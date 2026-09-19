import { describe, expect, it } from "vitest";
import { createActiveMission } from "../domain/active-mission";
import { createPlan, type Plan } from "../domain/plan";
import { createVehicle, type Vehicle } from "../domain/vehicles";
import {
  exportLocalState,
  importLocalState,
  type LocalState,
} from "./local-state";
import { loadLocalState, saveLocalState } from "./indexed-db";

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
  schemaVersion: 2,
  plan,
  vehicles: [vehicle],
  savedMissionIds: ["synthetic-mission"],
  activeMission: null,
};

const activeMission = createActiveMission({
  id: "synthetic-active-mission",
  plan,
  createdAt: "2026-09-19T09:45:00Z",
  visits: [
    {
      id: "synthetic-visit",
      title: "Visita sintética",
      location: { latitude: 40.01, longitude: -3.01 },
      recommendedDurationMinutes: 30,
    },
  ],
});

describe("local state envelope", () => {
  it("round-trips validated local state", () => {
    expect(importLocalState(exportLocalState(state))).toEqual(state);
  });

  it("round-trips a validated active mission", () => {
    const stateWithMission = { ...state, activeMission };

    expect(importLocalState(exportLocalState(stateWithMission))).toEqual(
      stateWithMission,
    );
  });

  it("rejects malformed or unsupported future state without a fallback", () => {
    expect(() => importLocalState("{\"schemaVersion\":3}")).toThrow(
      "schemaVersion",
    );
    expect(() => importLocalState("{\"schemaVersion\":2,\"vehicles\":[]}")).toThrow(
      "plan",
    );
  });

  it("migrates version one state without inventing active mission progress", () => {
    const versionOne = {
      schemaVersion: 1,
      plan,
      vehicles: [vehicle],
      savedMissionIds: ["synthetic-mission"],
      activeMissionId: "legacy-active-id",
    };

    expect(importLocalState(JSON.stringify(versionOne))).toEqual({
      schemaVersion: 2,
      plan,
      vehicles: [vehicle],
      savedMissionIds: ["synthetic-mission"],
      activeMission: null,
    });
  });

  it("revalidates nested plan and vehicle records during import", () => {
    const invalid = JSON.parse(exportLocalState(state)) as Record<string, unknown>;
    invalid.plan = { ...plan, budget: { minorUnits: -1, currency: "EUR" } };

    expect(() => importLocalState(JSON.stringify(invalid))).toThrow(
      "budget.minorUnits",
    );
  });

  it("rejects duplicate vehicle identifiers during import", () => {
    const duplicateVehicles = {
      ...state,
      vehicles: [vehicle, { ...vehicle, name: "Otra bicicleta sintética" }],
    };

    expect(() => importLocalState(JSON.stringify(duplicateVehicles))).toThrow(
      "vehicle ids",
    );
  });

  it("rejects a plan that references a missing or incompatible vehicle", () => {
    const danglingReference = {
      ...state,
      plan: {
        ...plan,
        transport: { mode: "car", vehicleId: "missing-vehicle" },
      },
    };

    expect(() => importLocalState(JSON.stringify(danglingReference))).toThrow(
      "selected vehicle",
    );
  });

  it("rejects malformed active missions and their dangling vehicle references", () => {
    const malformedStatus = {
      ...state,
      activeMission: { ...activeMission, status: "teleporting" },
    };
    expect(() => importLocalState(JSON.stringify(malformedStatus))).toThrow(
      "mission.status",
    );

    const danglingReference = {
      ...state,
      activeMission: {
        ...activeMission,
        plan: {
          ...activeMission.plan,
          transport: { mode: "car", vehicleId: "missing-vehicle" },
        },
      },
    };
    expect(() => importLocalState(JSON.stringify(danglingReference))).toThrow(
      "selected vehicle",
    );
  });

  it("rejects oversized exports before storage", () => {
    expect(() => exportLocalState(state, { maxBytes: 10 })).toThrow("limit");
  });

  it("reports unavailable browser storage instead of pretending to save", async () => {
    await expect(loadLocalState({ indexedDB: undefined })).rejects.toThrow(
      "IndexedDB is unavailable",
    );
    await expect(
      saveLocalState(state, { indexedDB: undefined }),
    ).rejects.toThrow("IndexedDB is unavailable");
  });
});
