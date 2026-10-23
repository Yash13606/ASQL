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
  Eye,
  Layers3,
  RefreshCw,
  Clock,
  CheckCircle2,
  Database,
  Zap,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PageHeader, SectionLabel, DataTable } from "@/components/shared/ui";
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

export function ViewsPage() {
  const { mvRefreshedAt, refreshMaterializedView } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      refreshMaterializedView();
      setRefreshing(false);
    }, 700);
  };

  const cmpData = [
    { label: "Execution Time (ms)", standard: 580, materialized: 72 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Views"
        title="Views & Materialized Views"
        subtitle="Pre-computed SQL definitions that simplify reporting and accelerate reads"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* View */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF2F8] text-[#4472C4]">
                <Eye className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-bold text-[#17365D]">View</div>
                <div className="font-mono text-[12px] text-[#4472C4]">v_daily_traffic_report</div>
              </div>
            </div>
            <span className="rounded bg-[#EAF2F8] px-2 py-0.5 text-[10px] font-bold uppercase text-[#4472C4]">
              Virtual
            </span>
          </div>
          <p className="mb-3 text-[12.5px] text-[#64748b]">
            A reusable SQL query for daily traffic summaries — re-computed on every read.
          </p>
          <SqlBlock
            title="view_definition.sql"
            maxHeight={220}
            sql={`CREATE VIEW v_daily_traffic_report AS
SELECT
    r.road_name,
    r.area,
    DATE(t.timestamp) AS traffic_date,
    SUM(t.vehicle_count) AS total_vehicles,
    ROUND(AVG(t.average_speed), 1) AS avg_speed,
    COUNT(*) FILTER (WHERE t.congestion_level='HIGH') AS high_events
FROM road r
JOIN road_segment rs ON r.road_id = rs.road_id
JOIN sensor s        ON rs.segment_id = s.segment_id
JOIN traffic_observation t ON s.sensor_id = t.sensor_id
GROUP BY r.road_id, r.road_name, r.area, DATE(t.timestamp);`}
          />
          <div className="mt-3 flex items-center gap-2 text-[12px] text-[#64748b]">
            <Clock className="h-3.5 w-3.5 text-[#4472C4]" />
            Computed on read ·{" "}
            <span className="font-semibold text-[#17365D]">580 ms</span> per query
          </div>
        </div>

        {/* Materialized View */}
        <div className="rounded-xl border border-[#4472C4]/30 bg-[#F5F9FD] p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4472C4] text-white">
                <Layers3 className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-bold text-[#17365D]">Materialized View</div>
                <div className="font-mono text-[12px] text-[#4472C4]">mv_daily_traffic_summary</div>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded bg-[#dff3e4] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1f7a4d]">
              <CheckCircle2 className="h-3 w-3" /> Refreshed
            </span>
          </div>
          <p className="mb-3 text-[12.5px] text-[#64748b]">
            Physically stored result — serves reports instantly until the next refresh.
          </p>
          <SqlBlock
            title="materialized_view.sql"
            maxHeight={180}
            sql={`CREATE MATERIALIZED VIEW mv_daily_traffic_summary AS
SELECT
    r.road_name,
    r.area,
    DATE(t.timestamp) AS traffic_date,
    SUM(t.vehicle_count) AS total_vehicles,
    ROUND(AVG(t.average_speed),1) AS avg_speed
FROM road r
JOIN road_segment rs ON r.road_id = rs.road_id
JOIN sensor s        ON rs.segment_id = s.segment_id
JOIN traffic_observation t ON s.sensor_id = t.sensor_id
GROUP BY r.road_name, r.area, DATE(t.timestamp);

CREATE UNIQUE INDEX idx_mv_daily
ON mv_daily_traffic_summary(road_name, traffic_date);`}
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-[#64748b]">
              <Clock className="h-3.5 w-3.5 text-[#1f7a4d]" />
              Last refresh:{" "}
              <span className="font-semibold text-[#17365D]">{mvRefreshedAt}</span>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
              className="bg-[#17365D] text-white hover:bg-[#17365D]/90"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              {refreshing ? "Refreshing…" : "Refresh Materialized View"}
            </Button>
          </div>
        </div>
      </div>

      {/* Performance comparison */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#4472C4]" />
            <SectionLabel>Query Performance</SectionLabel>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cmpData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} width={150} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F5F9FD" }} />
              <Bar dataKey="standard" name="View (recomputed)" fill="#C0392B" radius={[0, 4, 4, 0]} barSize={28} />
              <Bar dataKey="materialized" name="Materialized View" fill="#4472C4" radius={[0, 4, 4, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-[#64748b]">View (recomputed)</div>
            <div className="mt-1 text-2xl font-bold text-[#C0392B]">580 <span className="text-sm text-[#64748b]">ms</span></div>
          </div>
          <div className="rounded-xl border border-[#4472C4]/30 bg-[#F5F9FD] p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-[#4472C4]">Materialized</div>
            <div className="mt-1 text-2xl font-bold text-[#17365D]">72 <span className="text-sm text-[#64748b]">ms</span></div>
            <div className="mt-1 text-[11px] text-[#1f7a4d]">8.1× faster</div>
          </div>
        </div>
      </div>

      {/* Materialized view contents preview */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-[#4472C4]" />
          <SectionLabel>SELECT * FROM mv_daily_traffic_summary</SectionLabel>
        </div>
        <MaterializedPreview />
      </div>
    </div>
  );
}

function MaterializedPreview() {
  const rows = React.useMemo(() => {
    // lightweight derived preview
    return [
      { road_name: "OMR (Old Mahabalipuram Road)", area: "Sholinganallur", traffic_date: "2026-09-03", total_vehicles: 84230, avg_speed: 22.4 },
      { road_name: "Anna Salai", area: "Anna Salai", traffic_date: "2026-09-03", total_vehicles: 78610, avg_speed: 19.8 },
      { road_name: "GST Road", area: "Chromepet", traffic_date: "2026-09-03", total_vehicles: 71240, avg_speed: 24.1 },
      { road_name: "ECR (East Coast Road)", area: "Neelangarai", traffic_date: "2026-09-03", total_vehicles: 54320, avg_speed: 38.6 },
      { road_name: "Poonamallee High Road", area: "Kilpauk", traffic_date: "2026-09-03", total_vehicles: 61870, avg_speed: 26.3 },
      { road_name: "Velachery Main Road", area: "Velachery", traffic_date: "2026-09-03", total_vehicles: 44120, avg_speed: 28.9 },
    ];
  }, []);
  return (
    <DataTable
      columns={[
        { key: "road_name", header: "Road" },
        { key: "area", header: "Area" },
        { key: "traffic_date", header: "Date" },
        { key: "total_vehicles", header: "Total Vehicles", align: "right" as const, render: (r: any) => r.total_vehicles.toLocaleString() },
        { key: "avg_speed", header: "Avg Speed", align: "right" as const, render: (r: any) => `${r.avg_speed} km/h` },
      ]}
      rows={rows as any[]}
      maxHeight={260}
    />
  );
}
