# Superset Desktop — Windows

Инструкции по сборке и запуску Superset Desktop на Windows.

## Требования

- **Bun** 1.3.6+ ([bun.sh](https://bun.sh))
- **Node.js** 18+ (для native modules)
- **Visual Studio Build Tools** (для node-pty, better-sqlite3):
  - [Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
  - Установите workload "Desktop development with C++"

## Разработка

```powershell
cd C:\Users\Luffi\Desktop\trip-rift\superset-windows
bun install

cd apps\desktop
bun run dev
```

## Сборка

```powershell
cd C:\Users\Luffi\Desktop\trip-rift\superset-windows
bun install

cd apps\desktop
bun run prebuild
bun run package
```

Результат: `apps\desktop\release\Superset-<version>.exe`

## Отличия от macOS

- **Tray icon** — работает в системном трее (иконка в build/icons или tray)
- **Открытие в редакторе** — используются Windows CLI (code, cursor, idea64, pycharm64 и т.д.)
- **Звуки уведомлений** — через PowerShell Media.SoundPlayer
- **Deep links** — superset:// обрабатываются через second-instance

## Устранение неполадок

- **Ошибки native modules**: установите Visual Studio Build Tools; убедитесь, что `bun run install:deps` выполнен
- **Tray без иконки**: добавьте `icon.png` или `icon.ico` в `src/resources/build/icons/`
- **Команда не найдена**: убедитесь, что редактор (VS Code, Cursor и т.д.) добавлен в PATH
