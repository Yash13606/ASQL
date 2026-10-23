// ============================================================================
// Urban Mobility DB — SQL Query Library
// Canned PostgreSQL-style queries executed against the simulated dataset.
// Each entry has: id, title, sql, description, features, and an executor.
// ============================================================================

import { getDataset } from "./seed";
import { getRoadAggregates } from "./queries";

export interface QueryRow {
  [key: string]: string | number;
}

export interface QueryExecutorResult {
  columns: string[];
  rows: QueryRow[];
  rowCount: number;
  executionTimeMs: number;
  rowsScanned: number;
  indexUsed: boolean;
}

export interface SqlLibraryEntry {
  id: string;
  title: string;
  category: "JOIN" | "Subquery" | "CTE" | "Window" | "Aggregate";
  sql: string;
  description: string;
  why?: string;
  features: string[];
  run: (useIndex?: boolean) => QueryExecutorResult;
}

// helper: pseudo execution time (stable per query, modulated by index flag)
function execTime(baseMs: number, useIndex: boolean, scanFactor = 1): number {
  const ds = getDataset();
  const noise = (ds.observations.length % 17) / 17; // 0..1 stable
  const t = useIndex ? baseMs * 0.12 + noise * 4 : baseMs + noise * 18;
  return Math.round(t * scanFactor);
}

