interface TerminalCreateOrAttachInput {
	paneId: string;
	tabId: string;
	workspaceId: string;
	taskPromptContent?: string;
	taskPromptFileName?: string;
}

interface TerminalWriteInput {
	paneId: string;
	data: string;
	throwOnError?: boolean;
}

interface LaunchCommandInPaneOptions {
	paneId: string;
	tabId: string;
	workspaceId: string;
	command: string;
	createOrAttach: (input: TerminalCreateOrAttachInput) => Promise<unknown>;
	write: (input: TerminalWriteInput) => Promise<unknown>;
	noExecute?: boolean;
	taskPromptContent?: string;
	taskPromptFileName?: string;
}

function isWindowsPlatform(): boolean {
	if (typeof navigator === "undefined") {
		return false;
	}
	return navigator.platform.toLowerCase().includes("win");
}

function normalizeTerminalCommand(command: string): string {
	const isWindows = isWindowsPlatform();

	if (command.endsWith("\r\n") || command.endsWith("\r")) {
		return command;
	}

	if (command.endsWith("\n")) {
		// Windows terminals expect carriage return as "Enter".
		return isWindows ? `${command.slice(0, -1)}\r` : command;
	}

	return `${command}${isWindows ? "\r" : "\n"}`;
}

interface WriteCommandInPaneOptions {
	paneId: string;
	command: string;
	write: (input: TerminalWriteInput) => Promise<unknown>;
	noExecute?: boolean;
}

interface WriteCommandsInPaneOptions {
	paneId: string;
	commands: string[] | null | undefined;
	write: (input: TerminalWriteInput) => Promise<unknown>;
}

export function buildTerminalCommand(
	commands: string[] | null | undefined,
): string | null {
	if (!Array.isArray(commands) || commands.length === 0) return null;
	return commands.join(" && ");
}

export async function writeCommandInPane({
	paneId,
	command,
	write,
	noExecute,
}: WriteCommandInPaneOptions): Promise<void> {
	const data = noExecute ? command : normalizeTerminalCommand(command);
	await write({
		paneId,
		data,
		throwOnError: true,
	});
}

export async function writeCommandsInPane({
	paneId,
	commands,
	write,
}: WriteCommandsInPaneOptions): Promise<void> {
	const command = buildTerminalCommand(commands);
	if (!command) return;
	await writeCommandInPane({ paneId, command, write });
}

export async function launchCommandInPane({
	paneId,
	tabId,
	workspaceId,
	command,
	createOrAttach,
	write,
	noExecute,
	taskPromptContent,
	taskPromptFileName,
}: LaunchCommandInPaneOptions): Promise<void> {
	await createOrAttach({
		paneId,
		tabId,
		workspaceId,
		taskPromptContent,
		taskPromptFileName,
	});

	await writeCommandInPane({ paneId, command, write, noExecute });
}
