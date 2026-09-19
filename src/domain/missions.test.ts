import { describe, expect, it } from "vitest";
import {
  createTimeWindow,
  rankMissions,
  scoreMission,
  type Mission,
} from "./missions";

const rally: Mission = {
  id: "rally-granada",
  title: "Rally + carretera panorámica",
  summary: "Una prueba local y una ruta con vistas.",
  durationMinutes: 480,
  distanceKm: 90,
  estimatedCost: 55,
  location: { latitude: 40.01, longitude: -3.01 },
  tags: ["motor", "carretera"],
};

describe("mission recommendations", () => {
  it("calculates the available minutes from a real time window", () => {
    expect(
      createTimeWindow("2026-09-19T17:00:00+02:00", "2026-09-20T05:00:00+02:00")
        .availableMinutes,
    ).toBe(720);
  });

  it("rejects a mission that does not fit the available time", () => {
    const window = createTimeWindow(
      "2026-09-19T17:00:00+02:00",
      "2026-09-19T20:00:00+02:00",
    );

    expect(scoreMission(rally, window, { budget: 100, tags: ["motor"] })).toBe(
      null,
    );
  });

  it("rejects a mission over budget", () => {
    const window = createTimeWindow(
      "2026-09-19T17:00:00+02:00",
      "2026-09-20T05:00:00+02:00",
    );

    expect(scoreMission(rally, window, { budget: 40, tags: ["motor"] })).toBe(
      null,
    );
  });

  it("ranks compatible missions by affinity", () => {
    const window = createTimeWindow(
      "2026-09-19T17:00:00+02:00",
      "2026-09-20T05:00:00+02:00",
    );
    const result = rankMissions(
      [
        rally,
        {
          ...rally,
          id: "nature",
          title: "Cielo oscuro",
          tags: ["naturaleza"],
        },
      ],
      window,
      { budget: 100, tags: ["motor"] },
    );

    expect(result.map((mission) => mission.id)).toEqual([
      "rally-granada",
      "nature",
    ]);
    expect(result[0].reasons).toContain("Conecta con motor");
  });
});
