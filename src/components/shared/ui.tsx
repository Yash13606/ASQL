"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---- Section label (small uppercase) --------------------------------------
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4472C4]",
        className
      )}
    >
      {children}
    </div>
  );
}

// ---- Page header -----------------------------------------------------------
export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {badge && (
          <div className="mb-1.5">
            <span className="inline-flex items-center rounded-full bg-[#EAF2F8] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#4472C4]">
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-[#17365D] sm:text-[28px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---- KPI card --------------------------------------------------------------
export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-xl border py-0 overflow-hidden shadow-sm",
        accent ? "border-[#4472C4]/30 bg-[#F5F9FD]" : "border-[#e2e8f0] bg-white"
      )}
    >
      <div className="flex items-start justify-between px-5 pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748b]">
          {label}
        </span>
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF2F8] text-[#4472C4]">
            {icon}
          </span>
        )}
      </div>
      <div className="px-5 pb-4 pt-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[26px] font-bold leading-none text-[#17365D]">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-medium text-[#64748b]">{unit}</span>
          )}
        </div>
        {hint && <p className="mt-1.5 text-xs text-[#94a3b8]">{hint}</p>}
      </div>
    </Card>
  );
}

// ---- Chart card wrapper ----------------------------------------------------
export function ChartCard({
  title,
  subtitle,
  children,
  action,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-[#e2e8f0] bg-white shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div>
          <h3 className="text-sm font-semibold text-[#17365D]">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#64748b]">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className={cn("px-2 pb-3 pt-4 sm:px-3", bodyClassName)}>{children}</div>
    </Card>
  );
}

// ---- Feature badge (SQL operations used) -----------------------------------
export function FeatureBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[#dbe6f3] bg-[#F5F9FD] px-2.5 py-1 text-xs font-medium text-[#17365D]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#5fb571]" />
      {children}
    </span>
  );
}

// ---- Data table (generic) -------------------------------------------------
export interface Column<T> {
  key: keyof T | string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  maxHeight,
  emptyMessage = "No rows returned",
}: {
  columns: Column<T>[];
  rows: T[];
  maxHeight?: number;
  emptyMessage?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[#e2e8f0] overflow-auto scroll-thin bg-white"
      style={{ maxHeight: maxHeight ?? undefined }}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F5F9FD] hover:bg-[#F5F9FD]">
            {columns.map((c) => (
              <TableHead
                key={String(c.key)}
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wide text-[#4472C4] h-9",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                  c.className
                )}
              >
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-sm text-[#94a3b8] py-8"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow
                key={i}
                className="border-[#eef2f7] hover:bg-[#F5F9FD]"
              >
                {columns.map((c) => (
                  <TableCell
                    key={String(c.key)}
                    className={cn(
                      "text-[13px] text-[#334155]",
                      c.align === "right" && "text-right tabular-nums",
                      c.align === "center" && "text-center"
                    )}
                  >
                    {c.render ? c.render(row) : String(row[c.key as string] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ---- Congestion pill ------------------------------------------------------
export function CongestionPill({ level }: { level: string }) {
  const map: Record<string, string> = {
    HIGH: "bg-[#fde2e2] text-[#b03a2e] border-[#f5b8b8]",
    MEDIUM: "bg-[#fff3d6] text-[#9c5b00] border-[#f5d98a]",
    LOW: "bg-[#dff3e4] text-[#1f7a4d] border-[#b8e6c4]",
    Normal: "bg-[#dff3e4] text-[#1f7a4d] border-[#b8e6c4]",
    Moderate: "bg-[#fff3d6] text-[#9c5b00] border-[#f5d98a]",
    High: "bg-[#fde2e2] text-[#b03a2e] border-[#f5b8b8]",
  };
  const cls = map[level] || "bg-[#EAF2F8] text-[#17365D] border-[#dbe6f3]";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        cls
      )}
    >
      {level}
    </span>
  );
}
