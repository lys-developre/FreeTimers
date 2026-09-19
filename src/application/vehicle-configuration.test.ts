import { describe, expect, it } from "vitest";
import { createConfiguredVehicle } from "./vehicle-configuration";

const motorDraft = {
  id: "synthetic-primary",
  name: "Vehículo sintético",
  energyKind: "fuel" as const,
  consumptionPer100Km: "6.5",
  costPerUnit: "1.75",
  usableRangeKm: "650",
};

describe("vehicle form configuration", () => {
  it("creates a motor vehicle using explicit energy units and minor money units", () => {
    expect(createConfiguredVehicle("car", motorDraft)).toEqual({
      id: "synthetic-primary",
      name: "Vehículo sintético",
      mode: "car",
      energy: {
        kind: "fuel",
        unit: "liter",
        consumptionPer100Km: 6.5,
        costPerUnitMinor: 175,
        currency: "EUR",
      },
      usableRangeKm: 650,
    });
  });

  it("creates a bicycle without inventing energy assumptions", () => {
    expect(createConfiguredVehicle("bicycle", motorDraft)).toEqual({
      id: "synthetic-primary",
      name: "Vehículo sintético",
      mode: "bicycle",
    });
  });

  it("does not create a vehicle for walking", () => {
    expect(createConfiguredVehicle("walking", motorDraft)).toBeNull();
  });

  it("rejects incomplete and over-precise motor cost data", () => {
    expect(() =>
      createConfiguredVehicle("motorcycle", {
        ...motorDraft,
        consumptionPer100Km: "",
      }),
    ).toThrow("consumptionPer100Km");
    expect(() =>
      createConfiguredVehicle("motorcycle", {
        ...motorDraft,
        costPerUnit: "1.755",
      }),
    ).toThrow("costPerUnit");
  });
});
