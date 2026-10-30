# ASQL — Urban Mobility Database

An Advanced SQL project that imports the Kaggle **Bangalore Traffic 2023–2024** CSV into MySQL 8 and explores the source observations through parameterized SQL, live analytics, schema inspection, views, summary refresh, and query-plan comparison.

The historical dataset is aggregated. Its publisher does not document measurement units or detailed provenance. Time-of-day values are source categories rather than exact timestamps; locations are names without coordinates; vehicle and trip identities are not supplied. A separate **Live Simulation** screen runs a synthetic four-way junction so fixed and adaptive signals can be compared using stored MySQL results. The Overview also shows the latest completed synthetic comparison in a clearly labeled card. The simulation does not represent live Bangalore traffic.

For a handoff to another developer, start with [AI_CONTINUATION_GUIDE.md](AI_CONTINUATION_GUIDE.md). It explains the current evidence boundary, new-laptop setup, and presentation checklist. [PENDING_75_PERCENT.md](PENDING_75_PERCENT.md) tracks implementation and remaining proof.

## Stack and data model

- Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts.
- MySQL 8.0.18+ through the `mysql2` Node.js driver.
- Fourteen relational tables: ten historical-data/application tables plus four separate simulation tables for runs, samples, approach queues, and signal actions.
- Three ordinary MySQL views expose joined observations, daily summaries, and congestion summaries.
- Eleven saved MySQL query exercises cover joins, aggregation, subqueries, CTEs, window functions, JSON extraction, and set operations.

MySQL does not provide native materialized views. The project instead refreshes its daily summary table through a stored procedure and compares its values with the ordinary summary view.

## Local setup (Windows)

Requirements: Node.js 20.9 or newer, MySQL Server 8, and the supplied dataset CSV. MySQL Workbench can inspect the same local database.

1. Start MySQL Server and open a terminal in this repository.
2. Install dependencies and configure the local connection:

   ```powershell
   npm install
   powershell -ExecutionPolicy Bypass -File scripts\configure-local.ps1
   ```

   Enter the host, port, username, and password that work in MySQL Workbench. The password is requested as a hidden prompt and stored only in the ignored `.env` file. Do not commit or share `.env`.

3. Put the Kaggle CSV on the local computer and enter its absolute path in `DATASET_CSV` in `.env` when prompted. On the original development computer it was at `D:\ASQL\archive\bangalore_traffic_timely_data.csv`. The raw CSV is deliberately ignored by Git.
4. Create the project schema, tables, views, and refresh procedure, then import and activate the dataset:

   ```powershell
   npm run db:setup
   npm run data:import
   ```

   The MySQL account needs permission to create the dedicated `urban_mobility` database and its tables, views, and procedure. The import uses a transaction, validates rows before activation, preserves the original fields as JSON, and is idempotent by file SHA-256. Invalid rows are reported and are not silently included.

5. Start the web application:

   ```powershell
   npm run dev
   ```

   Open <http://127.0.0.1:3000>. The app binds to localhost. `/api/health` reports MySQL connectivity and version; `/api/traffic` serves the dataset-backed workspace. The app will display setup guidance if MySQL or an active import is unavailable.

Optional dataset download helper (requires the Python `kagglehub` package and Kaggle access already configured):

```powershell
python -m pip install kagglehub
npm run data:download
```

Alternatively, download and extract the CSV from [Kaggle: Bangalore Traffic 2023–2024](https://www.kaggle.com/datasets/sandheepkochi/bangalore-traffic-2023-2024) yourself.

## Main screens

- **Overview and Traffic Analysis:** live MySQL aggregates, consistent area/road/date/time-block/congestion/weather/roadwork filters, source-row samples, and a separate latest-simulation card on Overview.
- **Live Simulation:** seeded fixed-versus-adaptive junction runs, schematic moving vehicles, signal decisions, live queue/wait metrics, and SQL comparison. See [docs/SIMULATION_GUIDE.md](docs/SIMULATION_GUIDE.md).
- **Road Patterns:** compares areas and source road names as a schematic. It is not a map because coordinates and road geometry are absent.
- **Schema Explorer:** reads table/column definitions, foreign keys, indexes, and live row counts from the configured database.
- **SQL Query Lab:** executes the curated saved SQL on the server with bound filter parameters; it is not an unrestricted SQL console.
- **Index Benchmark:** compares actual MySQL query results and `EXPLAIN` plans with and without an index hint. Timings are measured locally and may vary; no speedup is assumed.
- **Views & Summaries:** inspects the three views, refreshes the daily summary procedure, and compares weighted results.
- **Data & Provenance:** shows the imported file checksum, validation, original columns, source URL, and known data limitations.
- **Reports:** previews filtered SQL reports and downloads formula-safe CSVs.

## Useful commands

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:database
npm run verify:simulation
```

`npm run verify:database` is read-only. It checks active-import counts, logical foreign-key coverage, the project views, the four simulation tables, and executes every saved query. `npm run verify:simulation` is also read-only; after a fixed/adaptive pair finishes, it checks the stored demand, totals, samples, lane rows, and actions against the deterministic model. Both commands require configured MySQL; the second also requires a completed pair. Workbench examples are in [docs/SIMULATION_GUIDE.md](docs/SIMULATION_GUIDE.md).

## Project paths

| Path | Purpose |
| --- | --- |
| `src/components/traffic/traffic-app.tsx` | Connected workspace UI and screens |
| `src/lib/traffic/core.mjs` | CSV parsing, validation, filters, and safe CSV output |
| `src/lib/traffic/database.mjs` | MySQL pool, parameterized query wrapper, and safe error mapping |
| `src/lib/traffic/queries.mjs` | Saved advanced MySQL query library |
| `src/lib/traffic/service.mjs` | Database-backed analytics, reports, schema, and benchmark services |
| `src/app/api/traffic/route.ts` | Traffic workspace API |
| `src/app/api/simulation/route.ts` | Simulation start, stop, history, and comparison API |
| `src/lib/simulation/` | Deterministic junction model and MySQL simulation service |
| `src/components/simulation/overview-simulation-card.tsx` | Latest completed synthetic comparison on Overview |
| `scripts/simulation-worker.mjs` | Local background worker that records each run |
| `scripts/verify-simulation.mjs` | Read-only simulation database evidence check |
| `sql/` | Repeatable MySQL schema, views, and summary procedure |
| `scripts/` | Local connection, schema setup, import, and verification scripts |
| `docs/SQL_GUIDE.md` | Workbench examples and explanations for the review |
| `docs/SIMULATION_GUIDE.md` | Model rules, run flow, simulation tables, and Workbench queries |
| `data/raw/` | Local-only dataset location; CSV files are gitignored |
| `PENDING_75_PERCENT.md` | Evidence-based milestone checklist and review notes |
| `AI_CONTINUATION_GUIDE.md` | Step-by-step setup and instructions for the next developer/AI |
| `FINAL_PRESENTATION_HANDOFF.md` | Final code-side status and exact teammate acceptance steps |
| `docs/ASQL_FINAL_PRESENTATION_SCRIPT.html` | Offline final speaking script with evidence-aware wording |

## Current verification boundary

Parser/filter/SQL-compilation and simulation-model tests can run without MySQL. Database import, simulation persistence, live browser behavior, and query timing require the local database setup above. Never present a successful front-end build or pure model result as proof of a successful live database run.
