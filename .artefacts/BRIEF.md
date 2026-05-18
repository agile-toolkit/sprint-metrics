# Sprint Metrics — Brief

## Overview

Sprint metrics dashboard: velocity, burn-down / burn-up, forecast, XLSX import (BacklogManager-style). React 18, Vite, Tailwind, Recharts, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Dashboard, charts, data views (`App.tsx`, chart components)
- [x] `burndown.ideal` used in `BurnDownChart.tsx`
- [x] `dashboard.ideal` — removed from en.json and ru.json (unused duplicate)
- [x] `data.delete` — wired as `title`/`aria-label` on delete buttons in `SprintDataTable.tsx` and `SprintDataView.tsx`
- [x] ES and BE locale support — `es.json`, `be.json` added; language selector upgraded to 4-option dropdown (EN/ES/BE/RU)
- [x] Planning Poker integration — "Import from Planning Poker" button in Project Settings; reads `sprintMetrics_planningPoker` localStorage key written by Planning Poker app; sums all finalEstimate values and pre-fills targetScope; shown in both Quick and Detailed data views
- [x] Sprint goal field + Copy Image — `goal?: string` added to SprintData; goal input in both data views; latest sprint goal shown as subtitle on dashboard; Copy Image button captures dashboard via html2canvas
- [x] Team mood/happiness index — `mood?: number` (1–5) added to SprintData; emoji picker (😫😟😐🙂😄) in both add-sprint forms; mood column in both data tables; VelocityChart upgraded to ComposedChart with secondary right Y-axis mood trend line (purple); i18n keys in all 4 locales
- [x] Moving Motivators integration — `MotivatorSnapshot` type added; "Import Motivators" JSON file button on dashboard; auto-detects `moving-motivators:lastSession` localStorage key; orange `★ Top motivator` ReferenceLine annotation on VelocityChart at most recent sprint; snapshot persisted in `sprint-metrics:motivatorSnapshot`; i18n keys in all 4 locales
- [x] CSV export — "Export CSV" button on dashboard header and in both data views; exports sprint name, planned, completed, carried over, goal, mood; dynamic filename `sprint-metrics-<project>-<date>.csv`; `results.exportCsv` i18n key in all 4 locales
- [x] Team capacity normalization — `teamSize?: number` and `absenceDays?: number` added to SprintData; optional inputs in both add-sprint forms; `normalizedVelocity = completed / ((teamSize * sprintLengthWeeks * 5) - absenceDays)` shown as indigo dashed line on VelocityChart right Y-axis (when no mood data) or in tooltip only (when mood data also present); `data.teamSize`, `data.absenceDays`, `data.normalizedVelocity` i18n keys in all 4 locales
- [x] Improvement Board integration — after adding a sprint, reads `improvement-board-items` localStorage key; if open items (status ≠ 'done') exist, shows dismissible amber toast with count and link to `https://agile-toolkit.github.io/improvement-board/`; `integration.improvementBoardOpen`, `integration.improvementBoardLink` i18n keys in all 4 locales

## Backlog

