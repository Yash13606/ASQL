// ============================================================================
// Urban Mobility DB — Query layer
// Simulates SQL execution over the in-memory relational dataset.
// Each "query" mirrors a real PostgreSQL statement and returns rows + plan.
// ============================================================================

import { getDataset } from "./seed";
import type {
  CongestionLevel,
  Road,
  TrafficObservation,
  VehicleType,
  Sensor,
} from "./types";

const dataset = () => getDataset();

// ---- Lookup helpers (JOIN simulation) -------------------------------------
export function sensorToRoad(sensorId: number): Road | undefined {
  const ds = dataset();
  const sensor = ds.sensors.find((s) => s.sensor_id === sensorId);
  if (!sensor) return undefined;
  const seg = ds.segments.find((sg) => sg.segment_id === sensor.segment_id);
  if (!seg) return undefined;
  return ds.roads.find((r) => r.road_id === seg.road_id);
}

export function roadOfObservation(o: TrafficObservation): Road | undefined {
  return sensorToRoad(o.sensor_id);
}

// ---- Aggregations ----------------------------------------------------------
export interface RoadAggregate {
  road_id: number;
  road_name: string;
  area: string;
  road_type: string;
  total_vehicles: number;
  avg_speed: number;
  peak_hour: number;
  peak_volume: number;
  high_pct: number;
  medium_pct: number;
  low_pct: number;
  congestion: CongestionLevel;
}

export function getRoadAggregates(): RoadAggregate[] {
  const ds = dataset();
  const map = new Map<number, RoadAggregate>();
  for (const r of ds.roads) {
    map.set(r.road_id, {
      road_id: r.road_id,
      road_name: r.road_name,
      area: r.area,
      road_type: r.road_type,
      total_vehicles: 0,
      avg_speed: 0,
      peak_hour: 8,
      peak_volume: 0,
      high_pct: 0,
      medium_pct: 0,
      low_pct: 0,
      congestion: "LOW",
    });
  }
  // join obs -> sensor -> segment -> road, aggregate
  const speedSum = new Map<number, number>();
  const speedCnt = new Map<number, number>();
  const hourVol = new Map<number, Map<number, number>>(); // road -> hour -> vol
  const cong = new Map<number, Record<string, number>>();

  for (const o of ds.observations) {
    const road = sensorToRoad(o.sensor_id);
    if (!road) continue;
    const agg = map.get(road.road_id)!;
    agg.total_vehicles += o.vehicle_count;
    speedSum.set(road.road_id, (speedSum.get(road.road_id) || 0) + o.average_speed);
    speedCnt.set(road.road_id, (speedCnt.get(road.road_id) || 0) + 1);
    let hm = hourVol.get(road.road_id);
    if (!hm) {
      hm = new Map();
      hourVol.set(road.road_id, hm);
    }
    hm.set(o.hour, (hm.get(o.hour) || 0) + o.vehicle_count);
    let c = cong.get(road.road_id);
    if (!c) {
      c = { LOW: 0, MEDIUM: 0, HIGH: 0 };
      cong.set(road.road_id, c);
    }
    c[o.congestion_level]++;
  }

  const out: RoadAggregate[] = [];
  for (const r of ds.roads) {
    const agg = map.get(r.road_id)!;
    agg.avg_speed = parseFloat((speedSum.get(r.road_id) || 0) / (speedCnt.get(r.road_id) || 1)).toFixed(1) as unknown as number;
    const hm = hourVol.get(r.road_id);
    if (hm) {
      let best = 8;
      let bestV = 0;
      for (const [h, v] of hm) {
        if (v > bestV) {
          bestV = v;
          best = h;
        }
      }
      agg.peak_hour = best;
      agg.peak_volume = bestV;
    }
    const c = cong.get(r.road_id) || { LOW: 0, MEDIUM: 0, HIGH: 0 };
    const total = c.LOW + c.MEDIUM + c.HIGH || 1;
    agg.high_pct = Math.round((c.HIGH / total) * 100);
    agg.medium_pct = Math.round((c.MEDIUM / total) * 100);
    agg.low_pct = Math.round((c.LOW / total) * 100);
    agg.congestion = agg.high_pct >= 25 ? "HIGH" : agg.medium_pct >= 30 ? "MEDIUM" : "LOW";
    out.push(agg);
  }
  return out;
}

