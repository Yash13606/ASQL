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
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";
import { Filter, RotateCcw, Lightbulb, Code2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  trafficByRoad,
  trafficByHour,
  congestionDistribution,
  getRoadNames,
  getAreas,
  getDates,
} from "@/lib/database/queries";
import type { VehicleType } from "@/lib/database/types";
import { PageHeader, SectionLabel, ChartCard, FeatureBadge } from "@/components/shared/ui";
import { SqlBlock } from "@/components/shared/sql-block";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(23,54,93,0.08)",
};

const VEHICLE_OPTIONS: (VehicleType | "All")[] = ["All", "Car", "Bike", "Bus", "Truck", "Auto"];

export function TrafficAnalysisPage() {
  const { filters, setFilter, resetFilters } = useAppStore();
  // local applied state so "Apply Filters" is explicit
  const [applied, setApplied] = React.useState(filters);

  const roadNames = React.useMemo(() => getRoadNames().slice(0, 40), []);
  const areas = React.useMemo(() => getAreas(), []);
  const dates = React.useMemo(() => getDates(), []);

  const byRoad = React.useMemo(() => trafficByRoad(applied), [applied]);
  const byHour = React.useMemo(() => trafficByHour(applied), [applied]);
  const congestion = React.useMemo(() => congestionDistribution(applied), [applied]);

  const insight = React.useMemo(() => {
    if (byRoad.length === 0) return "No observations match the current filters.";
    const top = byRoad[0];
    const range = `${String(applied.hourStart).padStart(2, "0")}:00–${String(applied.hourEnd).padStart(2, "0")}:00`;
    return `${top.road} records the highest traffic volume (${top.vehicles.toLocaleString()} vehicles) during the ${range} period${applied.date ? ` on ${applied.date}` : ""}.`;
  }, [byRoad, applied]);

  const hourLabel = `${String(applied.hourStart).padStart(2, "0")}:00–${String(applied.hourEnd).padStart(2, "0")}:00`;

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Analytics"
        title="Traffic Pattern Analysis"
        subtitle="Multi-table JOINs, GROUP BY and HAVING over filtered traffic observations"
      />

      {/* Filters */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#4472C4]" />
          <SectionLabel>Query Filters</SectionLabel>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterField label="Road">
            <Select value={filters.road} onValueChange={(v) => setFilter("road", v)}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Roads">All Roads</SelectItem>
                {roadNames.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Area">
            <Select value={filters.area} onValueChange={(v) => setFilter("area", v)}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Areas">All Areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Date">
            <Select value={filters.date} onValueChange={(v) => setFilter("date", v)}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {dates.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Time Range">
            <Select
              value={`${filters.hourStart}-${filters.hourEnd}`}
              onValueChange={(v) => {
                const [s, e] = v.split("-").map(Number);
                setFilter("hourStart", s);
                setFilter("hourEnd", e);
              }}
            >
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0-24">All Day</SelectItem>
                <SelectItem value="8-10">08:00–10:00 (Morning Peak)</SelectItem>
                <SelectItem value="10-17">10:00–17:00 (Off-peak)</SelectItem>
                <SelectItem value="17-20">17:00–20:00 (Evening Peak)</SelectItem>
                <SelectItem value="20-24">20:00–24:00 (Night)</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Vehicle Type">
            <Select
              value={filters.vehicleType}
              onValueChange={(v) => setFilter("vehicleType", v as VehicleType | "All")}
            >
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {VEHICLE_OPTIONS.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            onClick={() => setApplied({ ...filters })}
            className="bg-[#4472C4] text-white hover:bg-[#3a5fb0]"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              resetFilters();
              setApplied({
                road: "All Roads",
                area: "All Areas",
                date: "2026-09-03",
                hourStart: 8,
                hourEnd: 10,
                vehicleType: "All",
              });
            }}
            className="border-[#e2e8f0] text-[#475569] hover:bg-[#F5F9FD]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <span className="ml-auto text-[11px] text-[#94a3b8]">
            Filtered window: {applied.date} · {hourLabel}
          </span>
        </div>
      </div>

      {/* Insight */}
      <div className="flex items-start gap-3 rounded-xl border border-[#dbe6f3] bg-[#F5F9FD] p-4 shadow-sm">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4472C4] text-white">
          <Lightbulb className="h-4 w-4" />
        </span>
        <div>
          <SectionLabel className="mb-1">Analytical Insight</SectionLabel>
          <p className="text-[13px] leading-relaxed text-[#334155]">{insight}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Traffic Volume by Road" subtitle="SUM(vehicle_count) per road — top 10">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byRoad} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis type="category" dataKey="road" tick={{ fontSize: 9, fill: "#64748b" }} width={120} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F5F9FD" }} />
              <Bar dataKey="vehicles" radius={[0, 4, 4, 0]}>
                {byRoad.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#17365D" : "#4472C4"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Speed by Road" subtitle="AVG(average_speed) km/h — top 10">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byRoad} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
              <XAxis type="number" domain={[0, 70]} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis type="category" dataKey="road" tick={{ fontSize: 9, fill: "#64748b" }} width={120} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F5F9FD" }} />
              <Bar dataKey="avgSpeed" radius={[0, 4, 4, 0]}>
                {byRoad.map((r) => (
                  <Cell key={r.road} fill={r.avgSpeed < 25 ? "#C0392B" : r.avgSpeed < 38 ? "#E8B44D" : "#5fb571"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Congestion Distribution" subtitle="COUNT(*) GROUP BY congestion_level">
          <div className="flex items-center gap-4 px-4">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={congestion}
                  dataKey="count"
                  nameKey="level"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {congestion.map((c) => (
                    <Cell
                      key={c.level}
                      fill={c.level === "HIGH" ? "#C0392B" : c.level === "MEDIUM" ? "#E8B44D" : "#5fb571"}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {congestion.map((c) => (
                <div key={c.level} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] text-[#334155]">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{
                        background: c.level === "HIGH" ? "#C0392B" : c.level === "MEDIUM" ? "#E8B44D" : "#5fb571",
                      }}
                    />
                    {c.level}
                  </span>
                  <span className="text-[13px] font-bold tabular-nums text-[#17365D]">
                    {c.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Traffic by Hour" subtitle="Hourly vehicle count for filtered window">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={byHour} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#64748b" }} interval={2} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="vehicles" stroke="#4472C4" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="avgSpeed" stroke="#17365D" strokeWidth={1.5} strokeDasharray="4 3" dot={false} yAxisId={0} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* SQL operations used */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Code2 className="h-4 w-4 text-[#4472C4]" />
          <SectionLabel>SQL Operations Used</SectionLabel>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["JOIN (4 tables)", "GROUP BY", "HAVING", "AVG()", "SUM()", "COUNT()", "ORDER BY", "WHERE (filters)"].map((op) => (
            <FeatureBadge key={op}>{op}</FeatureBadge>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SqlBlock
            title="filtered_aggregation.sql"
            maxHeight={220}
            sql={`SELECT r.road_name,
       SUM(t.vehicle_count) AS vehicles,
       ROUND(AVG(t.average_speed),1) AS avg_speed
FROM road r
JOIN road_segment rs ON r.road_id = rs.road_id
JOIN sensor s        ON rs.segment_id = s.segment_id
JOIN traffic_observation t
                     ON s.sensor_id = t.sensor_id
WHERE t.date = '${applied.date}'
  AND t.hour BETWEEN ${applied.hourStart} AND ${applied.hourEnd - 1}
  ${applied.road !== "All Roads" ? `AND r.road_name = '${applied.road}'` : "-- (road filter off)"}
  ${applied.area !== "All Areas" ? `AND r.area = '${applied.area}'` : "-- (area filter off)"}
GROUP BY r.road_name
ORDER BY vehicles DESC
LIMIT 10;`}
          />
          <SqlBlock
            title="congestion_breakdown.sql"
            maxHeight={220}
            sql={`SELECT t.congestion_level,
       COUNT(*)                        AS observations,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM traffic_observation t
JOIN sensor s ON t.sensor_id = s.sensor_id
JOIN road_segment rs ON s.segment_id = rs.segment_id
JOIN road r ON rs.road_id = r.road_id
WHERE t.date = '${applied.date}'
GROUP BY t.congestion_level
ORDER BY observations DESC;`}
          />
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
        {label}
      </label>
      {children}
    </div>
  );
}
