#!/usr/bin/env bun
/**
 * Cross-platform postinstall script.
 * Prevents infinite recursion during electron-builder install-app-deps.
 * Runs sherif for workspace validation and installs native deps for desktop.
 */

if (process.env.SUPERSET_POSTINSTALL_RUNNING) {
	process.exit(0);
}

process.env.SUPERSET_POSTINSTALL_RUNNING = "1";

import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "..");

try {
	execSync("bunx sherif", { stdio: "inherit", cwd: root });
} catch {
	// sherif may fail on first install; non-fatal
}

try {
	execSync("bun run --filter=@superset/desktop install:deps", {
		stdio: "inherit",
		cwd: root,
	});
} catch (err) {
	console.warn("[postinstall] install:deps failed (may need Visual Studio Build Tools on Windows):", err);
	// Non-fatal - user can run manually
}
