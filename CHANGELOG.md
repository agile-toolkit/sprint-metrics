# Changelog

## Unreleased

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
