"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Car,
  Route,
  Cpu,
  Gauge,
  AlertTriangle,
  Presentation,
  TrendingUp,
  Sunrise,
  Sunset,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  getKpis,
  getTopCongestedRoads,
  getVolumeTrend,
  getHourlyTotals,
} from "@/lib/database/queries";
import {
  KpiCard,
  PageHeader,
  SectionLabel,
  ChartCard,
  CongestionPill,
  DataTable,
} from "@/components/shared/ui";
import { Button } from "@/components/ui/button";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(23,54,93,0.08)",
};

export function DashboardPage() {
  const setPresentation = useAppStore((s) => s.setPresentation);
  const setPage = useAppStore((s) => s.setPage);

  const kpis = React.useMemo(() => getKpis(), []);
  const trend = React.useMemo(() => getVolumeTrend(), []);
  const topRoads = React.useMemo(() => getTopCongestedRoads(8), []);
  const hourly = React.useMemo(() => getHourlyTotals(), []);

  const morningPeak = hourly.slice(8, 10);
  const eveningPeak = hourly.slice(17, 20);
  const morningAvg = Math.round(
    morningPeak.reduce((s, h) => s + h.vehicles, 0) / morningPeak.length
  );
  const eveningAvg = Math.round(
    eveningPeak.reduce((s, h) => s + h.vehicles, 0) / eveningPeak.length
  );

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Overview"
        title="Urban Mobility Database"
        subtitle="Advanced SQL powered urban traffic analytics"
        actions={
          <Button
            onClick={() => setPresentation(true)}
            className="bg-[#17365D] text-white hover:bg-[#17365D]/90"
          >
            <Presentation className="h-4 w-4" />
            Presentation Mode
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="Total Traffic Observations"
          value="2.4M"
          hint="7-day rolling window"
          icon={<Car className="h-4 w-4" />}
          accent
        />
        <KpiCard
          label="Roads Monitored"
          value={kpis.roadsMonitored}
          hint={`${kpis.activeSensors} sensors live`}
          icon={<Route className="h-4 w-4" />}
        />
        <KpiCard
          label="Active Sensors"
          value={kpis.activeSensors}
          hint="Streaming hourly"
          icon={<Cpu className="h-4 w-4" />}
        />
        <KpiCard
          label="Average Speed"
          value={kpis.avgSpeed}
          unit="km/h"
          hint="Across network"
          icon={<Gauge className="h-4 w-4" />}
        />
        <KpiCard
          label="Congestion Rate"
          value={kpis.congestionRate}
          unit="%"
          hint="HIGH observations"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Trend + peak hours */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Traffic Volume Trend"
          subtitle="Hourly vehicle count across all sensors (7 days)"
          className="lg:col-span-2"
          action={<TrendingUp className="h-4 w-4 text-[#4472C4]" />}
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4472C4" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4472C4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#64748b" }}
                interval={Math.floor(trend.length / 8)}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#17365D", fontWeight: 600 }} />
              <Area
                type="monotone"
                dataKey="vehicles"
                stroke="#4472C4"
                strokeWidth={2}
                fill="url(#volGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="space-y-4">
          <ChartCard
            title="Peak Traffic Hours"
            subtitle="Bimodal urban pattern"
          >
            <div className="space-y-3 px-3">
              <PeakCard
                icon={<Sunrise className="h-4 w-4" />}
                label="Morning Peak"
                time="08:00 - 10:00"
                volume={morningAvg}
              />
              <PeakCard
                icon={<Sunset className="h-4 w-4" />}
                label="Evening Peak"
                time="17:00 - 20:00"
                volume={eveningAvg}
              />
              <ResponsiveContainer width="100%" height={96}>
                <BarChart data={hourly} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                  <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "#64748b" }} interval={3} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Bar dataKey="vehicles" radius={[2, 2, 0, 0]}>
                    {hourly.map((h, i) => (
                      <Cell
                        key={i}
                        fill={
                          h.hour >= "08:00" && h.hour <= "10:00"
                            ? "#17365D"
                            : h.hour >= "17:00" && h.hour <= "20:00"
                            ? "#4472C4"
                            : "#B8CCE4"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Top congested roads */}
      <ChartCard
        title="Top Congested Roads"
        subtitle="Ranked by total observed vehicle count"
        bodyClassName="px-0"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="text-[#4472C4] hover:bg-[#EAF2F8]"
            onClick={() => setPage("traffic")}
          >
            Analyze →
          </Button>
        }
      >
        <DataTable
          columns={[
            { key: "_rank", header: "Rank", align: "center" as const, render: (r: any) => <span className="font-bold text-[#4472C4]">{r._rank}</span> },
            { key: "road_name", header: "Road" },
            { key: "area", header: "Area" },
            { key: "avg_speed", header: "Avg Speed", align: "right" as const, render: (r: any) => `${r.avg_speed} km/h` },
            { key: "total_vehicles", header: "Traffic Volume", align: "right" as const, render: (r: any) => r.total_vehicles.toLocaleString() },
            { key: "congestion", header: "Congestion", align: "center" as const, render: (r: any) => <CongestionPill level={r.congestion} /> },
          ]}
          rows={topRoads.map((r, i) => ({ ...r, _rank: i + 1 }))}
        />
      </ChartCard>
    </div>
  );
}

function PeakCard({
  icon,
  label,
  time,
  volume,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  volume: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#dbe6f3] bg-[#F5F9FD] px-3 py-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#4472C4]">
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#64748b]">
          {label}
        </div>
        <div className="text-sm font-semibold text-[#17365D]">{time}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[#17365D]">{volume.toLocaleString()}</div>
        <div className="text-[10px] text-[#94a3b8]">avg vol/h</div>
      </div>
    </div>
  );
}
