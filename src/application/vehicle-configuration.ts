import { createVehicle, type EnergyKind, type Vehicle } from "../domain/vehicles";
import type { Transport } from "../domain/plan";

export type VehicleDraft = {
  id: string;
  name: string;
  energyKind: EnergyKind;
  consumptionPer100Km: string;
  costPerUnit: string;
  usableRangeKm: string;
};

function requiredPositiveNumber(value: string, field: string): number {
  if (value.trim().length === 0) {
    throw new RangeError(`${field} is required`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new RangeError(`${field} must be finite and positive`);
  }
  return parsed;
}

function eurosToMinorUnits(value: string): number {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) {
    throw new RangeError("costPerUnit must have at most two decimals");
  }
  const minorUnits = Number(value.replace(",", ".")) * 100;
  if (!Number.isSafeInteger(minorUnits)) {
    throw new RangeError("costPerUnit is outside the supported range");
  }
  return minorUnits;
}

export function createConfiguredVehicle(
  mode: Transport["mode"],
  draft: VehicleDraft,
): Vehicle | null {
  if (mode === "walking") {
    return null;
  }
  if (mode === "bicycle") {
    return createVehicle({
      id: draft.id,
      name: draft.name,
      mode,
    });
  }

  return createVehicle({
    id: draft.id,
    name: draft.name,
    mode,
    energy: {
      kind: draft.energyKind,
      unit: draft.energyKind === "fuel" ? "liter" : "kWh",
      consumptionPer100Km: requiredPositiveNumber(
        draft.consumptionPer100Km,
        "consumptionPer100Km",
      ),
      costPerUnitMinor: eurosToMinorUnits(draft.costPerUnit),
      currency: "EUR",
    },
    usableRangeKm: requiredPositiveNumber(
      draft.usableRangeKm,
      "usableRangeKm",
    ),
  });
}
