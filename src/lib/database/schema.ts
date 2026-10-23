import type { DatabaseSchema } from "./types";

// Canonical relational schema — displayed in the Database Explorer ER diagram.
export const DB_SCHEMA: DatabaseSchema = {
  name: "UrbanMobilityDB",
  tables: [
    {
      name: "road",
      label: "ROAD",
      description: "Master list of monitored roads across urban zones.",
      rowCount: 128,
      x: 10,
      y: 18,
      columns: [
        { name: "road_id", type: "INT", key: "PK", note: "Primary key" },
        { name: "road_name", type: "VARCHAR(80)", note: "NOT NULL" },
        { name: "road_type", type: "VARCHAR(20)", note: "Arterial / Highway …" },
        { name: "area", type: "VARCHAR(60)" },
        { name: "city", type: "VARCHAR(40)" },
        { name: "length_km", type: "NUMERIC(6,2)" },
      ],
    },
    {
      name: "road_segment",
      label: "ROAD_SEGMENT",
      description: "Each road is partitioned into measurable segments.",
      rowCount: 300,
      x: 10,
      y: 78,
      columns: [
        { name: "segment_id", type: "INT", key: "PK", note: "Primary key" },
        { name: "road_id", type: "INT", key: "FK", ref: "road.road_id" },
        { name: "segment_name", type: "VARCHAR(80)" },
        { name: "start_location", type: "VARCHAR(80)" },
        { name: "end_location", type: "VARCHAR(80)" },
        { name: "length_km", type: "NUMERIC(5,2)" },
      ],
    },
    {
      name: "sensor",
      label: "SENSOR",
      description: "Traffic sensors deployed on each road segment.",
      rowCount: 342,
      x: 50,
      y: 18,
      columns: [
        { name: "sensor_id", type: "INT", key: "PK", note: "Primary key" },
        { name: "segment_id", type: "INT", key: "FK", ref: "road_segment.segment_id" },
        { name: "sensor_code", type: "VARCHAR(12)", note: "UNIQUE" },
        { name: "sensor_location", type: "VARCHAR(80)" },
        { name: "status", type: "VARCHAR(12)" },
        { name: "installed_date", type: "DATE" },
      ],
    },
    {
      name: "traffic_observation",
      label: "TRAFFIC_OBSERVATION",
      description: "Fact table — hourly traffic readings per sensor.",
      rowCount: 2400000,
      x: 90,
      y: 18,
      columns: [
        { name: "observation_id", type: "BIGINT", key: "PK", note: "Primary key" },
        { name: "sensor_id", type: "INT", key: "FK", ref: "sensor.sensor_id" },
        { name: "timestamp", type: "TIMESTAMP", note: "indexed" },
        { name: "vehicle_count", type: "INT" },
        { name: "average_speed", type: "NUMERIC(5,1)" },
        { name: "congestion_level", type: "VARCHAR(8)" },
      ],
    },
    {
      name: "vehicle",
      label: "VEHICLE",
      description: "Registered vehicles observed in the mobility network.",
      rowCount: 2000,
      x: 50,
      y: 78,
      columns: [
        { name: "vehicle_id", type: "INT", key: "PK", note: "Primary key" },
        { name: "vehicle_type", type: "VARCHAR(12)", note: "Car / Bike / Bus …" },
        { name: "registration", type: "VARCHAR(12)", note: "UNIQUE" },
        { name: "owner_zone", type: "VARCHAR(40)" },
      ],
    },
    {
      name: "trip",
      label: "TRIP",
      description: "Origin–destination trips undertaken by vehicles.",
      rowCount: 10000,
      x: 90,
      y: 78,
      columns: [
        { name: "trip_id", type: "INT", key: "PK", note: "Primary key" },
        { name: "vehicle_id", type: "INT", key: "FK", ref: "vehicle.vehicle_id" },
        { name: "start_time", type: "TIMESTAMP" },
        { name: "end_time", type: "TIMESTAMP" },
        { name: "source", type: "VARCHAR(60)" },
        { name: "destination", type: "VARCHAR(60)" },
      ],
    },
  ],
};

// Relationship edges for the ER diagram: from table -> to table (1 ─── N)
export interface SchemaRelation {
  from: string;
  to: string;
  cardinality: "1-N";
  label: string;
}

export const SCHEMA_RELATIONS: SchemaRelation[] = [
  { from: "road", to: "road_segment", cardinality: "1-N", label: "road_id" },
  { from: "road_segment", to: "sensor", cardinality: "1-N", label: "segment_id" },
  { from: "sensor", to: "traffic_observation", cardinality: "1-N", label: "sensor_id" },
  { from: "vehicle", to: "trip", cardinality: "1-N", label: "vehicle_id" },
];
