"use client";

import * as React from "react";
import { Key, Link2, ShieldCheck, GitBranch, Database, Table2 } from "lucide-react";
import { DB_SCHEMA, SCHEMA_RELATIONS } from "@/lib/database/schema";
import { PageHeader, SectionLabel } from "@/components/shared/ui";
import { cn } from "@/lib/utils";

const REL_ENDPOINTS: Record<string, { from: { x: number; y: number }; to: { x: number; y: number } }> = {
  "road|road_segment": { from: { x: 10, y: 18 }, to: { x: 10, y: 78 } },
  "road_segment|sensor": { from: { x: 10, y: 78 }, to: { x: 50, y: 18 } },
  "sensor|traffic_observation": { from: { x: 50, y: 18 }, to: { x: 90, y: 18 } },
  "vehicle|trip": { from: { x: 50, y: 78 }, to: { x: 90, y: 78 } },
};

export function DatabaseExplorerPage() {
  const canvasRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Relational Schema"
        title="Database Explorer"
        subtitle="Six normalized tables connected by primary / foreign key relationships"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* ER diagram canvas */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-[#e2e8f0] bg-[#F5F9FD] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[#4472C4]" />
                <span className="text-sm font-semibold text-[#17365D]">
                  Entity-Relationship Diagram
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#64748b]">
                <Legend swatch="bg-[#17365D]" label="PK" />
                <Legend swatch="bg-[#4472C4]" label="FK" />
                <Legend swatch="bg-[#cbd5e1]" label="Attribute" />
              </div>
            </div>

            <div
              ref={canvasRef}
              className="relative w-full"
              style={{ height: 460 }}
            >
              {/* Relationship lines (behind cards) */}
              <svg
                className="absolute inset-0 z-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {SCHEMA_RELATIONS.map((rel) => {
                  const key = `${rel.from}|${rel.to}`;
                  const ep = REL_ENDPOINTS[key];
                  if (!ep) return null;
                  const mx = (ep.from.x + ep.to.x) / 2;
                  const my = (ep.from.y + ep.to.y) / 2;
                  return (
                    <g key={key}>
                      <path
                        d={`M ${ep.from.x} ${ep.from.y} C ${ep.from.x} ${my}, ${ep.to.x} ${my}, ${ep.to.x} ${ep.to.y}`}
                        fill="none"
                        stroke="#4472C4"
                        strokeWidth={0.5}
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray="0"
                        opacity={0.55}
                      />
                      <circle cx={ep.from.x} cy={ep.from.y} r={0.8} fill="#17365D" vectorEffect="non-scaling-stroke" />
                      <circle cx={ep.to.x} cy={ep.to.y} r={0.8} fill="#4472C4" vectorEffect="non-scaling-stroke" />
                    </g>
                  );
                })}
              </svg>

              {/* Table cards */}
              {DB_SCHEMA.tables.map((t) => (
                <TableCard key={t.name} table={t} />
              ))}

              {/* Cardinality labels */}
              {SCHEMA_RELATIONS.map((rel) => {
                const key = `${rel.from}|${rel.to}`;
                const ep = REL_ENDPOINTS[key];
                if (!ep) return null;
                const midX = (ep.from.x + ep.to.x) / 2;
                const midY = (ep.from.y + ep.to.y) / 2;
                return (
                  <div
                    key={key}
                    className="pointer-events-none absolute z-20 flex -translate-x-1/2 -translate-y-1/2 gap-1.5"
                    style={{ left: `${midX}%`, top: `${midY}%` }}
                  >
                    <span className="rounded bg-[#17365D] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">1</span>
                    <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-[#4472C4] shadow-sm border border-[#dbe6f3]">{rel.label}</span>
                    <span className="rounded bg-[#4472C4] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">N</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Database design panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <SectionLabel className="mb-3">Database Design</SectionLabel>
            <ul className="space-y-3">
              <DesignItem icon={<Key className="h-3.5 w-3.5" />} title="Primary Keys" desc="Surrogate integer keys per table" />
              <DesignItem icon={<Link2 className="h-3.5 w-3.5" />} title="Foreign Keys" desc="4 FK relationships enforce joins" />
              <DesignItem icon={<ShieldCheck className="h-3.5 w-3.5" />} title="Constraints" desc="NOT NULL, UNIQUE, CHECK" />
              <DesignItem icon={<GitBranch className="h-3.5 w-3.5" />} title="Referential Integrity" desc="ON DELETE cascade rules" />
              <DesignItem icon={<Table2 className="h-3.5 w-3.5" />} title="Normalization" desc="3NF — no transitive deps" />
            </ul>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <SectionLabel className="mb-3">Table Statistics</SectionLabel>
            <div className="space-y-2">
              {DB_SCHEMA.tables.map((t) => (
                <div key={t.name} className="flex items-center justify-between text-[13px]">
                  <span className="font-mono text-[#17365D]">{t.label}</span>
                  <span className="tabular-nums text-[#64748b]">
                    {t.rowCount.toLocaleString()} rows
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableCard({ table }: { table: (typeof DB_SCHEMA.tables)[number] }) {
  return (
    <div
      className="absolute z-10 w-[230px] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${table.x}%`, top: `${table.y}%` }}
    >
      <div className="overflow-hidden rounded-lg border border-[#4472C4]/30 bg-white shadow-md">
        <div className="flex items-center justify-between bg-[#17365D] px-3 py-2">
          <span className="font-mono text-[12px] font-bold tracking-wide text-white">
            {table.label}
          </span>
          <span className="rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold text-white">
            {table.rowCount > 999999
              ? `${(table.rowCount / 1000000).toFixed(1)}M`
              : table.rowCount > 999
              ? `${(table.rowCount / 1000).toFixed(0)}K`
              : table.rowCount}
          </span>
        </div>
        <div className="divide-y divide-[#eef2f7]">
          {table.columns.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between px-3 py-1.5"
            >
              <div className="flex items-center gap-1.5">
                {c.key === "PK" && (
                  <span className="rounded bg-[#17365D] px-1 text-[8px] font-bold text-white">
                    PK
                  </span>
                )}
                {c.key === "FK" && (
                  <span className="rounded bg-[#4472C4] px-1 text-[8px] font-bold text-white">
                    FK
                  </span>
                )}
                {!c.key && (
                  <span className="h-1 w-1 rounded-full bg-[#cbd5e1]" />
                )}
                <span className="font-mono text-[11px] text-[#334155]">
                  {c.name}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#94a3b8]">{c.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={cn("h-2.5 w-2.5 rounded-sm", swatch)} />
      {label}
    </span>
  );
}

function DesignItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#EAF2F8] text-[#4472C4]">
        {icon}
      </span>
      <div>
        <div className="text-[13px] font-semibold text-[#17365D]">{title}</div>
        <div className="text-[11px] text-[#64748b]">{desc}</div>
      </div>
    </li>
  );
}
