// ============================================================================
// Urban Mobility DB — Seeded data generator (deterministic, realistic)
// Simulates a production-scale relational database entirely in memory.
// ============================================================================

import type {
  Road,
  RoadSegment,
  Sensor,
  TrafficObservation,
  Vehicle,
  Trip,
  RoadType,
  VehicleType,
  CongestionLevel,
  SensorStatus,
} from "./types";

// ---- Deterministic RNG (mulberry32) ---------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260901);

function randInt(min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals = 1) {
  const v = rng() * (max - min) + min;
  return parseFloat(v.toFixed(decimals));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ---- Reference data --------------------------------------------------------
const CITY = "Chennai";

const NAMED_ROADS: { name: string; type: RoadType; area: string; len: number }[] = [
  { name: "OMR (Old Mahabalipuram Road)", type: "Highway", area: "Sholinganallur", len: 26.5 },
  { name: "Anna Salai", type: "Arterial", area: "Anna Salai", len: 11.2 },
  { name: "GST Road", type: "Highway", area: "Chromepet", len: 22.8 },
  { name: "ECR (East Coast Road)", type: "Highway", area: "Neelangarai", len: 30.0 },
  { name: "Poonamallee High Road", type: "Arterial", area: "Kilpauk", len: 12.4 },
  { name: "Inner Ring Road", type: "Arterial", area: "Guindy", len: 14.6 },
  { name: "Outer Ring Road", type: "Highway", area: "Mannivakkam", len: 62.0 },
  { name: "Velachery Main Road", type: "Arterial", area: "Velachery", len: 7.8 },
  { name: "Arcot Road", type: "Arterial", area: "Vadapalani", len: 9.4 },
  { name: "TTK Road", type: "Arterial", area: "T Nagar", len: 3.6 },
  { name: "Cathedral Road", type: "Sub-arterial", area: "Teynampet", len: 2.2 },
  { name: "Sterling Road", type: "Sub-arterial", area: "Nungambakkam", len: 1.8 },
  { name: "Nungambakkam High Road", type: "Arterial", area: "Nungambakkam", len: 4.1 },
  { name: "Khader Nawaz Khan Road", type: "Sub-arterial", area: "Nungambakkam", len: 1.4 },
  { name: "Habibullah Road", type: "Sub-arterial", area: "T Nagar", len: 1.9 },
  { name: "Usman Road", type: "Arterial", area: "T Nagar", len: 2.6 },
  { name: "Ranganathan Street", type: "Collector", area: "T Nagar", len: 0.9 },
  { name: "Mambalam Main Road", type: "Sub-arterial", area: "T Nagar", len: 2.1 },
  { name: "Cenotaph Road", type: "Sub-arterial", area: "Teynampet", len: 1.7 },
  { name: "Chamiers Road", type: "Sub-arterial", area: "Raja Annamalai Puram", len: 1.6 },
  { name: "Peters Road", type: "Sub-arterial", area: "Royapettah", len: 1.3 },
  { name: "Wallajah Road", type: "Arterial", area: "Triplicane", len: 2.4 },
  { name: "Kamarajar Salai", type: "Arterial", area: "Marina", len: 3.8 },
  { name: "Santhome High Road", type: "Arterial", area: "Santhome", len: 2.9 },
  { name: "Luz Church Road", type: "Sub-arterial", area: "Mylapore", len: 2.0 },
  { name: "Thiru Vi Ka Street", type: "Collector", area: "Royapettah", len: 1.1 },
  { name: "Sardar Patel Road", type: "Arterial", area: "Guindy", len: 5.2 },
  { name: "LB Road", type: "Arterial", area: "Adyar", len: 3.0 },
  { name: "Adyar Signal Main Road", type: "Sub-arterial", area: "Adyar", len: 2.2 },
  { name: "1st Avenue Road", type: "Collector", area: "Adyar", len: 1.0 },
  { name: "2nd Avenue Road", type: "Collector", area: "Adyar", len: 0.9 },
  { name: "Gandhi Mandapam Road", type: "Sub-arterial", area: "Guindy", len: 2.7 },
  { name: "Medavakkam Main Road", type: "Arterial", area: "Medavakkam", len: 6.4 },
  { name: "Sholinganallur Main Road", type: "Sub-arterial", area: "Sholinganallur", len: 3.1 },
  { name: "Perungudi Main Road", type: "Sub-arterial", area: "Perungudi", len: 2.8 },
  { name: "Taramani 100 Feet Road", type: "Arterial", area: "Taramani", len: 4.3 },
  { name: "Grand Southern Trunk Road", type: "Highway", area: "Pallavaram", len: 18.6 },
  { name: "Tambaram Mudichur Road", type: "Arterial", area: "Tambaram", len: 5.5 },
  { name: "Anna Nagar 2nd Avenue", type: "Arterial", area: "Anna Nagar", len: 3.2 },
  { name: "Anna Nagar 3rd Avenue", type: "Collector", area: "Anna Nagar", len: 1.4 },
  { name: "Mogappair Main Road", type: "Sub-arterial", area: "Mogappair", len: 3.8 },
  { name: "Ambattur Main Road", type: "Arterial", area: "Ambattur", len: 7.1 },
  { name: "Avadi Main Road", type: "Arterial", area: "Avadi", len: 8.6 },
  { name: "Porur Main Road", type: "Arterial", area: "Porur", len: 6.0 },
  { name: "Arcot Road Extension", type: "Sub-arterial", area: "Porur", len: 4.2 },
  { name: "Mount Poonamallee Road", type: "Highway", area: "Porur", len: 13.5 },
  { name: "Chennai Bypass Road", type: "Highway", area: "Maduravoyal", len: 19.0 },
  { name: "Poonamallee High Road Ext", type: "Arterial", area: "Poonamallee", len: 9.8 },
  { name: "Sriperumbudur Highway", type: "Highway", area: "Sriperumbudur", len: 38.0 },
  { name: "Maraimalai Nagar Road", type: "Highway", area: "Maraimalai Nagar", len: 16.2 },
];

const AREAS = [
  "Adyar", "T Nagar", "Velachery", "Guindy", "Saidapet", "Anna Nagar", "Nungambakkam",
  "Mylapore", "Royapettah", "Tambaram", "Chromepet", "Pallavaram", "Sholinganallur",
  "Perungudi", "Taramani", "Porur", "Mogappair", "Ambattur", "Avadi", "Santhome",
  "Triplicane", "Egmore", "Purasawalkam", "Kilpauk", "Chetpet", "Vadapalani",
  "Saligramam", "Valasaravakkam", "Maduravoyal", "Poonamallee", "Sriperumbudur",
  "Oragadam", "Maraimalai Nagar", "Chengalpattu", "Mahabalipuram", "Neelangarai",
  "Injambakkam", "Uthandi", "Kottivakkam", "Palavakkam",
];

const ROAD_TYPES: RoadType[] = ["Arterial", "Highway", "Sub-arterial", "Collector", "Local"];

const LOC_LANDMARKS = [
  "Signal Junction", "Flyover Ramp", "Metro Station", "Bus Depot", "Railway Gate",
  "Market Area", "Tech Park Gate", "Hospital Junction", "School Zone", "Lake Bridge",
  "Roundabout", "Toll Plaza", "Interchange", "Traffic Island",
];

// Hour-of-day multiplier — realistic bimodal urban traffic (morning + evening peak)
const HOUR_MULT: number[] = [
  0.1, 0.06, 0.05, 0.06, 0.1, 0.18, 0.32, 0.55, 1.0, 1.0, 0.72, 0.65,
  0.7, 0.68, 0.66, 0.74, 0.88, 1.0, 1.0, 0.92, 0.7, 0.5, 0.32, 0.18,
];

const VEHICLE_TYPES: VehicleType[] = ["Car", "Bike", "Bus", "Truck", "Auto"];

// Base per-hour capacity and free-flow speed by road type
const ROAD_PROFILE: Record<RoadType, { baseVol: [number, number]; freeFlow: [number, number] }> = {
  Highway: { baseVol: [450, 850], freeFlow: [58, 70] },
  Arterial: { baseVol: [320, 680], freeFlow: [44, 55] },
  "Sub-arterial": { baseVol: [180, 420], freeFlow: [35, 46] },
  Collector: { baseVol: [90, 220], freeFlow: [30, 40] },
  Local: { baseVol: [35, 95], freeFlow: [24, 34] },
};

// Vehicle-type composition (Chennai-style), varies by road type
function vehicleMix(roadType: RoadType): Record<VehicleType, number> {
  const base: Record<VehicleType, number> = { Car: 0.28, Bike: 0.45, Bus: 0.08, Truck: 0.06, Auto: 0.13 };
  if (roadType === "Highway") {
    base.Car = 0.34; base.Bike = 0.26; base.Bus = 0.12; base.Truck = 0.18; base.Auto = 0.1;
  } else if (roadType === "Arterial") {
    base.Car = 0.3; base.Bike = 0.42; base.Bus = 0.1; base.Truck = 0.07; base.Auto = 0.11;
  } else if (roadType === "Local") {
    base.Car = 0.2; base.Bike = 0.56; base.Bus = 0.04; base.Truck = 0.02; base.Auto = 0.18;
  }
  return base;
}

function congestionFromSpeed(speed: number): CongestionLevel {
  if (speed < 25) return "HIGH";
  if (speed < 38) return "MEDIUM";
  return "LOW";
}

function statusFromCongestion(c: CongestionLevel): SensorStatus {
  if (c === "HIGH") return "High";
  if (c === "MEDIUM") return "Moderate";
  return "Normal";
}

// ---- Road generation -------------------------------------------------------
function generateRoads(): Road[] {
  const roads: Road[] = [];
  let id = 1;
  // named major roads first
  for (const r of NAMED_ROADS) {
    roads.push({
      road_id: id++,
      road_name: r.name,
      road_type: r.type,
      area: r.area,
      city: CITY,
      length_km: r.len,
    });
  }
  // pad to 128 with realistic area-based roads
  const suffixes = ["Main Road", "2nd Main Road", "3rd Main Road", "Cross Road", "Link Road", "Extension Road", "Service Road"];
  while (roads.length < 128) {
    const area = pick(AREAS);
    const suffix = pick(suffixes);
    const type = pick(ROAD_TYPES);
    roads.push({
      road_id: id++,
      road_name: `${area} ${suffix}`,
      road_type: type,
      area,
      city: CITY,
      length_km: randFloat(0.6, 6.4, 1),
    });
  }
  return roads;
}

// ---- Segment generation ----------------------------------------------------
function generateSegments(roads: Road[]): RoadSegment[] {
  const segments: RoadSegment[] = [];
  let id = 1;
  for (const road of roads) {
    // 2-3 segments per road -> ~300
    const count = road.road_type === "Highway" || road.road_type === "Arterial" ? randInt(3, 4) : randInt(2, 3);
    const segLen = road.length_km / count;
    for (let i = 0; i < count; i++) {
      const from = pick(LOC_LANDMARKS);
      let to = pick(LOC_LANDMARKS);
      while (to === from) to = pick(LOC_LANDMARKS);
      segments.push({
        segment_id: id,
        road_id: road.road_id,
        segment_name: `${road.area} Seg-${i + 1}`,
        start_location: `${road.area} ${from}`,
        end_location: `${road.area} ${to}`,
        length_km: parseFloat(segLen.toFixed(2)),
      });
      id++;
    }
  }
  return segments;
}

// ---- Sensor generation -----------------------------------------------------
function generateSensors(segments: RoadSegment[], roads: Road[]): Sensor[] {
  const sensors: Sensor[] = [];
  let id = 1;
  const roadById = new Map(roads.map((r) => [r.road_id, r]));
  for (const seg of segments) {
    // 1 sensor per segment, add extra for major roads to reach ~342
    const road = roadById.get(seg.road_id)!;
    const extra = road.road_type === "Arterial" || road.road_type === "Highway" ? 1 : 0;
    const total = 1 + extra;
    for (let i = 0; i < total; i++) {
      if (id > 342) break;
      sensors.push({
        sensor_id: id,
        segment_id: seg.segment_id,
        sensor_code: `S-${100 + id}`,
        sensor_location: `${seg.start_location}`,
        status: "Normal",
        installed_date: `2025-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
      });
      id++;
    }
  }
  return sensors;
}

// ---- Observation generation ------------------------------------------------
// 7 days x 24h x ~342 sensors ≈ 57k in-memory observations (represents 2.4M scale)
const DAYS = 7;
const BASE_DATE = new Date("2026-09-01T00:00:00");

function generateObservations(sensors: Sensor[], segments: RoadSegment[], roads: Road[]): TrafficObservation[] {
  const obs: TrafficObservation[] = [];
  let id = 1;
  const segById = new Map(segments.map((s) => [s.segment_id, s]));
  const roadById = new Map(roads.map((r) => [r.road_id, r]));

  for (const sensor of sensors) {
    const seg = segById.get(sensor.segment_id)!;
    const road = roadById.get(seg.road_id)!;
    const profile = ROAD_PROFILE[road.road_type];
    const mix = vehicleMix(road.road_type);
    const baseCap = randInt(profile.baseVol[0], profile.baseVol[1]);
    const freeFlow = randFloat(profile.freeFlow[0], profile.freeFlow[1], 1);
    // per-sensor steady character
    const sensorBias = randFloat(0.8, 1.2, 2);

    for (let d = 0; d < DAYS; d++) {
      const dayDate = new Date(BASE_DATE);
      dayDate.setDate(dayDate.getDate() + d);
      const dow = dayDate.getDay(); // 0 Sun .. 6 Sat
      const weekendFactor = dow === 0 || dow === 6 ? 0.78 : 1.0;
      const dateStr = dayDate.toISOString().slice(0, 10);

      for (let h = 0; h < 24; h++) {
        const mult = HOUR_MULT[h] * weekendFactor * sensorBias;
        const noise = randFloat(0.85, 1.15, 2);
        const vehicleCount = Math.max(0, Math.round(baseCap * mult * noise));
        const ratio = Math.min(0.96, vehicleCount / (baseCap * 1.08));
        const speed = Math.max(8, parseFloat((freeFlow * (1 - 0.72 * ratio * ratio) * randFloat(0.92, 1.06, 2)).toFixed(1)));
        const congestion = congestionFromSpeed(speed);

        const car = Math.round(vehicleCount * mix.Car);
        const bike = Math.round(vehicleCount * mix.Bike);
        const bus = Math.round(vehicleCount * mix.Bus);
        const truck = Math.round(vehicleCount * mix.Truck);
        const auto = Math.max(0, vehicleCount - car - bike - bus - truck);

        const ts = new Date(dayDate);
        ts.setHours(h, randInt(0, 5) * 10, 0, 0);

        obs.push({
          observation_id: id++,
          sensor_id: sensor.sensor_id,
          timestamp: ts.toISOString(),
          hour: h,
          date: dateStr,
          vehicle_count: vehicleCount,
          average_speed: speed,
          congestion_level: congestion,
          car_count: car,
          bike_count: bike,
          bus_count: bus,
          truck_count: truck,
          auto_count: auto,
        });
      }
    }
  }
  // set sensor status from its most common congestion
  return obs;
}

function setSensorStatuses(sensors: Sensor[], obs: TrafficObservation[]) {
  const bySensor = new Map<number, CongestionLevel>();
  const tally = new Map<number, Record<string, number>>();
  for (const o of obs) {
    let t = tally.get(o.sensor_id);
    if (!t) {
      t = { LOW: 0, MEDIUM: 0, HIGH: 0 };
      tally.set(o.sensor_id, t);
    }
    t[o.congestion_level]++;
  }
  for (const s of sensors) {
    const t = tally.get(s.sensor_id);
    if (!t) continue;
    const level: CongestionLevel = t.HIGH >= t.MEDIUM && t.HIGH >= t.LOW ? "HIGH" : t.MEDIUM >= t.LOW ? "MEDIUM" : "LOW";
    bySensor.set(s.sensor_id, level);
    s.status = statusFromCongestion(level);
  }
}

// ---- Vehicle + Trip generation --------------------------------------------
const REG_PREFIX = ["TN", "KA", "AP", "TS", "MH"];

function generateVehicles(): Vehicle[] {
  const vehicles: Vehicle[] = [];
  for (let i = 1; i <= 2000; i++) {
    const type = pick(VEHICLE_TYPES);
    const reg = `${pick(REG_PREFIX)}-${String(randInt(1, 99)).padStart(2, "0")} ${String(randInt(1000, 9999))}`;
    vehicles.push({
      vehicle_id: i,
      vehicle_type: type,
      registration: reg,
      owner_zone: pick(AREAS),
    });
  }
  return vehicles;
}

function generateTrips(vehicles: Vehicle[]): Trip[] {
  const trips: Trip[] = [];
  for (let i = 1; i <= 10000; i++) {
    const v = pick(vehicles);
    const startH = randInt(6, 21);
    const dur = randInt(12, 75);
    const start = new Date(BASE_DATE);
    start.setDate(start.getDate() + randInt(0, DAYS - 1));
    start.setHours(startH, randInt(0, 59), 0, 0);
    const end = new Date(start.getTime() + dur * 60000);
    let src = pick(AREAS);
    let dst = pick(AREAS);
    while (dst === src) dst = pick(AREAS);
    const dist = randFloat(1.2, 28.4, 1);
    trips.push({
      trip_id: i,
      vehicle_id: v.vehicle_id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      source: src,
      destination: dst,
      distance_km: dist,
      duration_min: dur,
    });
  }
  return trips;
}

// ---- Dataset singleton -----------------------------------------------------
export interface Dataset {
  roads: Road[];
  segments: RoadSegment[];
  sensors: Sensor[];
  observations: TrafficObservation[];
  vehicles: Vehicle[];
  trips: Trip[];
}

let _dataset: Dataset | null = null;

export function getDataset(): Dataset {
  if (_dataset) return _dataset;
  const roads = generateRoads();
  const segments = generateSegments(roads);
  const sensors = generateSensors(segments, roads);
  const observations = generateObservations(sensors, segments, roads);
  setSensorStatuses(sensors, observations);
  const vehicles = generateVehicles();
  const trips = generateTrips(vehicles);
  _dataset = { roads, segments, sensors, observations, vehicles, trips };
  return _dataset;
}
