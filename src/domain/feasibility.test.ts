import { describe, expect, it } from "vitest";
import {
  evaluateFeasibility,
  type FeasibilityInput,
} from "./feasibility";

const baseInput: FeasibilityInput = {
  startsAt: "2026-09-19T10:00:00Z",
  deadline: "2026-09-19T12:00:00Z",
  evaluatedAt: "2026-09-19T09:00:00Z",
  marginMinutes: 20,
  outbound: { durationMinutes: 30, status: "fresh" },
  waitMinutes: 10,
  stayMinutes: 20,
  return: { durationMinutes: 40, status: "fresh" },
  breaksMinutes: 0,
};

describe("evaluateFeasibility", () => {
  it("classifies a trip that preserves the configured margin as safe", () => {
    const result = evaluateFeasibility(baseInput);

    expect(result.status).toBe("safe");
    expect(result.requiredMinutes).toBe(100);
    expect(result.slackMinutes).toBe(20);
  });

  it("classifies a trip inside the window but below the margin as tight", () => {
    const result = evaluateFeasibility({
      ...baseInput,
      return: { durationMinutes: 41, status: "fresh" },
    });

    expect(result.status).toBe("tight");
    expect(result.slackMinutes).toBe(19);
  });

  it("classifies a trip that exceeds the deadline as unviable", () => {
    const result = evaluateFeasibility({
      ...baseInput,
      return: { durationMinutes: 61, status: "fresh" },
    });

    expect(result.status).toBe("unviable");
    expect(result.slackMinutes).toBe(-1);
  });

  it("classifies an exact deadline as tight when a margin is configured", () => {
    const result = evaluateFeasibility({
      ...baseInput,
      return: { durationMinutes: 60, status: "fresh" },
    });

    expect(result.status).toBe("tight");
    expect(result.slackMinutes).toBe(0);
  });

  it("accepts exact equality as safe when no reserve is configured", () => {
    const result = evaluateFeasibility({
      ...baseInput,
      return: { durationMinutes: 60, status: "fresh" },
      marginMinutes: 0,
    });

    expect(result.status).toBe("safe");
    expect(result.slackMinutes).toBe(0);
  });

  it("returns unknown when required route evidence is stale", () => {
    const result = evaluateFeasibility({
      ...baseInput,
      return: { durationMinutes: 40, status: "stale" },
    });

    expect(result.status).toBe("unknown");
    expect(result.slackMinutes).toBeNull();
  });

  it("uses the current evaluation time for an active mission", () => {
    const result = evaluateFeasibility({
      ...baseInput,
      evaluatedAt: "2026-09-19T11:00:00Z",
      outbound: { durationMinutes: 0, status: "fresh" },
      waitMinutes: 0,
      stayMinutes: 15,
      return: { durationMinutes: 35, status: "fresh" },
      marginMinutes: 10,
    });

    expect(result.status).toBe("safe");
    expect(result.departureAt).toBe("2026-09-19T11:00:00.000Z");
    expect(result.requiredMinutes).toBe(50);
    expect(result.slackMinutes).toBe(10);
  });

  it("does not replace an asymmetric return route with doubled outbound time", () => {
    const result = evaluateFeasibility({
      ...baseInput,
      outbound: { durationMinutes: 30, status: "fresh" },
      waitMinutes: 0,
      stayMinutes: 20,
      return: { durationMinutes: 80, status: "fresh" },
    });

    expect(result.requiredMinutes).toBe(130);
    expect(result.status).toBe("unviable");
  });

  it("rejects invalid numeric input instead of converting it to a decision", () => {
    expect(() =>
      evaluateFeasibility({
        ...baseInput,
        marginMinutes: -1,
      }),
    ).toThrow("marginMinutes");
  });
});
