# Pending work for the 75% project review

Updated: 2026-10-23

Project: Design and Implementation of an Urban Mobility Database for Spatio-Temporal Traffic Analysis Using Advanced SQL.

**Handoff status: all implementation tasks below remain pending. The current frontend is a demo, and the project is not being claimed as 75% complete.**

This is a proposed review milestone, not an official grading rubric. Follow the teacher's requirements if they differ. The person taking over should complete the checkboxes in order and retain evidence for each acceptance criterion.

## 1. Current implementation and limitations

Already present in source:

- Nine screens, shared UI components, charts, filters, and presentation mode.
- A displayed six-entity ER schema: ROAD, ROAD_SEGMENT, SENSOR, TRAFFIC_OBSERVATION, VEHICLE, and TRIP.
- Generated Chennai-style traffic data, JavaScript analytics, and example SQL.
- Report generation and browser CSV download code.
- Project slides and supporting reference documents.

Not implemented as a real traffic database:

- `prisma/schema.prisma` contains SQLite starter `User` and `Post` models only.
- `src/app/api/route.ts` returns a greeting; it does not serve traffic analytics.
- `src/lib/database/queries.ts` processes JavaScript arrays in memory.
- `src/lib/database/sql-library.ts` displays SQL but runs JavaScript functions.
- The SQL Lab shows predefined SQL; it is not an arbitrary SQL execution engine.
- Optimization timings and rows scanned are simulated, including the displayed 842 ms / 96 ms comparison.
- Materialized-view refresh updates UI state; it does not execute a database refresh.
- Connection labels and schema row counts are not proof of a live PostgreSQL connection or actual database contents.

## 2. Pending tasks to reach the proposed 75% milestone

### P1 - Choose and connect the actual database

- [ ] Confirm whether the course requires Oracle. Use it if required; otherwise PostgreSQL aligns with the existing displayed SQL and materialized-view design.
- [ ] Set up a local development database and a dedicated application user.
- [ ] Store connection settings in an ignored `.env`; maintain a credential-free `.env.example`.
- [ ] Implement a server-side connection and a real health endpoint.
- [ ] Document database version, setup commands, and connection troubleshooting.

Acceptance: connect using a database client, query database/version information, and show a successful application health response. An unavailable database must produce an honest error state.

### P2 - Create the six real tables and constraints

- [ ] Implement ROAD, ROAD_SEGMENT, SENSOR, TRAFFIC_OBSERVATION, VEHICLE, and TRIP in the selected DBMS.
- [ ] Add primary keys, foreign keys, required columns, unique identifiers, and appropriate numeric/time constraints.
- [ ] Enforce nonnegative vehicle counts and speeds, positive lengths, valid congestion values, and valid trip start/end ordering.
- [ ] Document normalization, relationship cardinalities, and timestamp/timezone conventions.
- [ ] Keep the displayed ER diagram and backend schema consistent.
- [ ] Save repeatable schema creation/migration scripts.

Relationships: ROAD -> ROAD_SEGMENT -> SENSOR -> TRAFFIC_OBSERVATION, and VEHICLE -> TRIP. Vehicle/trip records currently have no link to road observations; do not claim vehicle-type filtering of aggregate observations without defining and populating a valid relationship.

Acceptance: recreate the schema from scripts on an empty database; demonstrate that an invalid foreign key and an invalid measurement are rejected.

### P3 - Prepare, clean, and load data

- [ ] Select an appropriate source dataset, or use clearly labeled synthetic data if accepted for the review.
- [ ] Provide a repeatable loading script with a documented duplicate/reload strategy.
- [ ] Validate missing values, duplicate identifiers, dates, speeds, vehicle counts, and foreign-key relationships.
- [ ] Populate every table with consistent data.
- [ ] Cover multiple roads, segments, sensors, days, and peak/off-peak periods.
- [ ] Record actual row counts, date range, units, source/provenance, and cleaning decisions.

Suggested functional-demo scale: tens of thousands of observations covering at least one week, with enough roads and sensors for comparisons. This is a practical target, not a teacher-specified minimum. Larger data for performance experiments can follow later.

Acceptance: load into a clean database, show actual counts and sample rows, and produce a short validation summary. Do not reuse the UI's advertised millions-of-rows count unless actually loaded.

### P4 - Execute advanced SQL in the database

- [ ] Save and run SQL for the eight questions below in the selected DBMS.
- [ ] Adjust dialect-specific functions and syntax for Oracle or PostgreSQL.
- [ ] Save representative query results and explain each technique.
- [ ] Check key outputs against a small dataset with known expected results.
- [ ] Define metric meanings: sensor vehicle counts are recorded observations, not necessarily unique vehicles or unique city trips.

