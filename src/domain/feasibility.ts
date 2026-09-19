export type FeasibilityStatus = "safe" | "tight" | "unviable" | "unknown";

export type EvidenceStatus = "fresh" | "stale" | "unsupported" | "missing";

export type RouteEvidence = {
  durationMinutes: number;
  status: EvidenceStatus;
};

export type FeasibilityInput = {
  startsAt: string;
  deadline: string;
  evaluatedAt: string;
  marginMinutes: number;
  outbound: RouteEvidence | null;
  waitMinutes: number;
  stayMinutes: number;
  return: RouteEvidence | null;
  breaksMinutes: number;
};

export type FeasibilityResult = {
  status: FeasibilityStatus;
  departureAt: string;
  evaluatedAt: string;
  requiredMinutes: number;
  slackMinutes: number | null;
  reasons: string[];
};

export const FEASIBILITY_ALGORITHM_VERSION = "round-trip-v1";

function parseInstant(value: string, field: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new RangeError(`${field} must be a valid timestamp`);
  }

  return timestamp;
}

function assertNonNegativeMinutes(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} must be a finite non-negative number`);
  }
}

function validateRoute(
  route: RouteEvidence | null,
  field: "outbound" | "return",
): void {
  if (route === null) return;

  assertNonNegativeMinutes(route.durationMinutes, `${field}.durationMinutes`);
  if (
    route.status !== "fresh" &&
    route.status !== "stale" &&
    route.status !== "unsupported" &&
    route.status !== "missing"
  ) {
    throw new RangeError(`${field}.status is not supported`);
  }
}

function hasFreshRouteEvidence(route: RouteEvidence | null): boolean {
  return route !== null && route.status === "fresh";
}

export function evaluateFeasibility(
  input: FeasibilityInput,
): FeasibilityResult {
  const startsAt = parseInstant(input.startsAt, "startsAt");
  const deadline = parseInstant(input.deadline, "deadline");
  const evaluatedAt = parseInstant(input.evaluatedAt, "evaluatedAt");

  if (deadline <= startsAt) {
    throw new RangeError("deadline must be after startsAt");
  }

  assertNonNegativeMinutes(input.marginMinutes, "marginMinutes");
  assertNonNegativeMinutes(input.waitMinutes, "waitMinutes");
  assertNonNegativeMinutes(input.stayMinutes, "stayMinutes");
  assertNonNegativeMinutes(input.breaksMinutes, "breaksMinutes");
  validateRoute(input.outbound, "outbound");
  validateRoute(input.return, "return");

  const departureAt = Math.max(startsAt, evaluatedAt);
  const departureIso = new Date(departureAt).toISOString();
  const evaluatedIso = new Date(evaluatedAt).toISOString();
  const requiredMinutes =
    (input.outbound?.durationMinutes ?? 0) +
    input.waitMinutes +
    input.stayMinutes +
    (input.return?.durationMinutes ?? 0) +
    input.breaksMinutes;

  if (
    !hasFreshRouteEvidence(input.outbound) ||
    !hasFreshRouteEvidence(input.return)
  ) {
    return {
      status: "unknown",
      departureAt: departureIso,
      evaluatedAt: evaluatedIso,
      requiredMinutes,
      slackMinutes: null,
      reasons: ["Required route evidence is missing, stale, or unsupported."],
    };
  }

  const remainingMinutes = (deadline - departureAt) / 60000;
  const slackMinutes = remainingMinutes - requiredMinutes;
  const status: FeasibilityStatus =
    slackMinutes < 0
      ? "unviable"
      : slackMinutes < input.marginMinutes
        ? "tight"
        : "safe";

  return {
    status,
    departureAt: departureIso,
    evaluatedAt: evaluatedIso,
    requiredMinutes,
    slackMinutes,
    reasons: [
      `Computed with ${FEASIBILITY_ALGORITHM_VERSION}.`,
      `Return reserve: ${slackMinutes} minutes.`,
    ],
  };
}
