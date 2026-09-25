import type { GeoPoint } from "./routing";

export type ReachabilityZoneInput = {
  center: GeoPoint;
  radiusKm: number;
  samples?: number;
};

export type ReachabilityZone = {
  center: GeoPoint;
  radiusKm: number;
  points: GeoPoint[];
  areaKm2: number;
};

function validateGeoPoint(point: GeoPoint, field: string): void {
  if (
    !Number.isFinite(point.latitude) ||
    point.latitude < -90 ||
    point.latitude > 90
  ) {
    throw new RangeError(`${field}.latitude is invalid`);
  }

  if (
    !Number.isFinite(point.longitude) ||
    point.longitude < -180 ||
    point.longitude > 180
  ) {
    throw new RangeError(`${field}.longitude is invalid`);
  }
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

function getDestinationPoint(
  origin: GeoPoint,
  distanceKm: number,
  bearingDegrees: number,
): GeoPoint {
  const earthRadiusKm = 6371;
  const angularDistance = distanceKm / earthRadiusKm;
  const lat1 = toRadians(origin.latitude);
  const lon1 = toRadians(origin.longitude);
  const theta = toRadians(bearingDegrees);

  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const sinAngular = Math.sin(angularDistance);
  const cosAngular = Math.cos(angularDistance);

  const lat2 = Math.asin(
    sinLat1 * cosAngular + cosLat1 * sinAngular * Math.cos(theta),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(theta) * sinAngular * cosLat1,
      cosAngular - sinLat1 * Math.sin(lat2),
    );

  return {
    latitude: toDegrees(lat2),
    longitude: toDegrees(lon2),
  };
}

export function createReachabilityZone(
  input: ReachabilityZoneInput,
): ReachabilityZone {
  validateGeoPoint(input.center, "center");

  if (!Number.isFinite(input.radiusKm) || input.radiusKm <= 0) {
    throw new RangeError("radiusKm must be a finite positive number");
  }

  const samples = Number.isInteger(input.samples) && input.samples! > 2
    ? input.samples!
    : 32;

  const points = Array.from({ length: samples }, (_, index) => {
    const bearingDegrees = (360 / samples) * index;
    return getDestinationPoint(input.center, input.radiusKm, bearingDegrees);
  });

  const areaKm2 = Math.PI * input.radiusKm * input.radiusKm;

  return {
    center: input.center,
    radiusKm: input.radiusKm,
    points,
    areaKm2,
  };
}