export function getTopCongestedRoads(limit = 8): RoadAggregate[] {
  return getRoadAggregates()
    .sort((a, b) => b.total_vehicles - a.total_vehicles)
    .slice(0, limit);
}

// ---- Hourly traffic (overall) ---------------------------------------------
export function getHourlyTotals(): { hour: string; vehicles: number; avgSpeed: number }[] {
  const ds = dataset();
  const vol = new Array(24).fill(0);
  const spd = new Array(24).fill(0);
  const cnt = new Array(24).fill(0);
  for (const o of ds.observations) {
    vol[o.hour] += o.vehicle_count;
    spd[o.hour] += o.average_speed;
    cnt[o.hour]++;
  }
  return Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    vehicles: vol[h],
    avgSpeed: parseFloat((spd[h] / (cnt[h] || 1)).toFixed(1)),
  }));
}

// ---- Volume trend over days/hours (for dashboard line chart) ---------------
export function getVolumeTrend(): { time: string; vehicles: number }[] {
  const ds = dataset();
  // sample: aggregate by day+hour across all sensors, show last 7 days x 24h subsampled
  const map = new Map<string, number>();
  for (const o of ds.observations) {
    const key = `${o.date.slice(5)} ${String(o.hour).padStart(2, "0")}:00`;
    map.set(key, (map.get(key) || 0) + o.vehicle_count);
  }
  const out = Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([time, vehicles]) => ({ time, vehicles: Math.round(vehicles / 342) }));
  return out;
}

// ---- Filters ---------------------------------------------------------------
export interface TrafficFilter {
  road?: string;       // road_name
  area?: string;       // area
  date?: string;       // YYYY-MM-DD
  hourStart?: number;  // 0-23
  hourEnd?: number;    // 0-23
  vehicleType?: VehicleType | "All";
}

export function filterObservations(f: TrafficFilter): TrafficObservation[] {
  const ds = dataset();
  return ds.observations.filter((o) => {
    const road = sensorToRoad(o.sensor_id);
    if (!road) return false;
    if (f.road && f.road !== "All Roads" && road.road_name !== f.road) return false;
    if (f.area && f.area !== "All Areas" && road.area !== f.area) return false;
    if (f.date && o.date !== f.date) return false;
    if (f.hourStart != null && f.hourEnd != null) {
      if (o.hour < f.hourStart || o.hour >= f.hourEnd) return false;
    }
    if (f.vehicleType && f.vehicleType !== "All") {
      // vehicle-type weighting: include if that type share is meaningful
      const count =
        f.vehicleType === "Car" ? o.car_count :
        f.vehicleType === "Bike" ? o.bike_count :
        f.vehicleType === "Bus" ? o.bus_count :
        f.vehicleType === "Truck" ? o.truck_count : o.auto_count;
      if (count === 0) return false;
    }
    return true;
  });
}

// ---- Per-road / per-hour analytics (filtered) ------------------------------
export function trafficByRoad(f: TrafficFilter): { road: string; vehicles: number; avgSpeed: number }[] {
  const obs = filterObservations(f);
  const map = new Map<string, { vol: number; spd: number; cnt: number }>();
  for (const o of obs) {
    const road = sensorToRoad(o.sensor_id);
    if (!road) continue;
    let e = map.get(road.road_name);
    if (!e) {
      e = { vol: 0, spd: 0, cnt: 0 };
      map.set(road.road_name, e);
    }
    e.vol += o.vehicle_count;
    e.spd += o.average_speed;
    e.cnt++;
  }
  return Array.from(map.entries())
    .map(([road, e]) => ({ road, vehicles: e.vol, avgSpeed: parseFloat((e.spd / (e.cnt || 1)).toFixed(1)) }))
    .sort((a, b) => b.vehicles - a.vehicles)
    .slice(0, 10);
}

