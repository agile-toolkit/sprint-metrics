# Sprint Metrics — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic
None — idle. See `## Next epics` below.

## Next epics
1. **E1: Cross-app context integrations** — serves #4. Import retrospective sticky notes from Scrum Facilitator's ceremony history so the `retrospective` field can be pre-filled instead of retyped ([#52](https://github.com/agile-toolkit/sprint-metrics/issues/52)), and show a small team-symbol badge sourced from Team Identity's saved charter in the dashboard header ([#56](https://github.com/agile-toolkit/sprint-metrics/issues/56)).
2. **E2: Quarterly rollup view** — serves #2. New `QuarterlyView.tsx` grouping sprints into quarters with aggregated totals, average velocity/mood, and per-quarter sparklines, for stakeholder reporting ([#53](https://github.com/agile-toolkit/sprint-metrics/issues/53)).
3. **E3: Chart accessibility and bundle size** — serves #2. Screen-reader-accessible data tables beneath all four Recharts charts ([#54](https://github.com/agile-toolkit/sprint-metrics/issues/54)), and code-splitting `html2canvas` behind the Copy Image click so it isn't in the main bundle for sessions that never use it ([#55](https://github.com/agile-toolkit/sprint-metrics/issues/55)).
4. **E4: Sprint deletion safety** — serves #1. Soft-delete with a 5s "Undo" toast so an accidental row delete doesn't force re-entry of every field, companion to the already-shipped inline editing ([#57](https://github.com/agile-toolkit/sprint-metrics/issues/57)).

Note: issue [#51](https://github.com/agile-toolkit/sprint-metrics/issues/51) (Recharts tooltip dark mode) shows as open on GitHub but is already implemented (commit `cd8144e`, see BRIEF.md Agent Log 2026-07-13) — it just hasn't been closed yet. Treated as shipped here, not as a queued epic.

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