| Question | SQL technique |
| --- | --- |
| Which roads have the highest traffic volume? | Multi-table JOIN, SUM, GROUP BY, ORDER BY |
| Which hours have the most traffic? | Time extraction and aggregation |
| Which roads exceed the average per-road volume? | Subquery over consistent per-road aggregates |
| Which roads have high congestion during the morning peak? | Location and timestamp filtering |
| How do roads rank by daily volume? | RANK or DENSE_RANK with a suitable partition |
| How does traffic change between consecutive days? | LAG with documented handling of missing days |
| Which roads have low average speeds and enough observations? | GROUP BY and HAVING |
| How do morning and evening volumes compare? | CTE and conditional aggregation |

Acceptance: demonstrate all eight executing against populated tables, explain joins/grouping/window partitions, and show results consistent with the source data.

### P5 - Connect the main interface to actual results

- [ ] Implement parameterized server-side endpoints for dashboard summaries and road/date/time analysis.
- [ ] Replace mock data on the Dashboard and Traffic Analysis screens with endpoint responses.
- [ ] Make the SQL Lab run approved saved queries on the server and return actual rows. An unrestricted SQL console is not needed for this milestone.
- [ ] Validate filters, bound result sizes, and provide loading, empty, and connection-error states.
- [ ] Ensure road/date/time filters affect database queries and displayed results consistently.
- [ ] Show actual database status and counts; label any remaining demo-only screens.
- [ ] Remove simulated execution/scan figures from integrated screens or label them explicitly as illustrative.

Acceptance: changing a road or time window changes a real query result. Insert or update a known development observation, refresh, and verify that the relevant displayed aggregate changes as expected.

### P6 - Implement ordinary views and database-backed reports

- [ ] Create an ordinary daily road summary view.
- [ ] Create a congestion report query or view with a documented congestion definition.
- [ ] Connect at least one report and CSV export to real database results.
- [ ] Verify report filters, CSV columns/escaping, row counts, and numeric values against SQL output.

Acceptance: show the view definition in the database, query it, then generate and export a matching report from the application.

### P7 - Verify the milestone and prepare the review

- [ ] Document installation, database creation, data loading, and application startup from a fresh clone.
- [ ] Run lint and a separate TypeScript check; the current build configuration ignores TypeScript build errors.
- [ ] Run a build and verify the main database-backed flows in a browser.
- [ ] Check invalid filters, no-data periods, unavailable database behavior, and representative SQL correctness.
- [ ] Save an ER diagram, table counts, validation summary, query scripts/results, and application screenshots.
- [ ] Update slides to distinguish completed features, demo-only behavior, and pending final work.
- [ ] Rehearse the demonstration below and prepare answers about relationships, normalization, joins, CTEs, window functions, and data provenance.

Acceptance: another person can follow the README and reproduce the database-backed demo. Update this document with evidence paths and actual check results before marking tasks complete.

## 3. Proposed implementation organization

The following are suggested new paths, not files already implemented:

```text
sql/                    schema, views, and numbered analysis queries
scripts/                data preparation/loading utilities
docs/evidence/          counts, query outputs, screenshots, validation notes
src/app/api/health/     database connection status
src/app/api/analytics/  parameterized analytics endpoints
src/app/api/reports/    report endpoints
```

Start from `src/lib/database/types.ts` and `schema.ts` for the domain design. Replace or adapt `src/lib/db.ts` and `prisma/schema.prisma` for the selected DBMS. Convert the logic in `queries.ts` and the SQL in `sql-library.ts` into real server-side queries. Preserve the frontend components where practical.

## 4. What can remain for the final 25%

- [ ] Actual index experiments using execution plans and repeated, comparable measurements.
- [ ] Materialized views, real refresh behavior, and measured comparisons with ordinary queries.
- [ ] Larger-scale data loading and broader historical analysis.
- [ ] Integration of the remaining screens and additional reports.
- [ ] Wider edge-case coverage, final presentation polish, and final project report.

If the teacher explicitly requires indexing or materialized views at this review, move those tasks into the required milestone. Never present hardcoded or randomized timings as measured database results.

## 5. Review demonstration

1. Explain the problem and show the ER diagram.
2. Connect to the database and show six populated tables, constraints, and actual row counts.
3. Explain the data source, cleaning, and time coverage.
4. Run advanced SQL: a join, subquery, CTE, and window-function example.
5. Change road/date/time filters in the application and show corresponding results.
6. Query an ordinary view, generate a report, and export CSV.
7. Show the completion checklist and explain the final optimization/materialized-view work.

## 6. Definition of ready for this review

- [ ] P1 through P7 meet their acceptance criteria, with evidence retained.
- [ ] Data and SQL execute in a real database.
- [ ] The main demo screens and at least one report use database results.
- [ ] Setup is reproducible and no credentials are committed.
- [ ] Every simulated or unfinished feature is accurately labeled.
- [ ] The team can explain the implementation and what remains.

Publication checks do not count as completing these tasks. Do not tick boxes based only on the historical `worklog.md`; rerun the relevant checks and record what actually works.
