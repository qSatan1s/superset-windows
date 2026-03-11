import { existsSync } from "node:fs";
import { join } from "node:path";
import { workspaces } from "@superset/local-db";
import { eq } from "drizzle-orm";
import {
	app,
	BrowserWindow,
	dialog,
	Menu,
	type MenuItemConstructorOptions,
	nativeImage,
	Tray,
} from "electron";
import { localDb } from "main/lib/local-db";
import { menuEmitter } from "main/lib/menu-events";
import {
	restartDaemon as restartDaemonShared,
	tryListExistingDaemonSessions,
} from "main/lib/terminal";
import { getTerminalHostClient } from "main/lib/terminal-host/client";
import type { ListSessionsResponse } from "main/lib/terminal-host/types";

const POLL_INTERVAL_MS = 5000;

/** Must have "Template" suffix for macOS dark/light mode support */
const TRAY_ICON_FILENAME = "iconTemplate.png";
/** Fallback for Windows/Linux (template not used) */
const TRAY_ICON_FALLBACK = "icon.png";

function getTrayIconPath(): string | null {
	const candidates = [TRAY_ICON_FILENAME, TRAY_ICON_FALLBACK];

	if (app.isPackaged) {
		const trayBase = join(
			process.resourcesPath,
			"app.asar.unpacked/resources/tray",
		);
		const buildIcons = join(process.resourcesPath, "app.asar/resources/build/icons");
		for (const name of candidates) {
			const p = join(trayBase, name);
			if (existsSync(p)) return p;
			const buildP = join(buildIcons, name);
			if (existsSync(buildP)) return buildP;
		}
		// Windows: try icon.ico from build
		const icoPath = join(buildIcons, "icon.ico");
		if (existsSync(icoPath)) return icoPath;
		return null;
	}

	const previewBase = join(__dirname, "../resources/tray");
	const devBase = join(app.getAppPath(), "src/resources/tray");
	const buildIcons = join(app.getAppPath(), "src/resources/build/icons");
	for (const name of candidates) {
		const p = join(previewBase, name);
		if (existsSync(p)) return p;
		const d = join(devBase, name);
		if (existsSync(d)) return d;
		const b = join(buildIcons, name);
		if (existsSync(b)) return b;
	}
	const icoPath = join(buildIcons, "icon.ico");
	if (existsSync(icoPath)) return icoPath;

	console.warn("[Tray] Icon not found in tray or build/icons");
	return null;
}

let tray: Tray | null = null;
let pollIntervalId: ReturnType<typeof setInterval> | null = null;

function createTrayIcon(): Electron.NativeImage | null {
	const iconPath = getTrayIconPath();
	if (!iconPath) {
		console.warn("[Tray] Icon not found");
		return null;
	}

	try {
		let image = nativeImage.createFromPath(iconPath);
		const size = image.getSize();

		if (image.isEmpty() || size.width === 0 || size.height === 0) {
			console.warn("[Tray] Icon loaded with zero size from:", iconPath);
			return null;
		}

		// 16x16 is standard menu bar size, auto-scales for Retina
		if (size.width > 22 || size.height > 22) {
			image = image.resize({ width: 16, height: 16 });
		}

		return image;
	} catch (error) {
		console.warn("[Tray] Failed to load icon:", error);
		return null;
	}
}

function showWindow(): void {
	const windows = BrowserWindow.getAllWindows();

	if (windows.length > 0) {
		const mainWindow = windows[0];
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}
		mainWindow.show();
		mainWindow.focus();
	} else {
		// Triggers window creation via makeAppSetup's activate handler
		app.emit("activate");
	}
}

function openSettings(): void {
	showWindow();
	menuEmitter.emit("open-settings");
}

function openTerminalSettings(): void {
	showWindow();
	menuEmitter.emit("open-settings", "terminal");
}

function openSessionInSuperset(workspaceId: string): void {
	showWindow();
	menuEmitter.emit("open-workspace", workspaceId);
}

async function killSession(paneId: string): Promise<void> {
	try {
		const client = getTerminalHostClient();
		const connected = await client.tryConnectAndAuthenticate();
		if (connected) {
			await client.kill({ sessionId: paneId });
			console.log(`[Tray] Killed session: ${paneId}`);
		}
	} catch (error) {
		console.error(`[Tray] Failed to kill session ${paneId}:`, error);
	}

	await updateTrayMenu();
}

function getWorkspaceName(workspaceId: string): string {
	try {
		const workspace = localDb
			.select({ name: workspaces.name })
			.from(workspaces)
			.where(eq(workspaces.id, workspaceId))
			.get();
		return workspace?.name || workspaceId.slice(0, 8);
	} catch {
		return workspaceId.slice(0, 8);
	}
}

