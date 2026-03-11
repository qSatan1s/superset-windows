import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type AppLanguage = "en" | "ru";

function detectInitialLanguage(): AppLanguage {
	if (typeof navigator === "undefined") {
		return "en";
	}

	const locale =
		typeof navigator.language === "string" ? navigator.language : "en";
	return locale.toLowerCase().startsWith("ru") ? "ru" : "en";
}

interface LanguageState {
	language: AppLanguage;
	setLanguage: (language: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageState>()(
	devtools(
		persist(
			(set) => ({
				language: detectInitialLanguage(),
				setLanguage: (language) => set({ language }),
			}),
			{
				name: "language-store",
				partialize: (state) => ({ language: state.language }),
			},
		),
		{ name: "LanguageStore" },
	),
);

export const useLanguage = () => useLanguageStore((state) => state.language);
export const useSetLanguage = () =>
	useLanguageStore((state) => state.setLanguage);
export const getCurrentLanguage = () => useLanguageStore.getState().language;
