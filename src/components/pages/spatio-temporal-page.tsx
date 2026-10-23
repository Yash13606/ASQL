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
} from "recharts";
import { MapPin, Clock, Calendar, Navigation, Activity, HelpCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  getSensorsForRoad,
  getSensorTimeseries,
  getObservationAt,
  getDates,
} from "@/lib/database/queries";
import { PageHeader, SectionLabel, ChartCard, CongestionPill } from "@/components/shared/ui";
import { SqlBlock } from "@/components/shared/sql-block";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(23,54,93,0.08)",
};

// Schematic road network — fixed coordinates for major roads
interface SchematicRoad {
  name: string;
  short: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lx: number;
  ly: number;
}

const SCHEMATIC_ROADS: SchematicRoad[] = [
  { name: "OMR (Old Mahabalipuram Road)", short: "OMR", x1: 70, y1: 370, x2: 700, y2: 70, lx: 560, ly: 100 },
  { name: "Anna Salai", short: "Anna Salai", x1: 120, y1: 50, x2: 200, y2: 390, lx: 130, ly: 30 },
  { name: "GST Road", short: "GST Road", x1: 360, y1: 390, x2: 710, y2: 310, lx: 540, ly: 330 },
  { name: "ECR (East Coast Road)", short: "ECR", x1: 60, y1: 210, x2: 660, y2: 40, lx: 300, ly: 150 },
  { name: "Poonamallee High Road", short: "PHR", x1: 40, y1: 110, x2: 540, y2: 130, lx: 60, ly: 95 },
  { name: "Velachery Main Road", short: "Velachery", x1: 300, y1: 220, x2: 540, y2: 390, lx: 430, ly: 370 },
];

function statusColor(status: string) {
  if (status === "High") return "#C0392B";
  if (status === "Moderate") return "#E8B44D";
  return "#5fb571";
}

