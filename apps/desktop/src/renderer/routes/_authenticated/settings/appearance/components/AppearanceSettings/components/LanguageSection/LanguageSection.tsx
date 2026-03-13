import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@superset/ui/select";
import { useI18n } from "renderer/lib/i18n";
import {
	type AppLanguage,
	useLanguage,
	useSetLanguage,
} from "renderer/stores/language-state";

export function LanguageSection() {
	const language = useLanguage();
	const setLanguage = useSetLanguage();
	const { t } = useI18n();

	return (
		<div>
			<h3 className="text-sm font-medium mb-2">
				{t("settings.language.title")}
			</h3>
			<p className="text-sm text-muted-foreground mb-4">
				{t("settings.language.description")}
			</p>
			<Select
				value={language}
				onValueChange={(value) => setLanguage(value as AppLanguage)}
			>
				<SelectTrigger className="w-[220px]">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="en">{t("settings.language.english")}</SelectItem>
					<SelectItem value="ru">{t("settings.language.russian")}</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
