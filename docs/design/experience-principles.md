# Experience principles

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Feasibility contract](../data/feasibility.md)

## 1. Design for a decision

Every screen must state the decision it helps the user make. The primary
planning decisions are:

1. Can I reach this experience, complete it, and return on time?
2. Is it worthwhile for this window, budget, energy, and company?
3. Should I activate it, save it for later, or dismiss it?

Information that does not improve one of these decisions should be deferred or
removed.

## 2. Time is the primary constraint

FreeTimers starts from a real availability window, not an event catalog.

- Show the start, deadline, and configured return margin clearly.
- Use absolute return times alongside relative durations.
- Never hide assumptions used in feasibility calculations.
- Recalculate when time, position, activity duration, or route data changes.

## 3. Safety is explicit and conservative

“Safe” means the deterministic estimate preserves the configured return margin.
It is never a guarantee.

- Unknown or stale data cannot be promoted to safe.
- The activity-level calculation overrides the general mobility area.
- Weather, closures, fatigue, and lack of live traffic must be disclosed when
  relevant.
- The LLM cannot alter deterministic feasibility.

## 4. Progressive disclosure over information dumping

The first view answers what matters now. Details remain available on demand:

- First: feasibility, activity, duration, cost, return estimate.
- Then: route, weather, provenance, nearby opportunities.
- Later: narrative context, history, and memory creation.

## 5. Discovery without a personalization prison

Recommendations retain an origin:

- Direct affinity.
- Expansion.
- Discovery.

The interface explains why an unfamiliar activity appears. “Not now” and “not
interested” are different signals and must not be conflated.

## 6. Secondary Missions are alive

A saved mission is not a bookmark. It preserves:

- Why it was saved.
- Ideal season and conditions.
- Required time window.
- Estimated budget.
- Missing preparation.
- Source freshness.

It can resurface when current conditions make it relevant.

## 7. Mobile first means context first

Mobile use may happen outdoors, in motion, in poor light, or with weak
connectivity.

- Critical controls must be reachable with one hand.
- Avoid precision-dependent gestures as the only interaction.
- Maintain useful content when the map or network is unavailable.
- Preserve current planning inputs through interruptions.
- Never design a flow that requires a driver to interact while moving. Active
  use assumes a stationary user or passenger, not continuous attention.

## 8. The interface communicates system status

The user must know:

- What is being recalculated.
- Which inputs produced the result.
- When external data was last updated.
- Whether the result is complete, partial, stale, unsupported, or failed.

Never show a success-shaped fallback.

## 9. The experience comes before content capture

During an active mission, simplify the interface:

- Return status.
- Current route.
- Essential activity information.
- Clear action to begin returning.

Memory and sharing are offered after the experience or at a naturally relevant
moment, never as a constant engagement mechanism.

## 10. Privacy is visible but quiet

Local-first behavior should be understandable without filling every screen with
privacy copy.

- Explain when precise location leaves the device.
- Ask for permissions in context.
- Provide manual alternatives.
- Keep export and deletion discoverable.

## Screen framing questions

Before implementation, answer:

1. Who is using this screen and in what physical context?
2. What single decision matters most?
3. What is the primary action?
4. What can be removed or deferred?
5. What is the most harmful possible misunderstanding?
6. What happens without GPS, network, route coverage, or activities?
7. What changes on a narrow screen besides size?
8. What feedback confirms the action?

## Resumen en español

Cada pantalla debe ayudar a tomar una decisión concreta. El tiempo y la vuelta
segura son la restricción principal; los datos desconocidos nunca se presentan
como seguros. La información aparece progresivamente, las Secondary Missions se
mantienen vivas y el diseño móvil considera uso exterior, interrupciones y mala
conectividad.