export function SpatioTemporalPage() {
  const { spatio, setSpatio } = useAppStore();
  const dates = React.useMemo(() => getDates(), []);

  const sensors = React.useMemo(
    () => getSensorsForRoad(spatio.roadName),
    [spatio.roadName]
  );

  const schematic = SCHEMATIC_ROADS.find((r) => r.name === spatio.roadName) ?? SCHEMATIC_ROADS[0];

  // position sensors along the selected road line
  const sensorPositions = React.useMemo(() => {
    const n = sensors.length;
    if (n === 0) return [];
    return sensors.map((s, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = schematic.x1 + (schematic.x2 - schematic.x1) * t;
      const y = schematic.y1 + (schematic.y2 - schematic.y1) * t;
      return { sensor: s, x, y };
    });
  }, [sensors, schematic]);

  const selectedSensor = React.useMemo(
    () => sensors.find((s) => s.sensor_code === spatio.sensorCode) ?? sensors[0],
    [sensors, spatio.sensorCode]
  );

  const midHour = Math.floor((spatio.hourStart + spatio.hourEnd) / 2);
  const obs = React.useMemo(
    () => (selectedSensor ? getObservationAt(selectedSensor.sensor_id, spatio.date, midHour) : undefined),
    [selectedSensor, spatio.date, midHour]
  );

  const timeseries = React.useMemo(
    () => (selectedSensor ? getSensorTimeseries(selectedSensor.sensor_id, spatio.date) : []),
    [selectedSensor, spatio.date]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Spatio-Temporal"
        title="Spatio-Temporal Analysis"
        subtitle="Combining location (WHERE) and time (WHEN) for traffic intelligence"
      />

      {/* Spatial / Temporal explanation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-[#4472C4]/30 bg-[#F5F9FD] p-5 shadow-sm">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17365D] text-white">
            <Navigation className="h-6 w-6" />
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#4472C4]">
              Spatial = WHERE
            </div>
            <p className="mt-0.5 text-sm text-[#334155]">
              The geographic location of traffic — which road, segment and sensor recorded it.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#4472C4]/30 bg-[#F5F9FD] p-5 shadow-sm">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4472C4] text-white">
            <Clock className="h-6 w-6" />
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#4472C4]">
              Temporal = WHEN
            </div>
            <p className="mt-0.5 text-sm text-[#334155]">
              The time dimension — the hour, day and peak window in which traffic occurred.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FilterField label="Location (Road)" icon={<MapPin className="h-3.5 w-3.5" />}>
            <Select value={spatio.roadName} onValueChange={(v) => setSpatio({ roadName: v, sensorCode: null })}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCHEMATIC_ROADS.map((r) => (
                  <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Time Window" icon={<Clock className="h-3.5 w-3.5" />}>
            <Select
              value={`${spatio.hourStart}-${spatio.hourEnd}`}
              onValueChange={(v) => {
                const [s, e] = v.split("-").map(Number);
                setSpatio({ hourStart: s, hourEnd: e });
              }}
            >
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="8-10">08:00–10:00 (Morning Peak)</SelectItem>
                <SelectItem value="10-17">10:00–17:00 (Off-peak)</SelectItem>
                <SelectItem value="17-20">17:00–20:00 (Evening Peak)</SelectItem>
                <SelectItem value="20-24">20:00–24:00 (Night)</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Date" icon={<Calendar className="h-3.5 w-3.5" />}>
            <Select value={spatio.date} onValueChange={(v) => setSpatio({ date: v })}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {dates.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Schematic map */}
        <ChartCard
          title="Schematic Road Network"
          subtitle={`Click a sensor on ${schematic.short} to inspect observations`}
          bodyClassName="px-4 pb-4"
        >
          <div className="rounded-lg border border-[#e2e8f0] bg-[#F5F9FD] p-2">
            <svg viewBox="0 0 760 430" className="w-full" style={{ maxHeight: 380 }}>
              {/* faint city grid */}
              <g stroke="#dbe6f3" strokeWidth={1}>
                {[80, 160, 240, 320, 400].map((y) => (
                  <line key={`h${y}`} x1={0} y1={y} x2={760} y2={y} />
                ))}
                {[100, 220, 340, 460, 580, 680].map((x) => (
                  <line key={`v${x}`} x1={x} y1={0} x2={x} y2={430} />
                ))}
              </g>

              {/* context roads (faint) */}
              {SCHEMATIC_ROADS.filter((r) => r.name !== spatio.roadName).map((r) => (
                <g key={r.name}>
                  <line
                    x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                    stroke="#B8CCE4" strokeWidth={4} strokeLinecap="round" opacity={0.5}
                  />
                  <text x={r.lx} y={r.ly} fontSize={10} fill="#94a3b8" fontWeight={600}>{r.short}</text>
                </g>
              ))}

              {/* selected road (bold) */}
              <line
                x1={schematic.x1} y1={schematic.y1} x2={schematic.x2} y2={schematic.y2}
                stroke="#4472C4" strokeWidth={6} strokeLinecap="round"
              />
              <text x={schematic.lx} y={schematic.ly} fontSize={12} fill="#17365D" fontWeight={700}>{schematic.short}</text>

              {/* sensors */}
              {sensorPositions.map(({ sensor, x, y }) => {
                const isActive = selectedSensor?.sensor_code === sensor.sensor_code;
                const color = statusColor(sensor.status);
                return (
                  <g
                    key={sensor.sensor_code}
                    className="cursor-pointer"
                    onClick={() => setSpatio({ sensorCode: sensor.sensor_code })}
                  >
                    {isActive && (
                      <circle cx={x} cy={y} r={11} fill={color} opacity={0.25} />
                    )}
                    <circle
                      cx={x} cy={y} r={isActive ? 7 : 5}
                      fill={color}
                      stroke="#ffffff" strokeWidth={isActive ? 2.5 : 1.5}
                    />
                    <text x={x} y={y - 11} fontSize={8.5} fill="#17365D" fontWeight={700} textAnchor="middle">
                      {sensor.sensor_code}
                    </text>
                  </g>
                );
              })}

              {/* compass */}
              <g transform="translate(710, 400)">
                <circle cx={0} cy={0} r={18} fill="white" stroke="#dbe6f3" />
                <text x={0} y={-4} fontSize={8} fill="#4472C4" textAnchor="middle" fontWeight={700}>N</text>
                <line x1={0} y1={0} x2={0} y2={-9} stroke="#4472C4" strokeWidth={1.5} />
              </g>
            </svg>
          </div>

          {/* legend */}
          <div className="mt-3 flex items-center gap-4 px-2">
            <LegendDot color="#5fb571" label="Normal" />
            <LegendDot color="#E8B44D" label="Moderate" />
            <LegendDot color="#C0392B" label="High" />
            <span className="ml-auto text-[11px] text-[#94a3b8]">
              {sensors.length} sensors on this road
            </span>
          </div>
        </ChartCard>

        {/* Sensor detail */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#4472C4]" />
              <SectionLabel>Sensor Observation</SectionLabel>
            </div>
            {selectedSensor && obs ? (
              <div className="space-y-3">
                <DetailRow label="Road" value={spatio.roadName} />
                <DetailRow label="Sensor" value={selectedSensor.sensor_code} mono />
                <DetailRow label="Time" value={`${spatio.date} ${String(midHour).padStart(2, "0")}:30`} mono />
                <DetailRow label="Vehicle Count" value={obs.vehicle_count.toLocaleString()} />
                <DetailRow label="Average Speed" value={`${obs.average_speed} km/h`} />
                <div className="flex items-center justify-between border-t border-[#eef2f7] pt-3">
                  <span className="text-[12px] text-[#64748b]">Congestion</span>
                  <CongestionPill level={obs.congestion_level} />
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-[#94a3b8]">
                Click a sensor on the schematic to view its observation.
              </p>
            )}
          </div>

          {/* time series */}
          <ChartCard title="Sensor Time-Series" subtitle={`Vehicle count across ${spatio.date}`}>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={timeseries} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#64748b" }} interval={3} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="vehicles" stroke="#4472C4" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Explanation + query */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-[#dbe6f3] bg-[#F5F9FD] p-5 shadow-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4472C4] text-white">
            <HelpCircle className="h-4 w-4" />
          </span>
          <div>
            <SectionLabel className="mb-1">Why Spatio-Temporal?</SectionLabel>
            <p className="text-[13px] leading-relaxed text-[#334155]">
              Spatio-temporal analysis combines location-based and time-based traffic
              information. It answers questions such as{" "}
              <span className="font-semibold text-[#17365D]">
                “Which road experienced the highest congestion between 8 AM and 10 AM?”
              </span>{" "}
              by filtering both the spatial dimension (road/sensor) and the temporal
              dimension (timestamp) in a single query.
            </p>
          </div>
        </div>
        <SqlBlock
          title="spatio_temporal.sql"
          maxHeight={170}
          sql={`SELECT r.road_name,
       s.sensor_code,
       t.timestamp,
       t.vehicle_count,
       t.average_speed,
       t.congestion_level
FROM road r
JOIN road_segment rs        ON r.road_id = rs.road_id
JOIN sensor s               ON rs.segment_id = s.segment_id
JOIN traffic_observation t  ON s.sensor_id = t.sensor_id
WHERE r.road_name = '${spatio.roadName}'
  AND t.date = '${spatio.date}'
  AND EXTRACT(HOUR FROM t.timestamp)
      BETWEEN ${spatio.hourStart} AND ${spatio.hourEnd - 1}
ORDER BY t.timestamp;`}
        />
      </div>
    </div>
  );
}

function FilterField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[#475569]">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#64748b]">{label}</span>
      <span className={cn("text-[13px] font-semibold text-[#17365D]", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
