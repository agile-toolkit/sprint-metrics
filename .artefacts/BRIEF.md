# Sprint Metrics — Brief

## Overview

Sprint metrics dashboard: velocity, burn-down / burn-up, forecast, XLSX import (BacklogManager-style). React 18, Vite, Tailwind, Recharts, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Dashboard, charts, data views (`App.tsx`, chart components)
- [x] `burndown.ideal` used in `BurnDownChart.tsx`
- [x] `dashboard.ideal` — removed from en.json and ru.json (unused duplicate)
- [x] `data.delete` — wired as `title`/`aria-label` on delete buttons in `SprintDataTable.tsx` and `SprintDataView.tsx`

## Backlog

<!-- Issues awaiting human review; agent appends here during research runs -->
- [ ] [#2] Feature: Add ES and BE locale support (suite standard EN+ES+BE+RU)
- [ ] [#3] Integration: Import velocity target from Planning Poker session
- [ ] [#4] Feature: Sprint goal field + shareable retrospective report

## Tech notes

- Rollup may warn on large chunks; optional `manualChunks` later.

## Agent Log

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
