"use client";

import * as React from "react";
import {
  FileText,
  TrafficCone,
  Clock,
  Route,
  Gauge,
  Download,
  FileBarChart,
  Filter,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getRoadAggregates, getHourlyTotals, getRoadNames, getAreas, getDates } from "@/lib/database/queries";
import { SQL_LIBRARY } from "@/lib/database/sql-library";
import { PageHeader, SectionLabel, DataTable, CongestionPill, type Column } from "@/components/shared/ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type ReportType = "volume" | "congestion" | "peak" | "road-performance" | "query-performance";

interface ReportDef {
  id: ReportType;
  title: string;
  desc: string;
  icon: React.ElementType;
}

const REPORTS: ReportDef[] = [
  { id: "road-performance", title: "Road Performance Report", desc: "Per-road volume, speed, congestion & peak hour", icon: Route },
  { id: "volume", title: "Traffic Volume Report", desc: "Total vehicle counts ranked by road", icon: TrafficCone },
  { id: "congestion", title: "Congestion Report", desc: "High-congestion event distribution", icon: Gauge },
  { id: "peak", title: "Peak Hour Report", desc: "Hourly traffic distribution", icon: Clock },
  { id: "query-performance", title: "Query Performance Report", desc: "Execution timings for canned queries", icon: FileBarChart },
];

