# ASQL continuation guide for the next developer / AI

Read this file first, then read `FINAL_PRESENTATION_HANDOFF.md`, `README.md`, `PENDING_75_PERCENT.md`, `docs/SQL_GUIDE.md`, and `docs/SIMULATION_GUIDE.md`. This handoff describes the current source snapshot and the checks that still need to happen on the next developer's computer.

## Project goal

Finish the Advanced SQL Urban Mobility project as a real local MySQL-backed website using the Kaggle Bangalore Traffic 2023–2024 dataset. The owner subsequently requested a separate live junction simulation. Present the historical analytics and synthetic simulation as distinct sources; neither implies a live Bangalore sensor feed.

## Current state — read before changing anything

### Implemented in source

- Next.js/React application with historical-data workspace pages, a separate Live Simulation page, and responsive shared filters for the historical data.
- MySQL schema setup scripts for fourteen tables, three views, constraints, and a refresh procedure for a stored daily summary table.
- CSV parser and validator, transactional importer, SHA-256 file identity, local `.env` setup script, saved query library, API, schema explorer, reports, and read-only database verification script.
- Eleven saved MySQL exercises: joins and aggregates, subquery, CTE, window ranking and `LAG`, conditional aggregation, JSON source trace, and `UNION`.
- Dashboard, traffic analysis, area/road schematic, schema browser, SQL lab, index benchmark, views/summaries, source provenance, and CSV reports use the API rather than the old generated-data screens. Overview includes a separate latest-completed synthetic experiment card that opens its exact simulation comparison.
- Tests for CSV validation, filter binding, saved query compilation, and spreadsheet-safe CSV output.
- A deterministic four-way junction model, fixed and adaptive signal modes, two runs with identical seeded arrivals, a local background worker, MySQL simulation tables, live polling API, schematic vehicle display, action timeline, and SQL comparison. The worker's sample writes are transactional and have a pure mock-database test. `npm run verify:simulation` checks a completed pair against the model and stored samples without changing the database.

### Verified facts and limits

- The local CSV inspected during development has 33,072 data rows and 18 columns. All 33,072 passed the importer validator; there were no exact duplicate rows. Date range: 2023-01-01 to 2024-08-09; 8 areas and 16 road locations; six categorical time blocks.
- The current pure Node suite passed 18 tests: historical CSV/SQL checks plus simulation demand, conservation, comparison, and sample transaction checks. These do not establish live MySQL/browser operation.
- A previous `npm install` stopped with registry `ECONNRESET`. In the current preparing environment, npm is forced offline by default and has no cached packages; with offline mode disabled, the local proxy refuses requests at `127.0.0.1:9`. Dependencies were subsequently trimmed to what the active application imports. Re-run installation on the next computer.
- **Not yet proven on the preparing computer:** MySQL schema creation/import, simulation-worker persistence, live API responses, saved queries against MySQL, the production build, TypeScript check, lint, or browser behavior. The owner asked that the application and database be run on the teammate's laptop. Do these checks there before saying the website is fully working or assigning a completion percentage.
- The final code ZIP includes the local Git history and `feat/bangalore-mysql` branch with the code-side changes committed. It excludes `.env`, the dataset CSV, `node_modules`, and `.next`. Obtain the dataset separately and configure this computer. Check `git status` before editing or pushing.
- MySQL Workbench is the preferred visual database client. The Next.js server connects directly to the same MySQL Server 8 service using `mysql2`.

## Setup on a new Windows laptop

### 1. Prerequisites and files

- Node.js 20.9+ (Node 24 was used during local development), npm, MySQL Server 8.0.18+, and MySQL Workbench.
- Download/extract `bangalore_traffic_timely_data.csv` from the dataset URL in `README.md`. The Kaggle account may be required.
- Start MySQL Server. The MySQL account entered below needs permission to create the dedicated `urban_mobility` database, its tables/views, and the stored procedure. A local development root account is acceptable for this student project; do not put its password in source code or send it to an AI chat.

### 2. Install and configure

In PowerShell, change to the unzipped project folder:

```powershell
npm install
powershell -ExecutionPolicy Bypass -File scripts\configure-local.ps1
```

At the prompts, enter the MySQL host and port used by Workbench (usually `127.0.0.1` and `3306`), a working username, the absolute path to the downloaded CSV, and the password at the hidden password prompt. The script writes `.env`; `.env` is ignored by Git. Never paste the password or `.env` contents into chat.

If the PowerShell script was started from a different directory, it still finds the repository root from its own script path. If `npm install` reports `ECONNRESET`, wait briefly and retry `npm install`; if it repeats, check the machine's network/proxy and npm registry access.

