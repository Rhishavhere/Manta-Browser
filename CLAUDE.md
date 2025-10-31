# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Manta Browser is a Tauri-based desktop application that provides a web browser interface using native WebView2. Each website opens in a separate native window rather than tabs within a single window.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 (using @tailwindcss/vite plugin)
- **Desktop Framework**: Tauri 2 (with unstable features enabled)
- **UI Animations**: Framer Motion
- **Native Webview**: WebView2 (Windows)

## Development Commands

```bash
# Start development server (runs both Vite dev server and Tauri)
npm run tauri dev

# Build the frontend only
npm run build

# Build production application
npm run tauri build

# Clean Rust build artifacts (when needed)
cargo clean --manifest-path src-tauri/Cargo.toml
```

## Architecture

### Frontend (React)
- **src/App.tsx**: Main application UI with URL input, quick links, and custom window controls
- **src/main.tsx**: React app entry point
- Single-window launcher interface with custom titlebar (decorations disabled in tauri.conf.json)

### Backend (Rust)
- **src-tauri/src/lib.rs**: Core Tauri application logic
  - `create_webview(url)`: Creates new WebviewWindow for each URL navigation
  - `navigate_to(window, url)`: Navigates existing webview to new URL via JavaScript eval
  - Uses `tauri-plugin-opener` and `tauri-plugin-shell` plugins

- **src-tauri/src/main.rs**: Application entry point that calls `manta_browser_lib::run()`

### Multi-Window Architecture
The browser uses a launcher pattern:
1. Main window serves as a home page/launcher (custom decorations with minimize/maximize/close buttons)
2. Each URL navigation creates a new WebviewWindow instance via `create_webview` command
3. New windows are titled "Manta Browser" with default size 1200x800

### Tauri Configuration
- Custom window decorations disabled (`decorations: false` in tauri.conf.json)
- Window controls implemented in React (minimize, maximize, close buttons)
- Dev server runs on port 1420, HMR on 1421
- Uses `unstable` Tauri features in Cargo.toml

## Key Implementation Details

### URL Handling (src/App.tsx:11-35)
- Detects if input is URL (contains `.` without spaces, or has http/https protocol)
- Non-URL inputs are treated as Google search queries
- Automatically prepends `https://` to URLs without protocol

### Window Management
- Main window uses `data-tauri-drag-region` attribute for custom titlebar dragging
- Window controls call Tauri window API: `getCurrentWindow().minimize()`, `.toggleMaximize()`, `.close()`

### Tauri Commands (Rust)
Both commands are async and return `Result<(), String>` for error handling:
- Use `invoke("create_webview", { url })` from frontend to open new browser windows
- `navigate_to` uses JavaScript injection to change location in existing windows

## Build System

- Vite watches src directory, ignores src-tauri
- Tauri build hooks:
  - `beforeDevCommand`: npm run dev
  - `beforeBuildCommand`: npm run build
  - `frontendDist`: ../dist

## Common Patterns

When adding new Tauri commands:
1. Define command in src-tauri/src/lib.rs with `#[tauri::command]` attribute
2. Add to `invoke_handler` in the `run()` function
3. Call from frontend using `invoke("command_name", { args })`

When modifying window behavior:
- Window configuration is in src-tauri/tauri.conf.json under `app.windows`
- Permissions/capabilities defined in src-tauri/capabilities/default.json
