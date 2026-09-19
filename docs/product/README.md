# Product

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Documentation index](../README.md) · [What works today](../implementation-status.md)

## Product essence

FreeTimers helps answer:

> What is worth experiencing with the time I actually have?

It is a personal, local-first exploration companion. It filters activities
through real availability, return feasibility, budget, energy, people,
transport, conditions, and personal relevance.

It is not an event catalog, travel marketplace, social network, or generic trip
planner.

## Core surfaces

- **Plan Now:** configure a real time window and evaluate reachable activities.
- **Adventure Radar:** discover local or distant future opportunities.
- **Secondary Missions:** keep opportunities alive until time and conditions
  align.
- **Memory:** privately preserve completed experiences and optionally export
  them to existing social channels.

## MVP decisions

The MVP must help decide:

1. Can I travel there, experience it, and return before the deadline?
2. Is it worthwhile for this budget, energy, group, and context?
3. Should I activate it, save it, or dismiss it?

Memory generation, historical snapshots, and proactive resurfacing remain
important but do not block the first useful planning flow.

## Recommendation dimensions

Recommendation origin:

- **Direct affinity:** close to known interests.
- **Expansion:** adjacent but meaningfully different.
- **Discovery:** unfamiliar yet plausibly relevant.

Mission lifecycle:

- Candidate (not yet saved or selected; previously called spontaneous).
- Saved.
- Prepared.
- Active.
- Completed.

Origin and lifecycle are independent. A discovery can become a saved, prepared,
active, and completed mission.
“Spontaneous” is not a fourth recommendation origin. Prepared describes gathered
information; it does not mean fresh or feasible. Keep saved membership distinct
from active execution so a saved mission can be active without losing its
original reason.

Transitions must preserve data: candidate can be saved or activated; a saved
mission can be prepared or activated; completion requires user confirmation.
Replacing an active mission requires confirmation and must not delete the
previous saved record. Returning GPS alone cannot mark a mission completed.

An active mission may contain an ordered sequence of visit points. The sequence
is provisional: after each user-confirmed visit, material position change,
elapsed-time change or relevant evidence update, the application re-evaluates
the remaining points against the fixed return deadline and hub. Preserving the
return margin has priority over completing every planned point. When the
remaining sequence no longer fits, the product must recommend skipping,
shortening or ending the mission; it must never keep an obsolete itinerary
merely to preserve the original plan.

## Product principles

- Time is the first filter.
- Safety is deterministic and conservative.
- The LLM explains; it does not calculate feasibility.
- Fewer meaningful options are better than a large feed.
- “Not now” is not the same as “not interested”.
- Saved missions retain conditions and can resurface later.
- The experience comes before content capture.
- The user owns all memories and data.

## Terminology

| Term | Meaning |
| --- | --- |
| Hub | Fixed intended return location, initially the planning origin |
| Window | Start time through hard return deadline |
| Return margin | User-selected reserve before the deadline |
| Safe estimate | Deterministic travel estimate preserves the margin |
| Tight estimate | Return is estimated before deadline but loses the margin |
| Unviable | Estimated return exceeds the deadline |
| Unknown | Required data is missing, stale, unsupported, or failed |
| Mission | A structured experience opportunity |
| Secondary Mission | Saved mission waiting for suitable conditions |

“Safe” is never a guarantee. Unknown can never be promoted to safe.
Use [feasibility](../data/feasibility.md) for exact definitions. Spanish UI uses
“viable con margen estimado”, “regreso ajustado”, “no viable” and “sin datos
suficientes”; direct affinity must never be labelled “zona segura”.

The 70/20/10 recommendation mix is an experiment, not a quota or confidence
percentage. Small result sets must not fabricate discovery candidates to meet
it. Saving a distant or currently unviable mission remains possible without
claiming it can be activated safely now.

## Roadmap horizons

### Now

This is delivery priority, not current availability.

- Mobile-first plan configuration.
- GPS with manual correction.
- Real routing and reachability.
- Geolocated activities.
- Deterministic activity feasibility.
- Activate or save a mission.

### Next

- Route-integrated vehicle cost models (the validated multi-vehicle library is
  already available locally).
- Secondary Mission enrichment and resurfacing.
- Recommendation feedback.
- Weather and seasonal conditions.
- Adventure Radar.

### Later

- Exploration journal.
- Historical Time Snapshot.
- Story Engine.
- Exportable memory compositions.
- Public transport after GTFS/OpenTripPlanner support exists.

## Product acceptance

- A changed deadline or GPS position changes the calculation inputs, not hub.
- A closed, stale or unsupported activity cannot become suitable because of
  affinity.
- “Not now” preserves interest; “not interested” records explicit preference.
- A future mission can be saved even when it cannot fit today's window.
- Current planning exposes missing data instead of promising a safe trip.

See [testing](../testing/README.md) for how these behaviors are verified.

## Resumen en español

FreeTimers responde qué merece la pena vivir con el tiempo real disponible.
Plan Ahora evalúa movilidad y actividades; Adventure Radar descubre oportunidades
futuras; las Secondary Missions esperan condiciones adecuadas. Afinidad,
expansión y descubrimiento describen el origen, mientras guardada, preparada,
activa y completada describen el ciclo de vida.
Una candidata puede guardarse aunque no sea viable hoy. Preparada no significa
segura; activar o completar no debe borrar la razón original de guardado. El
GPS actual cambia el origen del trayecto, no el punto fijo de regreso.
