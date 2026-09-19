import { describe, expect, it } from "vitest";
import { createPlan, type Plan } from "../domain/plan";
import { createVehicle, type Vehicle } from "../domain/vehicles";
import {
  exportLocalState,
  importLocalState,
  type LocalState,
} from "./local-state";

const plan: Plan = createPlan({
  startsAt: "2026-09-19T10:00:00Z",
  returnDeadline: "2026-09-19T12:00:00Z",
  timeZone: "Europe/Madrid",
  returnMarginMinutes: 20,
  origin: { latitude: 40, longitude: -3, source: "manual" },
  hub: { latitude: 40, longitude: -3, source: "manual" },
  transport: { mode: "walking" },
  travelers: 1,
  budget: { minorUnits: 1000, currency: "EUR" },
});

const vehicle: Vehicle = createVehicle({
  id: "synthetic-bike",
  name: "Bicicleta sintética",
  mode: "bicycle",
});

const state: LocalState = {
  schemaVersion: 1,
  plan,
  vehicles: [vehicle],
  savedMissionIds: ["synthetic-mission"],
  activeMissionId: null,
};

describe("local state envelope", () => {
  it("round-trips validated local state", () => {
    expect(importLocalState(exportLocalState(state))).toEqual(state);
  });

  it("rejects malformed or unsupported future state without a fallback", () => {
    expect(() => importLocalState("{\"schemaVersion\":2}")).toThrow(
      "schemaVersion",
    );
    expect(() => importLocalState("{\"schemaVersion\":1,\"vehicles\":[]}")).toThrow(
      "plan",
    );
  });

  it("revalidates nested plan and vehicle records during import", () => {
    const invalid = JSON.parse(exportLocalState(state)) as Record<string, unknown>;
    invalid.plan = { ...plan, budget: { minorUnits: -1, currency: "EUR" } };

    expect(() => importLocalState(JSON.stringify(invalid))).toThrow(
      "budget.minorUnits",
    );
  });

  it("rejects oversized exports before storage", () => {
    expect(() => exportLocalState(state, { maxBytes: 10 })).toThrow("limit");
  });
});
