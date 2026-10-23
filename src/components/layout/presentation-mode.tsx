"use client";

import * as React from "react";
import {
  X,
  Database,
  Table2,
  TerminalSquare,
  Map,
  FileText,
  ArrowRight,
  Presentation,
} from "lucide-react";
import { useAppStore, type PageId } from "@/lib/store";

interface Step {
  num: number;
  title: string;
  desc: string;
  page: PageId;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  {
    num: 1,
    title: "Data",
    desc: "An urban mobility database of roads, sensors, vehicles, trips and 2.4M traffic observations.",
    page: "dashboard",
    icon: Database,
  },
  {
    num: 2,
    title: "Database",
    desc: "Raw traffic information normalized into six related relational tables with keys and constraints.",
    page: "explorer",
    icon: Table2,
  },
  {
    num: 3,
    title: "Advanced SQL",
    desc: "JOINs, subqueries, CTEs and window functions executed in a live query lab.",
    page: "sqllab",
    icon: TerminalSquare,
  },
  {
    num: 4,
    title: "Analysis",
    desc: "Spatio-temporal analysis — where traffic occurs and when it peaks.",
    page: "spatio",
    icon: Map,
  },
  {
    num: 5,
    title: "Insights",
    desc: "Generated traffic reports and optimization insights.",
    page: "reports",
    icon: FileText,
  },
];

export function PresentationMode() {
  const { presentation, setPresentation, setPage } = useAppStore();

  if (!presentation) return null;

  const go = (page: PageId) => {
    setPage(page);
    setPresentation(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17365D]/95 backdrop-blur-sm">
      <button
        onClick={() => setPresentation(false)}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
        aria-label="Close presentation mode"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mx-auto w-full max-w-4xl px-6">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
            <Presentation className="h-3.5 w-3.5" />
            Presentation Mode
          </span>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Urban Mobility Database — Demo Flow
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            A guided 5-step walkthrough of the database research pipeline. Select a
            stage to jump directly into it.
          </p>
        </div>

        <div className="space-y-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.num}>
                <button
                  onClick={() => go(s.page)}
                  className="group flex w-full items-center gap-5 rounded-xl border border-white/15 bg-white/5 p-5 text-left transition-all hover:border-white/40 hover:bg-white/10"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#17365D] font-bold">
                    {s.num}
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4472C4] text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-bold text-white">{s.title}</div>
                    <p className="text-[13px] text-white/70">{s.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </button>
                {i < STEPS.length - 1 && (
                  <div className="ml-11 h-4 w-px bg-white/20" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
