import { describe, expect, it } from "vitest";
import { estimateReachability } from "../domain/reachability";
import { reachabilityToMapOverlay } from "./reachability-map";

describe("reachability map overlay", () => {
  it("builds an explicitly approximate overlay that never implies feasibility", () => {
    const result = estimateReachability({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      departureAt: "2026-09-19T10:00:00Z",
      deadline: "2026-09-19T12:00:00Z",
      marginMinutes: 20,
      speedKmh: 24,
      routeEvidenceStatus: "missing",
    });

    const overlay = reachabilityToMapOverlay(result);

    expect(overlay).not.toBeNull();
    expect(overlay?.status).toBe("approximate");
    expect(overlay?.feasibilityStatus).toBe("unknown");
    expect(overlay?.visible).toBe(true);
    expect(overlay?.coverage).toBe("approximate");
    expect(overlay?.evidenceStatus).toBe("missing");
    expect(overlay?.polygon).toEqual(result.zone?.points);
    expect(overlay?.bounds).toEqual(result.zone?.bounds);
  });

  it("keeps approximate geometry available while preserving stale or unsupported evidence states", () => {
    const stale = estimateReachability({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      departureAt: "2026-09-19T10:00:00Z",
      deadline: "2026-09-19T12:00:00Z",
      marginMinutes: 20,
      speedKmh: 24,
      routeEvidenceStatus: "stale",
    });

    const unsupported = estimateReachability({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      departureAt: "2026-09-19T10:00:00Z",
      deadline: "2026-09-19T12:00:00Z",
      marginMinutes: 20,
      speedKmh: 24,
      routeEvidenceStatus: "unsupported",
    });

    expect(reachabilityToMapOverlay(stale)?.status).toBe("approximate");
    expect(reachabilityToMapOverlay(stale)?.feasibilityStatus).toBe("unknown");
    expect(reachabilityToMapOverlay(stale)?.evidenceStatus).toBe("stale");
    expect(reachabilityToMapOverlay(unsupported)?.status).toBe("approximate");
    expect(reachabilityToMapOverlay(unsupported)?.feasibilityStatus).toBe(
      "unknown",
    );
    expect(reachabilityToMapOverlay(unsupported)?.evidenceStatus).toBe(
      "unsupported",
    );
  });

  it("omits map geometry when the configured margin leaves no travel window", () => {
    const result = estimateReachability({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      departureAt: "2026-09-19T10:00:00Z",
      deadline: "2026-09-19T12:00:00Z",
      marginMinutes: 120,
      speedKmh: 24,
      routeEvidenceStatus: "missing",
    });

    expect(reachabilityToMapOverlay(result)).toBeNull();
  });
});
