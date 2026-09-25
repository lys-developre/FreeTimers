import { MAX_REACHABILITY_SPEED_KMH } from "./reachability";

export type LocationSource = "gps" | "manual" | "geocoded";

export type PlanLocation = {
  latitude: number;
  longitude: number;
  source: LocationSource;
  label?: string;
  accuracyMeters?: number;
  observedAt?: string;
};

export type Transport =
  | { mode: "walking" }
  | { mode: "bicycle"; vehicleId?: string }
  | { mode: "car" | "motorcycle"; vehicleId?: string };

export type Money = {
  minorUnits: number;
  currency: string;
};

export type PlanInput = {
  startsAt: string;
  returnDeadline: string;
  timeZone: string;
  returnMarginMinutes: number;
  reachabilitySpeedKmh?: number;
  origin: PlanLocation;
  hub: PlanLocation;
  transport: Transport;
  travelers: number;
  budget: Money;
};

export type Plan = PlanInput;

function parseInstant(value: string, field: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new RangeError(`${field} must be a valid timestamp`);
  }
  return timestamp;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown, field: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new TypeError(`${field} must be an object`);
  }
  return value;
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a string`);
  }
  return value;
}

function numberValue(value: unknown, field: string): number {
  if (typeof value !== "number") {
    throw new TypeError(`${field} must be a number`);
  }
  return value;
}

function locationSource(value: unknown, field: string): LocationSource {
  if (value !== "gps" && value !== "manual" && value !== "geocoded") {
    throw new RangeError(`${field} is unsupported`);
  }
  return value;
}

function assertNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} must be finite and non-negative`);
  }
}

function validateLocation(location: PlanLocation, field: string): void {
  if (
    location.source !== "gps" &&
    location.source !== "manual" &&
    location.source !== "geocoded"
  ) {
    throw new RangeError(`${field}.source is unsupported`);
  }
  if (
    !Number.isFinite(location.latitude) ||
    location.latitude < -90 ||
    location.latitude > 90
  ) {
    throw new RangeError(`${field}.latitude is invalid`);
  }
  if (
    !Number.isFinite(location.longitude) ||
    location.longitude < -180 ||
    location.longitude > 180
  ) {
    throw new RangeError(`${field}.longitude is invalid`);
  }
  if (
    location.accuracyMeters !== undefined &&
    (!Number.isFinite(location.accuracyMeters) ||
      location.accuracyMeters < 0)
  ) {
    throw new RangeError(`${field}.accuracyMeters is invalid`);
  }
  if (location.observedAt !== undefined) {
    parseInstant(location.observedAt, `${field}.observedAt`);
  }
}

function validateTimeZone(timeZone: string): void {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
  } catch {
    throw new RangeError("timeZone is invalid");
  }
}

function validateTransport(transport: Transport): void {
  if (
    transport.mode !== "walking" &&
    transport.mode !== "bicycle" &&
    transport.mode !== "car" &&
    transport.mode !== "motorcycle"
  ) {
    throw new RangeError("transport.mode is unsupported");
  }
  if (
    (transport.mode === "car" || transport.mode === "motorcycle") &&
    (!transport.vehicleId || transport.vehicleId.trim().length === 0)
  ) {
    throw new RangeError("transport.vehicleId is required");
  }
}

function validateMoney(money: Money): void {
  if (!Number.isSafeInteger(money.minorUnits) || money.minorUnits < 0) {
    throw new RangeError("budget.minorUnits must be a non-negative safe integer");
  }
  if (!/^[A-Z]{3}$/.test(money.currency)) {
    throw new RangeError("budget.currency must be an ISO currency code");
  }
}

export function createPlan(input: PlanInput): Plan {
  const startsAt = parseInstant(input.startsAt, "startsAt");
  const returnDeadline = parseInstant(
    input.returnDeadline,
    "returnDeadline",
  );
  const windowMinutes = (returnDeadline - startsAt) / 60000;
  if (windowMinutes <= 0) {
    throw new RangeError("returnDeadline must be after startsAt");
  }

  assertNonNegative(input.returnMarginMinutes, "returnMarginMinutes");
  if (
    input.reachabilitySpeedKmh !== undefined &&
    (!Number.isFinite(input.reachabilitySpeedKmh) ||
      input.reachabilitySpeedKmh <= 0 ||
      input.reachabilitySpeedKmh > MAX_REACHABILITY_SPEED_KMH)
  ) {
    throw new RangeError(
      `reachabilitySpeedKmh must be finite, positive, and no greater than ${MAX_REACHABILITY_SPEED_KMH}`,
    );
  }
  if (input.returnMarginMinutes >= windowMinutes) {
    throw new RangeError(
      "returnMarginMinutes must be shorter than the time window",
    );
  }
  if (!Number.isSafeInteger(input.travelers) || input.travelers <= 0) {
    throw new RangeError("travelers must be a positive safe integer");
  }

  validateTimeZone(input.timeZone);
  validateLocation(input.origin, "origin");
  validateLocation(input.hub, "hub");
  validateTransport(input.transport);
  validateMoney(input.budget);

  return input;
}

function parseLocation(value: unknown, field: string): PlanLocation {
  const location = record(value, field);
  return {
    latitude: numberValue(location.latitude, `${field}.latitude`),
    longitude: numberValue(location.longitude, `${field}.longitude`),
    source: locationSource(location.source, `${field}.source`),
    ...(location.label === undefined
      ? {}
      : { label: stringValue(location.label, `${field}.label`) }),
    ...(location.accuracyMeters === undefined
      ? {}
      : {
          accuracyMeters: numberValue(
            location.accuracyMeters,
            `${field}.accuracyMeters`,
          ),
        }),
    ...(location.observedAt === undefined
      ? {}
      : {
          observedAt: stringValue(location.observedAt, `${field}.observedAt`),
        }),
  };
}

function parseTransport(value: unknown): Transport {
  const transport = record(value, "transport");
  const mode = stringValue(transport.mode, "transport.mode");
  if (mode === "walking") {
    return { mode };
  }
  if (mode === "bicycle" || mode === "car" || mode === "motorcycle") {
    return {
      mode,
      ...(transport.vehicleId === undefined
        ? {}
        : {
            vehicleId: stringValue(
              transport.vehicleId,
              "transport.vehicleId",
            ),
          }),
    };
  }
  throw new RangeError("transport.mode is unsupported");
}

export function parsePlan(value: unknown): Plan {
  const plan = record(value, "plan");
  const budget = record(plan.budget, "budget");
  return createPlan({
    startsAt: stringValue(plan.startsAt, "startsAt"),
    returnDeadline: stringValue(plan.returnDeadline, "returnDeadline"),
    timeZone: stringValue(plan.timeZone, "timeZone"),
    returnMarginMinutes: numberValue(
      plan.returnMarginMinutes,
      "returnMarginMinutes",
    ),
    ...(plan.reachabilitySpeedKmh === undefined
      ? {}
      : {
          reachabilitySpeedKmh: numberValue(
            plan.reachabilitySpeedKmh,
            "reachabilitySpeedKmh",
          ),
        }),
    origin: parseLocation(plan.origin, "origin"),
    hub: parseLocation(plan.hub, "hub"),
    transport: parseTransport(plan.transport),
    travelers: numberValue(plan.travelers, "travelers"),
    budget: {
      minorUnits: numberValue(budget.minorUnits, "budget.minorUnits"),
      currency: stringValue(budget.currency, "budget.currency"),
    },
  });
}
