# Sprint Metrics — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic
None — idle. See `## Next epics` below.

## Next epics
1. **E1: Cross-app context integrations** — serves #4. Import retrospective sticky notes from Scrum Facilitator's ceremony history so the `retrospective` field can be pre-filled instead of retyped ([#52](https://github.com/agile-toolkit/sprint-metrics/issues/52)), and show a small team-symbol badge sourced from Team Identity's saved charter in the dashboard header ([#56](https://github.com/agile-toolkit/sprint-metrics/issues/56)).
2. **E2: Quarterly rollup view** — serves #2. New `QuarterlyView.tsx` grouping sprints into quarters with aggregated totals, average velocity/mood, and per-quarter sparklines, for stakeholder reporting ([#53](https://github.com/agile-toolkit/sprint-metrics/issues/53)).
3. **E3: Chart accessibility and bundle size** — serves #2. Screen-reader-accessible data tables beneath all four Recharts charts ([#54](https://github.com/agile-toolkit/sprint-metrics/issues/54)), and code-splitting `html2canvas` behind the Copy Image click so it isn't in the main bundle for sessions that never use it ([#55](https://github.com/agile-toolkit/sprint-metrics/issues/55)).

## Recently shipped
**Fix low-contrast delete icons; i18n the "Dismiss" buttons** (2026-09-02) — see `## Shipped`. A suite-wide UX audit flagged near-invisible `text-gray-200`/`gray-300` delete icons and 3 hardcoded-English "Dismiss" aria-labels despite the app supporting ES/BE/RU. Fixed both.

**Remove Management 3.0 reference; fix invisible brand colors; first test coverage** (2026-09-02) — see `## Shipped`. Dropped a stray "Management 3.0" mention from `README.md`; completed the `brand` Tailwind scale (`200`/`300`/`800`/`900` were undefined but referenced in code); extracted `App.tsx`'s pure logic into `src/sprintData.ts` and added this repo's first automated tests.

**E4: Sprint deletion safety** (2026-09-02) — see `## Shipped`. [#57](https://github.com/agile-toolkit/sprint-metrics/issues/57) shipped.

## Polish backlog
- Rollup/Vite may warn on large chunks at build time; no issue filed — consider `manualChunks` if it becomes disruptive.

## Shipped
- ~~Core dashboard: velocity/burn-down/burn-up charts, sprint data table, guided empty state~~
- ~~4-language i18n (EN/ES/BE/RU)~~
- ~~Dark mode with design system v2 tokens (header, charts, tooltips)~~
- ~~Multi-project portfolio comparison~~
- ~~Cumulative Flow Diagram (CFD) for Kanban/flow teams~~
- ~~Sprint health composite score, mood tracking, capacity normalization~~
- ~~Velocity forecasting with finish-date projections~~
- ~~CSV export, Copy Image, browser print report~~
- ~~Sprint goal, milestone annotations, retrospective notes fields~~
- ~~Inline sprint editing~~
- ~~PWA offline support~~
- ~~Cross-app integrations: Planning Poker, Moving Motivators, Improvement Board, Change Planner, Scrum Facilitator, Work Profiles, Kanban Designer~~

**v0.2.0 — [E4: Sprint deletion safety](https://github.com/agile-toolkit/sprint-metrics/issues/57)** (2026-09-02):
- ~~Soft-delete with a 5s "Undo" toast so an accidental row delete doesn't force re-entry of every field~~

**v0.2.1 — Remove Management 3.0 ref; fix invisible brand colors; first tests** (2026-09-02):
- ~~Removed a stray "Management 3.0" mention from README.md~~
- ~~Completed the `brand` Tailwind color scale (200/300/800/900 were
  missing but used in code)~~
- ~~Extracted `App.tsx`'s pure logic into `src/sprintData.ts`; added
  `vitest` + `jsdom` and 21 tests~~

**v0.2.2 — Fix low-contrast delete icons; i18n the "Dismiss" buttons** (2026-09-02):
- ~~Bumped delete/edit icon colors from `gray-200`/`gray-300` to
  `gray-400`/`gray-500`; added a missing `aria-label`~~
- ~~Moved 3 hardcoded-English "Dismiss" aria-labels into a new
  `common.dismiss` i18n key~~
