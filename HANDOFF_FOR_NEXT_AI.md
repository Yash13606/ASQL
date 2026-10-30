# ASQL transfer handoff — read this first

This file is the single continuation guide for the teammate and their AI assistant. The project folder and ZIP are prepared for transfer to a Windows laptop. Work from the folder containing `package.json`; keep it in a writable location such as `C:\Projects\ASQL`.

## Mission for the next AI assistant

> Inspect this repository and its current Git state. Read `README.md`, `docs/SQL_GUIDE.md`, and `docs/SIMULATION_GUIDE.md`. Install dependencies; configure the teammate's local MySQL Server using `scripts/configure-local.ps1` without exposing credentials in chat; create the schema; import the bundled CSV; run all pure tests, TypeScript, lint, production build, database verifier, and browser acceptance. Fix actual failures in source. Run and verify a fixed/adaptive simulation pair, check its MySQL records with `npm run verify:simulation`, and confirm the Overview comparison opens the same pair. Record command results and screenshots in a new `ACCEPTANCE_RESULTS.md`, separating passed checks from gaps. Inspect the Git remote before publishing the completed branch. Never commit `.env`, the CSV, dependencies, generated output, or credentials. Do not claim a complete running system until the laptop checks pass.

The owner requested code preparation here and runtime acceptance on your laptop. The preparing computer did **not** start the website or MySQL. Its 18 pure Node tests passed. This is a source handoff, not proof that a live database or browser has run.

## Contents and data

- `data/raw/bangalore_traffic_timely_data.csv` is bundled in the transfer folder/ZIP. Expected SHA-256: `6169001e519c47cfee22a3ddd407d1134ce9ee3febf8391f410ce2201aca08d3`.
- The original dataset is [Bangalore Traffic 2023–2024 on Kaggle](https://www.kaggle.com/datasets/sandheepkochi/bangalore-traffic-2023-2024). The inspected file has 18 columns and 33,072 data rows, dated 2023-01-01 through 2024-08-09. This count is a **source-file inspection**, not a claim that your MySQL import succeeded.
- The CSV is ignored by Git. A Git clone alone will require you to copy it from this transfer ZIP or download it again.
- `sql/001_schema.sql` through `sql/004_simulation.sql` contain the active MySQL schema, views, refresh procedure, and simulation tables. `scripts/` contains setup/import/verification commands. The active website entry point is `src/app/page.tsx` and the connected UI is `src/components/traffic/traffic-app.tsx`.
- The final offline speaking guide is `docs/ASQL_FINAL_PRESENTATION_SCRIPT.html`. It contains conditional wording; use actual laptop results when presenting.

## Laptop setup and checks, in order

1. Install Node.js 20.9 or newer, npm, MySQL Server 8.0.18 or newer, and MySQL Workbench. Start MySQL Server. Use a local MySQL account that can create the `urban_mobility` database, tables, views, and stored procedure. Keep the password out of chat and Git.
2. Extract the ZIP. In PowerShell, `cd` to the project folder. Confirm `package.json`, `sql/`, and the bundled CSV are present. Verify its checksum with `Get-FileHash .\data\raw\bangalore_traffic_timely_data.csv -Algorithm SHA256`.
3. Run each command separately; save output and fix errors before proceeding:

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

   `configure-local.ps1` defaults to the bundled CSV path inside this project. Enter the same host, port, and username used in Workbench; the password prompt is hidden. It writes the ignored `.env` file. If `npm install` fails because of network or proxy settings, resolve that on the new laptop and rerun it. Its generated `package-lock.json` is appropriate to keep after a successful install.
4. Open <http://127.0.0.1:3000/api/health> and <http://127.0.0.1:3000>. Confirm the health response reports MySQL connectivity. Confirm Overview and Data & Provenance show the active import. Use a road, date, or time-block filter and verify a historical metric changes.
5. In SQL Query Lab, run a JOIN/aggregate query, a CTE, a window-function query, and JSON source trace. Verify returned rows. In Views & Summaries, refresh and compare the stored daily summary. In Index Benchmark, report the actual `EXPLAIN` plans and measured time; do not assume either path wins. Export a filtered CSV and inspect it.
6. Open Live Simulation. Run a fixed/adaptive pair with seed 42 for east-west surge. Wait until **both** runs are completed. Check changing queues, signal decisions, chart, final comparison, and history. Confirm the Overview's synthetic experiment card opens that same comparison. From a second terminal run `npm run verify:simulation` and save its JSON output. Use Workbench to inspect `simulation_run`, `simulation_step`, `simulation_lane_sample`, and `simulation_action`. Repeat north-south surge and balanced demand if time permits; the adaptive model may perform worse for balanced demand.
7. Test Stop and a page reload. Check that a stopped/failed run is not presented as a completed comparison. If the worker fails, inspect `data/processed/simulation-worker.log` and the server output. Fix and rerun the pair before taking screenshots.

## Workbench evidence

Connect to the **same MySQL Server** used in `.env`. Run the examples in `docs/SQL_GUIDE.md` and `docs/SIMULATION_GUIDE.md`. Save screenshots or command output proving:

| Check | Acceptance evidence |
| --- | --- |
| Historical import | MySQL version, active import ID, checksum, accepted/rejected rows, observation count, and date bounds |
| SQL functionality | One result each for joins, CTE/window logic, views/summary refresh, and index-plan comparison |
| Website | Filtered dashboard, report export, source provenance, and a clear synthetic simulation label |
| Simulation | Same scenario/seed/demand fingerprint for both controllers, two completed run IDs, step/lane/action rows, UI comparison, and passing `verify:simulation` JSON |
| Code | Outputs from `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` |

Create `ACCEPTANCE_RESULTS.md` with the actual command, date, outcome, and evidence path for each row. A failed or skipped check stays open. The dataset field `Traffic Volume` is aggregate source data, not a count of distinct vehicles. Its time blocks are categories, and it lacks coordinates and individual trip records. The synthetic simulation is a separate demonstration; it does not control real signals or use live Bangalore sensor data.

## Git and final delivery

The project came from local branch `feat/bangalore-mysql`, with `origin` set to `https://github.com/Yash13606/ASQL.git`. The transfer folder includes Git history so the teammate can continue on the same branch. **Check the remote state before publishing** because GitHub may have changed since packaging:

```powershell
git status --short
git branch -vv
git remote -v
git fetch origin
git log --oneline --decorate --max-count=8
```

If the branch has not been published and the remote has no conflicting work, push it with `git push -u origin feat/bangalore-mysql` and open a pull request. If the remote has changed, reconcile the histories first; do not force-push. Add the new `ACCEPTANCE_RESULTS.md` and the generated npm lockfile only after reviewing them. Confirm with `git status --short` that `.env`, the CSV, `.next`, and `node_modules` are untracked/ignored and absent from the commit.

The academic completion percentage depends on the instructor's rubric. Report **source implementation complete, laptop acceptance pending** until the evidence above is actually collected. The final presentation script is a speaking aid, not a substitute for working software.
