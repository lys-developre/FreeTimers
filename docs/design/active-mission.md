# Active mission mode

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Product](../product/README.md) ·
[Feasibility](../data/feasibility.md) · [Voice and tone](./voice-and-tone.md)

## Purpose

After the user confirms a plan, FreeTimers changes from planning mode to a
dedicated active-mission mode. The active plan becomes the primary product
surface. Discovery and configuration remain available but secondary.

The mode helps the user complete useful visits while preserving the fixed
return deadline, hub and configured margin. It does not promise physical
safety or uninterrupted background monitoring.

## Information hierarchy

Always visible:

1. Current return status, deadline and remaining margin.
2. Next recommended action.
3. Current route and map, with a textual equivalent.
4. Current or next visit and its time window.
5. Remaining itinerary and confirmed progress.
6. Data freshness and unresolved constraints.
7. A persistent “Volver ahora” action.

Secondary surfaces contain explanations, alternatives, checklist, costs,
vehicle details, downloaded data and optional narrative insights.

## Adaptive itinerary

The active itinerary is provisional. A new revision is evaluated after:

- meaningful position movement;
- confirmed arrival, departure, completion or skip;
- an elapsed-time threshold;
- route, weather, schedule or availability expiry;
- a plan edit;
- application resume.

Estimated times, distance, margin and warnings update without confirmation.
Adding, removing, reordering or shortening visits requires an explanation and
explicit user confirmation. The proposal states:

- what changed;
- why it changed;
- which evidence triggered it;
- its effect on return margin, cost and availability;
- what happens if it is rejected.

New objectives may be proposed only when fresh required evidence proves that
they fit while preserving the full configured return margin. Unknown or stale
opportunities remain informational and cannot enter the active plan.

## Visit progress

Users can confirm arrival and departure manually. GPS assistance is configurable
globally or per activity:

- **Confirm:** GPS proposes a detected arrival or departure and the user
  confirms it.
- **Automatic:** after activity-specific or preference-level consent, a
  geofence plus dwell evidence records the event automatically.

The interface explains that automatic detection can fail because of position
accuracy, signal loss, nearby pass-throughs, operating-system suspension and
battery restrictions. Every automatic record is visible and correctable. GPS
proximity alone never marks an activity completed.

## Mission checklist

Every mission has an independent, manually authored checklist. An item contains:

- text;
- `required` or `optional`;
- completion state.

Required pending items block the “ready” state but do not alter temporal
feasibility. Optional items remain reminders. The active mode keeps the list
available without competing with return information and can announce pending
required items before departure.

## Actual cost journal

Unknown mandatory costs prevent an overall “ready” claim. After payment or a
visit, the user may record an actual cost with:

- amount and currency;
- category;
- activity or route context;
- observed date;
- optional note.

Future plans may use that value only as a dated historical estimate, clearly
labelled with context and sample count. It is not promoted to a current provider
price. The user can edit or delete the record.

## Learned travel profiles

The user may add reviewed observations to improve vehicle consumption and
delay estimates:

- distance;
- energy used;
- occupants;
- load;
- road type;
- traffic;
- weather;
- observed date;
- route or trip context.

Observations remain distinct from configured manufacturer or user baseline
values. FreeTimers derives conservative context profiles with ranges and sample
counts. It must request confirmation before promoting a learned profile as the
vehicle's normal planning assumption. Sparse, conflicting or stale samples
remain estimates and never imply exact consumption.

Delay learning follows the same rule: observed parking, queue, access and
transition times retain context rather than becoming one universal average.

## Voice mode

Voice is available for car, motorcycle, bicycle and walking modes. It has two
priority channels:

1. Navigation, return status and actionable warnings.
2. Optional narrative context such as sourced local history, landscape, fauna
   or activity information.

Navigation and safety-related output always interrupts or suppresses narrative
audio. Narrative output requires an enabled module, appropriate permissions,
available sources, configurable frequency and an immediate mute control.
Unverified model knowledge is not presented as a local fact.

Voice must minimize interaction while moving. It never encourages speeding,
unsafe maneuvers or looking at the screen. Bardeo may change phrasing according
to the accepted profile, not these priorities or facts.

## Offline mission packages

Users may explicitly download either:

- a mission package covering the route corridor, visit surroundings,
  instructions, schedules and essential normalized records; or
- a selected regional map package.

Before download, show estimated size, provider attribution, license limitations,
coverage and expiry. Packages are user-managed and removable.

An offline route supports a return decision only while it is valid for the
plan and freshness policy. Without current traffic or conditions it cannot be
described as live. If it expires while offline:

- keep it visible as an obsolete reference;
- mark current feasibility `unknown`;
- prioritize the known conservative return path;
- do not promise an arrival time.

Offline data does not bypass provider licensing, retention or attribution
requirements.

## Permission and privacy behavior

Geolocation tracking, automatic visit detection, narrative modules and AI data
access are disabled until explicitly enabled. Permissions can be global
preferences or narrower per-activity choices, with the narrower choice taking
precedence.

Store only the observations needed for the active mission unless the user
explicitly saves a reviewed cost, consumption, delay or memory record. A route
trace is not retained automatically.

## Non-happy states

The active mode defines visible behavior for:

- GPS denied, unavailable, inaccurate or stale;
- offline and expired offline data;
- routing or provider timeout;
- conflicting schedules;
- unknown mandatory costs;
- insufficient vehicle range;
- missed reservation or closing window;
- storage quota failure;
- application resume with stale results;
- rejected itinerary adjustment.

The last valid calculation may remain visible as stale context but cannot
support a current feasible claim.

## Implementation boundary

This document is a product and UX decision. Active mission mode, GPS progress,
learned profiles, voice navigation and offline packages are not implemented
yet. Each requires typed data contracts, deterministic tests, privacy controls
and adapter evidence before its status changes.

## Resumen en español

Al activar un plan, FreeTimers se transforma en un modo de misión centrado en
la próxima acción, el mapa, el itinerario restante y el margen para volver. El
usuario confirma los cambios estructurales; el GPS puede ayudar a registrar
llegadas y salidas según una preferencia explícita y corregible. Cada misión
tiene checklist manual, los costes reales se conservan como históricos y los
registros revisados pueden mejorar estimaciones de consumo y demora con rangos
y muestras. La voz funciona en todos los modos de movilidad, prioriza
navegación sobre relatos y los paquetes offline nunca se presentan como datos
actuales cuando han caducado.
