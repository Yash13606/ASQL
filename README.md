# ASQL - Urban Mobility Database

Design and Implementation of an Urban Mobility Database for Spatio-Temporal Traffic Analysis Using Advanced SQL.

**Current status: interactive frontend prototype with simulated data and SQL execution. The real urban mobility database is pending.**

Start with [PENDING_75_PERCENT.md](PENDING_75_PERCENT.md). It contains the implementation order, acceptance criteria, source-file pointers, review demonstration, and work reserved for the final milestone.

## What is included

- Next.js 16 / React 19 / TypeScript application with Tailwind, shadcn/ui, Recharts, and Zustand.
- Nine screens: Dashboard, Traffic Analysis, Spatio-Temporal Analysis, Database Explorer, SQL Query Lab, Query Optimization, Views, Data Flow, and Reports.
- Deterministic generated traffic data and example PostgreSQL-style SQL.
- Existing shell scripts, runtime packaging tests, and historical worklog.
- Project review slides in `docs/` and supplied supporting documents/images in `refrence/` (original folder spelling retained).

The UI's connection indicators, PostgreSQL label, execution timings, row-scan counts, index comparison, and materialized-view refresh are demo behavior. The Prisma schema currently contains starter SQLite `User` and `Post` models, not the six traffic tables.

## Run the frontend demo

Install a Node.js version supported by the Next.js version in `package.json`, plus Bun to use the existing `bun.lock`.

```sh
bun install --frozen-lockfile
bunx next dev -p 3000
```

Open <http://localhost:3000>.

Alternatively, with npm:

```sh
npm install
npx next dev -p 3000
```

Direct Next.js commands above work without the shell-specific logging in the existing package scripts. Installing with npm may generate a separate lockfile; agree on one package manager before changing dependency versions.

The in-memory frontend demo does not need a traffic database connection. For work on the existing Prisma scaffold, copy `.env.example` to `.env` and configure the chosen database locally. The example SQLite URL does not implement the required backend. Keep real credentials out of Git.

## Project map

| Path | Purpose |
| --- | --- |
| `src/app/page.tsx` | Application shell and state-based screen navigation |
| `src/components/pages/` | Nine application screens |
| `src/lib/database/types.ts` | Traffic entity types |
| `src/lib/database/schema.ts` | Display schema for the ER diagram |
| `src/lib/database/seed.ts` | Generated in-memory demo data |
| `src/lib/database/queries.ts` | JavaScript analytics simulating database queries |
| `src/lib/database/sql-library.ts` | Displayed SQL and JavaScript executors |
| `src/lib/store.ts` | Shared UI state and filters |
| `src/lib/db.ts` | Starter Prisma client |
| `prisma/schema.prisma` | Starter SQLite schema; traffic tables pending |
| `src/app/api/route.ts` | Placeholder API returning a greeting |
| `tests/` | Existing runtime packaging shell tests |
| `worklog.md` | Historical implementation notes; not fresh verification |

## Validation status

Publication adds documentation and safe repository configuration; it does not complete the database implementation. Dependencies are not installed in the supplied checkout, and application build, lint, type checks, and browser behavior have not been rerun for publication.

After installing dependencies, run `bun run lint`, `bunx tsc --noEmit`, and `bunx next build`. Note that the current `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so a build alone does not prove type correctness. Existing shell tests cover packaging helpers, not traffic-query correctness.

## Publication exclusions

Local environment files, local agent settings, database files, process IDs, dependency folders, and generated output are excluded. A clean publication snapshot avoids carrying the original scaffold history containing local environment/runtime files. Supplied reference materials are included for project handoff; no new license is assigned to third-party papers or images.
