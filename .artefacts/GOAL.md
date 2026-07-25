# Sprint Metrics — Goal

## Problem
Scrum and Kanban teams tracking sprint velocity, burn-down/up trends, and release forecasts typically resort to ad-hoc spreadsheets that don't talk to the other ceremony tools a team already uses (estimation, retrospectives, mood tracking, capacity planning). Sprint Metrics exists to give teams a lightweight, no-backend, browser-only dashboard for sprint health that stays wired into the rest of the Agile Toolkit suite, so data entered once (a Planning Poker estimate, a Moving Motivators snapshot, a retro note) shows up automatically instead of being re-typed.

## Audience
Scrum Masters and team leads running sprint reviews, planning, and retrospectives — using the dashboard live in a ceremony to show velocity trends, forecast completion dates, and cross-reference team health signals from other tools in the suite. No login, no server: state lives in the browser via localStorage.

## Success criteria
1. A team can log sprint-level data (planned/completed/carried points, goal, mood, capacity, milestones, retro notes, optional CFD flow counts) and edit it inline in a data table.
2. The dashboard renders velocity, burn-down, burn-up, and CFD charts with full dark-mode support and localized labels (EN/ES/BE/RU).
3. The Forecast view projects a finish date from optimistic/average/pessimistic velocity scenarios against remaining backlog.
4. Sprint Metrics exchanges data one-way (read and/or write) with at least Planning Poker, Moving Motivators, Improvement Board, Change Planner, Scrum Facilitator, Work Profiles, and Kanban Designer via documented localStorage keys — no manual copy-paste required.
5. All data persists locally per browser with no backend, and multiple projects can be tracked side-by-side via the Portfolio view.

## Non-goals
- No backend, sync service, or server-side storage — localStorage only, single browser/device.
- No user accounts, auth, or real-time multi-user collaboration.
- Not a full project-management or backlog tool — no ticket workflow, no issue tracking; scope stays at metrics/forecasting over sprints teams already ran.
- No native mobile app — responsive web only, installable as a PWA.
