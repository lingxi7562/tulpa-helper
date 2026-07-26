# AGENTS.md — Tulpa Helper

A Tauri v2 desktop app (React 19 + TypeScript + Tailwind CSS v4 + Zustand + SQLite). Local-first, no API calls, no AI/LLM.

## Commands

```bash
npm install                  # install deps (Node ≥22, Rust required)
npm run tauri dev            # dev mode with hot reload (Vite port 1420, fixed)
npm run tauri build          # production desktop build
npm run tauri android build -- --target aarch64  # Android APK (JDK 21 + SDK 34 + NDK 26.1)
```

Do NOT run `npm run dev` or `npm run build` standalone — use `npm run tauri dev` / `npm run tauri build`. The Tauri CLI orchestrates Vite; `npm run build` (`tsc && vite build`) is only invoked internally by `tauri build`.

## Stack & Gotchas

| Concern | Detail |
|---|---|
| React | **v19** (not 18 as the dev docs say — README is stale; trust `package.json`) |
| Tailwind | **v4**. Uses `@tailwindcss/vite` plugin (NOT legacy PostCSS-only pipeline). The `tailwind.config.js` only extends brand/stage colors; primary config lives in `src/App.css` via `@theme` and CSS custom properties. |
| Vite | v7, port 1420, `strictPort: true`. `@tailwindcss/vite` plugin imported from `@tailwindcss/vite`. |
| Tauri | v2. CSP is `null` (permissive). Capabilities in `src-tauri/capabilities/default.json`. |
| State | Zustand v5. Each store lives in `src/stores/` and calls `src/db/database.ts` directly. |
| DB | SQLite via `tauri-plugin-sql`. Auto-created as `tulpa.db` on first load. No migration tool — schema lives in `src/db/schema.ts` `MIGRATIONS` array and runs on `getDb()`. |
| Build | `tsc && vite build` inside Tauri — typecheck runs before bundling. No lint or test framework configured. |

## CI / Android Build Pitfalls

These are hard-won lessons from debugging the `.github/workflows/build.yml` Android job. Do NOT regress on any of these.

### 1. APK is NOT installable by default
- Tauri v2 produces **unsigned** release APKs: `app-*-release-unsigned.apk`.
- Android refuses to install unsigned APKs.
- **Fix:** always build debug APKs on CI unless signing secrets are configured:
  ```bash
  npx tauri android build --apk --debug --target aarch64
  ```
  Debug builds are self-signed with a debug keystore → installable.

### 2. The `--apk` flag is mandatory
- Without `--apk`, `tauri android build` produces **AAB** (Android App Bundle), not APK.
- There is no warning — the output silently goes to `outputs/bundle/` instead of `outputs/apk/`.
- Always include `--apk` in the build command.

### 3. `tauri android init --ci` is required on fresh CI
- `src-tauri/gen/android/` is **not committed** to the repo.
- On a clean CI clone, `tauri android build` will fail because the Android project scaffold doesn't exist.
- Always run `npx tauri android init --ci` before `tauri android build` in CI.

