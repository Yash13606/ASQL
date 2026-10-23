"use client";

import { create } from "zustand";
import type { VehicleType } from "@/lib/database/types";

export type PageId =
  | "dashboard"
  | "traffic"
  | "spatio"
  | "explorer"
  | "sqllab"
  | "optimization"
  | "views"
  | "dataflow"
  | "reports";

interface TrafficFilters {
  road: string;
  area: string;
  date: string;
  hourStart: number;
  hourEnd: number;
  vehicleType: VehicleType | "All";
}

// Spatio-temporal selection (shared, so other pages can react)
export interface SpatioSelection {
  roadName: string;
  sensorCode: string | null;
  hourStart: number;
  hourEnd: number;
  date: string;
}

interface AppState {
  page: PageId;
  setPage: (p: PageId) => void;

  presentation: boolean;
  setPresentation: (v: boolean) => void;

  filters: TrafficFilters;
  setFilter: <K extends keyof TrafficFilters>(k: K, v: TrafficFilters[K]) => void;
  resetFilters: () => void;

  spatio: SpatioSelection;
  setSpatio: (s: Partial<SpatioSelection>) => void;

  // materialized view refresh tracking
  mvRefreshedAt: string;
  refreshMaterializedView: () => void;

  // index toggling for optimization page
  indexEnabled: boolean;
  setIndexEnabled: (v: boolean) => void;
}

const DEFAULT_DATE = "2026-09-03"; // a weekday in the generated range

export const useAppStore = create<AppState>((set) => ({
  page: "dashboard",
  setPage: (p) => set({ page: p }),

  presentation: false,
  setPresentation: (v) => set({ presentation: v }),

  filters: {
    road: "All Roads",
    area: "All Areas",
    date: DEFAULT_DATE,
    hourStart: 8,
    hourEnd: 10,
    vehicleType: "All",
  },
  setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
  resetFilters: () =>
    set({
      filters: {
        road: "All Roads",
        area: "All Areas",
        date: DEFAULT_DATE,
        hourStart: 8,
        hourEnd: 10,
        vehicleType: "All",
      },
    }),

  spatio: {
    roadName: "OMR (Old Mahabalipuram Road)",
    sensorCode: null,
    hourStart: 8,
    hourEnd: 10,
    date: DEFAULT_DATE,
  },
  setSpatio: (s) => set((state) => ({ spatio: { ...state.spatio, ...s } })),

  mvRefreshedAt: "07 Sep 2026, 08:00",
  refreshMaterializedView: () =>
    set({ mvRefreshedAt: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) }),

  indexEnabled: true,
  setIndexEnabled: (v) => set({ indexEnabled: v }),
}));
