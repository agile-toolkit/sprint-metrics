# BRIEF

Derived per [`agent-state.NO-BRIEF.md`](https://github.com/agile-toolkit/.github/blob/main/agent-state.NO-BRIEF.md). There was **no prior** `BRIEF.md`. Sources: `README.md`, `src/i18n/en.json` / `ru.json`, `src/`. Generated **2026-04-19**.

## Product scope (from `README.md`)

- Sprint metrics: **velocity**, **burn-down / burn-up**, **release forecast**, **XLSX import** (BacklogManager templates).
- Stack: React 18, Vite, Tailwind, Recharts, react-i18next (EN/RU).

## Build

- `npm run build` — **passes** (verified **2026-04-19**; Rollup chunk-size warning only).

## TODO / FIXME in `src/`

- None.

## i18n — orphaned keys

- **`dashboard.ideal`** — not referenced; burn-down chart uses **`burndown.ideal`** (`BurnDownChart.tsx`). Remove **`dashboard.ideal`** from locales **or** use it in the dashboard summary if that line was intended.
- **`data.delete`** — not referenced under `src/`; confirm whether delete-row action exists; if not, remove key pair from `en.json` / `ru.json`.

## Classification (NO-BRIEF)

- **Status:** `in-progress` — trivial locale cleanup.
- **First next task:** Open `src/i18n/en.json` and `ru.json`, search **`dashboard.ideal`** and **`data.delete`**; remove unused entries **or** wire `data.delete` to the data-table delete control if the UI exists without i18n.
