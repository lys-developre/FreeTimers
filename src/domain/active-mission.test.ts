import { describe, expect, it } from "vitest";
import { createPlan } from "./plan";
import {
  acceptItineraryProposal,
  addChecklistItem,
  beginReturn,
  completeMission,
  confirmVisitArrival,
  confirmVisitDeparture,
  createActiveMission,
  createItineraryProposal,
  isMissionReady,
  removeChecklistItem,
  renameChecklistItem,
  setChecklistItemCompleted,
  skipVisit,
  startMission,
} from "./active-mission";

const plan = createPlan({
  startsAt: "2026-09-19T10:00:00Z",
  returnDeadline: "2026-09-19T14:00:00Z",
  timeZone: "Europe/Madrid",
  returnMarginMinutes: 20,
  origin: { latitude: 40, longitude: -3, source: "manual" },
  hub: { latitude: 40, longitude: -3, source: "manual" },
  transport: { mode: "walking" },
  travelers: 1,
  budget: { minorUnits: 5000, currency: "EUR" },
});

function missionFixture() {
  return createActiveMission({
    id: "synthetic-active-mission",
    plan,
    createdAt: "2026-09-19T09:45:00Z",
    visits: [
      {
        id: "synthetic-visit-1",
        title: "Primera visita sintética",
        location: { latitude: 40.01, longitude: -3.01 },
        recommendedDurationMinutes: 30,
      },
      {
        id: "synthetic-visit-2",
        title: "Segunda visita sintética",
        location: { latitude: 40.02, longitude: -3.02 },
        recommendedDurationMinutes: 45,
      },
    ],
    checklist: [
      {
        id: "synthetic-required-item",
        text: "Agua sintética",
        importance: "required",
        completed: false,
      },
    ],
  });
}

describe("active mission", () => {
  it("keeps immutable return constraints and starts at revision one", () => {
    const mission = missionFixture();

    expect(mission.status).toBe("preparing");
    expect(mission.revision).toBe(1);
    expect(mission.plan.hub).toEqual(plan.hub);
    expect(mission.plan.returnDeadline).toBe(plan.returnDeadline);
    expect(mission.plan.returnMarginMinutes).toBe(plan.returnMarginMinutes);
  });

  it("blocks readiness until every required checklist item is complete", () => {
    const mission = missionFixture();

    expect(isMissionReady(mission)).toBe(false);
    expect(() => startMission(mission, "2026-09-19T10:00:00Z")).toThrow(
      "required checklist",
    );

    const ready = setChecklistItemCompleted(
      mission,
      "synthetic-required-item",
      true,
    );
    expect(isMissionReady(ready)).toBe(true);
    expect(startMission(ready, "2026-09-19T10:00:00Z").status).toBe("active");
  });

  it("supports independent manual checklist items without changing visit state", () => {
    const added = addChecklistItem(missionFixture(), {
      id: "synthetic-optional-item",
      text: "Chaqueta sintética",
      importance: "optional",
    });
    const renamed = renameChecklistItem(
      added,
      "synthetic-optional-item",
      "Abrigo sintético",
    );
    const mission = removeChecklistItem(renamed, "synthetic-optional-item");

    expect(added.checklist.at(-1)).toEqual({
      id: "synthetic-optional-item",
      text: "Chaqueta sintética",
      importance: "optional",
      completed: false,
    });
    expect(renamed.checklist.at(-1)?.text).toBe("Abrigo sintético");
    expect(mission.checklist).toHaveLength(1);
    expect(mission.visits.every((visit) => visit.status === "pending")).toBe(
      true,
    );
  });

  it("records user-confirmed arrival and departure without GPS inference", () => {
    const ready = setChecklistItemCompleted(
      missionFixture(),
      "synthetic-required-item",
      true,
    );
    const active = startMission(ready, "2026-09-19T10:00:00Z");
    const arrived = confirmVisitArrival(
      active,
      "synthetic-visit-1",
      "2026-09-19T10:20:00Z",
    );
    const departed = confirmVisitDeparture(
      arrived,
      "synthetic-visit-1",
      "2026-09-19T10:55:00Z",
    );

    expect(departed.visits[0]).toMatchObject({
      status: "completed",
      arrivedAt: "2026-09-19T10:20:00.000Z",
      departedAt: "2026-09-19T10:55:00.000Z",
    });
    expect(departed.revision).toBe(active.revision + 2);
  });

  it("requires explicit confirmation operations to skip a visit and begin return", () => {
    const ready = setChecklistItemCompleted(
      missionFixture(),
      "synthetic-required-item",
      true,
    );
    const active = startMission(ready, "2026-09-19T10:00:00Z");
    const skipped = skipVisit(active, "synthetic-visit-2");
    const returning = beginReturn(skipped, "2026-09-19T11:00:00Z");

    expect(skipped.visits[1].status).toBe("skipped");
    expect(returning.status).toBe("returning");
    expect(returning.returnStartedAt).toBe("2026-09-19T11:00:00.000Z");
    expect(
      returning.visits.every((visit) =>
        visit.status === "completed" || visit.status === "skipped"
      ),
    ).toBe(true);
    expect(
      completeMission(returning, "2026-09-19T11:40:00Z").status,
    ).toBe("completed");
  });

  it("rejects itinerary proposals calculated for an obsolete revision", () => {
    const mission = missionFixture();
    const proposal = createItineraryProposal({
      id: "synthetic-proposal",
      baseRevision: mission.revision,
      visits: mission.visits.slice(0, 1),
      reasons: ["Preserva el margen sintético."],
      createdAt: "2026-09-19T10:05:00Z",
    });
    const changed = addChecklistItem(mission, {
      id: "another-item",
      text: "Elemento posterior",
      importance: "optional",
    });

    expect(() => acceptItineraryProposal(changed, proposal)).toThrow(
      "obsolete",
    );
    expect(acceptItineraryProposal(mission, proposal).visits).toHaveLength(1);
  });
});