### 4. NDK version: exact sdkmanager string required
- The README says "NDK 26.1" but sdkmanager requires the full version string.
- **Correct:** `ndk;26.1.10909125` ✅
- **Wrong:** `ndk;26.1.10929125` ❌ (one digit off — sdkmanager can't find it)
- Always verify the exact version string before using it. The version numbers are brittle.

### 5. Both NDK_HOME and ANDROID_NDK_HOME must be set
- `NDK_HOME` → used by Rust/Cargo cross-compilation linkers.
- `ANDROID_NDK_HOME` → used by some Gradle/Android tooling.
- Set both to the same path:
  ```bash
  echo "ANDROID_NDK_HOME=$ANDROID_HOME/ndk/26.1.10909125" >> "$GITHUB_ENV"
  echo "NDK_HOME=$ANDROID_HOME/ndk/26.1.10909125" >> "$GITHUB_ENV"
  ```

### 6. JAVA_HOME must be explicitly set on Linux runners
- `actions/setup-java@v4` may not propagate `JAVA_HOME` to subsequent steps on Linux.
- Explicitly write it:
  ```bash
  echo "JAVA_HOME=$JAVA_HOME" >> "$GITHUB_ENV"
  ```

### 7. Use `android-actions/setup-android@v3` with license acceptance
- Directly invoking `sdkmanager` without first setting up the SDK via this action is fragile.
- Always include `log-accepted-android-sdk-licenses: true` or sdkmanager may block on license prompts.

### 8. `bundle.targets` must be `"all"` (not `[]`)
- `tauri.conf.json` → `bundle.targets: []` means "build nothing" for desktop targets.
- Must be `"all"` or a specific list like `["deb", "msi"]`.

### 9. `bundle.android.minSdkVersion` should be set
- Without it, Tauri v2 defaults to 28, but explicit is safer:
  ```json
  "bundle": {
    "android": { "minSdkVersion": 28 }
  }
  ```

### 10. APK artifact path: use glob, never hardcode
- The exact APK filename depends on arch, debug/release, signed/unsigned — fragile to hardcode.
- **Do:**
  ```yaml
  path: src-tauri/gen/android/app/build/outputs/apk/**/*.apk
  ```
- **Don't:**
  ```yaml
  path: src-tauri/gen/android/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk
  ```
- Also always use `if-no-files-found: error` to fail loudly if no APK exists.

### 11. Working debug APK canonical path
```
src-tauri/gen/android/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk
```
This is what `--apk --debug --target aarch64` produces.

## Architecture

```
UI Layer (React components)
  → Zustand stores (src/stores/*)    — state + side effects
    → DB CRUD (src/db/database.ts)   — SQLite via tauri-plugin-sql
      → Schema (src/db/schema.ts)    — tables + TypeScript types + auto-migrations
```

Stage-driven design. Four stages in `src/constants/stages.ts`:
- `'prep'` → `'create'` → `'dev'` → `'mature'`

Feature panels are in `src/features/stages/`, each consuming the same reusable `FocusTimer` and `ScribbleInput`.

## Key Conventions

### CSS: two-tier styling
- Tailwind utilities for layout/spacing
- Custom component classes (`ui-button`, `ui-card`, `ui-input`) in `src/App.css` for shared design-token-driven styling. New UI primitives follow this class naming (prefix `ui-`).
- Design tokens as CSS custom properties in `:root` (colors, radii, shadows, durations, easing).

### `/T` dialogue parsing
`ScribbleInput` splits text at `/T` (or `/t`, or `\n/T`) to mark Tulpa messages. Lines before `/T` → speaker `'self'`, after → speaker `'tulpa'`. Stored as `dialogue_messages` linked to an `entries` row.

### Timer (Pomodoro)
Default 25 minutes. `timeLeft` is in seconds. Each stage sets a different default `sessionType` (EntryType). Timer completion creates an `entries` row with `duration_seconds`.

### Entry types
Defined in `src/db/schema.ts`: `'trait' | 'form' | 'session' | 'narration' | 'devotion' | 'dialogue' | 'wonderland' | 'signal' | 'imposition' | 'switch' | 'design' | 'dialogue_session' | 'practice'`

### Two views
- **Panel** (`PanelLayout`) — sidebar stage nav + content area, default view
- **Timeline** (`TimelineLayout`) — vertical scroll with pagination (50 per page, appended)

## File Placement Rules

| New thing | Goes in |
|---|---|
| A feature tied to a stage | `src/features/stages/<Stage>Panel.tsx` |
| A cross-cutting feature (timer, input, etc.) | `src/features/<domain>/` |
| A reusable UI primitive (button, card, badge) | `src/components/ui/` with `ui-` CSS classes |
| A new DB table or query | `src/db/schema.ts` (add migration SQL) + `src/db/database.ts` (add CRUD) |
| App-wide state | `src/stores/use<Thing>Store.ts` |
| Stage metadata | `src/constants/stages.ts` (single source of truth) |
