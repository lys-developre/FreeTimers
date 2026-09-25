import { describe, expect, it } from "vitest";
import {
  defaultReachabilitySpeedKmh,
  estimatePlanReachability,
} from "./plan-reachability";
import { createPlan } from "../domain/plan";
import { createVehicle } from "../domain/vehicles";

const plan = createPlan({
  startsAt: "2026-09-19T10:00:00Z",
  returnDeadline: "2026-09-19T12:00:00Z",
  timeZone: "Europe/Madrid",
  returnMarginMinutes: 20,
  reachabilitySpeedKmh: 24,
  origin: {
    latitude: 40.4168,
    longitude: -3.7038,
    source: "manual",
  },
  hub: {
    latitude: 40.4168,
    longitude: -3.7038,
    source: "manual",
  },
  transport: { mode: "car", vehicleId: "synthetic-car" },
  travelers: 1,
  budget: { minorUnits: 10000, currency: "EUR" },
});

describe("plan reachability", () => {
  it("provides documented editable starting speeds for each transport mode", () => {
    expect(defaultReachabilitySpeedKmh("walking")).toBe(4.5);
    expect(defaultReachabilitySpeedKmh("bicycle")).toBe(15);
    expect(defaultReachabilitySpeedKmh("car")).toBe(40);
    expect(defaultReachabilitySpeedKmh("motorcycle")).toBe(40);
  });

  it("maps the validated plan and selected vehicle into an explicitly approximate estimate", () => {
    const vehicle = createVehicle({
      id: "synthetic-car",
      name: "Coche sintético",
      mode: "car",
      energy: {
        kind: "fuel",
        unit: "liter",
        consumptionPer100Km: 6.5,
        costPerUnitMinor: 175,
        currency: "EUR",
      },
      usableRangeKm: 30,
    });

    const result = estimatePlanReachability(plan, vehicle);

    expect(result.status).toBe("approximate");
    expect(result.feasibilityStatus).toBe("unknown");
    expect(result.evidenceStatus).toBe("missing");
    expect(result.center).toEqual({
      latitude: plan.origin.latitude,
      longitude: plan.origin.longitude,
    });
    expect(result.availableWindowMinutes).toBe(100);
    expect(result.radiusKm).toBeCloseTo(20, 5);
    expect(result.radiusKm).toBeGreaterThan((vehicle.usableRangeKm ?? 0) / 2);
    expect(result.zone).not.toBeNull();
  });

  it("rejects a vehicle that does not match the configured plan selection", () => {
    const wrongVehicle = createVehicle({
      id: "synthetic-bicycle",
      name: "Bicicleta sintética",
      mode: "bicycle",
    });

    expect(() =>
      estimatePlanReachability(plan, wrongVehicle),
    ).toThrow("selected vehicle");
  });

  it("uses documented mode defaults when older plans have no speed assumption", () => {
    const legacyPlan = createPlan({
      ...plan,
      reachabilitySpeedKmh: undefined,
    });
    const vehicle = createVehicle({
      id: "synthetic-car",
      name: "Coche sintético",
      mode: "car",
      energy: {
        kind: "fuel",
        unit: "liter",
        consumptionPer100Km: 6.5,
        costPerUnitMinor: 175,
        currency: "EUR",
      },
      usableRangeKm: 300,
    });

    expect(estimatePlanReachability(legacyPlan, vehicle).radiusKm).toBeCloseTo(
      (100 / 120) * 40,
      5,
    );
  });
});
