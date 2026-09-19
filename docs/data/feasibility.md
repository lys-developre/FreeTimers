# Return feasibility contract

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Data contracts](./README.md) · [Documentation index](../README.md)

This is the canonical calculation specification, not an implemented API.
It assesses temporal feasibility under stated route assumptions, not physical
safety or a probability of arriving. The LLM cannot change its result.

## Inputs and time semantics

- `departure`: planned start for future planning; `max(now, startsAt)` during
  an active mission, using an injected evaluation clock. Never calculate
  remaining time from the original start after the mission has begun.
- `deadline`: fixed return instant, with the user's display timezone.
- `hub`: intended return point. GPS movement changes current origin, not hub.
- `margin`: non-negative user reserve before the deadline.
- `outbound`: route from departure position to candidate.
- `wait`: delay until admission/start; event end and opening constraints also
  apply.
- `stay`: estimated remaining activity duration, not time already spent.
- `return`: route from candidate to hub at expected return departure time.
- `breaks`: required rest, refuelling or other known travel overhead.

Calculate in consistent exact units; round for display only. Validate finite,
non-negative durations, valid coordinates and timestamps, and an ordered window.
Invalid user input is an actionable validation error, not `unviable` or zero.
Missing or invalid provider evidence gives `unknown`.

## Classification

```text
remaining = deadline - departure
required = outbound + wait + stay + return + breaks
slack = remaining - required

valid required evidence AND slack >= margin -> safe
valid required evidence AND 0 <= slack < margin -> tight
valid required evidence AND slack < 0 -> unviable
missing, stale or unsupported required evidence -> unknown
```

Evaluate known hard blockers separately: a confirmed cancellation or expired
deadline remains a blocker even if route data is also missing. Never hide a
known blocker behind an optimistic result. Keep reasons for every assessment.

With a zero margin, equality at the deadline qualifies as `safe` by the formula
but the UI must state “sin margen de reserva”; it must not imply resilience.
Do not expose a probability or “almost impossible” claim without a validated
probabilistic model.

## Map versus activity

- The general area represents mobility only: `wait = stay = 0`. Clearly label
  this assumption; it does not mean an activity fits there.
- Outbound and return routes may differ. Do not double outbound travel time or
  halve the window and call the resulting isochrone a verified round trip.
- Once a mission starts, outbound origin is current GPS/manual location while
  return destination remains hub. Concentric outbound rings cannot represent
  that entire problem.
- Candidate isochrones can bound a search. Final zones require a round-trip
  method with documented sampling, resolution and coverage. Unverified gaps
  stay unknown rather than becoming red or green through interpolation.
- Do not paint everything outside provider coverage as unviable.
- Re-evaluate each selected activity using its schedule, remaining duration and
  both route legs. Its assessment takes precedence over the general area.
- Long windows are not continuous driving allowances. Required rest and
  overnight needs must be represented; missing assumptions prevent a confident
  feasible recommendation.

## Other constraints

Time, budget, vehicle suitability, autonomy, access and relevant conditions have
separate results. A temporal `safe` result is not overall suitability.
Unknown price is not free. Known insufficient range or a confirmed closure
cannot be overridden by affinity, a green mobility zone or an LLM explanation.
Display missing constraints and block any overall “ready” claim they prevent.

## Active-mission refresh

On resume, obtain a recent position (or explicitly confirmed manual position),
current time and fresh return evidence. Time already spent is deducted from
the remaining window automatically; do not add the full activity duration again.
GPS alone does not prove when an activity started or ended. Keep elapsed-time
inference separate from user-confirmed progress.

Every result identifies plan revision, evaluated time, route assumptions,
freshness and algorithm version. Reject obsolete results. Do not move hub
silently or promise background monitoring when the PWA is closed.

## Acceptance cases for TDD

Synthetic minutes; all evidence is valid unless stated otherwise:

| Case | Remaining / margin | Required | Expected |
| --- | --- | --- | --- |
| Exact reserve | 120 / 20 | 100 | `safe`, slack 20 |
| Inside reserve | 120 / 20 | 101 | `tight`, slack 19 |
| Exact deadline | 120 / 20 | 120 | `tight`, slack 0 |
| Too late | 120 / 20 | 121 | `unviable` |
| No reserve | 120 / 0 | 120 | `safe` with no-reserve warning |
| Return evidence expired | 120 / 20 | Not trusted | `unknown`, no green activity |
| Asymmetric legs | 120 / 20 | 30 out + 20 stay + 80 return | `unviable`; doubling 30 is invalid |
| Active mission | 60 / 10 | 0 out + 15 remaining stay + 35 return | `safe`, no repeat of elapsed stay |

Also test cross-midnight/DST, scheduled waiting, cancellation, unknown prices,
insufficient range, rest requirements, no coverage and out-of-order requests.
These cases are a test specification; do not report them as passing tests until
they exist in code.

## Resumen en español

La viabilidad suma ida, espera, estancia pendiente, vuelta y descansos frente al
tiempo restante y margen. La ida no garantiza la vuelta: no se duplica su
duración ni se colorea cobertura desconocida como imposible. El hub permanece
fijo al moverse el GPS. Tiempo, presupuesto y condiciones se evalúan por
separado; datos incompletos nunca justifican una recomendación segura.
