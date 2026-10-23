"use client";

import * as React from "react";
import {
  Play,
  CheckCircle2,
  Clock,
  Database,
  Layers,
  Hash,
  TerminalSquare,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { SQL_LIBRARY, getQueryById } from "@/lib/database/sql-library";
import { PageHeader, SectionLabel, FeatureBadge, DataTable } from "@/components/shared/ui";
import { SqlBlock } from "@/components/shared/sql-block";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SqlQueryLabPage() {
  const [activeId, setActiveId] = React.useState(SQL_LIBRARY[0].id);
  const active = getQueryById(activeId)!;
  const [result, setResult] = React.useState<ReturnType<typeof active.run> | null>(null);
  const [running, setRunning] = React.useState(false);

  // auto-run first query on mount
  React.useEffect(() => {
    setResult(getQueryById(activeId)!.run(true));
  }, []);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setResult(active.run(true));
      setRunning(false);
    }, 480);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Query Lab"
        title="SQL Query Lab"
        subtitle="Execute PostgreSQL-style queries against the urban mobility dataset"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Query library */}
        <div className="space-y-3">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#4472C4]" />
              <SectionLabel>Query Library</SectionLabel>
            </div>
            <ul className="space-y-1">
              {SQL_LIBRARY.map((q) => {
                const isActive = q.id === activeId;
                return (
                  <li key={q.id}>
                    <button
                      onClick={() => {
                        setActiveId(q.id);
                        setResult(q.run(true));
                      }}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left transition-colors",
                        isActive
                          ? "bg-[#4472C4] text-white shadow-sm"
                          : "text-[#334155] hover:bg-[#EAF2F8]"
                      )}
                    >
                      <div className="text-[13px] font-semibold leading-tight">
                        {q.title}
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 text-[10px] font-medium uppercase tracking-wide",
                          isActive ? "text-white/70" : "text-[#94a3b8]"
                        )}
                      >
                        {q.category}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-[#dbe6f3] bg-[#F5F9FD] p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-[#9c5b00]" />
              <SectionLabel>Why it matters</SectionLabel>
            </div>
            <p className="text-[12px] leading-relaxed text-[#475569]">
              Each query demonstrates a distinct SQL technique — multi-table JOINs,
              scalar subqueries, CTEs and window functions — that power the
              traffic analytics across this platform.
            </p>
          </div>
        </div>

        {/* Editor + results */}
        <div className="space-y-4">
          {/* SQL editor */}
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-[#4472C4]" />
                <SectionLabel>SQL Editor</SectionLabel>
              </div>
              <Button
                onClick={handleRun}
                disabled={running}
                className="bg-[#4472C4] text-white hover:bg-[#3a5fb0]"
              >
                <Play className={cn("h-4 w-4", running && "animate-pulse")} />
                {running ? "Executing…" : "Run Query"}
              </Button>
            </div>
            <SqlBlock sql={active.sql} title="query.sql" maxHeight={300} />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {active.features.map((f) => (
                <FeatureBadge key={f}>{f}</FeatureBadge>
              ))}
            </div>
          </div>

          {/* Explanation for subquery / CTE / window */}
          {active.why && (
            <div className="flex items-start gap-3 rounded-xl border border-[#dbe6f3] bg-[#F5F9FD] p-4 shadow-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4472C4] text-white">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div>
                <SectionLabel className="mb-1">Why?</SectionLabel>
                <p className="text-[13px] leading-relaxed text-[#334155]">{active.why}</p>
              </div>
            </div>
          )}

          {/* Execution result */}
          {result && (
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1f7a4d]" />
                  <span className="text-sm font-semibold text-[#17365D]">
                    Query executed successfully
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[12px]">
                  <span className="flex items-center gap-1.5 text-[#64748b]">
                    <Clock className="h-3.5 w-3.5 text-[#4472C4]" />
                    Execution time:{" "}
                    <span className="font-bold text-[#17365D] tabular-nums">
                      {result.executionTimeMs} ms
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[#64748b]">
                    <Database className="h-3.5 w-3.5 text-[#4472C4]" />
                    Rows scanned:{" "}
                    <span className="font-bold text-[#17365D] tabular-nums">
                      {result.rowsScanned.toLocaleString()}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[#64748b]">
                    <Hash className="h-3.5 w-3.5 text-[#4472C4]" />
                    Returned:{" "}
                    <span className="font-bold text-[#17365D] tabular-nums">
                      {result.rowCount} rows
                    </span>
                  </span>
                </div>
              </div>

              <DataTable
                columns={result.columns.map((c, i) => ({
                  key: c,
                  header: c,
                  align: i === 0 ? "left" : typeof result.rows[0]?.[c] === "number" ? "right" : "left",
                }))}
                rows={result.rows as any[]}
                maxHeight={340}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
