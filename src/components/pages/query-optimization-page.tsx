"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  Zap,
  Gauge,
  Database,
  Clock,
  Layers,
  TrendingDown,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PageHeader, SectionLabel, ChartCard, KpiCard } from "@/components/shared/ui";
import { SqlBlock } from "@/components/shared/sql-block";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(23,54,93,0.08)",
};

interface RunResult {
  timeMs: number;
  rowsScanned: number;
  method: string;
}

export function QueryOptimizationPage() {
  const { indexEnabled, setIndexEnabled } = useAppStore();
  const [lastRun, setLastRun] = React.useState<RunResult | null>(null);
  const [running, setRunning] = React.useState(false);

  const run = (withIndex: boolean) => {
    setRunning(true);
    setIndexEnabled(withIndex);
    setTimeout(() => {
      const noise = Math.random();
      const timeMs = withIndex
        ? Math.round(88 + noise * 16)
        : Math.round(810 + noise * 60);
      const rowsScanned = withIndex
        ? 18420 + Math.round(noise * 600)
        : 2_400_000;
      setLastRun({ timeMs, rowsScanned, method: withIndex ? "Index Scan" : "Seq Scan" });
      setRunning(false);
    }, 520);
  };

  // default values shown before any run
  const noIndex: RunResult = { timeMs: 842, rowsScanned: 2_400_000, method: "Seq Scan" };
  const withIndex: RunResult = { timeMs: 96, rowsScanned: 18_420, method: "Index Scan" };
  const speedup = (noIndex.timeMs / withIndex.timeMs).toFixed(1);

  const chartData = [
    { label: "Execution Time (ms)", without: noIndex.timeMs, withIdx: withIndex.timeMs },
    {
      label: "Rows Scanned (K)",
      without: Math.round(noIndex.rowsScanned / 1000),
      withIdx: Math.round(withIndex.rowsScanned / 1000),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Optimization"
        title="Query Optimization"
        subtitle="Demonstrating the performance impact of composite indexes on the traffic_observation fact table"
      />

      {/* Target query */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-[#4472C4]" />
          <SectionLabel>Target Query</SectionLabel>
        </div>
        <SqlBlock
          title="optimization_target.sql"
          maxHeight={140}
          sql={`-- Find observations for a sensor within a time window
SELECT timestamp, vehicle_count, average_speed, congestion_level
FROM traffic_observation
WHERE sensor_id = 104
  AND timestamp BETWEEN '2026-09-03 08:00' AND '2026-09-03 10:00'
ORDER BY timestamp;`}
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            onClick={() => run(false)}
            disabled={running}
            variant="outline"
            className={cn(
              "border-[#e2e8f0] text-[#475569] hover:bg-[#F5F9FD]",
              !indexEnabled && "border-[#C0392B]/40 text-[#C0392B]"
            )}
          >
            <Database className="h-4 w-4" />
            Run Without Index
          </Button>
          <Button
            onClick={() => run(true)}
            disabled={running}
            className="bg-[#4472C4] text-white hover:bg-[#3a5fb0]"
          >
            <Zap className="h-4 w-4" />
            Run With Index
          </Button>
          {lastRun && (
            <span className="ml-auto flex items-center gap-2 text-[12px] text-[#64748b]">
              <CheckCircle2 className="h-4 w-4 text-[#1f7a4d]" />
              Last run: <span className="font-bold text-[#17365D]">{lastRun.method}</span>
              {" · "}
              <span className="font-bold tabular-nums text-[#17365D]">{lastRun.timeMs} ms</span>
              {" · "}
              <span className="font-bold tabular-nums text-[#17365D]">
                {lastRun.rowsScanned.toLocaleString()} rows
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Before / After cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          className={cn(
            "rounded-xl border p-5 shadow-sm transition-colors",
            !indexEnabled ? "border-[#C0392B]/40 bg-[#fdf3f2]" : "border-[#e2e8f0] bg-white"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C0392B]/10 text-[#C0392B]">
                <Database className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-[#17365D]">Before Index</span>
            </div>
            <span className="rounded bg-[#C0392B]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#C0392B]">
              Seq Scan
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-[#64748b]">Execution Time</div>
              <div className="mt-1 text-2xl font-bold text-[#17365D]">842 <span className="text-sm font-medium text-[#64748b]">ms</span></div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-[#64748b]">Rows Scanned</div>
              <div className="mt-1 text-2xl font-bold text-[#17365D]">2.4M</div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-[#64748b]">
            Full table scan — every row in <span className="font-mono">traffic_observation</span> is examined.
          </p>
        </div>

        <div
          className={cn(
            "rounded-xl border p-5 shadow-sm transition-colors",
            indexEnabled ? "border-[#4472C4]/40 bg-[#F5F9FD]" : "border-[#e2e8f0] bg-white"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4472C4]/10 text-[#4472C4]">
                <Zap className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-[#17365D]">After Index</span>
            </div>
            <span className="rounded bg-[#4472C4]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#4472C4]">
              Index Scan
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-[#64748b]">Execution Time</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#17365D]">96</span>
                <span className="text-sm font-medium text-[#64748b]">ms</span>
                <TrendingDown className="ml-1 h-4 w-4 text-[#1f7a4d]" />
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-[#64748b]">Rows Scanned</div>
              <div className="mt-1 text-2xl font-bold text-[#17365D]">18.4K</div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-[#64748b]">
            Composite index on <span className="font-mono">(sensor_id, timestamp)</span> directs the scan.
          </p>
        </div>
      </div>

      {/* Comparison chart */}
      <ChartCard
        title="Performance Comparison"
        subtitle={`Index delivers a ${speedup}× speedup`}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 24, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} width={50} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F5F9FD" }} />
            <Bar dataKey="without" name="Without Index" fill="#C0392B" radius={[4, 4, 0, 0]} barSize={48} />
            <Bar dataKey="withIdx" name="With Index" fill="#4472C4" radius={[4, 4, 0, 0]} barSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* The index DDL */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#4472C4]" />
            <SectionLabel>Index Definition</SectionLabel>
          </div>
          <SqlBlock
            title="create_index.sql"
            maxHeight={120}
            sql={`CREATE INDEX idx_traffic_sensor_time
ON traffic_observation (sensor_id, timestamp);

-- Refresh planner statistics
ANALYZE traffic_observation;`}
          />
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-[#dbe6f3] bg-[#F5F9FD] p-5 shadow-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4472C4] text-white">
            <Info className="h-4 w-4" />
          </span>
          <div>
            <SectionLabel className="mb-1">Why Index?</SectionLabel>
            <p className="text-[12.5px] leading-relaxed text-[#334155]">
              Indexes reduce the amount of data the database must scan for frequently
              searched columns. A composite B-tree index on{" "}
              <span className="font-mono text-[#17365D]">(sensor_id, timestamp)</span>{" "}
              lets the planner seek directly to the relevant partition instead of
              scanning all 2.4M rows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
