import { describe, expect, it } from "vitest";
import { createReachabilityZone } from "./reachability-zone";

function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

describe("reachability zone", () => {
  it("approximates a round-trip zone with a deterministic ring of points", () => {
    const zone = createReachabilityZone({
      center: { latitude: 40.4168, longitude: -3.7038 },
      radiusKm: 10,
    });

    expect(zone.points.length).toBe(32);
    expect(zone.radiusKm).toBeCloseTo(10, 5);
    expect(zone.areaKm2).toBeGreaterThan(300);
    expect(zone.areaKm2).toBeLessThan(400);

    const firstPoint = zone.points[0];
    const farthest = zone.points.reduce((max, point) => {
      const distance = haversineKm(zone.center, point);
      return distance > max ? distance : max;
    }, 0);

    expect(haversineKm(zone.center, firstPoint)).toBeGreaterThan(9);
    expect(farthest).toBeGreaterThan(9);
  });

  it("rejects invalid coordinates and non-positive radius values", () => {
    expect(() =>
      createReachabilityZone({
        center: { latitude: 91, longitude: -3.7038 },
        radiusKm: 10,
      }),
    ).toThrow("latitude");

    expect(() =>
      createReachabilityZone({
        center: { latitude: 40.4168, longitude: -3.7038 },
        radiusKm: 0,
      }),
    ).toThrow("radiusKm");
  });
});
