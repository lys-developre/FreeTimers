import type { Plan, Transport } from "../domain/plan";
import {
  estimateReachability,
  type ReachabilityResult,
} from "../domain/reachability";
import type { Vehicle } from "../domain/vehicles";

const defaultSpeedsKmh: Record<Transport["mode"], number> = {
  walking: 4.5,
  bicycle: 15,
  car: 40,
  motorcycle: 40,
};

export function defaultReachabilitySpeedKmh(
  mode: Transport["mode"],
): number {
  return defaultSpeedsKmh[mode];
}

function validateSelectedVehicle(plan: Plan, vehicle?: Vehicle): void {
  if (plan.transport.mode === "walking") {
    return;
  }

  if (
    !vehicle ||
    vehicle.mode !== plan.transport.mode ||
    (plan.transport.vehicleId !== undefined &&
      vehicle.id !== plan.transport.vehicleId)
  ) {
    throw new RangeError(
      "selected vehicle must exist and match the plan transport",
    );
  }
}

export function estimatePlanReachability(
  plan: Plan,
  vehicle?: Vehicle,
): ReachabilityResult {
  validateSelectedVehicle(plan, vehicle);

  return estimateReachability({
    origin: {
      latitude: plan.origin.latitude,
      longitude: plan.origin.longitude,
    },
    departureAt: plan.startsAt,
    deadline: plan.returnDeadline,
    marginMinutes: plan.returnMarginMinutes,
    speedKmh:
      plan.reachabilitySpeedKmh ??
      defaultReachabilitySpeedKmh(plan.transport.mode),
    routeEvidenceStatus: "missing",
  });
}
