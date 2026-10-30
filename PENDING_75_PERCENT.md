# ASQL — 75% review milestone handoff

Updated: 2026-10-30

This is a practical project checkpoint, not an official grading formula. Match it against the instructor's rubric before presenting. The project now has two distinct parts: MySQL-backed analysis of the supplied historical Bangalore traffic dataset and a synthetic junction simulation stored in separate MySQL tables.

## Implemented in the repository

- [x] Local MySQL configuration script writes secrets to ignored `.env`; credential-free `.env.example` is tracked.
- [x] MySQL schema scripts define ten related project tables, keys, checks, three ordinary views, and a transactional refresh procedure for the daily summary table.
- [x] CSV parsing, row validation, original-field JSON retention, duplicate/reload policy, SHA-256 import identity, and transactional activation are implemented.
- [x] The supplied local CSV was inspected: 33,072 rows, 18 columns, 8 areas, 16 road locations, six categorical time blocks, and dates from 2023-01-01 through 2024-08-09. All 33,072 rows pass the importer validator; no exact duplicate rows were found.
- [x] Parameterized API and live analytics are implemented for shared area/road/date/time-block/congestion/weather/roadwork filters.
- [x] Dashboard, traffic analysis, road-pattern schematic, schema explorer, saved SQL lab, index-plan comparison, view/summary screen, provenance page, and filtered reports are connected to the MySQL API.
- [x] Eleven MySQL queries cover JOIN/GROUP BY, subqueries, CTEs, window functions, date gaps, conditional aggregation, JSON, and UNION.
- [x] CSV output escapes values and prefixes formula-like cell contents.
- [x] Parser/filter/SQL compilation tests are included; `npm run verify:database` checks the connected import, foreign-key coverage, views, and saved queries.
- [x] Setup, limitations, and presentation flow are documented in `README.md`.
- [x] A four-way junction simulation is implemented with fixed and adaptive signal control, identical seeded demand for each comparison, MySQL run/sample/action tables, and a live dashboard. Its model and limits are documented in `docs/SIMULATION_GUIDE.md`.
- [x] Overview has a separate card for the latest completed synthetic comparison; it opens the saved pair on the Live Simulation screen. Active runs poll until a terminal state, with failure text shown in the UI.
- [x] Pure Node tests check seeded demand, arrival conservation, control comparisons, input validation, and transactional sample writes. The current source suite passed 18 tests; these do not prove the MySQL-backed screen runs on this machine.
- [x] A read-only `npm run verify:simulation` command checks a finished pair's demand, totals, sampled steps, lane rows, and actions against the deterministic model.

## Still needs local evidence before calling the checkpoint demonstrated

The code is present, but these results depend on Yash's local setup and must be captured from an actual run:

- [ ] Finish `npm install` and run `scripts/configure-local.ps1`; keep the password only in ignored `.env`.
- [ ] Run `npm run db:setup` against MySQL Workbench's MySQL Server 8 connection.
- [ ] Run `npm run data:import`; check actual row counts, rejected rows, date range, checksum, and importer log.
- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`; record pass/fail output and address any failures.
- [ ] Run `npm run verify:database`. Confirm saved SQL executes in MySQL and stored daily summaries match view results.
- [ ] Open Live Simulation and run east-west surge, north-south surge, and balanced scenarios with the same seed. Verify both runs complete, the queue chart and action timeline move, and `simulation_run`, `simulation_step`, `simulation_lane_sample`, and `simulation_action` contain the expected rows.
- [ ] Compare the fixed/adaptive UI metrics with SQL in Workbench. Confirm matching demand fingerprints and arrival counts. Record that the adaptive mode can do worse on balanced demand.
- [ ] Run `npm run verify:simulation` after a completed pair and save its JSON report. Open Overview and confirm the latest synthetic experiment card links to that exact pair.
- [ ] Check Stop, reload/history, and worker failure display. Inspect `data/processed/simulation-worker.log` locally if a run fails.
- [ ] Start the site and verify filter changes affect results, SQL lab results come from MySQL, CSV opens correctly, and an unavailable database shows a useful error.
- [ ] Capture Workbench table/view evidence and a few browser screenshots for the review.
- [ ] Compare this checklist with the instructor's rubric and adjust the completion claim accordingly.

## Useful presentation sequence

1. Describe the dataset, its 18 source fields, historical date span, and honest limits (no physical sensor identity, coordinates, exact timestamp, unit documentation, vehicle identity, or trip identity).
2. Show the MySQL schema and explain the normalized Area → Road → Segment → logical source location → Observation relationship. Mention that Vehicle and Trip are empty extension tables because the source cannot populate them reliably.
3. Show actual row counts, import quality/checksum, and one observation's retained `source_data` JSON in Workbench or the provenance screen.
4. Change an area, road, date range, or time-block filter and show the Dashboard/Traffic Analysis results change; explain that all views use the same active import and applied filters.
5. Run saved SQL examples for JOIN/aggregation, a CTE, a window ranking/LAG, and JSON source trace. Explain the purpose and actual result.
6. Show the ordinary daily view and the refreshable summary table, run the refresh, and show the value comparison.
7. Run the index benchmark, explain `EXPLAIN` and the measured boundaries, and report what this machine returned. Do not claim the index is faster unless results support it.
8. Export one filtered CSV and explain that it is generated from actual SQL output.
9. Run the synthetic junction comparison. Show both controllers received the same seeded arrivals, then use Workbench to explain the measured queue, waiting, throughput, and signal decisions. State that the result applies to this model, not live Bangalore roads.

## Boundaries to state clearly

- Kaggle publisher provenance, license details, and measurement units are not established by the downloaded file. Do not invent them.
- The period labels are categorical; filtering by hour would imply precision the source does not contain.
- `Traffic Volume` is retained as a source-reported aggregate. It must not be presented as distinct vehicles or trips.
- Derived sensor codes identify logical dataset locations, not physical devices.
- MySQL ordinary views are not materialized views. The project uses a regular table with an explicit refresh procedure.
- SQL timings vary by machine, cache state, server settings, and filtered row count. The app measures local driver round trips and also shows server execution plans.
- A completed checklist in source is not proof that the local database and website were run. Keep the evidence boxes above unchecked until each run is observed.
- The simulation generates traffic from scenario rates. It is not a calibrated SUMO model, an external live feed, or a traffic signal controller connected to real hardware.