function formatSessionLabel(
	session: ListSessionsResponse["sessions"][0],
): string {
	const attached = session.attachedClients > 0 ? " (attached)" : "";
	const shellName = session.shell?.split("/").pop() || "shell";
	return `${shellName}${attached}`;
}

function buildSessionsSubmenu(
	sessions: ListSessionsResponse["sessions"],
): MenuItemConstructorOptions[] {
	const aliveSessions = sessions.filter((s) => s.isAlive);
	const menuItems: MenuItemConstructorOptions[] = [];

	if (aliveSessions.length === 0) {
		menuItems.push({ label: "No active sessions", enabled: false });
	} else {
		const byWorkspace = new Map<string, ListSessionsResponse["sessions"]>();
		for (const session of aliveSessions) {
			const existing = byWorkspace.get(session.workspaceId) || [];
			existing.push(session);
			byWorkspace.set(session.workspaceId, existing);
		}

		let isFirst = true;
		for (const [workspaceId, workspaceSessions] of byWorkspace) {
			const workspaceName = getWorkspaceName(workspaceId);

			if (!isFirst) {
				menuItems.push({ type: "separator" });
			}
			menuItems.push({
				label: workspaceName,
				enabled: false,
			});

			for (const session of workspaceSessions) {
				menuItems.push({
					label: formatSessionLabel(session),
					submenu: [
						{
							label: "Open in Superset",
							click: () => openSessionInSuperset(session.workspaceId),
						},
						{
							label: "Kill",
							click: () => killSession(session.paneId),
						},
					],
				});
			}

			isFirst = false;
		}
	}

	menuItems.push({ type: "separator" });
	menuItems.push({
		label: "Terminal Settings",
		click: openTerminalSettings,
	});

	return menuItems;
}

async function quitApp(): Promise<void> {
	const { sessions } = await tryListExistingDaemonSessions();
	const hasActiveSessions = sessions.some((s) => s.isAlive);

	if (!hasActiveSessions) {
		app.quit();
		return;
	}

	const { response } = await dialog.showMessageBox({
		type: "question",
		buttons: ["Cancel", "Keep Sessions", "Kill Sessions"],
		defaultId: 1,
		cancelId: 0,
		title: "Quit Superset?",
		message: "Quit Superset?",
		detail:
			"Keep sessions running in the background, or kill all sessions and shut down the daemon?",
	});

	if (response === 0) {
		return;
	}

	if (response === 2) {
		await restartDaemonShared();
	}

	app.quit();
}

async function updateTrayMenu(): Promise<void> {
	if (!tray) return;

	const { sessions } = await tryListExistingDaemonSessions();
	const sessionCount = sessions.filter((s) => s.isAlive).length;

	const sessionsSubmenu = buildSessionsSubmenu(sessions);
	const sessionsLabel =
		sessionCount > 0
			? `Background Sessions (${sessionCount})`
			: "Background Sessions";

	const menu = Menu.buildFromTemplate([
		{
			label: sessionsLabel,
			submenu: sessionsSubmenu,
		},
		{ type: "separator" },
		{
			label: "Open Superset",
			click: showWindow,
		},
		{
			label: "Settings",
			click: openSettings,
		},
		{
			label: "Quit",
			click: quitApp,
		},
	]);

	tray.setContextMenu(menu);
}

/** Call once after app.whenReady() */
export function initTray(): void {
	if (tray) {
		console.warn("[Tray] Already initialized");
		return;
	}

	try {
		const icon = createTrayIcon();
		if (!icon) {
			console.warn("[Tray] Skipping initialization - no icon available");
			return;
		}

		tray = new Tray(icon);
		tray.setToolTip("Superset");
		tray.on("click", showWindow);
		tray.on("double-click", showWindow);

		updateTrayMenu().catch((error) => {
			console.error("[Tray] Failed to build initial menu:", error);
		});

		pollIntervalId = setInterval(() => {
			updateTrayMenu().catch((error) => {
				console.error("[Tray] Failed to update menu:", error);
			});
		}, POLL_INTERVAL_MS);
		// Don't keep Electron alive just for tray updates
		pollIntervalId.unref();

		console.log("[Tray] Initialized successfully");
	} catch (error) {
		console.error("[Tray] Failed to initialize:", error);
	}
}

/** Call on app quit */
export function disposeTray(): void {
	if (pollIntervalId) {
		clearInterval(pollIntervalId);
		pollIntervalId = null;
	}

	if (tray) {
		tray.destroy();
		tray = null;
	}
}
