export type MissionKind = "active" | "secondary";

export type TimeWindow = {
  startsAt: string;
  endsAt: string;
  availableMinutes: number;
};

export type Mission = {
  id: string;
  title: string;
  summary: string;
  durationMinutes: number;
  distanceKm: number;
  estimatedCost: number;
  tags: string[];
  kind?: MissionKind;
};

export type ScoredMission = Mission & {
  score: number;
  reasons: string[];
};

export function createTimeWindow(
  startsAt: string,
  endsAt: string,
): TimeWindow {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const availableMinutes = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 60000),
  );

  return { startsAt, endsAt, availableMinutes };
}

export function scoreMission(
  mission: Mission,
  window: TimeWindow,
  preferences: { budget: number; tags: string[] },
): ScoredMission | null {
  if (mission.durationMinutes > window.availableMinutes) return null;
  if (mission.estimatedCost > preferences.budget) return null;

  const matchingTags = mission.tags.filter((tag) =>
    preferences.tags.includes(tag),
  );
  const score = Math.min(
    100,
    50 +
      matchingTags.length * 15 +
      (mission.durationMinutes <= window.availableMinutes * 0.75 ? 10 : 0),
  );

  return {
    ...mission,
    score,
    reasons: [
      `${mission.durationMinutes} min dentro de tu ventana`,
      `${mission.estimatedCost} € dentro de tu presupuesto`,
      matchingTags.length > 0
        ? `Conecta con ${matchingTags.join(", ")}`
        : "Una propuesta para descubrir algo nuevo",
    ],
  };
}

export function rankMissions(
  missions: Mission[],
  window: TimeWindow,
  preferences: { budget: number; tags: string[] },
): ScoredMission[] {
  return missions
    .map((mission) => scoreMission(mission, window, preferences))
    .filter((mission): mission is ScoredMission => mission !== null)
    .sort((a, b) => b.score - a.score);
}
