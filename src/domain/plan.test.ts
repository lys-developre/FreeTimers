import { describe, expect, it } from "vitest";
import { createPlan, type PlanInput } from "./plan";

const validPlan: PlanInput = {
  startsAt: "2026-09-19T10:00:00Z",
  returnDeadline: "2026-09-19T12:00:00Z",
  timeZone: "Europe/Madrid",
  returnMarginMinutes: 20,
  origin: {
    latitude: 40.4168,
    longitude: -3.7038,
    source: "manual",
    label: "Punto de partida sintético",
  },
  hub: {
    latitude: 40.4168,
    longitude: -3.7038,
    source: "manual",
    label: "Hub sintético",
  },
  transport: { mode: "car", vehicleId: "synthetic-car" },
  travelers: 2,
  budget: { minorUnits: 5000, currency: "EUR" },
};

describe("createPlan", () => {
  it("accepts a valid plan and preserves named units", () => {
    expect(createPlan(validPlan)).toEqual(validPlan);
  });

  it("rejects a deadline that is not after the start", () => {
    expect(() =>
      createPlan({
        ...validPlan,
        returnDeadline: validPlan.startsAt,
      }),
    ).toThrow("returnDeadline");
  });

  it("rejects a margin equal to or longer than the time window", () => {
    expect(() =>
      createPlan({
        ...validPlan,
        returnMarginMinutes: 120,
      }),
    ).toThrow("returnMarginMinutes");
  });

  it("rejects invalid coordinates and non-positive travelers", () => {
    expect(() =>
      createPlan({
        ...validPlan,
        origin: { ...validPlan.origin, latitude: 91 },
      }),
    ).toThrow("origin.latitude");

    expect(() =>
      createPlan({
        ...validPlan,
        travelers: 0,
      }),
    ).toThrow("travelers");
  });

  it("rejects malformed money and an invalid timezone", () => {
    expect(() =>
      createPlan({
        ...validPlan,
        budget: { minorUnits: 10.5, currency: "EUR" },
      }),
    ).toThrow("budget.minorUnits");

    expect(() =>
      createPlan({
        ...validPlan,
        timeZone: "Mars/Olympus",
      }),
    ).toThrow("timeZone");
  });

  it("requires a vehicle reference for private motor transport", () => {
    expect(() =>
      createPlan({
        ...validPlan,
        transport: { mode: "motorcycle" },
      }),
    ).toThrow("vehicleId");
  });
});
