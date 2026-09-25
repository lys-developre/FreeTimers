import {
  createReachabilityZone,
  MAX_REACHABILITY_ZONE_RADIUS_KM,
  type ReachabilityZone,
} from "./reachability-zone";
import type { GeoPoint } from "./routing";

export const MAX_REACHABILITY_SPEED_KMH = 300;

export type ReachabilityEvidenceStatus = "fresh" | "stale" | "unsupported" | "missing";
export type ReachabilityStatus =
  | "approximate"
  | "geospatial-limit"
  | "no-window";

export type ReachabilityInput = {
  origin: GeoPoint;
  departureAt: string;
  deadline: string;
  marginMinutes: number;
  speedKmh: number;
  routeEvidenceStatus: ReachabilityEvidenceStatus;
};

export type ReachabilityResult = {
  status: ReachabilityStatus;
  feasibilityStatus: "unknown";
  evidenceStatus: ReachabilityEvidenceStatus;
  radiusKm: number;
  availableWindowMinutes: number;
  center: GeoPoint;
  zone: ReachabilityZone | null;
  reasons: string[];
};

function parseInstant(value: string, field: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new RangeError(`${field} must be a valid timestamp`);
  }

  return timestamp;
}

function validateGeoPoint(point: GeoPoint, field: string): void {
  if (
    !Number.isFinite(point.latitude) ||
    point.latitude < -90 ||
    point.latitude > 90
  ) {
    throw new RangeError(`${field}.latitude is invalid`);
  }

  if (
    !Number.isFinite(point.longitude) ||
    point.longitude < -180 ||
    point.longitude > 180
  ) {
    throw new RangeError(`${field}.longitude is invalid`);
  }
}

export function estimateReachability(
  input: ReachabilityInput,
): ReachabilityResult {
  validateGeoPoint(input.origin, "origin");

  if (
    input.routeEvidenceStatus !== "fresh" &&
    input.routeEvidenceStatus !== "stale" &&
    input.routeEvidenceStatus !== "unsupported" &&
    input.routeEvidenceStatus !== "missing"
  ) {
    throw new RangeError("routeEvidenceStatus is unsupported");
  }

  const departureAt = parseInstant(input.departureAt, "departureAt");
  const deadline = parseInstant(input.deadline, "deadline");

  if (deadline <= departureAt) {
    throw new RangeError("deadline must be after departureAt");
  }

  if (!Number.isFinite(input.marginMinutes) || input.marginMinutes < 0) {
    throw new RangeError("marginMinutes must be a finite non-negative number");
  }

  if (
    !Number.isFinite(input.speedKmh) ||
    input.speedKmh <= 0 ||
    input.speedKmh > MAX_REACHABILITY_SPEED_KMH
  ) {
    throw new RangeError(
      `speedKmh must be finite, positive, and no greater than ${MAX_REACHABILITY_SPEED_KMH}`,
    );
  }

  const windowMinutes = (deadline - departureAt) / 60000;
  const availableWindowMinutes = Math.max(windowMinutes - input.marginMinutes, 0);
  const oneWayBudgetMinutes = availableWindowMinutes / 2;
  const radiusKm = (oneWayBudgetMinutes / 60) * input.speedKmh;

  if (availableWindowMinutes === 0) {
    return {
      status: "no-window",
      feasibilityStatus: "unknown",
      evidenceStatus: input.routeEvidenceStatus,
      radiusKm: 0,
      availableWindowMinutes,
      center: input.origin,
      zone: null,
      reasons: [
        "The configured return margin consumes the entire available window.",
        "Route feasibility remains unknown because no route-backed evaluation was performed.",
      ],
    };
  }

  if (radiusKm >= MAX_REACHABILITY_ZONE_RADIUS_KM) {
    return {
      status: "geospatial-limit",
      feasibilityStatus: "unknown",
      evidenceStatus: input.routeEvidenceStatus,
      radiusKm,
      availableWindowMinutes,
      center: input.origin,
      zone: null,
      reasons: [
        "The theoretical radius exceeds the supported extent of a spherical boundary, so no polygon is generated.",
        "Route feasibility remains unknown because no route-backed evaluation was performed.",
      ],
    };
  }

  return {
    status: "approximate",
    feasibilityStatus: "unknown",
    evidenceStatus: input.routeEvidenceStatus,
    radiusKm,
    availableWindowMinutes,
    center: input.origin,
    zone: createReachabilityZone({ center: input.origin, radiusKm }),
    reasons: [
      "This geometric estimate assumes a constant average speed and splits travel time equally between outbound and return legs.",
      "Route feasibility remains unknown: the estimated circle is not a route-backed isochrone.",
    ],
  };
}
