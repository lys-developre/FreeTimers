export type VehicleMode = "walking" | "bicycle" | "car" | "motorcycle";

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type RouteCoverage = "covered" | "partial" | "unsupported" | "missing";
export type RouteEvidenceStatus = "fresh" | "stale" | "unsupported" | "missing";
export type FeasibilityEvidenceState = "fresh" | "unknown";

export type RouteRequest = {
  origin: GeoPoint;
  destination: GeoPoint;
  departureAt: string;
  vehicleMode: VehicleMode;
  requestedAt: string;
};

export type RouteResultInput = RouteRequest & {
  durationMinutes: number;
  distanceMeters: number;
  coverage: RouteCoverage;
  queriedAt: string;
  expiresAt?: string;
  provenance: string;
};

export type RouteResult = RouteResultInput & {
  status: RouteEvidenceStatus;
  evidenceForFeasibility: FeasibilityEvidenceState;
};

function parseInstant(value: string, field: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new RangeError(`${field} must be a valid timestamp`);
  }

  return timestamp;
}

function assertNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} must be a finite non-negative number`);
  }
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

function validateVehicleMode(mode: string): VehicleMode {
  if (
    mode !== "walking" &&
    mode !== "bicycle" &&
    mode !== "car" &&
    mode !== "motorcycle"
  ) {
    throw new RangeError("vehicleMode is unsupported");
  }

  return mode;
}

function normalizeStatus(
  coverage: RouteCoverage,
  expiresAt: string | undefined,
  queriedAt: number,
): RouteEvidenceStatus {
  if (coverage === "unsupported") {
    return "unsupported";
  }

  if (coverage === "missing") {
    return "missing";
  }

  if (coverage === "partial") {
    return "stale";
  }

  if (expiresAt !== undefined) {
    const expiry = parseInstant(expiresAt, "expiresAt");
    if (expiry <= queriedAt) {
      return "stale";
    }
  }

  return "fresh";
}

export function createRouteResult(
  input: RouteResultInput,
): RouteResult {
  validateGeoPoint(input.origin, "origin");
  validateGeoPoint(input.destination, "destination");
  parseInstant(input.departureAt, "departureAt");
  parseInstant(input.requestedAt, "requestedAt");
  parseInstant(input.queriedAt, "queriedAt");
  validateVehicleMode(input.vehicleMode);

  assertNonNegative(input.durationMinutes, "durationMinutes");
  assertNonNegative(input.distanceMeters, "distanceMeters");

  if (
    input.coverage !== "covered" &&
    input.coverage !== "partial" &&
    input.coverage !== "unsupported" &&
    input.coverage !== "missing"
  ) {
    throw new RangeError("coverage is unsupported");
  }

  if (typeof input.provenance !== "string" || input.provenance.trim().length === 0) {
    throw new RangeError("provenance must be a non-empty string");
  }

  const status = normalizeStatus(
    input.coverage,
    input.expiresAt,
    Date.parse(input.queriedAt),
  );

  return {
    ...input,
    status,
    evidenceForFeasibility: status === "fresh" ? "fresh" : "unknown",
  };
}
