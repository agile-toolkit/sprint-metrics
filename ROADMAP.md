# Sprint Metrics — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic
None — idle. See `## Next epics` below.

## Next epics
1. **E1: Cross-app context integrations** — serves #4. Import retrospective sticky notes from Scrum Facilitator's ceremony history so the `retrospective` field can be pre-filled instead of retyped ([#52](https://github.com/agile-toolkit/sprint-metrics/issues/52)), and show a small team-symbol badge sourced from Team Identity's saved charter in the dashboard header ([#56](https://github.com/agile-toolkit/sprint-metrics/issues/56)).
2. **E2: Quarterly rollup view** — serves #2. New `QuarterlyView.tsx` grouping sprints into quarters with aggregated totals, average velocity/mood, and per-quarter sparklines, for stakeholder reporting ([#53](https://github.com/agile-toolkit/sprint-metrics/issues/53)).
3. **E3: Chart accessibility and bundle size** — serves #2. Screen-reader-accessible data tables beneath all four Recharts charts ([#54](https://github.com/agile-toolkit/sprint-metrics/issues/54)), and code-splitting `html2canvas` behind the Copy Image click so it isn't in the main bundle for sessions that never use it ([#55](https://github.com/agile-toolkit/sprint-metrics/issues/55)).

## Recently shipped
**AgileEVM** (2026-09-04) — see `## Shipped`. New "EVM" tab: Planned Value, Earned Value, SPI and a schedule-derived finish forecast against a user-set release baseline (`plannedSprints`), per Sulaiman & Baham's Scrum adaptation of earned value management. Serves signals #2 (reports for stakeholders) and #4 (credible free answer to what paid PM tools gate behind an enterprise tier — full EVM suites like Deltek Cobra/Primavera are squarely enterprise-priced). Deliberately schedule-only for this first slice: a cost-side CPI/EAC/ETC would need genuine per-sprint actual-cost data to avoid being mathematically identical to SPI (see README `## Tech notes`) — a caught-in-QA design correction, not the original plan; tracked as a follow-up feature, not shipped as a fake metric. Also fixed a pre-existing bug found while manually verifying this feature: the "Load Sample Data" button called `updateSprints()` then `updateConfig()` back to back from the same stale `projects` closure, so the second call silently discarded the first — sample data never actually loaded. Fixed as a single `persistProjects` call (`loadSampleData` in `App.tsx`).

**Add glass effect to the header** (2026-09-04) — see `## Shipped`. `AppHeader.tsx`'s background changed to a translucent blur, matching the Dashboard's own nav — user-reported inconsistency.

**Sync icons; CI Node bump** (2026-09-04) — see `## Shipped`. Synced the shared `icons.tsx` (64 icons) and replaced the remaining decorative emoji suite-wide (toast bell, alert trend glyph, motivator chip/target, export/print/retro action icons, empty-state heroes, chart annotation flags/stars, and more). CI Node bumped 20 → 22 for `jsdom@30`.

**Facilitator Mode persists across suite apps** (2026-09-03) — see `## Shipped`. `useFacilitatorMode`'s storage key changed to the shared `agile-toolkit:facilitatorMode` so the mode survives switching to another suite app in the same tab, per direct user request.

**Fix close buttons using the × variant** (2026-09-03) — see `## Shipped`. Follow-up to the emoji→SVG sweep — found 4 more close buttons using `×` (multiplication sign) instead of `✕`, missed by the original grep.

**Replace decorative ✕ emoji with SVG icons** (2026-09-03) — see `## Shipped`. Part of a suite-wide emoji→SVG sweep the user asked for.

**Facilitator Mode** (2026-09-03) — see `## Shipped`. A user asked for the presentation/projector mode already built for Team Identity to be adopted suite-wide; this is repo 9 of an 11-repo rollout, adopting the pattern now shared in `design-system/`.

**Ship the missing half of the Improvement Board deep-link** (2026-09-03) — see `## Shipped`. [improvement-board#4](https://github.com/agile-toolkit/improvement-board/issues/4) was closed as completed in that repo months ago, but only the receiver half ever shipped — the "Open Improvement Board" sender link this repo was supposed to add never existed. Found by a suite-wide cross-app link audit, not by re-checking that specific issue.

**Normalize LanguagePicker dark shades** (2026-09-02) — see `## Shipped`. `LanguagePicker.tsx` had dark-mode classes on slightly different shades than the design-system's canonical copy. Normalized to match exactly.

**Fix low-contrast delete icons; i18n the "Dismiss" buttons** (2026-09-02) — see `## Shipped`. A suite-wide UX audit flagged near-invisible `text-gray-200`/`gray-300` delete icons and 3 hardcoded-English "Dismiss" aria-labels despite the app supporting ES/BE/RU. Fixed both.

**Remove Management 3.0 reference; fix invisible brand colors; first test coverage** (2026-09-02) — see `## Shipped`. Dropped a stray "Management 3.0" mention from `README.md`; completed the `brand` Tailwind scale (`200`/`300`/`800`/`900` were undefined but referenced in code); extracted `App.tsx`'s pure logic into `src/sprintData.ts` and added this repo's first automated tests.

**E4: Sprint deletion safety** (2026-09-02) — see `## Shipped`. [#57](https://github.com/agile-toolkit/sprint-metrics/issues/57) shipped.

## Polish backlog
- Rollup/Vite may warn on large chunks at build time; no issue filed — consider `manualChunks` if it becomes disruptive.
- AgileEVM cost side (CPI/EAC/ETC): needs a genuine per-sprint actual-cost field (optional, alongside `teamSize`/`mood`) so Actual Cost can vary independently of the plan — see `src/agileEvm.ts`'s doc comment for why a flat per-sprint rate can't produce an honest CPI. Not yet spec'd as its own epic.

## Shipped
- ~~AgileEVM — PV/EV/SPI and a schedule-derived finish forecast against a user-set release baseline, new "EVM" tab~~
- ~~Add glass/backdrop-blur effect to the header, matching the Dashboard's own nav~~
- ~~Sync the shared `icons.tsx` and replace remaining decorative emoji suite-wide, including chart-annotation flag/star icons~~
- ~~Unify Facilitator Mode's storage key to the shared `agile-toolkit:facilitatorMode` so it persists across suite apps~~
- ~~Fix 4 more close buttons using the × variant instead of ✕~~
- ~~Replace decorative ✕ text-glyph buttons with shared SVG icons~~
- ~~Facilitator Mode — bigger UI + hidden nav/language picker for in-room presentation, adopted from the shared design-system pattern~~
- ~~Send the velocity/mood decline alert to Improvement Board (`?prefill=`/`utm_source=`), completing issue #4~~
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

**v0.2.3 — Normalize LanguagePicker dark shades** (2026-09-02):
- ~~Synced `LanguagePicker.tsx`'s dark-mode shades exactly with the
  design-system's canonical copy~~
