import { useLanguage, type AppLanguage } from "renderer/stores/language-state";

const TRANSLATIONS = {
	en: {
		"signIn.welcome": "Welcome to Superset",
		"signIn.restoringSession": "Restoring your session",
		"signIn.signInToGetStarted": "Sign in to get started",
		"signIn.continueWithGithub": "Continue with GitHub",
		"signIn.continueWithGoogle": "Continue with Google",
		"signIn.bySigningIn": "By signing in, you agree to our",
		"signIn.termsOfService": "Terms of Service",
		"signIn.and": "and",
		"signIn.privacyPolicy": "Privacy Policy",
		"settings.language.title": "Language",
		"settings.language.description":
			"Choose the interface language for supported screens",
		"settings.language.english": "English",
		"settings.language.russian": "Russian",
		"settings.language.appearance": "Appearance",
		"settings.language.appearanceDescription":
			"Customize how Superset looks on your device",
		"settings.search.languageTitle": "Language",
		"settings.search.languageDescription": "Choose app interface language",
	},
	ru: {
		"signIn.welcome": "Добро пожаловать в Superset",
		"signIn.restoringSession": "Восстанавливаем вашу сессию",
		"signIn.signInToGetStarted": "Войдите, чтобы начать",
		"signIn.continueWithGithub": "Продолжить через GitHub",
		"signIn.continueWithGoogle": "Продолжить через Google",
		"signIn.bySigningIn": "Входя в систему, вы принимаете",
		"signIn.termsOfService": "Условия использования",
		"signIn.and": "и",
		"signIn.privacyPolicy": "Политику конфиденциальности",
		"settings.language.title": "Язык",
		"settings.language.description":
			"Выберите язык интерфейса для поддерживаемых экранов",
		"settings.language.english": "Английский",
		"settings.language.russian": "Русский",
		"settings.language.appearance": "Внешний вид",
		"settings.language.appearanceDescription":
			"Настройте отображение Superset на вашем устройстве",
		"settings.search.languageTitle": "Язык",
		"settings.search.languageDescription": "Выбор языка интерфейса приложения",
	},
} as const;

export type TranslationKey = keyof (typeof TRANSLATIONS)["en"];
type TemplateValues = Record<string, number | string>;

