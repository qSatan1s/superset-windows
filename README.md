# Superset Windows

### The Terminal for Coding Agents (Windows Port)

This is an unofficial Windows port of [Superset](https://github.com/superset-sh/superset).

## Why Superset?

Superset is a turbocharged terminal that allows you to run any CLI coding agents along with the tools to 10x your development workflow.

- **Run multiple agents simultaneously** without context switching overhead
- **Isolate each task** in its own git worktree so agents don't interfere with each other
- **Monitor all your agents** from one place and get notified when they need attention
- **Review changes quickly** with built-in diff viewer and editor

## Features

| Feature | Description |
|:--------|:------------|
| **Parallel Execution** | Run 10+ coding agents simultaneously on your machine |
| **Worktree Isolation** | Each task gets its own branch and working directory |
| **Agent Monitoring** | Track agent status and get notified when changes are ready |
| **Built-in Diff Viewer** | Inspect and edit agent changes without leaving the app |
| **Workspace Presets** | Automate env setup, dependency installation, and more |
| **Universal Compatibility** | Works with any CLI agent that runs in a terminal |
| **Quick Context Switching** | Jump between tasks as they need your attention |
| **IDE Integration** | Open any workspace in your favorite editor with one click |

## Supported Agents

Superset works with any CLI-based coding agent, including:

| Agent | Status |
|:------|:-------|
| [Claude Code](https://github.com/anthropics/claude-code) | Fully supported |
| [OpenAI Codex CLI](https://github.com/openai/codex) | Fully supported |
| [Cursor Agent](https://docs.cursor.com/agent) | Fully supported |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Fully supported |
| [GitHub Copilot](https://github.com/features/copilot) | Fully supported |
| [OpenCode](https://github.com/opencode-ai/opencode) | Fully supported |
| Any CLI agent | Will work |

If it runs in a terminal, it runs on Superset.

## Requirements

| Requirement | Details |
|:------------|:--------|
| **OS** | Windows 10/11 (64-bit) |
| **Runtime** | [Bun](https://bun.sh/) v1.0+ |
| **Version Control** | Git 2.20+ |
| **GitHub CLI** | [gh](https://cli.github.com/) |

## Installation

### Download Pre-built

**[Download Superset for Windows](https://github.com/qSatan1s/superset-windows/releases/latest)**

### Build from Source

**1. Clone the repository**

```powershell
git clone https://github.com/qSatan1s/superset-windows.git
cd superset-windows
```

**2. Set up environment variables**

```powershell
copy .env.example .env
# Edit .env and add: SKIP_ENV_VALIDATION=1
```

**3. Install dependencies and build**

```powershell
bun install
bun run build
```

**4. Find the installer**

```powershell
explorer apps\desktop\release
```

## Keyboard Shortcuts

All shortcuts are customizable via **Settings > Keyboard Shortcuts** (`Ctrl+/`).

### Workspace Navigation

| Shortcut | Action |
|:---------|:-------|
| `Ctrl+1-9` | Switch to workspace 1-9 |
| `Ctrl+Alt+Up/Down` | Previous/next workspace |
| `Ctrl+N` | New workspace |
| `Ctrl+Shift+N` | Quick create workspace |
| `Ctrl+Shift+O` | Open project |

### Terminal

| Shortcut | Action |
|:---------|:-------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close pane/terminal |
| `Ctrl+D` | Split right |
| `Ctrl+Shift+D` | Split down |
| `Ctrl+K` | Clear terminal |
| `Ctrl+F` | Find in terminal |
| `Ctrl+Alt+Left/Right` | Previous/next tab |

### Layout

| Shortcut | Action |
|:---------|:-------|
| `Ctrl+B` | Toggle workspaces sidebar |
| `Ctrl+L` | Toggle changes panel |
| `Ctrl+O` | Open in external app |
| `Ctrl+Shift+C` | Copy path |

## Configuration

Configure workspace setup and teardown in `.superset/config.json`:

```json
{
  "setup": ["./.superset/setup.bat"],
  "teardown": ["./.superset/teardown.bat"]
}
```

| Option | Type | Description |
|:-------|:-----|:------------|
| `setup` | `string[]` | Commands to run when creating a workspace |
| `teardown` | `string[]` | Commands to run when deleting a workspace |

### Example setup script

```batch
@echo off
REM .superset/setup.bat

REM Copy environment variables
copy ..\.env .env

REM Install dependencies
bun install

echo Workspace ready!
```

Scripts have access to environment variables:
- `SUPERSET_WORKSPACE_NAME` — Name of the workspace
- `SUPERSET_ROOT_PATH` — Path to the main repository

## Tech Stack

- **Electron** — Desktop application framework
- **React** — UI framework
- **TailwindCSS** — Styling
- **Bun** — JavaScript runtime and package manager
- **Turborepo** — Monorepo build system
- **Vite** — Build tool
- **Biome** — Linter and formatter

## License

Based on [Superset](https://github.com/superset-sh/superset) by the Superset team.

Distributed under the Apache 2.0 License. See [LICENSE.md](LICENSE.md) for more information.
