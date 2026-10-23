// ============================================================================
// Urban Mobility DB — Type Definitions
// Relational schema: ROAD, ROAD_SEGMENT, SENSOR, TRAFFIC_OBSERVATION, VEHICLE, TRIP
// ============================================================================

export type RoadType = "Arterial" | "Highway" | "Sub-arterial" | "Collector" | "Local";
export type CongestionLevel = "LOW" | "MEDIUM" | "HIGH";
export type VehicleType = "Car" | "Bike" | "Bus" | "Truck" | "Auto";
export type SensorStatus = "Normal" | "Moderate" | "High";

export interface Road {
  road_id: number;
  road_name: string;
  road_type: RoadType;
  area: string;
  city: string;
  length_km: number;
}

export interface RoadSegment {
  segment_id: number;
  road_id: number;
  segment_name: string;
  start_location: string;
  end_location: string;
  length_km: number;
}

export interface Sensor {
  sensor_id: number;
  segment_id: number;
  sensor_code: string;
  sensor_location: string;
  status: SensorStatus;
  installed_date: string;
}

export interface TrafficObservation {
  observation_id: number;
  sensor_id: number;
  timestamp: string; // ISO string
  hour: number;
  date: string; // YYYY-MM-DD
  vehicle_count: number;
  average_speed: number;
  congestion_level: CongestionLevel;
  // derived vehicle-type composition (analytical breakdown)
  car_count: number;
  bike_count: number;
  bus_count: number;
  truck_count: number;
  auto_count: number;
}

export interface Vehicle {
  vehicle_id: number;
  vehicle_type: VehicleType;
  registration: string;
  owner_zone: string;
}

export interface Trip {
  trip_id: number;
  vehicle_id: number;
  start_time: string;
  end_time: string;
  source: string;
  destination: string;
  distance_km: number;
  duration_min: number;
}

export interface DatabaseSchema {
  name: string;
  tables: TableDef[];
}

export interface ColumnDef {
  name: string;
  type: string;
  key?: "PK" | "FK";
  ref?: string;
  note?: string;
}

export interface TableDef {
  name: string;
  label: string;
  description: string;
  columns: ColumnDef[];
  rowCount: number;
  // layout coordinates for the ER diagram (percentages within the canvas)
  x: number;
  y: number;
}
