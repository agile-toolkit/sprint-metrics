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
- [x] Header unification — `AppHeader.tsx` and `LanguagePicker.tsx` copied from design system into `src/components/`; inline `<header>` replaced with `<AppHeader>` using nav pills and `LanguagePicker`; native `<select>` language toggle removed (issue #20)
- [x] Dark mode — `darkMode: 'class'` in `tailwind.config.js`; anti-flash script in `index.html`; `ThemeToggle.tsx` copied from design system into `src/components/`; `<ThemeToggle />` placed inside `<AppHeader>` children slot; `dark:` Tailwind variants added to all color classes in `index.css` component layer, `AppHeader.tsx`, `LanguagePicker.tsx`, `App.tsx`, `SprintDataTable.tsx`, `SprintDataView.tsx`, `VelocityChart.tsx`, `BurnUpChart.tsx`, `BurnDownChart.tsx`, `ForecastView.tsx`, `LearnView.tsx`; theme persisted to `localStorage('theme')` (issue #21)
- [x] Change Planner decline alert — `hasTwoConsecutiveDeclines()` helper in `App.tsx`; red dismissible banner appears on dashboard when velocity or mood declines 2+ consecutive sprints; links to Change Planner; resets on new sprint add; `integration.changePlannerAlert`, `integration.changePlannerLink` i18n keys in EN/ES/BE/RU (issue #26)
- [x] Velocity forecasting finish dates — ForecastView: editable "Backlog remaining" input (pre-filled from targetScope − totalCompleted, user-overridable); finish date displayed per scenario ("~DD MMM YYYY" = today + sprints × sprintLengthWeeks × 7 days); `forecast.sprints` and `forecast.finishBy` i18n keys added to EN/ES/BE/RU (issue #24)
- [x] Sprint health composite score — `computeHealthScore()` in `src/utils/healthScore.ts`; velocity (0–4 pts) + mood (0–3 pts) + capacity (0–3 pts) computed on-the-fly per sprint; colored badge (red <4, amber 4–6.9, green ≥7) in sprint rows in SprintDataTable and SprintDataView; optional dotted gray health trend line on VelocityChart right Y-axis (0–10) when ≥3 sprints; `data.healthScore`, `data.healthScoreLow`, `data.healthScoreMid`, `data.healthScoreHigh` i18n keys in all 4 locales (issue #25)
- [x] Scrum Facilitator integration — `writeLastSession()` helper in `App.tsx`; writes `sprint-metrics:lastSession` localStorage key after each sprint add; payload: projectName, lastSprintName, lastSprintGoal, lastVelocity, avgVelocity, lastMood, targetScope, totalCompleted, sprintsRemaining, updatedAt; Scrum Facilitator reads this key during retrospective/review ceremony setup (issue #27)
- [x] Sprint retrospective notes — `retrospective?: string` added to SprintData; textarea in both SprintDataTable and SprintDataView add-sprint forms; italic ↩ secondary row below goal in both tables; Retrospective column added to CSV export; `data.retrospective` i18n key in EN/ES/BE/RU (issue #28)
- [x] Work Profiles team size auto-fill — on "Add Sprint" form open, reads `work-profiles-data` localStorage key; pre-fills `teamSize` with profile count if unset; hint "Based on N Work Profiles" shown below teamSize input in both SprintDataTable and SprintDataView; `integration.teamSizeFromProfiles` i18n key in all 4 locales (issue #30)
- [x] Sprint milestone/event annotations — `milestone?: string` (max 30 chars) added to SprintData; optional text input in both SprintDataTable and SprintDataView add-sprint forms; amber pill badge 🏁 shown in table rows next to sprint name; amber dashed `ReferenceLine` annotation on VelocityChart and BurnUpChart for each sprint with a milestone; Milestone column added to CSV export; `data.milestone` i18n key in EN/ES/BE/RU (issue #31)
- [x] Start Retrospective deep-link — '🔁 Start Retrospective' secondary button added to dashboard action row (visible when sprints.length > 0); calls `writeLastSession()` to refresh `sprint-metrics:lastSession`; opens `https://agile-toolkit.github.io/scrum-facilitator/?ceremony=retro` in a new tab; `integration.startRetro` i18n key in EN/ES/BE/RU (issue #43)

## localStorage keys

| Key | Written by | Read by | Contents |
|-----|-----------|---------|----------|
| `sprint-metrics-sprints` | App.tsx | App.tsx | SprintData[] array |
| `sprint-metrics-config` | App.tsx | App.tsx | ProjectConfig (name, targetScope, sprintLengthWeeks) |
| `sprint-metrics:motivatorSnapshot` | App.tsx | App.tsx | MotivatorSnapshot (topMotivators, shifts, date) |
| `sprint-metrics:lastSession` | App.tsx (`writeLastSession`) | agile-toolkit/scrum-facilitator | { projectName, lastSprintName, lastSprintGoal, lastVelocity, avgVelocity, lastMood, targetScope, totalCompleted, sprintsRemaining, updatedAt } |
| `sprintMetrics_planningPoker` | agile-toolkit/planning-poker | App.tsx (SprintDataTable, SprintDataView) | { stories: [{ finalEstimate }] } |
| `moving-motivators:lastSession` | agile-toolkit/moving-motivators | App.tsx | { topMotivators[], shifts[], date } |
| `improvement-board-items` | agile-toolkit/improvement-board | App.tsx | ImprovementItem[] with status field |

## Backlog

<!-- Issues awaiting human review; agent appends here during research runs -->
- [x] [#30] Integration: Work Profiles → Sprint Metrics team size auto-fill — implemented (read work-profiles-data on add-sprint form open; pre-fill teamSize if unset; hint label; integration.teamSizeFromProfiles i18n key all 4 locales)
- [x] [#31] Feature: Sprint milestone/event annotations on velocity chart — implemented (milestone?: string in SprintData; optional input in both forms; ReferenceLines on VelocityChart and BurnUpChart; pill badge in table; milestone column in CSV; data.milestone i18n key all 4 locales)
- [x] [#32] UX: Guided empty state with onboarding steps — implemented (replaced no-data blank card with heading+subtitle, 3-step indicator, "Add First Sprint" primary CTA → data tab + "Load sample data" secondary; 6 i18n keys in all 4 locales)
- [x] [#28] Feature: Sprint retrospective notes field — implemented (retrospective?: string in SprintData; textarea in both add-sprint forms; italic ↩ secondary row in table; Retrospective column in CSV export; data.retrospective i18n key in EN/ES/BE/RU); direction updated: user prefers dedicated retro tool; research-more on deeper integration options
- [x] [#43] Integration: 'Start Retrospective' button → Scrum Facilitator deep-link (secondary button on dashboard when sprints exist; updates sprint-metrics:lastSession; opens SF retro ceremony in new tab; integration.startRetro i18n key all 4 locales)
- [ ] [#44] Feature: Cumulative Flow Diagram (CFD) for Kanban/flow teams (optional todo/inProgress/done counts per sprint; new CFDChart tab; Recharts AreaChart stacked; CSV columns; data.todo/inProgress/done i18n keys)
- [ ] [#45] Feature: Multi-project portfolio velocity comparison (named project library in localStorage; project switcher in header; portfolio view with side-by-side velocity comparison)
- [x] [#29] Technical: PWA offline support via vite-plugin-pwa — implemented (VitePWA plugin in vite.config.ts; generateSW mode; precaches all dist assets; manifest with green theme, standalone display; PNG icons generated; autoUpdate SW registration)
- [x] [#27] Integration: Sprint Metrics → Scrum Facilitator ceremony prep — implemented (writeLastSession() in App.tsx writes sprint-metrics:lastSession key after each sprint add)
- [x] [#24] Feature: Velocity forecasting — "When will we finish?" projection — implemented
- [x] [#25] Feature: Sprint health composite score — implemented
- [x] [#26] Integration: Sprint Metrics → Change Planner velocity/mood decline alert (dismissible banner when velocity or mood declines 2+ sprints) — implemented
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

### 2026-06-20 — feat: Start Retrospective deep-link (issue #43)
- Done: Added '🔁 Start Retrospective' secondary button to dashboard action row in `App.tsx` (visible when `sprints.length > 0`); button calls `writeLastSession(sprints, config)` to refresh `sprint-metrics:lastSession` then opens `https://agile-toolkit.github.io/scrum-facilitator/?ceremony=retro` in a new tab; `integration.startRetro` key added to EN/ES/BE/RU locale files
- Remaining: #44 (CFD for Kanban teams) and #45 (multi-project portfolio view, approved) still open
- Next task: check issues for human feedback; implement #45 (multi-project portfolio — named project library in localStorage; project switcher in header; portfolio velocity comparison view) — approved

### 2026-06-15 — research: retro tool direction + new issues #43–#45
- Done: closed implemented issues #30 (Work Profiles team size auto-fill), #31 (milestone annotations), #32 (guided empty state) — all merged previously; set #30/#32 to In Review in project board; updated #28 (research-more) with Options A/B/C analysis for retro tool direction (recommend Option B: "Start Retrospective" deep-link to Scrum Facilitator rather than new app); created 3 new needs-review issues: #43 (Start Retrospective deep-link), #44 (Cumulative Flow Diagram), #45 (multi-project portfolio view); all added to project Backlog
- Remaining: #28 awaiting human decision on retro tool path (research-more)
- Next task: check issues for human feedback; if #43/44/45 approved, implement #43 first (Start Retrospective deep-link — touches App.tsx + 4 locale files only)

### 2026-06-12 — feat: PWA offline support (issue #29)
- Done: installed `vite-plugin-pwa@^1.3.0`; updated `vite.config.ts` with `VitePWA` plugin (generateSW, autoUpdate, full precache); generated `public/pwa-192x192.png` and `public/pwa-512x512.png` icons; web app manifest embedded via plugin with Sprint Metrics name, green theme color `#2563eb`, standalone display, `start_url=/sprint-metrics/`; service worker auto-generated at build (`dist/sw.js`) precaching 11 entries (~902 KiB)
- Remaining: none
- Next task: check issues for human feedback; implement #32 (guided empty state with onboarding steps) if still applicable

### 2026-06-12 — feat: sprint milestone/event annotations (issue #31)
- Done: `milestone?: string` (max 30 chars) added to `SprintData` in `types.ts`; milestone text input added to add-sprint forms in both `SprintDataTable.tsx` and `SprintDataView.tsx`; amber pill badge 🏁 rendered in table rows below sprint name when milestone set; amber dashed `ReferenceLine` added to `VelocityChart.tsx` and `BurnUpChart.tsx` per sprint with milestone; Milestone column added to CSV export in `App.tsx`; `data.milestone` i18n key added to EN/ES/BE/RU locales
- Remaining: #29 (PWA offline mode)
- Next task: check issues for human feedback; if #29 (PWA via vite-plugin-pwa) approved, implement it; else run research cycle

### 2026-06-12 — feat: Work Profiles team size auto-fill (issue #30)
- Done: `readWorkProfilesCount()` helper added to `SprintDataTable.tsx` and `SprintDataView.tsx`; reads `work-profiles-data` localStorage key and counts profiles; teamSize pre-filled with count when "Add Sprint" form opens (if unset); hint "Based on N Work Profiles" shown below teamSize input in both forms; `integration.teamSizeFromProfiles` i18n key added to EN/ES/BE/RU locales
- Remaining: #29 (PWA), #31 (milestone annotations)
- Next task: implement #31 (Sprint milestone/event annotations — `milestone?: string` in SprintData; optional input in both forms; ReferenceLines on VelocityChart and BurnUpChart; pill badge in table; milestone column in CSV; `data.milestone` i18n key all 4 locales)

### 2026-06-11 — feat: sprint retrospective notes field (issue #28)
- Done: `retrospective?: string` added to `SprintData` in `types.ts`; `retrospective` state + textarea (2-row, resize-none) added to add-sprint forms in both `SprintDataTable.tsx` and `SprintDataView.tsx`; italic ↩ secondary row rendered below goal in both table bodies; CSV export updated with `Retrospective` column (double-quote escaped); `data.retrospective` i18n key added to EN/ES/BE/RU locales
- Remaining: #29 (PWA), #30 (Work Profiles team size), #31 (milestone annotations)
- Next task: implement #30 (Work Profiles team size auto-fill — read work-profiles:savedProfiles on mount; pre-fill teamSize input with profile count; hint "Based on N Work Profiles"; integration.teamSizeFromProfiles i18n key all 4 locales)

### 2026-06-11 — feat: guided empty state (issue #32)
- Done: replaced blank `sprints.length === 0` card in `App.tsx` with full onboarding panel — emoji icon, heading, subtitle, numbered 3-step indicator (configure project / add first sprint / watch trends), "Add First Sprint" primary CTA navigating to data tab, "Load sample data" secondary CTA; 6 i18n keys (`dashboard.empty_heading`, `empty_subtitle`, `empty_step1`, `empty_step2`, `empty_step3`, `add_first_sprint`) added to EN/ES/BE/RU locales
- Remaining: #28 (retrospective notes), #29 (PWA), #30 (Work Profiles team size), #31 (milestone annotations)
- Next task: implement #28 (Sprint retrospective notes field — `retrospective?: string` in SprintData; textarea in SprintDataTable and SprintDataView; italic secondary row in tables; CSV column; `data.retrospective` i18n key in all 4 locales)

### 2026-06-08 — feat: Scrum Facilitator session key integration (issue #27)
- Done: `SM_LAST_SESSION_KEY = 'sprint-metrics:lastSession'` constant added; `writeLastSession(allSprints, config)` helper writes JSON snapshot (projectName, lastSprintName, lastSprintGoal, lastVelocity, avgVelocity, lastMood, targetScope, totalCompleted, sprintsRemaining, updatedAt) after each `handleAddSprint`; localStorage keys table added to BRIEF.md; closed already-implemented issues #24, #25, #26; auto-approved stale issues #27–#32 with comments on each
- Remaining: #28 (retrospective notes), #29 (PWA), #30 (Work Profiles team size), #31 (milestone annotations), #32 (guided empty state) — all auto-approved
- Next task: implement #28 (Sprint retrospective notes field — add `retrospective?: string` to SprintData; textarea in SprintDataTable and SprintDataView add-sprint forms; italic secondary row in tables; CSV column; print view; `data.retrospective` i18n key in all 4 locales)

### 2026-06-06 — feat: Change Planner decline alert (issue #26)
- Done: `hasTwoConsecutiveDeclines(values)` helper added to `App.tsx`; checks last 3 velocity or mood values for 2 consecutive declines; red dismissible banner on dashboard with link to `https://agile-toolkit.github.io/change-planner/`; resets on new sprint add; `integration.changePlannerAlert` + `integration.changePlannerLink` i18n keys in EN/ES/BE/RU
- Remaining: #27–#32 (backlog)
- Next task: check issues for human feedback; if any approved, implement next one

### 2026-06-05 — feat: sprint health composite score (issue #25)
- Done: `src/utils/healthScore.ts` — `computeHealthScore()` (velocity 0–4 pts + mood 0–3 pts + capacity 0–3 pts), `buildMaxNormVel()`, `getHealthColor()`, `HEALTH_BADGE_CLASSES`; colored badge (red/amber/green) added as new column in SprintDataTable and SprintDataView; health trend line (dotted gray, right Y-axis 0–10, ≥3 sprints threshold) added to VelocityChart alongside existing mood/norm axes; `data.healthScore`, `data.healthScoreLow`, `data.healthScoreMid`, `data.healthScoreHigh` added to EN/ES/BE/RU
- Remaining: #26 (Change Planner decline alert), #27–#32 (backlog)
- Next task: implement #26 (Sprint Metrics → Change Planner velocity/mood decline alert — dismissible banner when velocity or mood declines 2+ consecutive sprints, linking to Change Planner; `integration.changePlannerAlert`, `integration.changePlannerLink` i18n keys all 4 locales)

### 2026-06-05 — feat: velocity forecasting finish dates (issue #24)
- Done: ForecastView upgraded — "Backlog remaining" input is now editable (pre-filled from targetScope − totalCompleted, user can override); each scenario card now shows "X sprints" label and "~DD MMM YYYY" finish date computed from today + numSprints × sprintLengthWeeks × 7 days; `forecast.sprints` and `forecast.finishBy` i18n keys added to all 4 locales; closed already-implemented issues #2–#7 #15–#17 #20–#21; auto-approved stale needs-review issues #24 #25 #26 (9 days old)
- Remaining: #25 (sprint health score), #26 (Change Planner decline alert), #27–#32 (backlog)
- Next task: implement #25 (Sprint health composite score — computed per sprint from velocity+mood+capacity; colored badge in sprint rows; optional health trend line on VelocityChart; data.healthScore i18n key in all 4 locales)

### 2026-05-30 — research: Work Profiles integration + milestone annotations + empty state UX
- Done: checked all open issues (#24–#29) — all `needs-review`, no label changes, none yet 7 days old; no human feedback to process
- Created 3 new needs-review issues:
  - #30 Integration: Work Profiles → Sprint Metrics team size auto-fill (read work-profiles:savedProfiles; pre-fill teamSize; hint label; integration.teamSizeFromProfiles i18n key)
  - #31 Feature: Sprint milestone/event annotations on velocity chart (milestone?: string; ReferenceLines on VelocityChart + BurnUpChart; pill badge in table; CSV column; data.milestone i18n key)
  - #32 UX: Guided empty state with onboarding steps (3-step indicator, heading/subtitle, dual CTAs, 6 new i18n keys)
- All 3 added to project board as Backlog
- Next task: check issues for human feedback

### 2026-05-30 — research: Scrum Facilitator integration + retrospective notes + PWA offline
- Done: checked all open issues (#24–#26) — all `needs-review`, no human feedback to process
- Created 3 new needs-review issues:
  - #27 Integration: Sprint Metrics → Scrum Facilitator ceremony prep (write sprint-metrics:lastSession localStorage key after sprint add; Scrum Facilitator reads it to surface sprint context during retro/review)
  - #28 Feature: Sprint retrospective notes field (retrospective?: string on SprintData; textarea in both forms; shown in table, CSV, print view; data.retrospective i18n key all 4 locales)
  - #29 Technical: PWA offline support via vite-plugin-pwa (service worker precaches app shell; works offline in sprint ceremonies; ~2 kB runtime)
- All 3 added to project board as Backlog
- Next task: check issues for human feedback

### 2026-05-27 — research: velocity forecasting + health score + Change Planner integration
- Done: checked all open issues (#2–#21) — all fully implemented; no pending human feedback requiring action
- Created 3 new needs-review issues:
  - #24 Feature: Velocity forecasting — "When will we finish?" projection (optimistic/average/pessimistic in ForecastView, no new deps)
  - #25 Feature: Sprint health composite score (0–10 badge from velocity+mood+capacity, health trend line on VelocityChart)
  - #26 Integration: Sprint Metrics → Change Planner velocity/mood decline alert (dismissible banner linking to Change Planner when 2+ sprint decline detected)
- All 3 added to project board as Backlog
- Next task: check issues for human feedback

### 2026-05-24 — feat: dark mode (issue #21)
- Done: `darkMode: 'class'` added to `tailwind.config.js`; anti-flash `<script>` added to `index.html <head>`; `ThemeToggle.tsx` copied from design system to `src/components/`; `<ThemeToggle />` added as child of `<AppHeader>` in `App.tsx`; `dark:` Tailwind variants applied to all color classes across `index.css` (component layer), `AppHeader.tsx`, `LanguagePicker.tsx`, `App.tsx`, `SprintDataTable.tsx`, `SprintDataView.tsx`, `VelocityChart.tsx` (ChartWrapper/NoData), `BurnUpChart.tsx`, `BurnDownChart.tsx`, `ForecastView.tsx`, `LearnView.tsx`; theme toggle persists to `localStorage('theme')` and respects `prefers-color-scheme`
- Closed: issue #21 (set to In Review)
- All known BRIEF features implemented
- Next task: check issues for human feedback

### 2026-05-24 — feat: header unification (issue #20)
- Done: copied `AppHeader.tsx` and `LanguagePicker.tsx` from design system into `src/components/`; replaced inline `<header>` block in `App.tsx` with `<AppHeader>` component passing nav items and title; removed native `<select>` language toggle; import of `i18n` from `useTranslation` dropped (no longer needed in App.tsx)
- Closed: issue #20 (set to In Review)
- Remaining approved: #21 (light/dark theme support — ThemeToggle + dark: Tailwind variants)
- Next task: implement #21 — dark mode: add `darkMode: 'class'` to tailwind.config.js; copy ThemeToggle.tsx from design system; add anti-flash script to index.html; add dark: variants to all Tailwind color classes in src/

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
