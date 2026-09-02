# Sprint Metrics

A sprint metrics dashboard for Scrum and Kanban teams — velocity, burn-down/burn-up, Cumulative Flow Diagrams, and finish-date forecasts, entirely client-side with no backend. It reads and writes localStorage keys shared with the rest of the Agile Toolkit suite (Planning Poker, Scrum Facilitator, Moving Motivators, and more) so ceremony data doesn't need to be re-typed between tools.

Part of the [Agile Tools](https://github.com/bthos) suite built on Management 3.0 and ICAgile source materials.

See `GOAL.md` for why this app exists and `ROADMAP.md` for what's queued next.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · Recharts · react-i18next (EN/ES/BE/RU)

## Dev commands
```bash
npm install
npm run dev       # start Vite dev server
npm run build     # tsc typecheck + production build
npm run preview   # preview the production build locally
```

## Deploy
GitHub Pages via GitHub Actions on push to `main`.

## localStorage keys

Keys this app writes (its own data). Sprint Metrics also *reads* several keys owned by other suite apps for one-way integrations — see `.artefacts/BRIEF.md` → `## localStorage keys` for the full read/write matrix (Planning Poker, Moving Motivators, Improvement Board, Work Profiles, Kanban Designer).

| Key | Shape | Purpose |
|-----|-------|---------|
| `sprint-metrics-projects` | `ProjectRecord[]` (`id`, `name`, `config`, `sprints[]`, `createdAt`) | Named project library — all sprint data, current storage model |
| `sprint-metrics-active-project` | `string` (project id) | Which project is currently selected |
| `sprint-metrics:motivatorSnapshot` | `{ topMotivators[], shifts[], date }` | Last imported Moving Motivators snapshot, persisted after import |
| `sprint-metrics:lastSession` | `{ projectId, projectName, lastSprintName, lastSprintGoal, lastVelocity, avgVelocity, lastMood, targetScope, totalCompleted, sprintsRemaining, updatedAt }` | Snapshot written after every sprint add; read by Scrum Facilitator during ceremony prep |
| `sprint-metrics-sprints`, `sprint-metrics-config` | `SprintData[]`, `ProjectConfig` | Legacy single-project keys — read once for migration into `sprint-metrics-projects` on first load, not written going forward |

Note: the `theme` localStorage key (light/dark preference, written by `ThemeToggle.tsx`) is a shared design-system key used the same way across suite apps served from the same origin — not Sprint-Metrics-specific.

## Tech notes
- **State:** no state library — plain `useState`/`useEffect` in `App.tsx`, persisted to localStorage on every change. `ProjectRecord[]` is the source of truth; legacy single-project keys are migrated in once on load.
- **i18n:** `react-i18next`, one JSON catalog per locale in `src/i18n/{en,es,be,ru}.json`, loaded via `src/i18n/index.ts`. Language choice is per-user via `LanguagePicker.tsx`.
- **Theme:** `darkMode: 'class'` in `tailwind.config.js`, toggled via `data-theme` attribute on `<html>` (not a class) plus an anti-flash inline `<script>` in `index.html` that applies the stored theme before React mounts. `src/utils/theme.ts` exposes `useIsDarkMode()`, a hook watching that attribute via `MutationObserver`, used to theme Recharts tooltips (which don't inherit CSS).
- **Charts:** Recharts (`VelocityChart`, `BurnDownChart`, `BurnUpChart`, `CFDChart`) — `VelocityChart` is a `ComposedChart` with up to three optional right-axis overlays (mood, normalized velocity, health score) layered onto the base bar chart.
- **Cross-app integrations:** all one-way localStorage reads/writes, no network calls — see the table above and `.artefacts/BRIEF.md` for the full contract list (Planning Poker, Moving Motivators, Improvement Board, Change Planner, Scrum Facilitator, Work Profiles, Kanban Designer).
- **PWA:** `vite-plugin-pwa` (`generateSW`, autoUpdate) precaches the app shell for offline use during ceremonies.
- **Sprint deletion:** soft-delete with a 5s undo toast (`App.tsx`'s `handleDeleteSprint`/`undoDeleteSprint`) — the sprint is removed from `sprint-metrics-projects` immediately (no visual lag) but held in `lastDeleted` state for a 5-second grace window, re-insertable at its original index via the toast's Undo button. In-memory only, no new localStorage key. Only one undo is tracked at a time — deleting a second sprint while a toast is showing commits the first delete immediately.

## Source materials
See `.artefacts/BRIEF.md` for the full feature checklist and run-by-run agent log.
