"use client";

import * as React from "react";
import {
  Database,
  Sparkles,
  Table2,
  Link2,
  UploadCloud,
  Layers3,
  TerminalSquare,
  Map,
  FileText,
  ChevronDown,
  Boxes,
} from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/shared/ui";

interface FlowStage {
  num: number;
  title: string;
  desc: string;
  icon: React.ElementType;
  tag: string;
}

const STAGES: FlowStage[] = [
  { num: 1, title: "Traffic / Mobility Dataset", desc: "Raw urban traffic observations, road networks, vehicle & trip records.", icon: Database, tag: "Source Data" },
  { num: 2, title: "Data Cleaning & Preparation", desc: "Null handling, type coercion, deduplication and timestamp normalization.", icon: Sparkles, tag: "ETL" },
  { num: 3, title: "Relational Database Design", desc: "Entity identification, normalization to 3NF, attribute assignment.", icon: Boxes, tag: "Design" },
  { num: 4, title: "Tables + Constraints + Relationships", desc: "6 tables, primary keys, foreign keys, UNIQUE / CHECK / NOT NULL.", icon: Table2, tag: "Schema" },
  { num: 5, title: "Data Loading", desc: "Bulk INSERT of 2.4M observations, 342 sensors, 10K trips.", icon: UploadCloud, tag: "Load" },
  { num: 6, title: "Indexes + Views + Materialized Views", desc: "Composite indexes, summary views and refreshed materialized views.", icon: Layers3, tag: "Optimize" },
  { num: 7, title: "Advanced SQL Queries", desc: "JOINs, subqueries, CTEs, window functions, GROUP BY / HAVING.", icon: TerminalSquare, tag: "Query" },
  { num: 8, title: "Spatio-Temporal Traffic Analysis", desc: "Location × time intersection to pinpoint congestion hotspots.", icon: Map, tag: "Analyze" },
  { num: 9, title: "Reports & Traffic Insights", desc: "Generated performance reports and actionable traffic intelligence.", icon: FileText, tag: "Report" },
];

export function DataFlowPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Architecture"
        title="Data Flow"
        subtitle="End-to-end database architecture — from raw mobility data to traffic insights"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Flow diagram */}
        <div className="rounded-xl border border-[#e2e8f0] bg-[#F5F9FD] p-6 shadow-sm">
          <div className="mx-auto flex max-w-[640px] flex-col items-center">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const isLast = i === STAGES.length - 1;
              return (
                <React.Fragment key={s.num}>
                  <div className="flex w-full items-center gap-4">
                    {/* stage number */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17365D] text-sm font-bold text-white shadow-sm">
                      {s.num}
                    </div>
                    {/* card */}
                    <div className="flex flex-1 items-center gap-4 rounded-xl border border-[#dbe6f3] bg-white p-4 shadow-sm">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF2F8] text-[#4472C4]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-bold text-[#17365D]">{s.title}</h3>
                          <span className="rounded bg-[#EAF2F8] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#4472C4]">
                            {s.tag}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12px] text-[#64748b]">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                  {!isLast && (
                    <div className="flex h-7 items-center text-[#4472C4]">
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <SectionLabel className="mb-3">Pipeline Summary</SectionLabel>
            <ul className="space-y-3 text-[13px]">
              <SummaryRow icon={<Database className="h-3.5 w-3.5" />} label="Source tables" value="6" />
              <SummaryRow icon={<Table2 className="h-3.5 w-3.5" />} label="Records loaded" value="2.4M" />
              <SummaryRow icon={<Link2 className="h-3.5 w-3.5" />} label="Relationships" value="4 FK" />
              <SummaryRow icon={<Layers3 className="h-3.5 w-3.5" />} label="Indexes / views" value="8 / 6" />
              <SummaryRow icon={<TerminalSquare className="h-3.5 w-3.5" />} label="Canned queries" value="6" />
            </ul>
          </div>

          <div className="rounded-xl border border-[#dbe6f3] bg-[#F5F9FD] p-5 shadow-sm">
            <SectionLabel className="mb-2">Design Principle</SectionLabel>
            <p className="text-[12.5px] leading-relaxed text-[#334155]">
              Each stage feeds the next: raw data is normalized into relational
              tables, augmented with indexes and views, then queried with advanced
              SQL to produce spatio-temporal traffic intelligence — a fully
              reproducible database research pipeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[#64748b]">
        <span className="text-[#4472C4]">{icon}</span>
        {label}
      </span>
      <span className="font-bold tabular-nums text-[#17365D]">{value}</span>
    </li>
  );
}
