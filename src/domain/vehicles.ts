import type { Money } from "./plan";

export type VehicleMode = "car" | "motorcycle" | "bicycle";
export type EnergyKind = "fuel" | "electric";
export type EnergyUnit = "liter" | "kWh";

export type VehicleEnergy = {
  kind: EnergyKind;
  unit: EnergyUnit;
  consumptionPer100Km: number;
  costPerUnitMinor: number;
  currency: string;
};

export type VehicleInput = {
  id: string;
  name: string;
  mode: VehicleMode;
  energy?: VehicleEnergy;
  usableRangeKm?: number;
};

export type Vehicle = VehicleInput;

function assertPositive(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${field} must be finite and positive`);
  }
}

function validateEnergy(energy: VehicleEnergy | undefined, mode: VehicleMode) {
  if (energy === undefined) {
    if (mode === "bicycle") return;
    throw new RangeError("energy is required for motor vehicles");
  }

  if (energy.kind !== "fuel" && energy.kind !== "electric") {
    throw new RangeError("energy.kind is unsupported");
  }
  const expectedUnit = energy.kind === "fuel" ? "liter" : "kWh";
  if (energy.unit !== expectedUnit) {
    throw new RangeError("energy.unit does not match energy.kind");
  }
  assertPositive(energy.consumptionPer100Km, "consumptionPer100Km");
  if (!Number.isSafeInteger(energy.costPerUnitMinor) || energy.costPerUnitMinor < 0) {
    throw new RangeError("costPerUnitMinor must be a non-negative safe integer");
  }
  if (!/^[A-Z]{3}$/.test(energy.currency)) {
    throw new RangeError("energy.currency must be an ISO currency code");
  }
}

export function createVehicle(input: VehicleInput): Vehicle {
  if (
    input.mode !== "car" &&
    input.mode !== "motorcycle" &&
    input.mode !== "bicycle"
  ) {
    throw new RangeError("mode is unsupported");
  }
  if (input.id.trim().length === 0) {
    throw new RangeError("id is required");
  }
  if (input.name.trim().length === 0) {
    throw new RangeError("name is required");
  }
  validateEnergy(input.energy, input.mode);
  if (input.usableRangeKm !== undefined) {
    assertPositive(input.usableRangeKm, "usableRangeKm");
  }
  return input;
}

export function estimateVehicleCost(
  vehicle: VehicleInput,
  distanceKm: number,
): Money | null {
  createVehicle(vehicle);
  assertPositive(distanceKm, "distanceKm");

  if (!vehicle.energy || vehicle.usableRangeKm === undefined) {
    return null;
  }
  if (distanceKm > vehicle.usableRangeKm) {
    return null;
  }

  const units = (distanceKm / 100) * vehicle.energy.consumptionPer100Km;
  return {
    minorUnits: Math.ceil(units * vehicle.energy.costPerUnitMinor),
    currency: vehicle.energy.currency,
  };
}
