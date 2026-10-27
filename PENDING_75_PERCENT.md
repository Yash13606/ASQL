# ASQL — 75% review milestone handoff

Updated: 2026-10-27

This is a practical project checkpoint, not an official grading formula. Match it against the instructor's rubric before presenting. The project scope is a MySQL-backed analysis of the supplied Bangalore traffic dataset. Traffic simulation is outside this milestone.

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

## Still needs local evidence before calling the checkpoint demonstrated

The code is present, but these results depend on Yash's local setup and must be captured from an actual run:

- [ ] Finish `npm install` and run `scripts/configure-local.ps1`; keep the password only in ignored `.env`.
- [ ] Run `npm run db:setup` against MySQL Workbench's MySQL Server 8 connection.
- [ ] Run `npm run data:import`; check actual row counts, rejected rows, date range, checksum, and importer log.
- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`; record pass/fail output and address any failures.
- [ ] Run `npm run verify:database`. Confirm saved SQL executes in MySQL and stored daily summaries match view results.
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

## Boundaries to state clearly

- Kaggle publisher provenance, license details, and measurement units are not established by the downloaded file. Do not invent them.
- The period labels are categorical; filtering by hour would imply precision the source does not contain.
- `Traffic Volume` is retained as a source-reported aggregate. It must not be presented as distinct vehicles or trips.
- Derived sensor codes identify logical dataset locations, not physical devices.
- MySQL ordinary views are not materialized views. The project uses a regular table with an explicit refresh procedure.
- SQL timings vary by machine, cache state, server settings, and filtered row count. The app measures local driver round trips and also shows server execution plans.
- A completed checklist in source is not proof that the local database and website were run. Keep the evidence boxes above unchecked until each run is observed.
