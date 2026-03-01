# AGENTS.md

Repository guide for coding agents working in `pjserver-sys`.

## Project Snapshot

- Runtime: Node.js 22 + TypeScript (`"type": "module"`, ESM only).
- Package manager: `pnpm` (pinned via `packageManager` in `package.json`).
- Main entry after build: `dist/master.js`.
- Source root: `src/`.
- Build output: `dist/`.
- Bot domain: Discord bot using `discord.js`.

## Rule Files (Cursor/Copilot)

- Checked for Cursor rules in `.cursor/rules/`: **not present**.
- Checked for `.cursorrules`: **not present**.
- Checked for Copilot rules in `.github/copilot-instructions.md`: **not present**.
- If these files are added later, treat them as highest-priority repo instructions.

## Install And Setup

- Install deps: `pnpm install`.
- Copy env template: `cp env.sample .env` and fill required values.
- Required env keys: `credential`, `clientID`, `guildID`, `mode`, `welcomeChannelID`.
- `mode` values: `1` (main), `2` (standby), `0` (dev).

## Build/Lint/Test Commands

### Core Commands

- Build (dev-style): `pnpm run build`
  - Runs `copy-static` + TypeScript compile + path alias rewrite.
- Build (production): `pnpm run build:prod`
  - Uses `tsconfig.build.json` (no source maps, comments removed).
- Lint all source: `pnpm run lint`
- Auto-fix lint issues: `pnpm run lint:fix`
- Format check: `pnpm run format`
- Auto-format: `pnpm run format:fix`
- Typecheck only (CI uses this): `pnpm tsc --noEmit`
- Test all: `pnpm run test`
- Test unit only: `pnpm run test:unit`
- Test integration only: `pnpm run test:integration`
- Test coverage: `pnpm run test:coverage`

### Single-File / Focused Checks

- Lint one file: `pnpm eslint src/path/to/file.ts`
- Lint one file with fixes: `pnpm eslint src/path/to/file.ts --fix`
- Format-check one file: `pnpm prettier src/path/to/file.ts --check`
- Format one file: `pnpm prettier src/path/to/file.ts --write`

### Single-Test / Focused Test Commands

- Run one test file: `pnpm vitest run tests/unit/config.test.ts`
- Run one test by name: `pnpm vitest run -t "loads all required values"`
- Run one integration file: `pnpm vitest run tests/integration/register-events.test.ts`
- Watch mode for local iteration: `pnpm run test:watch`

### Test Status (Important)

- Test runner: Vitest (`vitest.config.ts`, Node environment).
- Test locations: `tests/unit/**/*.test.ts`, `tests/integration/**/*.test.ts`.
- Integration tests should mock side-effect libraries (e.g. `discord.js`, canvas, network clients).
- CI (`ci.yml`) enforces lint + typecheck + Docker build on PRs.
- Deploy workflow (`deploy.yml`) enforces lint + typecheck + test before image push on `master`/`v*`.

## CI/Automation Expectations

- CI workflow (`.github/workflows/ci.yml`) runs:
  - `pnpm install --frozen-lockfile --ignore-scripts`
  - `pnpm run lint`
  - `pnpm tsc --noEmit`
  - Docker image build test
- Deploy workflow (`.github/workflows/deploy.yml`) runs:
  - `pnpm install --frozen-lockfile --ignore-scripts`
  - `pnpm run lint`
  - `pnpm tsc --noEmit`
  - `pnpm run test`
  - Docker image build/push + provenance attestation
  - release metadata artifact publish (`release-metadata.json`)
  - optional `repository_dispatch` to `AkatukiSora/k8s-deploys` when `K8S_DEPLOYS_REPO_TOKEN` is configured
- Pre-commit hook (`.husky/pre-commit`) runs:
  - `pnpm lint-staged`
  - `pnpm depcheck`
- `lint-staged` behavior (`package.json`):
  - Runs ESLint fixers
  - Runs Prettier write

## Code Style Guidelines

### Language And Modules

- Use TypeScript for source files under `src/`.
- Keep ESM imports/exports only; do not introduce CommonJS.
- For relative imports in TS, include `.js` extension (`./x.js`, `../y.js`).
- Path alias `@/*` is available via `tsconfig.json`; use sparingly and consistently.

### Imports

- Group imports by origin: external first, internal second.
- Prefer one import statement per module.
- Keep imports at file top-level.
- Remove unused imports (CI/lint should stay clean).
- Keep Node built-ins explicit (`node:path`, `node:url`) when appropriate.

### Formatting

- Follow Prettier defaults (repo has no custom prettier config).
- Use 2-space indentation.
- Use semicolons.
- Use double quotes in TS files.
- Use trailing commas where formatter applies them.
- Keep line length readable; let Prettier wrap long expressions.

### Types

- `strict` mode is enabled: keep code type-safe.
- `noImplicitAny` and `strictNullChecks` are enabled.
- Always type function params/returns when non-obvious.
- Prefer narrow types over `any`; use `unknown` then narrow when needed.
- Use existing shared types (`src/types/*.d.ts`) before creating duplicates.
- Respect Discord.js types (`CommandInteraction`, `Interaction`, etc.).

### Naming Conventions

- Files: lowercase (existing pattern: `master.ts`, `interaction.ts`).
- Functions/variables: `camelCase`.
- Types/interfaces: `PascalCase`.
- Constants: `camelCase` unless true global constants justify `UPPER_SNAKE_CASE`.
- Command module filenames should match slash command intent (`ping.ts`, `restart.ts`).

### Command Module Contract

- Command modules should export factory functions returning `Command`.
- Returned `Command` includes:
  - `data`: `SlashCommandBuilder`
  - `execute(interaction)`: async handler returning `Promise<void>`
  - optional `cooldown` number (seconds)
  - optional `requiredPermissions`
- Register commands through `src/commands/index.ts` and load via `loadCommands`.
- Keep command replies user-safe and localized to existing style.

### Logging And Error Handling

- Prefer `logger` from `src/logger.ts` over `console`.
- `no-console` is warning-level; avoid introducing new console usage in app code.
- Fail fast on missing critical env vars (existing pattern uses `process.exit(1)`).
- Wrap async external calls in `try/catch` where failures are expected.
- Provide user-facing fallback replies for command execution failures.
- Log enough context (command/user IDs, operation stage) for debugging.

### Environment And Secrets

- Never hardcode credentials/tokens.
- Read secrets via environment variables only.
- Do not commit `.env` files.
- Use `env.sample` as the source of truth for required keys.

## Agent Working Agreement

- Make the smallest safe change that solves the task.
- Preserve existing architecture unless refactor is requested.
- Run relevant checks before finishing:
  - Minimum for code changes: `pnpm run lint` and `pnpm tsc --noEmit`.
  - If formatting touched: `pnpm run format` (or format changed files).
- If a command cannot run locally, explain why and provide exact follow-up commands.
- Update this file when build/test/style workflow changes.
