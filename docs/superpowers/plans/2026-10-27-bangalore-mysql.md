# Bangalore MySQL completion plan

Design: [implementation design](../specs/2026-10-27-bangalore-mysql-design.md).

1. **Data and query contracts — implemented.** CSV parsing/validation, safe filters, duplicate profile, and formula-safe CSV output. `npm test` passes 10 tests; actual CSV was inspected and all 33,072 rows passed validation.
2. **Database and import — scripts implemented; live DB proof pending.** MySQL schema/views/summary procedure, local environment setup, transactional importer, and read-only verifier are present. Need successful dependency installation and local credentials to execute them.
3. **SQL and API — implemented; live SQL proof pending.** Parameterized analytics, eleven saved queries, schema inspection, reports, summary refresh, index comparison, and health endpoint are present. The database verifier executes all saved queries when connected.
4. **Connected UI — implemented; browser/API proof pending.** Nine navigation destinations now use the MySQL API, shared applied filters, responsive charts/tables, real query plans, provenance, and setup/error states.
5. **End-to-end proof and handoff — pending.** Need install, local MySQL setup/import, lint/typecheck/build, live database verification, browser acceptance, and screenshots. README and presentation sequence are updated. No automatic publication or cloud deployment.

External prerequisites: the user reports MySQL is running and the CSV exists at `D:\ASQL\archive\bangalore_traffic_timely_data.csv`. The first observed `npm install` ended on an npm registry `ECONNRESET`; no `node_modules/mysql2` or `.env` was present at last check. User must finish/retry dependency installation and the interactive connection setup before live SQL evidence can be collected.
