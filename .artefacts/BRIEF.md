# BRIEF — Sprint Metrics

## What this app does
A sprint metrics dashboard and tracker for Scrum teams. Import data from backlog/estimation spreadsheets or enter manually. Visualize velocity, burn-down/burn-up, sprint progress, and release forecasts. Helps teams and stakeholders understand delivery pace and make data-driven decisions.

## Target users
Scrum Masters, Product Owners, and project managers tracking sprint performance and forecasting release dates. Works for teams of 3–15.

## Core features (MVP)
- Sprint data entry: story points planned, completed, carried over per sprint
- Velocity chart: rolling average over last N sprints
- Sprint burn-down chart: ideal vs. actual remaining work
- Release burn-up chart: cumulative completed vs. target scope
- Forecast: estimated release date based on velocity and remaining backlog
- Import from CSV/XLSX (BacklogManager format support)
- Export charts as PNG or data as CSV

## Educational layer
- "What is velocity?" explainer (definition, how to read it, common mistakes)
- Burn-down vs. burn-up: when to use each and how to interpret them
- Forecasting guide: why ranges beat point estimates, cone of uncertainty
- Reference to BacklogManager source files and Scrum & Kanban book

## Tech stack
React 18 + TypeScript + Vite + Tailwind CSS + Recharts (charts). No backend (localStorage + file import). GitHub Pages deployment.

## Source materials in `.artefacts/`
- `BacklogManager-v8.xls` — backlog tracking template v8
- `Backlog_Manager_v10_1.xls` — backlog tracking template v10
- `ProjectEstimationTemplate.xlsx` — project estimation template
- `Release Burndown Sample.xlsx` — sample release burndown data
- `ScrumAndKanbanRuFinal.pdf` — Scrum metrics theory reference

## i18n
English + Russian (react-i18next). Date and number formatting must be locale-aware.

## Agentic pipeline roles
- `/vadavik` — spec & requirements validation
- `/lojma` — UX/UI design (dashboard layout, chart styles, import flow)
- `/laznik` — architecture (data model, chart data transformations, XLSX parser)
- `@cmok` — implementation
- `@bahnik` — QA (chart accuracy, XLSX import edge cases, forecast math)
- `@piarun` — documentation
- `@zlydni` — git commits & GitHub Pages deploy
