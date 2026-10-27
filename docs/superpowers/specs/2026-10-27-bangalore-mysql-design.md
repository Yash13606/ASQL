# Bangalore traffic analytics: implementation design

## Objective and scope

Finish the existing nine-screen Advanced SQL web project using the user-selected Kaggle dataset `sandheepkochi/bangalore-traffic-2023-2024`. Simulation is excluded. Work in the published checkout `D:\ASQL\github-upload`; preserve the earlier `project/` copy and do not push or deploy unless subsequently requested.

The user's requested stack is the existing Next.js/React application plus the installed MySQL 8 server and MySQL Workbench. Workbench is a database client; the Next.js server connects directly to MySQL using mysql2 prepared statements.

## Approaches and decisions

1. Keep the generated frontend demo: insufficient because the requested outcome requires actual database execution and the selected dataset.
2. Move to PostgreSQL: fits the original example SQL and native materialized views, but does not match the user's preferred installed Workbench workflow.
3. Use MySQL 8 with explicit compatibility adaptations: selected implementation proposal, based on the user's request to use Workbench if possible. Use a refreshable summary table for the materialized-result demonstration and label it accurately. Do not claim full Oracle feature parity.

Existing source and the pending-work checklist establish the required features. The course handout is Oracle-focused, so document the DBMS choice and unsupported Oracle-specific features rather than inventing equivalence.

## Data contract

- Inspect the downloaded CSV before finalizing column mappings. Kaggle currently advertises one approximately 5.22 MB CSV, 18 columns, no description, and unknown license/provenance.
- Keep the original CSV local and ignored; retain source URL, file checksum, row numbers, and dataset version metadata.
- Normalize areas, roads, source locations, and observations. Location/sensor records derived for relational organization must be labeled dataset locations, not physical installed sensors.
- Retain every source column in JSON alongside typed analytical columns. Interpret time labels only when explicitly supplied by the source; never derive times from row order.
- Keep vehicle/trip tables as documented schema extensions if the dataset lacks individual records. Their counts must remain zero and the UI must explain missing coverage.
- Validate values and retain rejected-row reasons. Identify exact duplicates; repeat imports of the same checksum must be idempotent.
- Identify the active import so historical versions are not silently combined.

## Backend and persistence

Use focused shared modules for CSV parsing/validation, database configuration, query definitions, filters, and analytics. Use SQL migration/setup scripts that can also be inspected in Workbench. Restrict setup to the dedicated `urban_mobility` database; no reset/drop of unrelated databases.

Endpoints: health/status, source metadata and filter options, filtered analytics, schema inspection, saved query execution, measured index comparison, ordinary/cached summaries, and report export. Accept saved query identifiers instead of arbitrary client SQL. Validate filters server-side, use prepared values, bounded query/result sizes, and reject untrusted mutation origins. Return actionable errors without connection secrets.

Use database transactions for imports and summary refresh. Include ordinary views, CTE/subquery/window/aggregation examples, constraints, indexes, a stored procedure or transaction demonstration, and dataset provenance JSON queries. Benchmark indexes using actual query plans and repeated measurements; no assumed speedup or fabricated rows scanned.

## Frontend

Preserve the blue/navy academic visual style and existing nine navigation destinations. Replace generated analytics with a shared API-backed application state. Support loading, setup failure, retry, empty results, accessible controls, and narrow screens. Use actual data bounds for defaults and filters. Label historical data, unsupported dimensions, and missing coverage accurately.

Dashboard: actual counts and aggregate metrics; Analysis: road/area/date/time/congestion filters; Spatio-Temporal: source locations and historical trends, with schematic explicitly labeled if geographic coordinates are absent; Explorer: actual schema and counts; Query Lab: saved executable SQL and measured results; Optimization: real plans/timings; Views: real ordinary views plus refreshable cache; Data Flow: actual pipeline and import quality; Reports: matching filtered database results and safe CSV export.

## Validation and completion evidence

Use Node's test runner for pure importer/filter/CSV contracts. Validate known-small-fixture SQL outputs, foreign-key/check rejection, import idempotency, view/cache consistency, all saved queries, benchmark result equivalence, and API errors against MySQL. Run lint, separate TypeScript check, production build, and desktop/mobile browser flows using the actual imported dataset. Record row counts, rejected/duplicate counts, source checksum/date range, and verification commands/results in docs.

Completion means a fresh setup can import the chosen file, serve all main flows from MySQL, execute genuine Advanced SQL, refresh summaries, export matching reports, and reproduce measured optimization results. External service, credentials, registry, and dataset-access blockers remain explicitly incomplete until live proof is obtained.
