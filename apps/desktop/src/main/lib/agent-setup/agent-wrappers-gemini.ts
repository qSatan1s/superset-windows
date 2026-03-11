import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { env } from "shared/env.shared";
import {
	buildWrapperScript,
	createWrapper,
	isSupersetManagedHookCommand,
	reconcileManagedEntries,
	writeFileIfChanged,
} from "./agent-wrappers-common";
import { HOOKS_DIR } from "./paths";

export const GEMINI_HOOK_SCRIPT_NAME = "gemini-hook.sh";
export const GEMINI_HOOK_PS1_SCRIPT_NAME = "gemini-hook.ps1";

const GEMINI_HOOK_SIGNATURE = "# Superset gemini hook";
const GEMINI_HOOK_VERSION = "v1";
export const GEMINI_HOOK_MARKER = `${GEMINI_HOOK_SIGNATURE} ${GEMINI_HOOK_VERSION}`;

const GEMINI_HOOK_TEMPLATE_PATH = path.join(
	__dirname,
	"templates",
	"gemini-hook.template.sh",
);
const GEMINI_HOOK_PS1_TEMPLATE_PATH = path.join(
	__dirname,
	"templates",
	"gemini-hook.template.ps1",
);

const IS_WINDOWS = process.platform === "win32";

interface GeminiHookConfig {
	type: string;
	command: string;
	[key: string]: unknown;
}

interface GeminiHookDefinition {
	matcher?: string;
	hooks?: GeminiHookConfig[];
	[key: string]: unknown;
}

interface GeminiSettingsJson {
	hooks?: Record<string, GeminiHookDefinition[]>;
	[key: string]: unknown;
}

export function getGeminiHookScriptPath(): string {
	return path.join(HOOKS_DIR, GEMINI_HOOK_SCRIPT_NAME);
}

export function getGeminiHookPs1ScriptPath(): string {
	return path.join(HOOKS_DIR, GEMINI_HOOK_PS1_SCRIPT_NAME);
}

export function getGeminiSettingsJsonPath(): string {
	return path.join(os.homedir(), ".gemini", "settings.json");
}

export function getGeminiHookScriptContent(): string {
	const template = fs.readFileSync(GEMINI_HOOK_TEMPLATE_PATH, "utf-8");
	return template
		.replace("{{MARKER}}", GEMINI_HOOK_MARKER)
		.replace(/\{\{DEFAULT_PORT\}\}/g, String(env.DESKTOP_NOTIFICATIONS_PORT));
}

function getGeminiHookPs1Content(): string {
	const template = fs.readFileSync(GEMINI_HOOK_PS1_TEMPLATE_PATH, "utf-8");
	return template
		.replace("{{MARKER}}", GEMINI_HOOK_MARKER)
		.replace(/\{\{DEFAULT_PORT\}\}/g, String(env.DESKTOP_NOTIFICATIONS_PORT));
}

function buildGeminiHookCommand(scriptPath: string): string {
	if (IS_WINDOWS) {
		return `powershell -ExecutionPolicy Bypass -NoProfile -NonInteractive -File "${scriptPath}"`;
	}
	return scriptPath;
}

function isGeminiHookManaged(definition: GeminiHookDefinition): boolean {
	const commands = definition.hooks?.map((h) => h.command) ?? [];
	for (const cmd of commands) {
		if (!cmd) continue;
		const normalized = cmd.replaceAll("\\", "/");
		if (
			normalized.includes("/hooks/gemini-hook.sh") ||
			normalized.includes("/hooks/gemini-hook.ps1") ||
			isSupersetManagedHookCommand(cmd, GEMINI_HOOK_SCRIPT_NAME) ||
			isSupersetManagedHookCommand(cmd, GEMINI_HOOK_PS1_SCRIPT_NAME)
		) {
			return true;
		}
	}
	return false;
}

/**
 * Reads existing ~/.gemini/settings.json, merges our hook definitions (identified by
 * hook script path), and preserves any user-defined settings/hooks.
 *
 * Gemini CLI uses a two-level nesting format:
 *   { hooks: { EventName: [{ matcher?, hooks: [{ type, command }] }] } }
 */
export function getGeminiSettingsJsonContent(hookScriptPath: string): string {
	const globalPath = getGeminiSettingsJsonPath();

	let existing: GeminiSettingsJson = {};
	try {
		if (fs.existsSync(globalPath)) {
			existing = JSON.parse(fs.readFileSync(globalPath, "utf-8"));
		}
	} catch {
		console.warn(
			"[agent-setup] Could not parse existing ~/.gemini/settings.json, merging carefully",
		);
	}

	if (!existing.hooks || typeof existing.hooks !== "object") {
		existing.hooks = {};
	}

	const hookCommand = buildGeminiHookCommand(hookScriptPath);
	const eventNames = ["BeforeAgent", "AfterAgent", "AfterTool"];

	for (const eventName of eventNames) {
		const current = existing.hooks[eventName];
		const desiredEntries: GeminiHookDefinition[] = [
			{
				hooks: [{ type: "command", command: hookCommand }],
			},
		];
		const { entries } = reconcileManagedEntries({
			current,
			desired: desiredEntries,
			isManaged: isGeminiHookManaged,
			isEquivalent: (
				definition: GeminiHookDefinition,
				desiredDefinition: GeminiHookDefinition,
			) =>
				JSON.stringify(definition.hooks ?? []) ===
				JSON.stringify(desiredDefinition.hooks ?? []),
		});
		existing.hooks[eventName] = entries;
	}

	return JSON.stringify(existing, null, 2);
}

export function createGeminiHookScript(): void {
	const scriptPath = getGeminiHookScriptPath();
	const content = getGeminiHookScriptContent();
	const changed = writeFileIfChanged(scriptPath, content, 0o755);
	console.log(
		`[agent-setup] ${changed ? "Updated" : "Verified"} Gemini hook script (.sh)`,
	);

	if (IS_WINDOWS) {
		const ps1Path = getGeminiHookPs1ScriptPath();
		const ps1Content = getGeminiHookPs1Content();
		const ps1Changed = writeFileIfChanged(ps1Path, ps1Content, 0o644);
		console.log(
			`[agent-setup] ${ps1Changed ? "Updated" : "Verified"} Gemini hook script (.ps1)`,
		);
	}
}

export function createGeminiWrapper(): void {
	const script = buildWrapperScript("gemini", `exec "$REAL_BIN" "$@"`);
	createWrapper("gemini", script);
}

export function createGeminiSettingsJson(): void {
	const hookScriptPath = IS_WINDOWS
		? getGeminiHookPs1ScriptPath()
		: getGeminiHookScriptPath();
	const globalPath = getGeminiSettingsJsonPath();
	const content = getGeminiSettingsJsonContent(hookScriptPath);

	const dir = path.dirname(globalPath);
	fs.mkdirSync(dir, { recursive: true });
	const changed = writeFileIfChanged(globalPath, content, 0o644);
	console.log(
		`[agent-setup] ${changed ? "Updated" : "Verified"} Gemini settings.json`,
	);
}
