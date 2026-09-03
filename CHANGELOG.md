# Changelog

## Unreleased

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
