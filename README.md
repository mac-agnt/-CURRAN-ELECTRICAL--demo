# Pulse for Joe Curran Electrical Ltd

Frontend demo (mock data, no backend) of Pulse customised for Joe Curran Electrical, Toor, Waterville, Co. Kerry. Brand accent `#1c93e3` and slate neutrals come from joecurranelectrical.ie.
The demo clock is fixed to Tue 10 Nov 2026, 09:20 and ticks from there.

## Where things live

| Area | Where |
| --- | --- |
| Single source of truth (staff, customers, sites, systems, jobs, invoices, contracts, schedule) | `src/curran/core.ts`, `jobs.ts`, `ops.ts` |
| Modules: Jobs, Schedule, Customers, Finance, Service Contracts, People, Knowledge | `src/curran/pages/` |
| Technician field app | `src/curran/field/`, `pages/FieldHome.tsx` |
| Stock Pulse page content (Home, Agents, Dashboard, Work, Records, Activity, Settings) | `src/logic/curranContent.js` |
| Roles and permissions ("View Pulse as" in the sidebar) | `ROLES` in `src/curran/core.ts` |
| Reconciliation check for every shared number | `node tools/verify-curran.mjs` |

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

## What's in it

| Area | Where |
| --- | --- |
| Pages: Home (Helios chat), Agents, Dashboard, Work, Records, Activity, Settings | `src/views/pages/` |
| Overlays: ⌘K palette, agent studio, Helios mini chat, work viewer, new record, background gallery | `src/views/overlays/` |
| App frame: sidebar, top bar, notifications | `src/views/AppShell.tsx` |
| State and behaviour | `src/logic/PulseLogic.js` |
| Demo data (Kilbride Group) | `src/logic/data.js` |
| Agent avatar | `src/components/AgentFace.tsx` |
| Theme tokens (Harbour, light and 11 more), animations | `src/styles/pulse.css` |

## How it fits together

- **`PulseLogic`** holds all state. Its `renderVals()` returns one flat object `v`.
- **Views** are plain React components that render from `v`.
- **`LogicHost`** (`src/runtime/logic.tsx`) mounts the logic and re-renders on `setState`.
- **Backgrounds** live in `src/App.tsx`:
  - `dashboardBackdrop`: the colour of the Dashboard KPI background
  - `kpiBackdropOn`: whether that background shows
  - `recordsBackdrop`: the colour of the Records wash (`""` uses the theme gradient)
- **Customising for a client:** read `CLAUDE.md` first. It lists the layout rules every copy keeps.

## Updating from Claude Design

Export the new version, replace the file in `design/`, then run:

```bash
npm run import-design
```

This regenerates:

- `src/views/`
- `src/styles/pulse.css`
- `src/styles/interactions.css`
- `src/logic/`

`AgentFace` is hand-written and left alone. Commit before running, because it overwrites hand edits to those files.

## Fixed from the mockup

In the mockup, the work viewer's wrapper `<div>` was never closed. As a result, the ⌘K palette, agent studio, new record dialog and background gallery could only appear while the work viewer was open. They now open on their own. The fix is applied in `tools/import-design.mjs`.