const STATIC_TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
	en: {},
	ru: {
		Back: "Назад",
		Settings: "Настройки",
		"Search settings...": "Поиск по настройкам...",
		Documentation: "Документация",
		Personal: "Личное",
		Account: "Аккаунт",
		Appearance: "Внешний вид",
		Notifications: "Уведомления",
		Keyboard: "Клавиатура",
		"Editor & Workflow": "Редактор и рабочий процесс",
		General: "Общее",
		"Git & Worktrees": "Git и Worktree",
		Terminal: "Терминал",
		Organization: "Организация",
		Integrations: "Интеграции",
		Billing: "Биллинг",
		Devices: "Устройства",
		"API Keys": "API-ключи",
		System: "Система",
		Permissions: "Разрешения",
		Projects: "Проекты",
		Cloud: "Облако",
		"Environment Variables": "Переменные окружения",
		"Failed to open project": "Не удалось открыть проект",
		"An unknown error occurred": "Произошла неизвестная ошибка",
		"New Workspace": "Новое рабочее пространство",
		"Create a new workspace from a PR, branch, issue, or prompt.":
			"Создайте новое рабочее пространство из PR, ветки, задачи или промпта.",
		Prompt: "Промпт",
		Issues: "Задачи",
		"Pull requests": "Pull request'ы",
		Branches: "Ветки",
		"Search by slug, title, or description":
			"Поиск по slug, заголовку или описанию",
		"Search by name": "Поиск по имени",
		"Search by title, number, author, or paste a url":
			"Поиск по названию, номеру, автору или вставьте URL",
		"Select project": "Выберите проект",
		"Search projects...": "Поиск проектов...",
		"No projects found.": "Проекты не найдены.",
		"Open project": "Открыть проект",
		"New project": "Новый проект",
		"Signed out": "Вы вышли из аккаунта",
		"Avatar updated!": "Аватар обновлён!",
		"Failed to update avatar": "Не удалось обновить аватар",
		"Name updated!": "Имя обновлено!",
		"Failed to update name": "Не удалось обновить имя",
		"Manage your account settings": "Управляйте настройками аккаунта",
		Profile: "Профиль",
		Avatar: "Аватар",
		"Recommended size is 256x256px": "Рекомендуемый размер: 256x256 px",
		Name: "Имя",
		"Your name": "Ваше имя",
		Email: "Email",
		"Unable to load user info": "Не удалось загрузить данные пользователя",
		"Sign Out": "Выйти",
		"Sign out of your Superset account on this device.":
			"Выйти из аккаунта Superset на этом устройстве.",
		"Configure general app preferences":
			"Настройте общие параметры приложения",
		"Confirm before quitting": "Подтверждать выход",
		"Show a confirmation dialog when quitting the app":
			"Показывать диалог подтверждения при выходе из приложения",
		"File open mode": "Режим открытия файлов",
		"Choose how files open when no preview pane exists":
			"Выберите, как открывать файлы, когда нет панели предпросмотра",
		"Split pane": "Разделить панель",
		"New tab": "Новая вкладка",
		"Resource monitor": "Монитор ресурсов",
		"Show CPU and memory usage in the top bar":
			"Показывать использование CPU и памяти в верхней панели",
		"Open links in app browser": "Открывать ссылки во встроенном браузере",
		"Open links from chat and terminal in the built-in browser instead of your default browser":
			"Открывать ссылки из чата и терминала во встроенном браузере вместо браузера по умолчанию",
		"Send anonymous usage data": "Отправлять анонимную статистику использования",
		"Help improve Superset by sending anonymous usage data":
			"Помогите улучшить Superset, отправляя анонимную статистику использования",
		"Configure git branch and worktree behavior":
			"Настройте поведение веток git и worktree",
		"Delete local branch on workspace removal":
			"Удалять локальную ветку при удалении рабочего пространства",
		"Also delete the local git branch when deleting a worktree workspace":
			"Также удалять локальную ветку git при удалении рабочего пространства worktree",
		"Branch Prefix": "Префикс ветки",
		Preview: "Превью",
		Prefix: "Префикс",
		"Worktree location": "Папка worktree",
		"Base directory for new worktrees": "Базовая папка для новых worktree",
		"Default ({path})": "По умолчанию ({path})",
		"No prefix": "Без префикса",
		"GitHub username": "Имя пользователя GitHub",
		"Git author name": "Имя автора git",
		"Custom prefix": "Свой префикс",
		"Use global default": "Использовать глобальное значение",
		"Choose the notification sound for completed tasks":
			"Выберите звук уведомления для завершённых задач",
		"Notification sounds": "Звуки уведомлений",
		"Play a sound when tasks complete": "Воспроизводить звук при завершении задач",
		"Notification Sound": "Звук уведомления",
		"Replace Custom Audio": "Заменить свой аудиофайл",
		"Add Custom Audio": "Добавить свой аудиофайл",
		"Click the play button to preview a sound. Use Add Custom Audio to import your own .mp3, .wav, or .ogg file.":
			"Нажмите кнопку воспроизведения для предпросмотра. Используйте «Добавить свой аудиофайл», чтобы импортировать .mp3, .wav или .ogg.",
		"Select worktree location": "Выберите папку worktree",
		Directory: "Папка",
		"Browse...": "Обзор...",
		Reset: "Сброс",
		"Creating workspace from branch...":
			"Создаём рабочее пространство из ветки...",
		"Workspace created": "Рабочее пространство создано",
		"Failed to create workspace": "Не удалось создать рабочее пространство",
		"Importing worktree...": "Импортируем worktree...",
		"Imported {branch}": "Импортировано: {branch}",
		"Failed to import worktree": "Не удалось импортировать worktree",
		"Imported 1 workspace": "Импортировано 1 рабочее пространство",
		"Imported {count} workspaces":
			"Импортировано рабочих пространств: {count}",
		"Failed to import worktrees": "Не удалось импортировать worktree",
		"Select a project to view branches.": "Выберите проект для просмотра веток.",
		"Loading branches...": "Загрузка веток...",
		All: "Все",
		Worktrees: "Worktree",
		"Importing...": "Импорт...",
		"Import all": "Импортировать все",
		"Loading worktree branches...": "Загрузка веток worktree...",
		"No worktree branches found.": "Ветки worktree не найдены.",
		"No branches found.": "Ветки не найдены.",
		Open: "Открыть",
		Import: "Импортировать",
		Create: "Создать",
		"Duplicate branch": "Дублировать ветку",
		"Connect Linear": "Подключить Linear",
		"Sync issues from Linear to create workspaces":
			"Синхронизируйте задачи из Linear для создания рабочих пространств",
		Connect: "Подключить",
		"No issues found.": "Задачи не найдены.",
		"Select a project first": "Сначала выберите проект",
		"Creating workspace...": "Создаём рабочее пространство...",
		"Connect GitHub": "Подключить GitHub",
		"Sync pull requests from GitHub to create workspaces":
			"Синхронизируйте pull request'ы из GitHub для создания рабочих пространств",
		"Select a project to view pull requests.":
			"Выберите проект для просмотра pull request'ов.",
		"No GitHub repository found.": "Репозиторий GitHub не найден.",
		"No pull requests found.": "Pull request'ы не найдены.",
		"Creating workspace from PR #{number}...":
			"Создаём рабочее пространство из PR #{number}...",
		"Creating workspace from PR...": "Создаём рабочее пространство из PR...",
		"No agent": "Без агента",
		Agent: "Агент",
		"What do you want to do?": "Что вы хотите сделать?",
		"Create Workspace": "Создать рабочее пространство",
		"Advanced options": "Дополнительные параметры",
		"Branch name": "Имя ветки",
		"Edit prefix": "Изменить префикс",
		"auto-generated": "автогенерация",
		"Base branch": "Базовая ветка",
		"Failed to load branches": "Не удалось загрузить ветки",
		"Select branch...": "Выберите ветку...",
		default: "по умолчанию",
		"Search branches...": "Поиск веток...",
		"No branches found": "Ветки не найдены",
		"Run setup script": "Запускать setup-скрипт",
		Enter: "Enter",
		Offline: "Не в сети",
		"Path copied to clipboard": "Путь скопирован в буфер обмена",
		"Failed to copy path:": "Не удалось скопировать путь:",
		"No default editor configured": "Редактор по умолчанию не настроен",
		"Open a project in an editor first to set a default.": "Сначала откройте проект в редакторе, чтобы установить его по умолчанию.",
		"Open in {app}": "Открыть в {app}",
		"Open in editor": "Открыть в редакторе",
		"Select an editor from the dropdown": "Выберите редактор из списка",
		"Search {workspace}...": "Поиск в {workspace}...",
		"Search files...": "Поиск файлов...",
		"Search…": "Поиск…",
		"Go back": "Назад",
		"Go forward": "Вперёд",
		"Manage members": "Управление участниками",
		"Switch organization": "Сменить организацию",
		"Keyboard Shortcuts": "Горячие клавиши",
		"Report Issue": "Сообщить об ошибке",
		"Contact Us": "Связаться с нами",
		GitHub: "GitHub",
		Discord: "Discord",
		X: "X",
		"Email Founders": "Написать основателям",
		"Log out": "Выйти",
		Workspace: "Рабочее пространство",
		Task: "Задача",
		Unknown: "Неизвестно",
		"Recently viewed": "Недавно просмотренные",
		"Recently Viewed": "Недавно просмотренные",
		Copy: "Копировать",
		Paste: "Вставить",
		"Clear Terminal": "Очистить терминал",
		"Scroll to Bottom": "Прокрутить вниз",
		"Select All": "Выделить всё",
		"Copy Link Address": "Копировать адрес ссылки",
		"Mark as Unread": "Отметить как непрочитанное",
		"Close Pane": "Закрыть панель",
		"Failed to open: ": "Не удалось открыть: ",
	},
};

function interpolateTemplate(
	template: string,
	values?: TemplateValues,
): string {
	if (!values) {
		return template;
	}

	return template.replace(/\{(\w+)\}/g, (_full, key: string) => {
		const value = values[key];
		return value === undefined ? `{${key}}` : String(value);
	});
}

export function getTranslation(
	language: AppLanguage,
	key: TranslationKey,
): string {
	return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key];
}

export function translateText(
	language: AppLanguage,
	text: string,
	values?: TemplateValues,
): string {
	const template =
		language === "en" ? text : (STATIC_TRANSLATIONS[language]?.[text] ?? text);
	return interpolateTemplate(template, values);
}

export function useI18n() {
	const language = useLanguage();
	return {
		language,
		t: (key: TranslationKey) => getTranslation(language, key),
		tt: (text: string, values?: TemplateValues) =>
			translateText(language, text, values),
	};
}
