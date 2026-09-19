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

function assertNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} must be finite and non-negative`);
  }
}

function validateLocation(location: PlanLocation, field: string): void {
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
