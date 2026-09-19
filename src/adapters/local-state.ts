import { validatePayloadSize } from "../config/security";
import { createPlan, type Plan } from "../domain/plan";
import { createVehicle, type Vehicle } from "../domain/vehicles";

export const LOCAL_STATE_SCHEMA_VERSION = 1;

export type LocalState = {
  schemaVersion: typeof LOCAL_STATE_SCHEMA_VERSION;
  plan: Plan | null;
  vehicles: Vehicle[];
  savedMissionIds: string[];
  activeMissionId: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a string`);
  }
  return value;
}

function validateState(value: unknown): LocalState {
  if (!isRecord(value)) {
    throw new TypeError("local state must be an object");
  }
  if (value.schemaVersion !== LOCAL_STATE_SCHEMA_VERSION) {
    throw new RangeError("schemaVersion is unsupported");
  }
  if (value.plan !== null && !isRecord(value.plan)) {
    throw new TypeError("plan must be an object or null");
  }
  const plan = value.plan === null ? null : createPlan(value.plan as Plan);
  if (!Array.isArray(value.vehicles)) {
    throw new TypeError("vehicles must be an array");
  }
  const vehicles = value.vehicles.map((vehicle, index) => {
    if (!isRecord(vehicle)) {
      throw new TypeError(`vehicles[${index}] must be an object`);
    }
    return createVehicle(vehicle as Vehicle);
  });
  const vehicleIds = new Set(vehicles.map((vehicle) => vehicle.id));
  if (vehicleIds.size !== vehicles.length) {
    throw new RangeError("vehicle ids must be unique");
  }
  if (
    plan &&
    plan.transport.mode !== "walking" &&
    plan.transport.vehicleId !== undefined
  ) {
    const { mode, vehicleId } = plan.transport;
    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.id === vehicleId,
    );
    if (!selectedVehicle || selectedVehicle.mode !== mode) {
      throw new RangeError(
        "selected vehicle must exist and match the transport mode",
      );
    }
  }
  if (!Array.isArray(value.savedMissionIds)) {
    throw new TypeError("savedMissionIds must be an array");
  }
  const savedMissionIds = value.savedMissionIds.map((id, index) =>
    requiredString(id, `savedMissionIds[${index}]`),
  );
  const activeMissionId =
    value.activeMissionId === null
      ? null
      : requiredString(value.activeMissionId, "activeMissionId");

  return {
    schemaVersion: LOCAL_STATE_SCHEMA_VERSION,
    plan,
    vehicles,
    savedMissionIds,
    activeMissionId,
  };
}

export function exportLocalState(
  state: LocalState,
  options: { maxBytes?: number } = {},
): string {
  const validated = validateState(state);
  const serialized = JSON.stringify(validated);
  validatePayloadSize(serialized, options.maxBytes ?? 1_000_000);
  return serialized;
}

export function importLocalState(serialized: string): LocalState {
  if (typeof serialized !== "string") {
    throw new TypeError("serialized local state must be a string");
  }
  validatePayloadSize(serialized, 1_000_000);
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new TypeError("serialized local state is invalid JSON");
  }
  return validateState(parsed);
}
