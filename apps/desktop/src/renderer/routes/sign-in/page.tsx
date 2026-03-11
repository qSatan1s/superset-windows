import { type AuthProvider, COMPANY } from "@superset/shared/constants";
import { Button } from "@superset/ui/button";
import { Spinner } from "@superset/ui/spinner";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { env } from "renderer/env.renderer";
import { track } from "renderer/lib/analytics";
import { electronTrpc } from "renderer/lib/electron-trpc";
import { useI18n } from "renderer/lib/i18n";
import { useLanguage, useSetLanguage } from "renderer/stores/language-state";
import { SupersetLogo } from "./components/SupersetLogo";
import { useSessionRecovery } from "./hooks/useSessionRecovery";

export const Route = createFileRoute("/sign-in/")({
	component: SignInPage,
});

function SignInPage() {
	const signInMutation = electronTrpc.auth.signIn.useMutation();
	const { hasLocalToken, isPending, session } = useSessionRecovery();
	const { t } = useI18n();
	const language = useLanguage();
	const setLanguage = useSetLanguage();

	// Optional dev bypass for local testing.
	// Enable manually with: localStorage.setItem("SUPERSET_DEV_SKIP_AUTH", "1")
	const shouldSkipAuth =
		env.NODE_ENV === "development" &&
		typeof window !== "undefined" &&
		window.localStorage.getItem("SUPERSET_DEV_SKIP_AUTH") === "1";
	if (shouldSkipAuth) {
		return <Navigate to="/workspace" replace />;
	}

	// Show loading while session is being fetched
	if (isPending) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-background">
				<Spinner className="size-8" />
			</div>
		);
	}

	// If already signed in, redirect to workspace
	if (session?.user) {
		return <Navigate to="/workspace" replace />;
	}

	const signIn = (provider: AuthProvider) => {
		track("auth_started", { provider });
		signInMutation.mutate({ provider });
	};

	return (
		<div className="relative flex flex-col h-full w-full bg-background">
			<div className="h-12 w-full drag shrink-0" />
			<div className="absolute top-14 right-6 z-10 flex items-center gap-1 rounded-md border border-border bg-background/90 p-1">
				<Button
					variant={language === "en" ? "secondary" : "ghost"}
					size="sm"
					className="h-7 px-2 text-xs"
					onClick={() => setLanguage("en")}
				>
					EN
				</Button>
				<Button
					variant={language === "ru" ? "secondary" : "ghost"}
					size="sm"
					className="h-7 px-2 text-xs"
					onClick={() => setLanguage("ru")}
				>
					RU
				</Button>
			</div>

			<div className="flex flex-1 items-center justify-center">
				<div className="flex flex-col items-center w-full max-w-md px-8">
					<div className="mb-8">
						<SupersetLogo className="h-12 w-auto" />
					</div>

					<div className="text-center mb-8">
						<h1 className="text-xl font-semibold text-foreground mb-2">
							{t("signIn.welcome")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{hasLocalToken
								? t("signIn.restoringSession")
								: t("signIn.signInToGetStarted")}
						</p>
					</div>

					<div className="flex flex-col gap-3 w-full max-w-xs">
						<Button
							variant="outline"
							size="lg"
							onClick={() => signIn("github")}
							className="w-full gap-3"
							disabled={signInMutation.isPending}
						>
							<FaGithub className="size-5" />
							{t("signIn.continueWithGithub")}
						</Button>

						<Button
							variant="outline"
							size="lg"
							onClick={() => signIn("google")}
							className="w-full gap-3"
							disabled={signInMutation.isPending}
						>
							<FcGoogle className="size-5" />
							{t("signIn.continueWithGoogle")}
						</Button>
					</div>

					<p className="mt-8 text-xs text-muted-foreground/70 text-center max-w-xs">
						{t("signIn.bySigningIn")}{" "}
						<a
							href={COMPANY.TERMS_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="underline hover:text-muted-foreground transition-colors"
						>
							{t("signIn.termsOfService")}
						</a>{" "}
						{t("signIn.and")}{" "}
						<a
							href={COMPANY.PRIVACY_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="underline hover:text-muted-foreground transition-colors"
						>
							{t("signIn.privacyPolicy")}
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
