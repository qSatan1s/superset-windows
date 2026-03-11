import { Alerter } from "@superset/ui/atoms/Alert";
import { type ReactNode, useEffect } from "react";
import { PostHogUserIdentifier } from "renderer/components/PostHogUserIdentifier";
import { TelemetrySync } from "renderer/components/TelemetrySync";
import { ThemedToaster } from "renderer/components/ThemedToaster";
import { AuthProvider } from "renderer/providers/AuthProvider";
import { ElectronTRPCProvider } from "renderer/providers/ElectronTRPCProvider";
import { OutlitProvider } from "renderer/providers/OutlitProvider";
import { PostHogProvider } from "renderer/providers/PostHogProvider";
import { useLanguage } from "renderer/stores/language-state";

export function RootLayout({ children }: { children: ReactNode }) {
	const language = useLanguage();

	useEffect(() => {
		document.documentElement.lang = language;
	}, [language]);

	return (
		<PostHogProvider>
			<OutlitProvider>
				<ElectronTRPCProvider>
					<PostHogUserIdentifier />
					<TelemetrySync />
					<AuthProvider>
						{children}
						<ThemedToaster />
						<Alerter />
					</AuthProvider>
				</ElectronTRPCProvider>
			</OutlitProvider>
		</PostHogProvider>
	);
}
