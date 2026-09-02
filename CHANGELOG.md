# Changelog

## Unreleased

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
