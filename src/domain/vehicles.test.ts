import { describe, expect, it } from "vitest";
import { createVehicle, estimateVehicleCost, type VehicleInput } from "./vehicles";

const carEnergy = {
  kind: "fuel" as const,
  unit: "liter" as const,
  consumptionPer100Km: 6.5,
  costPerUnitMinor: 175,
  currency: "EUR",
};

const car: VehicleInput = {
  id: "synthetic-car",
  name: "Coche sintético",
  mode: "car",
  energy: carEnergy,
  usableRangeKm: 650,
};

describe("vehicle domain", () => {
  it("accepts a validated motor vehicle", () => {
    expect(createVehicle(car)).toEqual(car);
  });

  it("estimates round-trip energy cost in integer minor units", () => {
    expect(estimateVehicleCost(car, 100)).toEqual({
      minorUnits: 1138,
      currency: "EUR",
    });
  });

  it("rejects invalid consumption, range, and cost assumptions", () => {
    expect(() =>
      createVehicle({
        ...car,
        energy: { ...carEnergy, consumptionPer100Km: 0 },
      }),
    ).toThrow("consumptionPer100Km");
    expect(() =>
      createVehicle({ ...car, usableRangeKm: -1 }),
    ).toThrow("usableRangeKm");
    expect(() =>
      createVehicle({
        ...car,
        energy: { ...carEnergy, costPerUnitMinor: 10.5 },
      }),
    ).toThrow("costPerUnitMinor");
  });

  it("rejects electric vehicles with fuel units and motor vehicles without energy data", () => {
    expect(() =>
      createVehicle({
        ...car,
        energy: { ...carEnergy, kind: "electric", unit: "liter" },
      }),
    ).toThrow("unit");
    expect(() =>
      createVehicle({
        ...car,
        energy: undefined,
      }),
    ).toThrow("energy");
  });

  it("returns unknown cost when a distance exceeds usable range", () => {
    expect(estimateVehicleCost(car, 700)).toBeNull();
  });

  it("supports bicycles without fuel or energy assumptions", () => {
    const bicycle: VehicleInput = {
      id: "synthetic-bike",
      name: "Bicicleta sintética",
      mode: "bicycle",
    };

    expect(createVehicle(bicycle)).toEqual(bicycle);
    expect(estimateVehicleCost(bicycle, 20)).toBeNull();
  });
});
