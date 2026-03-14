import { describe, expect, it } from "bun:test";
import {
	canonicalizeHotkey,
	canonicalizeHotkeyForPlatform,
	deriveNonMacDefault,
	hotkeyFromKeyboardEvent,
	isTerminalReservedEvent,
	matchesHotkeyEvent,
	toElectronAccelerator,
} from "./hotkeys";

describe("canonicalizeHotkey", () => {
	it("normalizes modifier order", () => {
		expect(canonicalizeHotkey("shift+meta+k")).toBe("meta+shift+k");
	});

	it("rejects invalid hotkeys", () => {
		expect(canonicalizeHotkey("shift+meta+k+x")).toBeNull();
	});
});

describe("canonicalizeHotkeyForPlatform", () => {
	it("rejects meta on non-mac platforms", () => {
		expect(canonicalizeHotkeyForPlatform("meta+k", "win32")).toBeNull();
	});
});

describe("deriveNonMacDefault", () => {
	it("returns null for null input", () => {
		expect(deriveNonMacDefault(null)).toBeNull();
	});

	it("returns null for invalid hotkey", () => {
		expect(deriveNonMacDefault("invalid+key+combo+extra")).toBeNull();
	});

	it("returns unchanged hotkey when no meta modifier present", () => {
		expect(deriveNonMacDefault("ctrl+k")).toBe("ctrl+k");
	});

	it("maps meta+key to ctrl+shift+key (simple meta case)", () => {
		expect(deriveNonMacDefault("meta+k")).toBe("ctrl+shift+k");
	});

	it("maps meta+shift to ctrl+alt+shift (adds alt for shifted defaults)", () => {
		expect(deriveNonMacDefault("meta+shift+w")).toBe("ctrl+alt+shift+w");
	});

	it("maps meta+alt to ctrl+alt+shift", () => {
		expect(deriveNonMacDefault("meta+alt+k")).toBe("ctrl+alt+shift+k");
	});
});

describe("matchesHotkeyEvent", () => {
	it("matches ctrl+c with Latin layout", () => {
		expect(
			matchesHotkeyEvent(
				{
					key: "c",
					code: "KeyC",
					ctrlKey: true,
					shiftKey: false,
					altKey: false,
					metaKey: false,
				},
				"ctrl+c",
			),
		).toBe(true);
	});

	it("matches ctrl+c with Cyrillic layout (event.key = 'с')", () => {
		expect(
			matchesHotkeyEvent(
				{
					key: "с", // Cyrillic 'с'
					code: "KeyC",
					ctrlKey: true,
					shiftKey: false,
					altKey: false,
					metaKey: false,
				},
				"ctrl+c",
			),
		).toBe(true);
	});

	it("matches ctrl+shift+k with Cyrillic layout", () => {
		expect(
			matchesHotkeyEvent(
				{
					key: "л", // Cyrillic 'л' on KeyK
					code: "KeyK",
					ctrlKey: true,
					shiftKey: true,
					altKey: false,
					metaKey: false,
				},
				"ctrl+shift+k",
			),
		).toBe(true);
	});
});

describe("hotkeyFromKeyboardEvent", () => {
	it("captures a simple event on windows", () => {
		const keys = hotkeyFromKeyboardEvent(
			{
				key: "k",
				code: "KeyK",
				metaKey: false,
				ctrlKey: true,
				altKey: false,
				shiftKey: false,
			},
			"win32",
		);
		expect(keys).toBe("ctrl+k");
	});

	it("captures Cyrillic key as Latin equivalent on windows", () => {
		const keys = hotkeyFromKeyboardEvent(
			{
				key: "с", // Cyrillic 'с'
				code: "KeyC",
				metaKey: false,
				ctrlKey: true,
				altKey: false,
				shiftKey: false,
			},
			"win32",
		);
		expect(keys).toBe("ctrl+c");
	});
});

describe("toElectronAccelerator", () => {
	it("returns null for meta on non-mac", () => {
		expect(toElectronAccelerator("meta+w", "win32")).toBeNull();
	});
});

describe("isTerminalReservedEvent", () => {
	it("detects ctrl+c", () => {
		expect(
			isTerminalReservedEvent({
				key: "c",
				ctrlKey: true,
				shiftKey: false,
				altKey: false,
				metaKey: false,
			}),
		).toBe(true);
	});
});