export const SQL_LIBRARY: SqlLibraryEntry[] = [
  {
    id: "busiest-roads",
    title: "1. Busiest Roads",
    category: "JOIN",
    sql: `SELECT
    r.road_name,
    r.area,
    SUM(t.vehicle_count) AS total_vehicles,
    ROUND(AVG(t.average_speed), 1) AS avg_speed
FROM road r
JOIN road_segment rs
    ON r.road_id = rs.road_id
JOIN sensor s
    ON rs.segment_id = s.segment_id
JOIN traffic_observation t
    ON s.sensor_id = t.sensor_id
GROUP BY r.road_id, r.road_name, r.area
ORDER BY total_vehicles DESC
LIMIT 10;`,
    description:
      "Joins four tables (road → segment → sensor → observation) and aggregates total vehicle count per road.",
    features: ["JOIN (4 tables)", "GROUP BY", "SUM()", "AVG()", "ORDER BY", "LIMIT"],
    run: (useIndex = true) => {
      const rows = getRoadAggregates()
        .sort((a, b) => b.total_vehicles - a.total_vehicles)
        .slice(0, 10)
        .map((r) => ({
          road_name: r.road_name,
          area: r.area,
          total_vehicles: r.total_vehicles,
          avg_speed: r.avg_speed,
        }));
      return {
        columns: ["road_name", "area", "total_vehicles", "avg_speed"],
        rows,
        rowCount: rows.length,
        executionTimeMs: execTime(42, useIndex),
        rowsScanned: useIndex ? 18420 : 2_400_000,
        indexUsed: useIndex,
      };
    },
  },
  {
    id: "peak-hours",
    title: "2. Peak Traffic Hours",
    category: "Aggregate",
    sql: `SELECT
    EXTRACT(HOUR FROM t.timestamp) AS hour_of_day,
    SUM(t.vehicle_count) AS total_vehicles,
    ROUND(AVG(t.average_speed), 1) AS avg_speed
FROM traffic_observation t
GROUP BY hour_of_day
ORDER BY hour_of_day;`,
    description:
      "Groups all observations by hour of day to reveal the bimodal morning/evening peak pattern.",
    features: ["EXTRACT()", "GROUP BY", "SUM()", "AVG()", "ORDER BY"],
    run: (useIndex = true) => {
      const ds = getDataset();
      const vol = new Array(24).fill(0);
      const spd = new Array(24).fill(0);
      const cnt = new Array(24).fill(0);
      for (const o of ds.observations) {
        vol[o.hour] += o.vehicle_count;
        spd[o.hour] += o.average_speed;
        cnt[o.hour]++;
      }
      const rows = Array.from({ length: 24 }, (_, h) => ({
        hour_of_day: `${String(h).padStart(2, "0")}:00`,
        total_vehicles: vol[h],
        avg_speed: parseFloat((spd[h] / (cnt[h] || 1)).toFixed(1)),
      }));
      return {
        columns: ["hour_of_day", "total_vehicles", "avg_speed"],
        rows,
        rowCount: rows.length,
        executionTimeMs: execTime(38, useIndex),
        rowsScanned: useIndex ? 24180 : 2_400_000,
        indexUsed: useIndex,
      };
    },
  },
  {
    id: "above-average",
    title: "3. Roads Above Average Traffic",
    category: "Subquery",
    sql: `SELECT r.road_name, r.area, SUM(t.vehicle_count) AS total_vehicles
FROM road r
JOIN road_segment rs ON r.road_id = rs.road_id
JOIN sensor s ON rs.segment_id = s.segment_id
JOIN traffic_observation t ON s.sensor_id = t.sensor_id
GROUP BY r.road_id, r.road_name, r.area
HAVING SUM(t.vehicle_count) > (
    SELECT AVG(road_total) FROM (
        SELECT SUM(t2.vehicle_count) AS road_total
        FROM traffic_observation t2
        JOIN sensor s2 ON t2.sensor_id = s2.sensor_id
        GROUP BY s2.segment_id
    ) AS sub
)
ORDER BY total_vehicles DESC;`,
    description:
      "A correlated subquery computes the overall average traffic per segment; HAVING keeps only roads above that average.",
    why: "Subqueries let us compare each road against a value computed from the whole dataset, without a separate application step.",
    features: ["JOIN", "GROUP BY", "HAVING", "Subquery", "SUM()", "ORDER BY"],
    run: (useIndex = true) => {
      const all = getRoadAggregates();
      const avg = all.reduce((s, r) => s + r.total_vehicles, 0) / all.length;
      const rows = all
        .filter((r) => r.total_vehicles > avg)
        .sort((a, b) => b.total_vehicles - a.total_vehicles)
        .slice(0, 12)
        .map((r) => ({
          road_name: r.road_name,
          area: r.area,
          total_vehicles: r.total_vehicles,
          avg_threshold: Math.round(avg),
        }));
      return {
        columns: ["road_name", "area", "total_vehicles", "avg_threshold"],
        rows,
        rowCount: rows.length,
        executionTimeMs: execTime(126, useIndex),
        rowsScanned: useIndex ? 36210 : 2_400_000,
        indexUsed: useIndex,
      };
    },
  },
  {
    id: "road-ranking",
    title: "4. Road Ranking",
    category: "Window",
    sql: `WITH road_traffic AS (
    SELECT
        r.road_name,
        r.area,
        SUM(t.vehicle_count) AS total_traffic,
        ROUND(AVG(t.average_speed),1) AS avg_speed
    FROM road r
    JOIN road_segment rs ON r.road_id = rs.road_id
    JOIN sensor s ON rs.segment_id = s.segment_id
    JOIN traffic_observation t ON s.sensor_id = t.sensor_id
    GROUP BY r.road_id, r.road_name, r.area
)
SELECT
    road_name,
    area,
    total_traffic,
    avg_speed,
    RANK() OVER (ORDER BY total_traffic DESC) AS traffic_rank,
    RANK() OVER (ORDER BY avg_speed ASC) AS slowest_rank
FROM road_traffic
ORDER BY traffic_rank
LIMIT 12;`,
    description:
      "A CTE pre-aggregates per-road traffic, then two RANK() window functions rank roads by volume and by slowness — without collapsing rows.",
    why: "Window functions allow ranking without collapsing the result rows, so each road keeps its detail alongside its rank.",
    features: ["CTE (WITH)", "JOIN", "GROUP BY", "RANK() OVER", "ORDER BY"],
    run: (useIndex = true) => {
      const rows = getRoadAggregates()
        .sort((a, b) => b.total_vehicles - a.total_vehicles)
        .slice(0, 12)
        .map((r, i) => ({
          road_name: r.road_name,
          area: r.area,
          total_traffic: r.total_vehicles,
          avg_speed: r.avg_speed,
          traffic_rank: i + 1,
          slowest_rank: 0,
        }));
      // compute slowest rank separately
      const bySpeed = [...rows].sort((a, b) => (a as any).avg_speed - (b as any).avg_speed);
      bySpeed.forEach((r, i) => {
        const target = rows.find((x) => x.road_name === r.road_name);
        if (target) target.slowest_rank = i + 1;
      });
      return {
        columns: ["road_name", "area", "total_traffic", "avg_speed", "traffic_rank", "slowest_rank"],
        rows,
        rowCount: rows.length,
        executionTimeMs: execTime(74, useIndex),
        rowsScanned: useIndex ? 18420 : 2_400_000,
        indexUsed: useIndex,
      };
    },
  },
  {
    id: "daily-summary",
    title: "5. Daily Traffic Summary",
    category: "Aggregate",
    sql: `SELECT
    DATE(t.timestamp) AS traffic_date,
    COUNT(*) AS observations,
    SUM(t.vehicle_count) AS total_vehicles,
    ROUND(AVG(t.average_speed),1) AS avg_speed,
    SUM(CASE WHEN t.congestion_level='HIGH' THEN 1 ELSE 0 END) AS high_count
FROM traffic_observation t
GROUP BY DATE(t.timestamp)
ORDER BY traffic_date;`,
    description:
      "Daily rollup of observation count, total vehicles, average speed and high-congestion events — the basis for the daily traffic view.",
    features: ["DATE()", "GROUP BY", "COUNT()", "SUM()", "AVG()", "CASE WHEN"],
    run: (useIndex = true) => {
      const ds = getDataset();
      const map = new Map<string, { obs: number; vol: number; spd: number; high: number; cnt: number }>();
      for (const o of ds.observations) {
        let e = map.get(o.date);
        if (!e) {
          e = { obs: 0, vol: 0, spd: 0, high: 0, cnt: 0 };
          map.set(o.date, e);
        }
        e.obs++;
        e.vol += o.vehicle_count;
        e.spd += o.average_speed;
        e.cnt++;
        if (o.congestion_level === "HIGH") e.high++;
      }
      const rows = Array.from(map.entries())
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([d, e]) => ({
          traffic_date: d,
          observations: e.obs,
          total_vehicles: e.vol,
          avg_speed: parseFloat((e.spd / (e.cnt || 1)).toFixed(1)),
          high_count: e.high,
        }));
      return {
        columns: ["traffic_date", "observations", "total_vehicles", "avg_speed", "high_count"],
        rows,
        rowCount: rows.length,
        executionTimeMs: execTime(54, useIndex),
        rowsScanned: useIndex ? 57456 : 2_400_000,
        indexUsed: useIndex,
      };
    },
  },
  {
    id: "congestion-analysis",
    title: "6. Congestion Analysis",
    category: "Aggregate",
    sql: `SELECT
    r.road_name,
    COUNT(*) FILTER (WHERE t.congestion_level='HIGH') AS high_events,
    COUNT(*) FILTER (WHERE t.congestion_level='MEDIUM') AS medium_events,
    ROUND(100.0 * COUNT(*) FILTER (WHERE t.congestion_level='HIGH') / COUNT(*), 1) AS high_pct
FROM road r
JOIN road_segment rs ON r.road_id = rs.road_id
JOIN sensor s ON rs.segment_id = s.segment_id
JOIN traffic_observation t ON s.sensor_id = t.sensor_id
GROUP BY r.road_id, r.road_name
HAVING COUNT(*) FILTER (WHERE t.congestion_level='HIGH') > 0
ORDER BY high_pct DESC
LIMIT 10;`,
    description:
      "Uses FILTER (PostgreSQL) inside aggregates with HAVING to surface the most frequently congested roads by percentage.",
    features: ["JOIN", "GROUP BY", "COUNT() FILTER", "HAVING", "ORDER BY"],
    run: (useIndex = true) => {
      const rows = getRoadAggregates()
        .filter((r) => r.high_pct > 0)
        .sort((a, b) => b.high_pct - a.high_pct)
        .slice(0, 10)
        .map((r) => ({
          road_name: r.road_name,
          high_events: Math.round((r.high_pct / 100) * 168),
          medium_events: Math.round((r.medium_pct / 100) * 168),
          high_pct: r.high_pct,
        }));
      return {
        columns: ["road_name", "high_events", "medium_events", "high_pct"],
        rows,
        rowCount: rows.length,
        executionTimeMs: execTime(61, useIndex),
        rowsScanned: useIndex ? 18420 : 2_400_000,
        indexUsed: useIndex,
      };
    },
  },
];

export function getQueryById(id: string): SqlLibraryEntry | undefined {
  return SQL_LIBRARY.find((q) => q.id === id);
}
