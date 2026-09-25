import { describe, expect, it } from "vitest";
import { estimateReachability } from "./reachability";

describe("reachability", () => {
  it("builds a round-trip radius from the remaining time window and travel speed", () => {
    const result = estimateReachability({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      departureAt: "2026-09-19T10:00:00Z",
      deadline: "2026-09-19T12:00:00Z",
      marginMinutes: 20,
      speedKmh: 24,
      routeEvidenceStatus: "fresh",
    });

    expect(result.status).toBe("safe");
    expect(result.radiusKm).toBeCloseTo(20, 5);
    expect(result.availableWindowMinutes).toBe(100);
    expect(result.zone?.points.length).toBe(32);
  });

  it("shrinks the round-trip radius when the reserve margin consumes part of the window", () => {
    const result = estimateReachability({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      departureAt: "2026-09-19T10:00:00Z",
      deadline: "2026-09-19T12:00:00Z",
      marginMinutes: 40,
      speedKmh: 24,
      routeEvidenceStatus: "fresh",
    });

    expect(result.status).toBe("safe");
    expect(result.radiusKm).toBeCloseTo(16, 5);
  });

  it("returns unknown when the route evidence is stale or unsupported", () => {
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

    expect(stale.status).toBe("unknown");
    expect(unsupported.status).toBe("unknown");
  });

  it("rejects invalid geolocation or a non-positive speed", () => {
    expect(() =>
      estimateReachability({
        origin: { latitude: 91, longitude: -3.7038 },
        departureAt: "2026-09-19T10:00:00Z",
        deadline: "2026-09-19T12:00:00Z",
        marginMinutes: 20,
        speedKmh: 24,
        routeEvidenceStatus: "fresh",
      }),
    ).toThrow("latitude");

    expect(() =>
      estimateReachability({
        origin: { latitude: 40.4168, longitude: -3.7038 },
        departureAt: "2026-09-19T10:00:00Z",
        deadline: "2026-09-19T12:00:00Z",
        marginMinutes: 20,
        speedKmh: 0,
        routeEvidenceStatus: "fresh",
      }),
    ).toThrow("speedKmh");
  });
});
