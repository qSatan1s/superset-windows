import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
	buildTerminalCommand,
	launchCommandInPane,
	writeCommandsInPane,
} from "./launch-command";

// Get the expected line ending for the current platform
// In tests, navigator may not be defined, but on Windows process.platform is "win32"
const isWindowsTest =
	typeof process !== "undefined" && process.platform === "win32";

describe("launchCommandInPane", () => {
	const originalNavigator = globalThis.navigator;

	beforeEach(() => {
		// Mock navigator for consistent test behavior
		if (isWindowsTest) {
			// @ts-expect-error - mocking navigator for tests
			globalThis.navigator = { platform: "Win32" };
		} else {
			// @ts-expect-error - mocking navigator for tests
			globalThis.navigator = { platform: "MacIntel" };
		}
	});

	afterEach(() => {
		globalThis.navigator = originalNavigator;
	});

	it("creates a terminal session and writes the command with a newline", async () => {
		const createOrAttach = mock(async () => ({}));
		const write = mock(async () => ({}));

		await launchCommandInPane({
			paneId: "pane-1",
			tabId: "tab-1",
			workspaceId: "ws-1",
			command: "echo hello",
			createOrAttach,
			write,
		});

		expect(createOrAttach).toHaveBeenCalledWith({
			paneId: "pane-1",
			tabId: "tab-1",
			workspaceId: "ws-1",
		});
		// Windows uses \r, Unix uses \n
		const expectedLineEnd = isWindowsTest ? "\r" : "\n";
		expect(write).toHaveBeenCalledWith({
			paneId: "pane-1",
			data: `echo hello${expectedLineEnd}`,
			throwOnError: true,
		});
	});

	it("does not append a second newline when command already has one", async () => {
		const createOrAttach = mock(async () => ({}));
		const write = mock(async () => ({}));

		await launchCommandInPane({
			paneId: "pane-1",
			tabId: "tab-1",
			workspaceId: "ws-1",
			command: "echo hello\n",
			createOrAttach,
			write,
		});

		// On Windows, \n at end is converted to \r
		const expectedData = isWindowsTest ? "echo hello\r" : "echo hello\n";
		expect(write).toHaveBeenCalledWith({
			paneId: "pane-1",
			data: expectedData,
			throwOnError: true,
		});
	});
});

describe("buildTerminalCommand", () => {
	it("joins commands with shell separators", () => {
		expect(buildTerminalCommand(["echo one", "echo two"])).toBe(
			"echo one && echo two",
		);
	});

	it("returns null for empty commands", () => {
		expect(buildTerminalCommand([])).toBeNull();
		expect(buildTerminalCommand(null)).toBeNull();
		expect(buildTerminalCommand(undefined)).toBeNull();
	});
});

describe("writeCommandsInPane", () => {
	it("writes joined command with newline", async () => {
		const write = mock(async () => ({}));

		await writeCommandsInPane({
			paneId: "pane-1",
			commands: ["echo one", "echo two"],
			write,
		});

		// Windows uses \r, Unix uses \n
		const expectedLineEnd = isWindowsTest ? "\r" : "\n";
		expect(write).toHaveBeenCalledWith({
			paneId: "pane-1",
			data: `echo one && echo two${expectedLineEnd}`,
			throwOnError: true,
		});
	});

	it("does not write when commands are empty", async () => {
		const write = mock(async () => ({}));

		await writeCommandsInPane({
			paneId: "pane-1",
			commands: [],
			write,
		});

		expect(write).not.toHaveBeenCalled();
	});
});
