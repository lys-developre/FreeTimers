import type { ReachabilityResult } from "../domain/reachability";
import type { GeoPoint } from "../domain/routing";
import type { ReachabilityZoneBounds } from "../domain/reachability-zone";

export type ReachabilityMapOverlay = {
  center: GeoPoint;
  radiusKm: number;
  polygon: GeoPoint[];
  bounds: ReachabilityZoneBounds;
  status: "approximate";
  feasibilityStatus: "unknown";
  evidenceStatus: ReachabilityResult["evidenceStatus"];
  coverage: "approximate";
  visible: boolean;
  reasons: string[];
};

export function reachabilityToMapOverlay(
  result: ReachabilityResult,
): ReachabilityMapOverlay | null {
  if (result.zone === null) {
    return null;
  }

  return {
    center: result.center,
    radiusKm: result.radiusKm,
    polygon: result.zone.polygon,
    bounds: result.zone.bounds,
    status: "approximate",
    feasibilityStatus: "unknown",
    evidenceStatus: result.evidenceStatus,
    coverage: "approximate",
    visible: true,
    reasons: result.reasons,
  };
}
