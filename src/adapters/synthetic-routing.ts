import {
  createRouteResult,
  type GeoPoint,
  type RouteRequest,
  type RouteResult,
  type RouteCoverage,
} from "../domain/routing";

export type SyntheticRouteFixture = RouteRequest & {
  id?: string;
  durationMinutes: number;
  distanceMeters: number;
  coverage: RouteCoverage;
  queriedAt: string;
  expiresAt?: string;
  provenance: string;
};

export type SyntheticRouteProviderOptions = {
  fixtures?: SyntheticRouteFixture[];
  now?: () => Date;
};

export type RouteProvider = {
  getRoute(request: RouteRequest): Promise<RouteResult>;
};

const defaultFixtures: SyntheticRouteFixture[] = [
  {
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
];

function isSamePoint(left: GeoPoint, right: GeoPoint): boolean {
  return (
    Math.abs(left.latitude - right.latitude) < 1e-6 &&
    Math.abs(left.longitude - right.longitude) < 1e-6
  );
}

function isUnsupportedArea(point: GeoPoint): boolean {
  return (
    point.latitude > 41.0 &&
    point.longitude < -4.0 &&
    point.latitude < 42.0
  );
}

export function createSyntheticRouteProvider(
  options: SyntheticRouteProviderOptions = {},
): RouteProvider {
  const now = options.now ?? (() => new Date());
  const fixtures = [...defaultFixtures, ...(options.fixtures ?? [])];

  return {
    async getRoute(request: RouteRequest): Promise<RouteResult> {
      const match = fixtures.find(
        (fixture) =>
          fixture.vehicleMode === request.vehicleMode &&
          isSamePoint(fixture.origin, request.origin) &&
          isSamePoint(fixture.destination, request.destination),
      );

      const queriedAt = now().toISOString();

      if (match) {
        return createRouteResult({
          ...request,
          ...match,
          queriedAt,
          provenance: match.provenance,
          expiresAt: match.expiresAt,
        });
      }

      if (isUnsupportedArea(request.destination)) {
        return createRouteResult({
          ...request,
          durationMinutes: 0,
          distanceMeters: 0,
          coverage: "unsupported",
          queriedAt,
          provenance: "synthetic adapter",
        });
      }

      return createRouteResult({
        ...request,
        durationMinutes: 0,
        distanceMeters: 0,
        coverage: "missing",
        queriedAt,
        provenance: "synthetic adapter",
      });
    },
  };
}
