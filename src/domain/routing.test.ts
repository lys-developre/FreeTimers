import { describe, expect, it } from "vitest";
import { createRouteResult, type RouteRequest } from "./routing";

const baseRequest: RouteRequest = {
  origin: { latitude: 40.4168, longitude: -3.7038 },
  destination: { latitude: 40.418, longitude: -3.7005 },
  departureAt: "2026-09-19T10:00:00Z",
  vehicleMode: "walking",
  requestedAt: "2026-09-19T09:57:00Z",
};

describe("routing contract", () => {
  it("accepts a fresh covered route result and preserves its provenance", () => {
    const result = createRouteResult({
      ...baseRequest,
      durationMinutes: 12,
      distanceMeters: 850,
      coverage: "covered",
      queriedAt: "2026-09-19T09:58:00Z",
      expiresAt: "2026-09-19T10:30:00Z",
      provenance: "synthetic fixture",
    });

    expect(result.status).toBe("fresh");
    expect(result.coverage).toBe("covered");
    expect(result.durationMinutes).toBe(12);
    expect(result.provenance).toBe("synthetic fixture");
  });

  it("marks unsupported or missing coverage as unknown to feasibility", () => {
    const unsupported = createRouteResult({
      ...baseRequest,
      durationMinutes: 12,
      distanceMeters: 850,
      coverage: "unsupported",
      queriedAt: "2026-09-19T09:58:00Z",
      provenance: "synthetic fixture",
    });

    const missing = createRouteResult({
      ...baseRequest,
      durationMinutes: 12,
      distanceMeters: 850,
      coverage: "missing",
      queriedAt: "2026-09-19T09:58:00Z",
      provenance: "synthetic fixture",
    });

    expect(unsupported.status).toBe("unsupported");
    expect(missing.status).toBe("missing");
    expect(unsupported.evidenceForFeasibility).toBe("unknown");
    expect(missing.evidenceForFeasibility).toBe("unknown");
  });

  it("marks stale results by expiry and invalidates them before they reach feasibility", () => {
    const result = createRouteResult({
      ...baseRequest,
      durationMinutes: 12,
      distanceMeters: 850,
      coverage: "covered",
      queriedAt: "2026-09-19T10:00:00Z",
      expiresAt: "2026-09-19T09:30:00Z",
      provenance: "synthetic fixture",
    });

    expect(result.status).toBe("stale");
    expect(result.evidenceForFeasibility).toBe("unknown");
  });

  it("rejects invalid coordinates and impossible route dimensions", () => {
    expect(() =>
      createRouteResult({
        ...baseRequest,
        origin: { latitude: 91, longitude: -3.7038 },
        durationMinutes: 12,
        distanceMeters: 850,
        coverage: "covered",
        queriedAt: "2026-09-19T09:58:00Z",
        provenance: "synthetic fixture",
      }),
    ).toThrow("origin.latitude");

    expect(() =>
      createRouteResult({
        ...baseRequest,
        durationMinutes: -1,
        distanceMeters: 850,
        coverage: "covered",
        queriedAt: "2026-09-19T09:58:00Z",
        provenance: "synthetic fixture",
      }),
    ).toThrow("durationMinutes");
  });
});
