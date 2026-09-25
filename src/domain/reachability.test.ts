import { describe, expect, it } from "vitest";
import {
  estimateReachability,
  type ReachabilityInput,
} from "./reachability";

describe("reachability", () => {
  it("builds an approximate radius without claiming route-backed feasibility", () => {
    const result = estimateReachability({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      departureAt: "2026-09-19T10:00:00Z",
      deadline: "2026-09-19T12:00:00Z",
      marginMinutes: 20,
      speedKmh: 24,
      routeEvidenceStatus: "missing",
    });

    expect(result.status).toBe("approximate");
    expect(result.feasibilityStatus).toBe("unknown");
    expect(result.evidenceStatus).toBe("missing");
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

    expect(result.status).toBe("approximate");
    expect(result.feasibilityStatus).toBe("unknown");
    expect(result.radiusKm).toBeCloseTo(16, 5);
  });

  it("keeps stale or unsupported route evidence unknown without hiding the geometric estimate", () => {
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

    expect(stale.status).toBe("approximate");
    expect(stale.feasibilityStatus).toBe("unknown");
    expect(stale.evidenceStatus).toBe("stale");
    expect(stale.zone).not.toBeNull();
    expect(unsupported.status).toBe("approximate");
    expect(unsupported.feasibilityStatus).toBe("unknown");
    expect(unsupported.evidenceStatus).toBe("unsupported");
    expect(unsupported.zone).not.toBeNull();
  });

  it("does not generate a zone when the margin consumes the entire window", () => {
    const result = estimateReachability({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      departureAt: "2026-09-19T10:00:00Z",
      deadline: "2026-09-19T12:00:00Z",
      marginMinutes: 120,
      speedKmh: 24,
      routeEvidenceStatus: "missing",
    });

    expect(result.status).toBe("no-window");
    expect(result.feasibilityStatus).toBe("unknown");
    expect(result.availableWindowMinutes).toBe(0);
    expect(result.radiusKm).toBe(0);
    expect(result.zone).toBeNull();
  });

  it("omits polygons when the theoretical radius exceeds the spherical boundary limit", () => {
    const result = estimateReachability({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      departureAt: "2026-09-19T10:00:00Z",
      deadline: "2027-09-19T10:00:00Z",
      marginMinutes: 20,
      speedKmh: 40,
      routeEvidenceStatus: "missing",
    });

    expect(result.status).toBe("geospatial-limit");
    expect(result.feasibilityStatus).toBe("unknown");
    expect(result.zone).toBeNull();
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

    expect(() =>
      estimateReachability({
        origin: { latitude: 40.4168, longitude: -3.7038 },
        departureAt: "2026-09-19T10:00:00Z",
        deadline: "2026-09-19T12:00:00Z",
        marginMinutes: 20,
        speedKmh: 301,
        routeEvidenceStatus: "missing",
      }),
    ).toThrow("speedKmh");

    expect(() =>
      estimateReachability({
        origin: { latitude: 40.4168, longitude: -3.7038 },
        departureAt: "2026-09-19T10:00:00Z",
        deadline: "2026-09-19T12:00:00Z",
        marginMinutes: 20,
        speedKmh: 24,
        routeEvidenceStatus:
          "unverified" as ReachabilityInput["routeEvidenceStatus"],
      }),
    ).toThrow("routeEvidenceStatus");
  });
});
