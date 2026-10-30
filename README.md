# ASQL Urban Mobility

An Advanced SQL project for exploring the Kaggle Bangalore Traffic 2023–2024 dataset in MySQL 8. The Next.js workspace reads imported observations through server-side SQL and includes a separate, synthetic four-way traffic signal simulation. Simulation results are stored in their own MySQL tables and never become historical dataset observations.

**Moving this project to another laptop? Read [HANDOFF_FOR_NEXT_AI.md](HANDOFF_FOR_NEXT_AI.md) first.** The transfer ZIP includes `data/raw/bangalore_traffic_timely_data.csv`; a Git checkout does not, because the source CSV is ignored.

## Requirements

- Node.js 20.9 or newer and npm
- MySQL Server 8.0.18 or newer; MySQL Workbench is useful for inspection
- The CSV in `data/raw/`, supplied in the transfer ZIP or obtained from [Kaggle](https://www.kaggle.com/datasets/sandheepkochi/bangalore-traffic-2023-2024)

## Start on Windows

From the project root, with MySQL Server running:

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

The configuration script prompts for the same MySQL host, port, user, and password used in Workbench. It defaults the dataset path to the CSV inside this folder and saves credentials only to the ignored local `.env`. The MySQL user must be able to create the dedicated `urban_mobility` database, tables, views, and stored procedure. Open <http://127.0.0.1:3000> and <http://127.0.0.1:3000/api/health> after `npm run dev` starts.

The import is identified by the CSV's SHA-256 and reuses a matching prior import. The schema setup is repeatable. `npm run verify:database` is read-only and checks the active import, schema, views, foreign keys, summary, and saved SQL queries. After a fixed/adaptive simulation pair completes, run `npm run verify:simulation`; it compares the persisted samples, lane records, actions, and totals with the deterministic model.

## What the application shows

| Area | Source and behavior |
| --- | --- |
| Overview, Traffic Analysis, Road Patterns | SQL-backed summaries and filters over the imported CSV; Road Patterns is schematic because the CSV has no coordinates |
| Schema Explorer and SQL Query Lab | Live schema metadata and eleven curated, parameterized SQL exercises |
| Index Benchmark and Views & Summaries | MySQL `EXPLAIN` comparison, three ordinary views, and a refreshable daily summary table |
| Data & Provenance and Reports | Import checksum and validation details, source limitations, and filtered CSV export |
| Live Simulation | Seeded fixed and adaptive signal runs, junction and queue display, action timeline, run history, and persisted comparison |

The dataset contains source-reported aggregate `Traffic Volume`, categorical time blocks, road names, and no vehicle identities, trip identities, GPS coordinates, or documented measurement units. The simulation uses generated demand and is **not live Bangalore traffic or a real signal controller**. Adaptive timing can perform worse than fixed timing under balanced demand.

## Project layout

```text
data/raw/                     Supplied CSV in transfer ZIP; ignored by Git
docs/                         SQL, simulation, and final speaking guides
scripts/                      Configuration, schema setup, import, worker, verification
sql/                          MySQL schema, views, summary procedure, simulation tables
src/app/                      Next.js entry point, API routes, styles
src/components/traffic/       Connected analytics workspace
src/components/simulation/    Simulation and Overview comparison UI
src/lib/traffic/              Parser, database access, queries, services
src/lib/simulation/           Model, metrics, persistence, services
tests/                        Pure Node tests
HANDOFF_FOR_NEXT_AI.md        Laptop acceptance and AI continuation instructions
```

The main guides are [SQL_GUIDE.md](docs/SQL_GUIDE.md), [SIMULATION_GUIDE.md](docs/SIMULATION_GUIDE.md), and the offline [final presentation script](docs/ASQL_FINAL_PRESENTATION_SCRIPT.html).

## Verification status

The preparing computer passed 18 pure Node tests and source syntax checks. The owner asked for MySQL, build, and browser checks to be performed on the presentation laptop. Follow the acceptance steps in the handoff before claiming that the full system has run end to end. No password, `.env`, `node_modules`, `.next`, or generated database output belongs in Git or the transfer ZIP.
