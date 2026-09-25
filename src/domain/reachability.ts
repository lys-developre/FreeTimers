import type { GeoPoint } from "./routing";

export type ReachabilityEvidenceStatus = "fresh" | "stale" | "unsupported" | "missing";
export type ReachabilityStatus = "safe" | "tight" | "unknown" | "unviable";

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
  radiusKm: number;
  availableWindowMinutes: number;
  center: GeoPoint;
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

  const departureAt = parseInstant(input.departureAt, "departureAt");
  const deadline = parseInstant(input.deadline, "deadline");

  if (deadline <= departureAt) {
    throw new RangeError("deadline must be after departureAt");
  }

  if (!Number.isFinite(input.marginMinutes) || input.marginMinutes < 0) {
    throw new RangeError("marginMinutes must be a finite non-negative number");
  }

  if (!Number.isFinite(input.speedKmh) || input.speedKmh <= 0) {
    throw new RangeError("speedKmh must be a finite positive number");
  }

  const windowMinutes = (deadline - departureAt) / 60000;
  const availableWindowMinutes = Math.max(windowMinutes - input.marginMinutes, 0);

  if (input.routeEvidenceStatus !== "fresh") {
    return {
      status: "unknown",
      radiusKm: 0,
      availableWindowMinutes,
      center: input.origin,
      reasons: ["Required route evidence is not fresh enough to compute a reachability zone."],
    };
  }

  const oneWayBudgetMinutes = availableWindowMinutes / 2;
  const radiusKm = (oneWayBudgetMinutes / 60) * input.speedKmh;

  return {
    status: availableWindowMinutes > 0 ? "safe" : "tight",
    radiusKm,
    availableWindowMinutes,
    center: input.origin,
    reasons: [
      "Radius is a deterministic round-trip estimate derived from the remaining window and margin.",
    ],
  };
}