export function ReportsPage() {
  const { filters, setFilter } = useAppStore();
  const [selected, setSelected] = React.useState<ReportType>("road-performance");
  const [generated, setGenerated] = React.useState<ReportType | null>(null);
  const [generating, setGenerating] = React.useState(false);

  const roadNames = React.useMemo(() => getRoadNames().slice(0, 40), []);
  const areas = React.useMemo(() => getAreas(), []);
  const dates = React.useMemo(() => getDates(), []);

  const { columns, rows, title } = React.useMemo(() => buildReport(selected, filters), [selected, filters]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerated(selected);
      setGenerating(false);
    }, 500);
  };

  const handleExport = () => {
    if (!generated) return;
    const header = columns.map((c) => c.header).join(",");
    const body = rows.map((r) =>
      columns.map((c) => {
        const v = c.render ? String((c.render(r) as any) ?? "") : String(r[c.key as string] ?? "");
        return `"${v.replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported", { description: `${selected}-report.csv downloaded` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Reports"
        title="Reports"
        subtitle="Generate and export traffic analytics reports from the database"
      />

      {/* Report cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          const isActive = selected === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left shadow-sm transition-all ${
                isActive
                  ? "border-[#4472C4] bg-[#F5F9FD] ring-1 ring-[#4472C4]/20"
                  : "border-[#e2e8f0] bg-white hover:border-[#4472C4]/40 hover:bg-[#F5F9FD]"
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-[#4472C4] text-white" : "bg-[#EAF2F8] text-[#4472C4]"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-[#17365D]">{r.title}</div>
                <div className="mt-0.5 text-[12px] text-[#64748b]">{r.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters + actions */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#4472C4]" />
          <SectionLabel>Report Filters</SectionLabel>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Date">
            <Select value={filters.date} onValueChange={(v) => setFilter("date", v)}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {dates.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Road">
            <Select value={filters.road} onValueChange={(v) => setFilter("road", v)}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Roads">All Roads</SelectItem>
                {roadNames.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Area">
            <Select value={filters.area} onValueChange={(v) => setFilter("area", v)}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Areas">All Areas</SelectItem>
                {areas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Time">
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
                <SelectItem value="17-20">17:00–20:00 (Evening Peak)</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button onClick={handleGenerate} disabled={generating} className="bg-[#4472C4] text-white hover:bg-[#3a5fb0]">
            <FileText className="h-4 w-4" />
            {generating ? "Generating…" : "Generate Report"}
          </Button>
          <Button
            onClick={handleExport}
            disabled={!generated}
            variant="outline"
            className="border-[#e2e8f0] text-[#475569] hover:bg-[#F5F9FD] disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {generated && (
            <span className="ml-auto text-[11px] text-[#94a3b8]">
              {rows.length} records · generated {new Date().toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Generated report */}
      {generated && (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <SectionLabel>Generated Report</SectionLabel>
              <h2 className="mt-1 text-[17px] font-bold text-[#17365D]">{title}</h2>
            </div>
            <span className="rounded bg-[#EAF2F8] px-2.5 py-1 text-[11px] font-semibold text-[#4472C4]">
              {rows.length} rows
            </span>
          </div>
          <DataTable columns={columns as any[]} rows={rows as any[]} maxHeight={460} />
        </div>
      )}
    </div>
  );
}

function buildReport(type: ReportType, filters: ReturnType<typeof useAppStore.getState>["filters"]): {
  columns: Column<any>[];
  rows: any[];
  title: string;
} {
  if (type === "road-performance") {
    const all = getRoadAggregates();
    const rows = all
      .filter((r) => (filters.road === "All Roads" ? true : r.road_name === filters.road))
      .filter((r) => (filters.area === "All Areas" ? true : r.area === filters.area))
      .sort((a, b) => b.total_vehicles - a.total_vehicles)
      .slice(0, 20)
      .map((r) => ({
        road_name: r.road_name,
        total_vehicles: r.total_vehicles,
        avg_speed: r.avg_speed,
        congestion: r.congestion,
        peak_hour: `${String(r.peak_hour).padStart(2, "0")}:30`,
      }));
    return {
      title: "Road Performance Report",
      columns: [
        { key: "road_name", header: "Road" },
        { key: "total_vehicles", header: "Traffic", align: "right" as const, render: (r: any) => r.total_vehicles.toLocaleString() },
        { key: "avg_speed", header: "Avg Speed", align: "right" as const, render: (r: any) => `${r.avg_speed} km/h` },
        { key: "congestion", header: "Congestion", align: "center" as const, render: (r: any) => <CongestionPill level={r.congestion} /> },
        { key: "peak_hour", header: "Peak Hour", align: "center" as const },
      ],
      rows,
    };
  }
  if (type === "volume") {
    const rows = getRoadAggregates()
      .sort((a, b) => b.total_vehicles - a.total_vehicles)
      .slice(0, 20)
      .map((r) => ({
        road_name: r.road_name,
        area: r.area,
        total_vehicles: r.total_vehicles,
        avg_speed: r.avg_speed,
      }));
    return {
      title: "Traffic Volume Report",
      columns: [
        { key: "road_name", header: "Road" },
        { key: "area", header: "Area" },
        { key: "total_vehicles", header: "Total Vehicles", align: "right" as const, render: (r: any) => r.total_vehicles.toLocaleString() },
        { key: "avg_speed", header: "Avg Speed", align: "right" as const, render: (r: any) => `${r.avg_speed} km/h` },
      ],
      rows,
    };
  }
  if (type === "congestion") {
    const rows = getRoadAggregates()
      .filter((r) => r.high_pct > 0)
      .sort((a, b) => b.high_pct - a.high_pct)
      .slice(0, 20)
      .map((r) => ({
        road_name: r.road_name,
        area: r.area,
        high_pct: r.high_pct,
        medium_pct: r.medium_pct,
        low_pct: r.low_pct,
        congestion: r.congestion,
      }));
    return {
      title: "Congestion Report",
      columns: [
        { key: "road_name", header: "Road" },
        { key: "area", header: "Area" },
        { key: "high_pct", header: "High %", align: "right" as const, render: (r: any) => `${r.high_pct}%` },
        { key: "medium_pct", header: "Medium %", align: "right" as const, render: (r: any) => `${r.medium_pct}%` },
        { key: "low_pct", header: "Low %", align: "right" as const, render: (r: any) => `${r.low_pct}%` },
        { key: "congestion", header: "Status", align: "center" as const, render: (r: any) => <CongestionPill level={r.congestion} /> },
      ],
      rows,
    };
  }
  if (type === "peak") {
    const rows = getHourlyTotals().map((h) => ({
      hour: h.hour,
      vehicles: h.vehicles,
      avg_speed: h.avgSpeed,
      band: h.vehicles > 250000 ? "PEAK" : h.vehicles > 120000 ? "MODERATE" : "LOW",
    }));
    return {
      title: "Peak Hour Report",
      columns: [
        { key: "hour", header: "Hour" },
        { key: "vehicles", header: "Vehicles", align: "right" as const, render: (r: any) => r.vehicles.toLocaleString() },
        { key: "avg_speed", header: "Avg Speed", align: "right" as const, render: (r: any) => `${r.avg_speed} km/h` },
        { key: "band", header: "Band", align: "center" as const, render: (r: any) => <CongestionPill level={r.band === "PEAK" ? "HIGH" : r.band === "MODERATE" ? "MEDIUM" : "LOW"} /> },
      ],
      rows,
    };
  }
  // query-performance
  const rows = SQL_LIBRARY.map((q) => {
    const res = q.run(true);
    return {
      query: q.title,
      category: q.category,
      execution_ms: res.executionTimeMs,
      rows_scanned: res.rowsScanned,
      rows_returned: res.rowCount,
    };
  });
  return {
    title: "Query Performance Report",
    columns: [
      { key: "query", header: "Query" },
      { key: "category", header: "Category" },
      { key: "execution_ms", header: "Exec Time (ms)", align: "right" as const },
      { key: "rows_scanned", header: "Rows Scanned", align: "right" as const, render: (r: any) => r.rows_scanned.toLocaleString() },
      { key: "rows_returned", header: "Returned", align: "right" as const },
    ],
    rows,
  };
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