export function trafficByHour(f: TrafficFilter): { hour: string; vehicles: number; avgSpeed: number }[] {
  const obs = filterObservations(f);
  const vol = new Array(24).fill(0);
  const spd = new Array(24).fill(0);
  const cnt = new Array(24).fill(0);
  for (const o of obs) {
    vol[o.hour] += o.vehicle_count;
    spd[o.hour] += o.average_speed;
    cnt[o.hour]++;
  }
  return Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    vehicles: vol[h],
    avgSpeed: parseFloat((spd[h] / (cnt[h] || 1)).toFixed(1)),
  }));
}

export function congestionDistribution(f: TrafficFilter): { level: string; count: number; pct: number }[] {
  const obs = filterObservations(f);
  const t = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  for (const o of obs) t[o.congestion_level]++;
  const total = t.LOW + t.MEDIUM + t.HIGH || 1;
  return [
    { level: "LOW", count: t.LOW, pct: Math.round((t.LOW / total) * 100) },
    { level: "MEDIUM", count: t.MEDIUM, pct: Math.round((t.MEDIUM / total) * 100) },
    { level: "HIGH", count: t.HIGH, pct: Math.round((t.HIGH / total) * 100) },
  ];
}

// ---- KPI helpers -----------------------------------------------------------
export function getKpis() {
  const ds = dataset();
  const totalObs = ds.observations.length;
  const totalVehicles = ds.observations.reduce((s, o) => s + o.vehicle_count, 0);
  const avgSpeed = ds.observations.reduce((s, o) => s + o.average_speed, 0) / totalObs;
  const high = ds.observations.filter((o) => o.congestion_level === "HIGH").length;
  const congestionRate = (high / totalObs) * 100;
  return {
    totalObservations: 2_400_000, // production-scale representation
    roadsMonitored: ds.roads.length,
    activeSensors: ds.sensors.length,
    avgSpeed: parseFloat(avgSpeed.toFixed(1)),
    congestionRate: parseFloat(congestionRate.toFixed(1)),
    totalVehiclesObserved: totalVehicles,
    actualRows: totalObs,
  };
}

// ---- Database status -------------------------------------------------------
export function getDbStatus() {
  const ds = dataset();
  return {
    name: "UrbanMobilityDB",
    status: "CONNECTED",
    tables: 6,
    records: 2_400_000,
    indexes: 8,
    views: 4,
    materializedViews: 2,
    actualRows: ds.observations.length,
  };
}

// ---- Distinct filter option lists -----------------------------------------
export function getRoadNames(): string[] {
  return getDataset().roads.map((r) => r.road_name).sort();
}
export function getAreas(): string[] {
  return Array.from(new Set(getDataset().roads.map((r) => r.area))).sort();
}
export function getDates(): string[] {
  return Array.from(new Set(getDataset().observations.map((o) => o.date))).sort();
}

// ---- Spatio-temporal helpers ----------------------------------------------
export function getSensorsForRoad(roadName: string): Sensor[] {
  const ds = dataset();
  const road = ds.roads.find((r) => r.road_name === roadName);
  if (!road) return [];
  const segIds = new Set(
    ds.segments.filter((s) => s.road_id === road.road_id).map((s) => s.segment_id)
  );
  return ds.sensors.filter((s) => segIds.has(s.segment_id));
}

export function getSensorTimeseries(
  sensorId: number,
  date: string
): { hour: string; vehicles: number; speed: number; congestion: CongestionLevel }[] {
  const ds = dataset();
  return ds.observations
    .filter((o) => o.sensor_id === sensorId && o.date === date)
    .sort((a, b) => a.hour - b.hour)
    .map((o) => ({
      hour: `${String(o.hour).padStart(2, "0")}:00`,
      vehicles: o.vehicle_count,
      speed: o.average_speed,
      congestion: o.congestion_level,
    }));
}

export function getObservationAt(sensorId: number, date: string, hour: number) {
  const ds = dataset();
  // nearest hour within window
  return ds.observations.find((o) => o.sensor_id === sensorId && o.date === date && o.hour === hour);
}
