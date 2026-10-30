# ASQL final code handoff for the presentation laptop

Updated: 2026-10-30

## What is ready in source

- Historical Bangalore CSV import, validation, source trace, MySQL schema, three ordinary views, refreshable daily summary, eleven saved SQL exercises, index benchmark, reports, and connected analytics pages.
- Synthetic four-way junction model with seeded fixed and adaptive controllers. Both modes receive the same arrival plan, and the simulation writes runs, five-second steps, four lane samples per step, and signal actions to separate MySQL tables.
- Live Simulation page with junction state, queue chart, actions, run progress, failures, history, stop control, and a fixed-versus-adaptive comparison. The Overview shows the latest completed synthetic result in a separate card that opens its saved pair.
- Pure Node tests: 18 passed on the preparing computer. They cover CSV/SQL logic, simulation behavior, comparison integrity, and transaction rollback for a failed sample write.
- Read-only database verification commands for the historical import and a completed simulation pair.

This is **code ready for laptop acceptance**, not evidence that the MySQL-backed website has already run here. The owner asked that the app and database not be started on this preparing computer. The teammate performs the following steps on the presentation laptop.

The active website entry point is `src/app/page.tsx`, which renders `src/components/traffic/traffic-app.tsx`. The active database schema is in `sql/001_schema.sql` through `sql/004_simulation.sql`. Older starter/demo files under `src/components/pages/`, `src/lib/database/`, and `prisma/schema.prisma` are not the connected implementation and should not be presented as the live data path.

## Exact teammate sequence

1. Unzip or pull the repository and read `AI_CONTINUATION_GUIDE.md`. Install Node.js 20.9+, MySQL Server 8.0.18+, MySQL Workbench, and the source CSV. Keep passwords in the ignored local `.env` only.
2. In the repository folder, run these commands in order and save their output:

   ```powershell
   npm install
   powershell -ExecutionPolicy Bypass -File scripts\configure-local.ps1
   npm run db:setup
   npm run data:import
   npm run verify:database
   npm test
   npm run typecheck
   npm run lint
   npm run build
   npm run dev
   ```

3. Open `http://127.0.0.1:3000` and `/api/health`. Confirm the Overview and Data & Provenance pages show the active import, and a historical filter changes the SQL-backed metrics.
4. In SQL Lab, run a JOIN/aggregation exercise, a CTE, a window function, and the source JSON trace. Inspect the returned rows and bound parameters. Refresh the daily summary; check its MATCH indicator. Run the index benchmark; report the actual plans and timings without assuming an index is faster.
5. In Live Simulation, run the **east-west surge** with seed **42**. Wait for both fixed and adaptive modes to finish. Confirm progress, queue chart, action timeline, final comparison, and demand equality. Return to Overview and use its latest synthetic experiment card to open the same pair.
6. Keep the app available and run `npm run verify:simulation` in a second terminal after the pair finishes. Save the JSON report. Repeat the browser comparison for north-south surge and balanced demand if presentation time allows. The pure model expects adaptive timing to help both surge cases and to perform worse for balanced demand; the database and UI must be checked before presenting those as live results.
7. Capture Workbench screenshots of the table list, active import metadata, observation count, one advanced SQL result, and the two `simulation_run` rows. Keep screenshots and saved command output available as a presentation fallback.

The worker log is in ignored `data/processed/simulation-worker.log`. If a simulation pair fails, inspect that file and the API/server output, fix the cause, then rerun the pair and verification command. Do not substitute pure model output for a failed database run.

## Acceptance evidence to send the presenter

| Area | Evidence |
| --- | --- |
| MySQL data | Version, active import ID, 33,072 expected source rows, actual accepted/rejected counts, checksum, date bounds, and observation count |
| Website | Dashboard before/after a filter, SQL Lab result, summary comparison, index-plan result, and one CSV export |
| Simulation | Both completed run IDs, same demand fingerprint and arrival count, MySQL step/action rows, UI comparison, Overview card, and `verify:simulation` JSON |
| Code checks | Output of `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` |
| Repository | Clean commit and pushed branch/remote link, excluding `.env`, the raw CSV, dependencies, and generated files |

## Claims for the final presentation

- The 33,072-row figure comes from inspection of the supplied CSV. Say it was imported into MySQL only when the presentation laptop's database report confirms it.
- Source `Traffic Volume` is an aggregate field, not a count of distinct vehicles. Named time blocks are categories rather than exact timestamps. The CSV has road names but no coordinates, vehicle identities, or trip identities.
- The simulation is deterministic and synthetic. It is not live Bangalore traffic, a calibrated SUMO network, or a controller connected to real signals.
- MySQL has three ordinary project views. The daily stored result is a refreshable summary table, not a native materialized view.
- A review percentage is determined by the instructor's rubric. Code completion and live database/browser verification are separate claims.

For Workbench SQL examples, use `docs/SQL_GUIDE.md` and `docs/SIMULATION_GUIDE.md`. The final speaker script is `docs/ASQL_FINAL_PRESENTATION_SCRIPT.html`; the earlier 75% review script remains for that checkpoint.
