import { describe, expect, it } from "vitest";
import { createSyntheticRouteProvider } from "./synthetic-routing";

describe("synthetic route adapter", () => {
  it("returns a fresh covered route result for a known synthetic fixture", async () => {
    const provider = createSyntheticRouteProvider({
      now: () => new Date("2026-09-19T09:58:00Z"),
      fixtures: [
        {
          id: "central-madrid",
          origin: { latitude: 40.4168, longitude: -3.7038 },
          destination: { latitude: 40.418, longitude: -3.7005 },
          departureAt: "2026-09-19T10:00:00Z",
          vehicleMode: "walking",
          requestedAt: "2026-09-19T09:57:00Z",
          durationMinutes: 12,
          distanceMeters: 850,
          coverage: "covered",
          queriedAt: "2026-09-19T09:58:00Z",
          expiresAt: "2026-09-19T10:30:00Z",
          provenance: "synthetic fixture",
        },
      ],
    });

    const result = await provider.getRoute({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      destination: { latitude: 40.418, longitude: -3.7005 },
      departureAt: "2026-09-19T10:00:00Z",
      vehicleMode: "walking",
      requestedAt: "2026-09-19T09:57:00Z",
    });

    expect(result.status).toBe("fresh");
    expect(result.coverage).toBe("covered");
    expect(result.provenance).toBe("synthetic fixture");
  });

  it("marks unsupported areas and missing fixtures as unknown evidence", async () => {
    const provider = createSyntheticRouteProvider();
    const unsupported = await provider.getRoute({
      origin: { latitude: 40.4168, longitude: -3.7038 },
      destination: { latitude: 41.653, longitude: -4.727 },
      departureAt: "2026-09-19T10:00:00Z",
      vehicleMode: "walking",
      requestedAt: "2026-09-19T09:57:00Z",
    });

    const missing = await provider.getRoute({
      origin: { latitude: 40.0, longitude: -3.0 },
      destination: { latitude: 40.0002, longitude: -3.0003 },
      departureAt: "2026-09-19T10:00:00Z",
      vehicleMode: "car",
      requestedAt: "2026-09-19T09:57:00Z",
    });

    expect(unsupported.coverage).toBe("unsupported");
    expect(unsupported.evidenceForFeasibility).toBe("unknown");
    expect(missing.coverage).toBe("missing");
    expect(missing.evidenceForFeasibility).toBe("unknown");
  });

  it("rejects invalid route requests before driving a deterministic decision", async () => {
    const provider = createSyntheticRouteProvider();

    await expect(
      provider.getRoute({
        origin: { latitude: 91, longitude: -3.7038 },
        destination: { latitude: 40.418, longitude: -3.7005 },
        departureAt: "2026-09-19T10:00:00Z",
        vehicleMode: "walking",
        requestedAt: "2026-09-19T09:57:00Z",
      }),
    ).rejects.toThrow("origin.latitude");
  });
});
