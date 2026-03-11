import { join } from "node:path";
import { SUPERSET_DIR_NAME } from "shared/constants";

const WINDOWS_PIPE_PREFIX = "\\\\.\\pipe\\";

function sanitizeForPipeName(input: string): string {
	return input.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getWindowsPipeName(): string {
	// Includes workspace suffix so multiple dev worktrees don't collide.
	const workspaceSuffix = sanitizeForPipeName(SUPERSET_DIR_NAME);
	return `superset-terminal-host-${workspaceSuffix}`;
}

export function usesFilesystemSocket(): boolean {
	return process.platform !== "win32";
}

export function getTerminalHostEndpoint(supersetHomeDir: string): string {
	if (usesFilesystemSocket()) {
		return join(supersetHomeDir, "terminal-host.sock");
	}

	return `${WINDOWS_PIPE_PREFIX}${getWindowsPipeName()}`;
}