<!-- Issues awaiting human review; agent appends here during research runs -->
- [x] [#3] Integration: Import velocity target from Planning Poker session — implemented
- [x] [#4] Feature: Sprint goal field + shareable retrospective report — implemented
- [x] [#5] Feature: Team mood/happiness index per sprint (emoji 1–5, overlay on VelocityChart) — implemented
- [x] [#6] Integration: Moving Motivators → Sprint Metrics motivation-velocity overlay — implemented
- [x] [#7] Technical: Browser print API for zero-dependency retrospective PDF — implemented
- [x] [#15] Feature: CSV export of sprint data — implemented
- [x] [#16] Feature: Team capacity normalization — implemented
- [x] [#17] Integration: Improvement Board → Sprint Metrics retrospective link — implemented

## Tech notes

- Rollup may warn on large chunks; optional `manualChunks` later.

## Agent Log

### 2026-05-18 — feat: team capacity normalization + Improvement Board integration (#16, #17)
- Done: `teamSize?: number` and `absenceDays?: number` added to SprintData type; optional numeric inputs in both SprintDataTable and SprintDataView add-sprint forms (absenceDays disabled when no teamSize); VelocityChart now accepts `config` prop, computes `normalizedVelocity = completed / ((teamSize * sprintLengthWeeks * 5) - absenceDays)` per sprint; shown as indigo dashed line on right Y-axis when no mood data, or via hidden Line in tooltip only when mood data coexists; amber dismissible toast appears after sprint add when `improvement-board-items` localStorage key contains open items (status ≠ 'done'), with link to https://agile-toolkit.github.io/improvement-board/; i18n keys added to all 4 locales
- Closed: issues #16 and #17 (both approved → set to In Review)
- All known BRIEF features implemented
- Next task: check issues for human feedback

### 2026-05-18 — feat: CSV export of sprint data (issue #15)
- Done: updated `exportCSV(sprints, projectName)` in App.tsx to include goal, mood columns and dynamic filename `sprint-metrics-<project>-<date>.csv`; added "⬇ Export CSV" button to dashboard header (visible when sprints.length > 0); added `results.exportCsv` i18n key to EN/ES/BE/RU locales; existing export button in SprintDataTable and SprintDataView continues to work
- Closed: issue #15 (set to In Review)
- Remaining approved: #16 (team capacity normalization), #17 (Improvement Board integration)
- Next task: implement #16 — add teamSize/absenceDays to SprintData type; inputs in both add-sprint forms (SprintDataTable and SprintDataView); derive normalizedVelocity = completed / ((teamSize * sprintLengthWeeks * 5) - absenceDays); show as tooltip chip on VelocityChart bars; add data.teamSize, data.absenceDays, data.normalizedVelocity i18n keys to all 4 locales

### 2026-05-15 — research: market + integration opportunities (round 3)
- Done: checked all open issues (#2–#7) — all already implemented; no pending human feedback requiring action
- Created 3 new needs-review issues:
  - #15 Feature: CSV export of sprint data (Blob download, ~20 lines, no new deps)
  - #16 Feature: Team capacity normalization — velocity per point-day (teamSize + absenceDays in SprintData)
  - #17 Integration: Improvement Board → Sprint Metrics retrospective link (read improvement-board-items on sprint save)
- All 3 added to project board as Backlog
- Next task: check issues for human feedback

### 2026-05-12 — feat: Moving Motivators integration (issue #6)
- Done: added `MotivatorSnapshot` interface to `types.ts`; "🎯 Import Motivators" JSON file picker on dashboard header; auto-detects `moving-motivators:lastSession` localStorage key on mount; persists imported snapshot in `sprint-metrics:motivatorSnapshot`; orange `★ TopMotivator` `ReferenceLine` annotation on VelocityChart at most recent sprint; badge shows top 2 motivators with × clear button; `integration.importMotivators` and `integration.motivatorsClear` i18n keys in all 4 locales (EN/ES/BE/RU)
- Closed: issue #6 (set to In Review)
- All BRIEF features implemented
- Next task: check issues for human feedback

### 2026-05-12 — feat: browser print API (issue #7)
- Done: added `@media print` CSS to `src/index.css` (hide header, white background, card border normalisation); added `print:hidden` class to `<header>` and dashboard action buttons; added "🖨️ Print Report" button alongside "Copy Image" button (visible only with data), calls `window.print()`; added `results.printReport` i18n key to all 4 locales (EN/ES/BE/RU)
- Closed: issue #7 (set to In Review)
- Remaining approved: #6 (Moving Motivators motivation-velocity overlay)
- Next task: implement #6 — read `moving-motivators:lastSession` localStorage key; display top motivator name as annotation label on VelocityChart at the most recent sprint

### 2026-05-11 — feat: team mood/happiness index (issue #5)
- Done: added `mood?: number` to SprintData type; emoji picker (😫😟😐🙂😄 = 1–5) in SprintDataTable and SprintDataView add-sprint forms; mood column in both data tables; upgraded VelocityChart from BarChart to ComposedChart with secondary right Y-axis (domain 1–5, emoji ticks) and purple mood trend Line; skip sprints with no mood via `connectNulls={false}`; i18n keys `data.mood` and `data.moodLabel` added to EN/ES/BE/RU
- Closed: issue #5 (set to In Review)
- Remaining approved: #6 (Moving Motivators overlay), #7 (browser print PDF)
- Next task: implement #6 — Moving Motivators motivation-velocity overlay: read `moving-motivators:lastSession` localStorage key; show top motivator as annotation on VelocityChart; or implement #7 — browser print API (@media print CSS)

### 2026-05-11 — research: checked human feedback on open issues
- Found 3 approved issues: #5 (team mood index), #6 (Moving Motivators overlay), #7 (browser print PDF)
- Picked #5 as next implementation target; set project status → In Progress
- Next task: implement #5 — team mood/happiness index: add `mood?: number` to SprintData type; emoji scale input (😫😕😐🙂😄 = 1–5) in SprintDataTable and SprintDataView add-sprint forms; overlay secondary line on VelocityChart using Recharts ComposedChart with right Y-axis scaled 1–5; skip sprints with no mood; add data.mood and data.moodLabel i18n keys to all 4 locales

### 2026-05-09 — feat: sprint goal field + copy image (issue #4)
- Done: added `goal?: string` to SprintData type; goal text input in SprintDataTable and SprintDataView add-sprint forms; goal shown as italic line in table rows; latest sprint goal shown as italic subtitle on dashboard; Copy Image button on dashboard using html2canvas; all 4 locales updated with data.goal and results.copyImage keys
- Installed: html2canvas
- Closed: issue #4 (approved → implemented, set to In Review)
- Next task: check issues for human feedback (#5 team mood index, #6 Moving Motivators overlay, #7 browser print PDF)

### 2026-05-09 — research: checked human feedback on open issues
- Found 4 approved issues: #4 (sprint goal + shareable report), #5 (team mood index), #6 (Moving Motivators overlay), #7 (browser print PDF)
- Picked #4 as next implementation target; set project status → In Progress
- Next task: implement #4 — sprint goal field (add `goal?: string` to SprintData, text input in SprintDataTable + SprintDataView, display in dashboard) + shareable report via html2canvas (Copy Image button on dashboard)

### 2026-04-29 — feat: Planning Poker integration (issue #3)
- Done: added "Import from Planning Poker" button in Project Settings panel in both `SprintDataTable.tsx` and `SprintDataView.tsx`; reads `sprintMetrics_planningPoker` localStorage key (written by Planning Poker app on session close); sums all `finalEstimate` values; updates `targetScope` in ProjectConfig and auto-saves; shows 5s feedback message; all 4 locales updated (EN/ES/BE/RU)
- Closed: issue #3 (approved → implemented)
- Next task: check needs-review issues for human feedback (#4 sprint goal + retrospective report, #5 team mood index, #6 Moving Motivators overlay, #7 browser print PDF)

### 2026-04-29 — feat: ES and BE locale support
- Done: created `src/i18n/es.json` (full Spanish translations) and `src/i18n/be.json` (full Belarusian translations); wired both into `src/i18n/index.ts`; upgraded language toggle from EN↔RU button to 4-option dropdown (EN/ES/BE/RU) in `App.tsx`
- Closed: issue #2 (approved → implemented)
- Remaining approved issues: #3 Planning Poker integration, #4 Sprint goal + retrospective report, #5 Team mood index, #6 Moving Motivators overlay, #7 Browser print PDF
- Next task: implement issue #3 — Import velocity target from Planning Poker session (read `pp-session` localStorage key, pre-fill target scope in project config)

### 2026-04-26 — research: market + UX + integration opportunities (round 2)
- Done: checked open issues #2 #3 #4 — all still needs-review, no human response. Created 3 new needs-review issues:
  - #5 Team mood/happiness index per sprint (emoji scale, dual-axis VelocityChart)
  - #6 Moving Motivators → Sprint Metrics motivator-velocity overlay (snapshot import)
  - #7 Browser print API for zero-dependency retrospective PDF (window.print + @media print)
- Waiting for human review on all six backlog issues (#2–#7)
- Next task: check needs-review issues for human feedback (#2–#7)

### 2026-04-24 — research: market + integration + UX opportunities
- Done: checked open issues (none). Created 3 needs-review issues:
  - #2 ES+BE locale gap (suite standard requires 4 languages, only EN+RU exist)
  - #3 Planning Poker → Sprint Metrics velocity import integration (mirrors PP issue #4)
  - #4 Sprint goal field + dashboard image export for retrospectives
- Waiting for human review on all three
- Next task: check needs-review issues for human feedback (#2 ES/BE locales, #3 Planning Poker integration, #4 sprint goal+export)

### 2026-04-21 — fix: wire data.delete i18n key, remove unused dashboard.ideal
- Done: Removed `dashboard.ideal` from en.json and ru.json (was never referenced in components; `burndown.ideal` covers BurnDownChart). Wired `data.delete` as `title`/`aria-label` on the row-delete buttons in `SprintDataTable.tsx` and `SprintDataView.tsx`.
- All BRIEF features now implemented.
- Next task: check needs-review issues for human feedback; run research cycle for market/integration/UX improvements

### 2026-04-19 — docs: BRIEF template (AGENT_AUTONOMOUS)

- Done: Template migration.
- Next task: Fix `dashboard.ideal` and `data.delete` in `src/i18n/en.json`+`ru.json` (remove or wire to UI).
