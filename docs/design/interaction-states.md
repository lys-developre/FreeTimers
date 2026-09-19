# Interaction states

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Implementation status](../implementation-status.md)

These are target interaction contracts; persistence, routing and offline
capabilities are not yet implemented.

## Principle

Every interaction must answer:

1. Did the system receive the action?
2. What is happening now?
3. Did it succeed?
4. If not, what can the user do?
5. Is the displayed decision still trustworthy?

## Planner recalculation

### Idle

- Inputs display the current plan.
- Existing valid map results remain visible.

### Editing

- Update local derived values immediately.
- Debounce external requests.
- Do not erase the last valid result while typing.
- As soon as effective inputs change, label retained results as belonging to
  the previous plan; do not leave a green state actionable as current during
  debounce. Invalid inputs show field errors and cannot trigger evaluation.

### Recalculating

- Mark the affected result as recalculating.
- Keep the map interactive.
- Show which inputs changed when useful.
- Cancel obsolete requests.
- Associate results with a plan revision and discard late responses even if
  transport cancellation fails.

### Updated

- Transition zones without excessive movement.
- Announce meaningful feasibility changes to assistive technology.
- Show the new calculation time.

### Failed

- Preserve the last valid result as stale when available.
- State that it is stale and cannot support a fresh safety decision.
- Offer retry and manual alternatives.

## Geolocation

### Not requested

Explain why location improves the plan before requesting permission.

### Requesting

Show progress without blocking manual location entry.

### Granted

Display accuracy and age when they affect trust. Allow correction on the map.

### Denied

Do not repeatedly prompt. Explain how to enter a location manually and how to
change browser permission later.

### Unavailable or stale

Use the last position only with an explicit stale indicator. Never silently
present it as current.

## Mission actions

### Save as Secondary Mission

- Apply an optimistic update locally.
- Confirm with an inline state change.
- Offer undo.
- Preserve the original recommendation reason.
- Show durable confirmation only after storage succeeds. On failure, roll back
  the optimistic state, preserve user input and explain retry/export options.
  Undo is a storage operation and can fail; report that failure too.

### Activate mission

- Confirm only when activation replaces another active mission.
- Persist the deadline, hub, margin, activity, and source data.
- Transition the interface into active-mission mode.
- Keep saving independent from feasibility. For activation with missing or
  blocking evidence, show the unresolved state prominently; do not transform
  activation into an endorsement of a safe trip.

### Progress through visit points

- Keep the fixed hub, hard return deadline and current return margin persistent.
- Let the user explicitly mark the current point completed, skipped or still in
  progress; GPS proximity alone does not complete it.
- Recalculate the remaining sequence from the recent current position and time.
- If all remaining points no longer fit, present the smallest safe adjustment:
  shorten a stay when supported, skip later points, or begin returning.
- Make “Volver ahora” continuously available and more prominent as reserve
  decreases.
- Announce meaningful state changes without repeatedly interrupting the user.
- Never require interaction while driving; controls assume a stationary user or
  passenger.

### Complete mission

- Ask for lightweight confirmation.
- Offer memory creation afterward.
- Never force sharing or rating.

### Dismiss

Provide distinct choices when learning matters:

- Not now.
- Not interested.

## Reachability changes

### Safe to tight

- Use more than color.
- Display the lost margin.
- Avoid alarm language if there is still time.

### Tight to unviable

- Make the change prominent.
- State the recommended action.
- Do not hide it in a toast.

### Any state to unknown

- Replace certainty with an explicit unknown state.
- Explain whether route, GPS, weather, or coverage is missing.

## Activity data states

- **Loading:** skeleton only where shape is stable; otherwise use clear progress
  text.
- **Empty:** explain why no activities match and offer meaningful adjustments.
- **Partial:** show available fields and identify what is missing.
- **Stale:** show age and restrict claims that require fresh data.
- **Error:** identify the affected source and recovery action.
- **Unsupported:** explain coverage limits without implying a failure.

## Offline or no network

Offline mode preserves local-first capabilities:

- Editing the current plan.
- Viewing saved and active missions.
- Reading the last cached activity details with freshness labels.
- Viewing the last cached route or zone as historical context.
- Editing local preferences and vehicles.

Offline mode cannot claim a current safe return estimate unless every required
input remains valid and the route policy explicitly allows the cached result.
By default:

- Expired or invalidated reachability becomes unknown. A still-valid cached
  result may support an estimate only under the explicit policy above.
- New routes, weather, event status, and LLM explanations are suppressed.
- Map tiles may be incomplete unless already cached.
- The interface explains which capabilities require connectivity.

When connectivity returns:

- Revalidate time-sensitive data in the background.
- Keep local edits.
- Surface material feasibility changes.
- Do not replace a visible result without identifying that it changed.

## Optimistic updates

Suitable for:

- Saving a mission.
- Editing local preferences.
- Reordering personal items.

Not suitable for:

- Route feasibility.
- External bookings.
- Weather or event confirmation.
- Any safety-critical state.

## Confirmation and undo

Prefer undo for reversible actions. Use confirmation for:

- Replacing an active mission.
- Deleting memories or all local data.
- Exporting sensitive location history.
- Leaving an active mission when the action loses state.

## Motion and feedback

- Pressed states respond immediately.
- Loading indicators do not cause layout shift.
- Success feedback is brief and does not interrupt planning.
- Repeated background refreshes remain quiet unless the decision changes.
- Reduced-motion mode replaces spatial transitions with opacity or immediate
  updates.

Do not require plan editing or map interaction while driving. Active-mission
controls are designed for a stationary user or passenger; changing risk must
not encourage hurried interaction on the road.

## Resumen en español

Cada interacción debe confirmar recepción, progreso, resultado y recuperación.
Durante un recálculo se conserva el último resultado válido, pero se marca como
desactualizado. Guardar una misión puede ser optimista; la viabilidad de rutas
nunca. Los cambios críticos de margen deben mostrarse en contexto, no mediante
un toast efímero.
Al cambiar entradas se invalida la certeza inmediatamente, no al terminar la
petición; las respuestas antiguas se descartan. Un guardado fallido revierte el
estado optimista y explica el error. No se exige interacción al conductor.
