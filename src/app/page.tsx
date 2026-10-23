"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PresentationMode } from "@/components/layout/presentation-mode";
import { DashboardPage } from "@/components/pages/dashboard-page";
import { TrafficAnalysisPage } from "@/components/pages/traffic-analysis-page";
import { SpatioTemporalPage } from "@/components/pages/spatio-temporal-page";
import { DatabaseExplorerPage } from "@/components/pages/database-explorer-page";
import { SqlQueryLabPage } from "@/components/pages/sql-query-lab-page";
import { QueryOptimizationPage } from "@/components/pages/query-optimization-page";
import { ViewsPage } from "@/components/pages/views-page";
import { DataFlowPage } from "@/components/pages/data-flow-page";
import { ReportsPage } from "@/components/pages/reports-page";
import { useAppStore } from "@/lib/store";
import { Database, Activity, TerminalSquare } from "lucide-react";

const PAGE_META: Record<string, { title: string; crumb: string }> = {
  dashboard: { title: "Dashboard", crumb: "Overview" },
  traffic: { title: "Traffic Analysis", crumb: "Analytics" },
  spatio: { title: "Spatio-Temporal Analysis", crumb: "Spatio-Temporal" },
  explorer: { title: "Database Explorer", crumb: "Schema" },
  sqllab: { title: "SQL Query Lab", crumb: "Query Lab" },
  optimization: { title: "Query Optimization", crumb: "Optimization" },
  views: { title: "Views & Materialized Views", crumb: "Views" },
  dataflow: { title: "Data Flow", crumb: "Architecture" },
  reports: { title: "Reports", crumb: "Reports" },
};

export default function Home() {
  const page = useAppStore((s) => s.page);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar crumb={PAGE_META[page]?.crumb ?? ""} />
        <main className="flex-1 overflow-y-auto scroll-thin">
          <div className="mx-auto w-full max-w-[1320px] px-6 py-6 lg:px-8">
            <PageRouter page={page} />
          </div>
        </main>
      </div>
      <PresentationMode />
    </div>
  );
}

function TopBar({ crumb }: { crumb: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white px-6">
      <div className="flex items-center gap-2 text-sm">
        <Database className="h-4 w-4 text-[#4472C4]" />
        <span className="text-[#94a3b8]">UrbanMobilityDB</span>
        <span className="text-[#cbd5e1]">/</span>
        <span className="font-medium text-[#17365D]">{crumb}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1.5 text-xs text-[#64748b] sm:flex">
          <Activity className="h-3.5 w-3.5 text-[#5fb571]" />
          Query engine online
        </div>
        <div className="hidden items-center gap-1.5 rounded-md border border-[#e2e8f0] bg-[#F5F9FD] px-2.5 py-1 text-xs font-medium text-[#17365D] sm:flex">
          <TerminalSquare className="h-3.5 w-3.5 text-[#4472C4]" />
          PostgreSQL 16
        </div>
      </div>
    </header>
  );
}

function PageRouter({ page }: { page: string }) {
  switch (page) {
    case "dashboard":
      return <DashboardPage />;
    case "traffic":
      return <TrafficAnalysisPage />;
    case "spatio":
      return <SpatioTemporalPage />;
    case "explorer":
      return <DatabaseExplorerPage />;
    case "sqllab":
      return <SqlQueryLabPage />;
    case "optimization":
      return <QueryOptimizationPage />;
    case "views":
      return <ViewsPage />;
    case "dataflow":
      return <DataFlowPage />;
    case "reports":
      return <ReportsPage />;
    default:
      return <DashboardPage />;
  }
}
