import fs from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { shell, systemPreferences } from "electron";
import { publicProcedure, router } from "..";

function checkFullDiskAccess(): boolean {
	return true; // Not required on Windows
}

function checkAccessibility(): boolean {
	return true; // Not required on Windows
}

function checkMicrophone(): boolean {
	try {
		return systemPreferences.getMediaAccessStatus("microphone") === "granted";
	} catch {
		return false;
	}
}

export const createPermissionsRouter = () => {
	return router({
		getStatus: publicProcedure.query(() => {
			return {
				fullDiskAccess: checkFullDiskAccess(),
				accessibility: checkAccessibility(),
				microphone: checkMicrophone(),
			};
		}),

		requestFullDiskAccess: publicProcedure.mutation(async () => {
			// No-op for Windows
		}),

		requestAccessibility: publicProcedure.mutation(async () => {
			// No-op for Windows
		}),

		requestMicrophone: publicProcedure.mutation(async () => {
			try {
				const granted = await systemPreferences.askForMediaAccess("microphone");
				return { granted };
			} catch {
				return { granted: false };
			}
		}),

		requestAppleEvents: publicProcedure.mutation(async () => {
			// No-op for Windows
		}),

		requestLocalNetwork: publicProcedure.mutation(async () => {
			// No-op for Windows
		}),
	});
};

export type PermissionsRouter = ReturnType<typeof createPermissionsRouter>;
