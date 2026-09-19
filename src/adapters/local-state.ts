import { validatePayloadSize } from "../config/security";
import {
  parseActiveMission,
  type ActiveMission,
} from "../domain/active-mission";
import { parsePlan, type Plan } from "../domain/plan";
import { createVehicle, type Vehicle } from "../domain/vehicles";

export const LOCAL_STATE_SCHEMA_VERSION = 2;

export type LocalState = {
  schemaVersion: typeof LOCAL_STATE_SCHEMA_VERSION;
  plan: Plan | null;
  vehicles: Vehicle[];
  savedMissionIds: string[];
  activeMission: ActiveMission | null;
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

function validateVehicleReference(plan: Plan, vehicles: Vehicle[]): void {
  if (
    plan.transport.mode === "walking" ||
    plan.transport.vehicleId === undefined
  ) {
    return;
  }
  const { mode, vehicleId } = plan.transport;
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);
  if (!selectedVehicle || selectedVehicle.mode !== mode) {
    throw new RangeError(
      "selected vehicle must exist and match the transport mode",
    );
  }
}

function validateState(value: unknown): LocalState {
  if (!isRecord(value)) {
    throw new TypeError("local state must be an object");
  }
  let state: Record<string, unknown> = value;
  if (state.schemaVersion === 1) {
    state = {
      ...state,
      schemaVersion: LOCAL_STATE_SCHEMA_VERSION,
      activeMission: null,
    };
  }
  if (state.schemaVersion !== LOCAL_STATE_SCHEMA_VERSION) {
    throw new RangeError("schemaVersion is unsupported");
  }
  if (state.plan !== null && !isRecord(state.plan)) {
    throw new TypeError("plan must be an object or null");
  }
  const plan = state.plan === null ? null : parsePlan(state.plan);
  if (!Array.isArray(state.vehicles)) {
    throw new TypeError("vehicles must be an array");
  }
  const vehicles = state.vehicles.map((vehicle, index) => {
    if (!isRecord(vehicle)) {
      throw new TypeError(`vehicles[${index}] must be an object`);
    }
    return createVehicle(vehicle as Vehicle);
  });
  const vehicleIds = new Set(vehicles.map((vehicle) => vehicle.id));
  if (vehicleIds.size !== vehicles.length) {
    throw new RangeError("vehicle ids must be unique");
  }
  if (plan) {
    validateVehicleReference(plan, vehicles);
  }
  if (!Array.isArray(state.savedMissionIds)) {
    throw new TypeError("savedMissionIds must be an array");
  }
  const savedMissionIds = state.savedMissionIds.map((id, index) =>
    requiredString(id, `savedMissionIds[${index}]`),
  );
  if (state.activeMission !== null && !isRecord(state.activeMission)) {
    throw new TypeError("activeMission must be an object or null");
  }
  const activeMission =
    state.activeMission === null
      ? null
      : parseActiveMission(state.activeMission);
  if (activeMission) {
    validateVehicleReference(activeMission.plan, vehicles);
  }

  return {
    schemaVersion: LOCAL_STATE_SCHEMA_VERSION,
    plan,
    vehicles,
    savedMissionIds,
    activeMission,
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
