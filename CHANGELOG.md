# Changelog

## Unreleased

## 0.4.4 — Import retro notes from Scrum Facilitator (2026-09-05)

- **feat** (issue #52): when the add-sprint form is open in either
  `SprintDataTable.tsx` (quick entry) or `SprintDataView.tsx` (detailed
  table), a "📋 Import from Scrum Facilitator (retro on {{date}})" link
  appears under the Retrospective Notes field if Scrum Facilitator's
  `scrum-facilitator-history` has a recent retro session with sticky
  notes. Clicking it fills the field with all non-empty notes flattened
  as `• <text>` bullets, prefixed by column name when the retro used
  more than one column (e.g. `Well:\n• Item 1\nImprove:\n• Item 2`);
  the user can edit before saving. New `src/utils/scrumFacilitatorImport.ts`
  (`readLatestRetroNotes`) with 9 unit tests.
  - Answers to the issue's open questions: (1) one-click **replace**, not
    append — matches the "click to pre-fill" pattern already used by the
    Moving Motivators interests import elsewhere in the suite; (2) no
    staleness cutoff — the history is already capped at 5 entries, and
    the button's own date label lets the user judge freshness themselves
    rather than silently hiding an older-but-still-useful retro.

## 0.4.3 — Team Identity badge on the dashboard (2026-09-05)

- **feat** (issue #56): reads Team Identity's `team-identity:lastSession`
  key (written on every charter save) and, when present, shows a small
  badge under the project name on the Dashboard tab — the team's symbol
  plus name (e.g. "🦉 Nightwatch — sprint dashboard"), linking to
  Team Identity in a new tab. Graceful fallback: renders exactly as
  before when the key is missing or malformed. New
  `loadTeamIdentitySnapshot()` in `sprintData.ts` (4 new unit tests) and
  `integration.teamIdentityBadge`/`teamIdentityBadgeTitle` i18n keys in
  all four locales.
  - Answers to the issue's open questions: (1) badge shown on the
    Dashboard tab only, next to the project name, not persisted across
    every tab — keeps other screens uncluttered; (2) the same badge
    applies regardless of which project is active, since
    `team-identity:lastSession` only ever holds one (the most recent)
    team's data.

## 0.4.2 — Accessible data tables for charts (2026-09-05)

- **a11y** (issue #54): `VelocityChart`, `BurnDownChart`, `BurnUpChart`,
  and `CFDChart` render entirely as SVG via Recharts, with nothing for a
  screen reader to read. Each chart's `<ResponsiveContainer>` is now
  wrapped in `role="img" aria-hidden="true"`, paired with a visually
  hidden (`sr-only`) `<table>` sibling summarising the same data with an
  `aria-label` matching the chart's title — the standard accessible-chart
  pattern (WCAG 2.1 SC 1.1.1). No visual change for sighted users;
  verified in a real browser that the charts render identically and the
  four accessible tables exist in the DOM with real data rows.
  - `VelocityChart`: Sprint | Planned | Completed | Carried Over | Mood
    (if present) | Normalised Velocity (if present)
  - `BurnDownChart`: Day | Ideal Remaining | Actual Remaining
  - `BurnUpChart`: Sprint | Cumulative Completed | Target Scope
  - `CFDChart`: Sprint | To Do | In Progress | Done
  - New `a11y` i18n keys (`day`, `velocity_table`, `burndown_table`,
    `burnup_table`, `cfd_table`) in all four locales; every other table
    header reuses an existing translation key.

## 0.4.1 — Lazy-load html2canvas (2026-09-05)

- **perf** (issue #55): `html2canvas` (~200 KB gzipped ~50 KB) was
  imported statically at the top of `App.tsx` even though it's only
  used by the "Copy Image" button. Replaced with a dynamic
  `import('html2canvas')` inside the click handler, so it's now its
  own chunk (`html2canvas.esm-*.js`) that only loads on first use — every
  visitor who never clicks Copy Image no longer downloads it. The
  existing `copying` disabled/loading state on the button already
  covers the one-time chunk-fetch delay, so no new UI state was needed.

## 0.4.0 — AgileEVM (2026-09-04)

- **feat**: new "EVM" tab implementing AgileEVM — earned value management
  adapted to Scrum (Sulaiman & Baham), with story points standing in for
  the traditional dollar budget. Set a release-length baseline (`plannedSprints`)
  and see Planned Value, Earned Value, SPI (schedule performance index), and
  a schedule-derived finish forecast, on top of a PV/EV line chart. Schedule
  side only for this release — see `src/agileEvm.ts`'s doc comment for why a
  cost-side CPI needs genuine per-sprint actual-cost data to be an honest
  second signal rather than a relabeled SPI.
- **fix**: "Load Sample Data" silently didn't load anything — `updateSprints()`
  followed by `updateConfig()` in the same click handler both read the same
  stale `projects` state, so the second call discarded the first's effect.
  Found while manually verifying the EVM feature in a browser. Fixed as a
  single `persistProjects` call (`loadSampleData` in `App.tsx`).

## 0.3.2 — Add glass effect to the header (2026-09-04)

- **fix**: `AppHeader.tsx`'s background changed from opaque
  `bg-white`/`dark:bg-gray-900` to `bg-[var(--glass)] backdrop-blur-sm` —
  the Dashboard's own nav has always had this translucent blur effect,
  but the shared header every app copies did not. User-reported
  inconsistency. Verified in both themes.

## 0.3.1 — Sync icons; CI Node bump (2026-09-04)
- **ci**: CI Node bumped 20 → 22 and `engines` declared. `jsdom@30` requires
  Node `^22.22.2 || ^24.15.0 || >=26`, so the test step could never have passed
  on the pinned Node 20 — invisible until this release started running the
  tests in CI at all. Builds were unaffected (vite and tsc do not load jsdom).
- **feat**: synced the shared `icons.tsx` (now 64 icons) and replaced the
  remaining decorative emoji across the app: the Improvement Board toast
  bell, the Change Planner alert's downward-trend glyph, the top-motivator
  star chip, the motivator-import target, CSV export/copy-image/print/retro
  action buttons, the empty dashboard's chart hero, the forecast stat's
  checkmark (now sized to line up with its numeric neighbors), LearnView's
  three topic icons and its pitfalls warning glyph, the poker-import card
  icon, milestone flag and retrospective undo glyphs (both sprint table and
  list-row views), the row edit pencil (both views), the empty-portfolio
  folder, and the project-switcher's portfolio chart glyph. Left the 1–5
  mood-scale emoji alone everywhere it appears (selectable value, not
  chrome).
- **feat**: the `★`/`🏁` `VelocityChart`/`BurnUpChart` `ReferenceLine`
  annotations (top motivator, sprint milestones) now draw a small SVG flag
  or star next to the label text instead of an emoji glyph, via a new
  `ChartAnnotationLabel` used as a recharts custom `label` render function.
  The icon sits at a fixed offset from the reference line and the text
  grows away from it, so the icon's position never depends on the text's
  length and the label can't grow toward or across the line. Verified by
  screenshotting the running app (light and dark) with sample milestone
  and motivator data, and by diffing against the pre-change emoji version
  with the same data: label crowding when two annotations land close
  together, and text clipping when a milestone sits on the chart's last
  sprint, both reproduce identically before and after — pre-existing
  chart-layout limits, not a regression from this change.


## 0.3.0 — Guard cross-app payloads, error boundary (2026-09-03)

- **fix**: `tryParse` validated JSON *syntax* and nothing else, then cast. A key
  holding valid JSON of the wrong shape sailed through and threw at the first
  property access — `initAppState` indexed `stored[0].id` before first paint, so
  a malformed `sprint-metrics-projects` produced a blank page. It now takes an
  optional type guard, and the three startup reads use one.
- **fix**: `loadMotivatorSnapshot` cast a stored snapshot whose `topMotivators`
  consumers render directly; now checked.
- **feat**: `ErrorBoundary` at the root, with a scoped "clear this app's saved
  data" recovery path.
- **ci**: `npm test` now runs before `npm run build` in `deploy.yml`.

## 0.2.8 — Facilitator Mode persists across suite apps (2026-09-03)

- **fix**: `useFacilitatorMode`'s storage key changed from
  `'sprint-metrics:facilitatorMode'` to the shared
  `'agile-toolkit:facilitatorMode'` — user-requested so Facilitator Mode
  survives navigating to another suite app in the same tab instead of
  resetting. sessionStorage is already shared per-origin-per-tab; this
  was previously app-prefixed specifically to keep it isolated, which
  turned out to be the wrong default for a cross-app presentation
  session.

## 0.2.7 — Fix close buttons using the × variant (2026-09-03)

- **fix (follow-up)**: 4 more close/cancel/delete buttons (two Kanban
  hint dismissals, a sprint-row delete, the motivator-snapshot clear)
  used `×` (multiplication sign, U+00D7) rather than `✕`, a variant the
  original emoji→SVG sweep's grep missed. Replaced with `CloseIcon`.

## 0.2.6 — Replace decorative ✕ emoji with SVG icons (2026-09-03)

- **feat**: replaced 4 decorative `✕` text-glyph dismiss/delete buttons
  (sprint-row delete, Improvement Board toast dismiss, Change Planner
  banner dismiss, delete-undo dismiss) with `CloseIcon` from the new
  shared `icons.tsx`, using `currentColor` so every button keeps the
  color it already had. Left the `sprintsToTarget === 0 ? '✓' : ...`
  forecast-stat value as-is — it's a computed data value in a stat-chip
  array, not a standalone decorative icon. Part of a suite-wide
  emoji→SVG sweep the user asked for.

## 0.2.5 — Facilitator Mode (2026-09-03)

- **feat**: added Facilitator (projector) Mode — a presentation toggle for
  in-room sprint reviews, bigger UI via one CSS rule (everything sized in
  `rem` scales automatically) plus hiding the nav pills and language
  picker while active. Toggled from a new header button next to the theme
  toggle, session-scoped via `sessionStorage`. Adopted from the shared
  design-system pattern (`useFacilitatorMode.ts` + `FacilitatorToggle.tsx`),
  originally built for Team Identity. `ProjectSwitcher` stays visible —
  it's a functional control, not chrome.

## 0.2.4 — Ship the missing half of the Improvement Board deep-link (2026-09-03)

- **fix (broken integration)**: [improvement-board#4](https://github.com/agile-toolkit/improvement-board/issues/4)
  was closed as completed in that repo, but only the receiver half
  shipped — Improvement Board has read `?prefill=`/`utm_source=` since
  April, and nothing here ever sent it. The velocity/mood decline alert
  now includes a "Log as improvement item" link alongside the existing
  Change Planner one, prefilled with the sprint name. Found by a
  suite-wide cross-app link audit. See `buildImprovementBoardUrl` in
  `src/sprintData.ts` (tested).

## 0.2.3 — Normalize LanguagePicker dark shades (2026-09-02)

- **fix (consistency)**: `LanguagePicker.tsx` already had dark-mode
  classes, but on slightly different shades than the design-system's
  canonical copy. Normalized to match exactly, part of a suite-wide
  sweep that found the same component had drifted into 3 different
  shade combinations across repos (and was missing dark mode entirely
  in 5 others).

## 0.2.2 — Fix low-contrast delete icons; i18n the "Dismiss" buttons (2026-09-02)

- **fix**: delete/edit icon buttons in `SprintDataTable.tsx` and
  `SprintDataView.tsx` used `text-gray-200`/`gray-300`, below WCAG AA
  contrast and nearly invisible until hover (one delete button was also
  missing its `aria-label`). Bumped to `gray-400`/`gray-500` and added
  the missing label.
- **fix**: three toast dismiss buttons in `App.tsx` hardcoded
  `aria-label="Dismiss"` in English despite the app supporting
  ES/BE/RU. Moved to a new `common.dismiss` i18n key across all 4
  locales.
- Found via a suite-wide UX/scope audit.

## 0.2.1 — Remove Management 3.0 ref; fix invisible brand colors; first tests (2026-09-02)

- **content**: removed a stray "Management 3.0" mention from `README.md`'s
  suite tagline.
- **fix**: `brand-200`/`brand-300`/`brand-800`/`brand-900` were referenced
  in application code but never defined in `tailwind.config.js` — the same
  invisible-color bug found across the rest of the suite. Completed the
  `brand` scale with Tailwind's own `emerald` values.
- **test**: extracted `App.tsx`'s pure logic (project init/migration,
  motivator-snapshot handling, last-session summary write, CSV
  import/export, the two-consecutive-declines alert check) into
  `src/sprintData.ts`. Added `vitest` + `jsdom` (this repo's first
  automated test coverage) and 21 tests. `npm test` now passes cleanly.

## 0.2.0 — E4: Sprint deletion safety (2026-09-02)

- **feat**: soft-delete with a 5-second "Undo" toast for sprint deletion.
  The sprint is removed immediately (no visual lag) but held in memory for
  a 5s grace window; the toast's Undo button re-inserts it at its original
  index, and letting the toast expire (or dismissing it) commits the
  delete permanently. Only one undo is tracked at a time — deleting a
  second sprint while a toast is showing commits the first delete right
  away. `data.deleteUndo`/`data.deleteUndoAction` in EN/ES/BE/RU.
- **chore**: closed 1 stale issue (#51) confirmed already implemented.
- **docs**: refresh `GOAL.md` from the suite-wide `GOALS.md` platform
  thesis and rebuild `ROADMAP.md` around it; document the undo pattern
  in `README.md`.
- Docs-only: added `.artefacts/GOAL.md` and `.artefacts/ROADMAP.md`, filled in README with dev commands / localStorage keys / tech notes, added this CHANGELOG. No behavior change — documents existing functionality that previously only lived in `.artefacts/BRIEF.md`.
- docs: move GOAL.md and ROADMAP.md from .artefacts/ to the repo root.
