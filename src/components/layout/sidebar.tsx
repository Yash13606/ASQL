"use client";

import * as React from "react";
import {
  LayoutDashboard,
  BarChart3,
  Map,
  Database,
  TerminalSquare,
  Gauge,
  Eye,
  Workflow,
  FileText,
  Database as DbIcon,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type PageId } from "@/lib/store";
import { getDbStatus } from "@/lib/database/queries";

const NAV: { id: PageId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "traffic", label: "Traffic Analysis", icon: BarChart3 },
  { id: "spatio", label: "Spatio-Temporal", icon: Map },
  { id: "explorer", label: "Database Explorer", icon: Database },
  { id: "sqllab", label: "SQL Query Lab", icon: TerminalSquare },
  { id: "optimization", label: "Query Optimization", icon: Gauge },
  { id: "views", label: "Views", icon: Eye },
  { id: "dataflow", label: "Data Flow", icon: Workflow },
  { id: "reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  const page = useAppStore((s) => s.page);
  const setPage = useAppStore((s) => s.setPage);
  const status = React.useMemo(() => getDbStatus(), []);

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-[#e2e8f0] bg-[#F5F9FD]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#e2e8f0]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17365D] text-white shadow-sm">
          <Database className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold text-[#17365D]">Urban Mobility DB</div>
          <div className="text-[11px] text-[#64748b]">Traffic Pattern Analysis</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scroll-thin px-3 py-4">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
          Navigation
        </div>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = page === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setPage(item.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-[#4472C4] text-white shadow-sm"
                      : "text-[#334155] hover:bg-[#EAF2F8] hover:text-[#17365D]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      active ? "text-white" : "text-[#4472C4]"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Database status */}
      <div className="border-t border-[#e2e8f0] p-4">
        <div className="rounded-xl border border-[#dbe6f3] bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
              Database Status
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1f7a4d]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5fb571] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5fb571]" />
              </span>
              Connected
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <DbIcon className="h-3.5 w-3.5 text-[#4472C4]" />
            <span className="font-mono text-[13px] font-semibold text-[#17365D]">
              {status.name}
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <StatusItem icon={<Database className="h-3 w-3" />} label="Tables" value={status.tables} />
            <StatusItem icon={<Zap className="h-3 w-3" />} label="Indexes" value={status.indexes} />
            <StatusItem icon={<Eye className="h-3 w-3" />} label="Views" value={status.views} />
            <StatusItem
              icon={<CheckCircle2 className="h-3 w-3" />}
              label="Mat. Views"
              value={status.materializedViews}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatusItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-[#F5F9FD] px-2 py-1.5">
      <span className="text-[#4472C4]">{icon}</span>
      <span className="text-[10px] text-[#64748b]">{label}</span>
      <span className="ml-auto text-[11px] font-bold text-[#17365D]">{value}</span>
    </div>
  );
}