### 3. Create schema and load source data

```powershell
npm run db:setup
npm run data:import
npm run verify:database
```

The setup script creates only the dedicated `urban_mobility` schema and does not drop unrelated databases. The import activates a valid file by its SHA-256; importing the same file again reuses the import. Check the row counts, checksum, validation report, and SQL output rather than assuming the command succeeded. Workbench can inspect the database and run examples from `docs/SQL_GUIDE.md`.

### 4. Run the checks and application

Run each command separately so failures are easy to read:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```

Open `http://127.0.0.1:3000` and `http://127.0.0.1:3000/api/health`. Record command output and fix failures. `npm run verify:database` also executes all eleven saved queries and checks active-import counts, foreign-key paths, views, and stored-summary presence. After a simulation pair completes, run `npm run verify:simulation` and save its JSON output.

## Review acceptance checklist

1. Show MySQL version and the active import metadata in Workbench.
2. Compare actual observation counts with the import's accepted count. Check location/day counts, zero rejected rows (if the same source file is used), date bounds, and checksum.
3. Inspect the fourteen tables, constraints, indexes, three views, and the empty vehicle/trip extension tables.
4. In the website, apply a road/date/time-block filter and show the actual result changing. The time block is a dataset category; there is no hour-level timestamp.
5. Run at least one JOIN/aggregate, CTE, window query, and JSON query in SQL Lab. Explain how the rows map to the source CSV.
6. Refresh the daily stored summary and verify the view/table comparison. Describe it as a refreshable summary table: MySQL does not have native materialized views.
7. Run the index benchmark and explain its actual plans/results. Report the measured output; do not promise that the index is faster.
8. Preview and download one filtered CSV. Check its columns and values against SQL output.
9. Capture real Workbench and browser screenshots, and update `PENDING_75_PERCENT.md` with evidence only after each check passes.
10. Open Live Simulation, run fixed and adaptive modes with the same seed, inspect the junction/queue chart, and compare the two `simulation_run` records in Workbench. Run `npm run verify:simulation`, confirm the Overview latest-experiment card opens the same pair, and repeat all three scenarios. The adaptive strategy may perform worse for balanced demand; report the actual result.

## Data interpretation rules

- The Kaggle listing does not establish the publisher's measurement method, license, or units. Treat them as unknown unless the instructor or dataset owner provides documentation.
- `Traffic Volume` is a source-reported aggregate, not a distinct-vehicle count or number of unique trips.
- `Average Speed` is averaged arithmetically across source rows; its unit is not confirmed.
- `TimeBlock` is categorical (`Midnight`, `Morning`, `Daytime`, `Noon`, `Evening`, `Night`). Do not derive exact times.
- Dataset roads have no coordinates or geometry. The UI's area cards are organizational, not a geographic map.
- Derived sensor codes identify logical source locations, not physical traffic sensors.
- Vehicle and trip tables remain empty because this dataset does not identify individual entities.
- Weather summaries show association and do not prove causation.

## Repository and Git handoff

Project remote: `https://github.com/Yash13606/ASQL`. The final ZIP includes the committed local `feat/bangalore-mysql` branch, based on starter commit `af81be7`. At the previous handoff, GitHub `main` still pointed at `af81be7`; publishing was blocked by GitHub integration permissions and the preparing environment's network proxy. Recheck the current remote before pushing. On the new laptop, inspect `git status`, then `git fetch origin` and compare `origin/main` with this branch. If the remote is unchanged and this branch is not already on GitHub, push it as a branch with `git push -u origin feat/bangalore-mysql` and open a PR; otherwise make a fresh branch from the current remote and apply the project commits carefully. Confirm `.env` and the CSV are ignored. Do not force-push. No deployment or real traffic-control integration is part of this handoff.

## Instructions for the next AI assistant

1. Read this file and the documents listed at the top before editing.
2. Inspect the current source and Git state; do not assume any command above has succeeded.
3. Ask the developer to perform only laptop-specific steps (install Node packages, supply a MySQL login in the local secure prompt, and obtain the CSV). Never request the password in chat.
4. Run schema creation, import, verification, typecheck, lint, build, and local browser acceptance; fix issues rather than merely reporting them.
5. Update the pending checklist with evidence and exact remaining gaps. Keep local synthetic/code-only proof distinct from verified database/browser results.
6. Keep simulation output isolated from historical Kaggle observations. Verify the seeded comparison and action log before presenting a claim that adaptive control improved the result.
