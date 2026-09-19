# Plan Now configurator

**Status:** Active  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Implementation status](../implementation-status.md)

## Purpose

The first screen helps the user configure a real availability window before
evaluating synthetic mission proposals. Its primary action is editing the plan,
not accepting a recommendation.

Implemented inputs:

- start and return deadline;
- total budget;
- traveler count;
- transport mode;
- multiple selectable local vehicle profiles with name and, for motor vehicles,
  energy type, consumption, unit price and usable range;
- manual latitude and longitude hub.

The current screen creates, edits, selects and deletes validated local vehicle
profiles, persists the valid configuration locally, and offers JSON
export/import for recovery. It does not request GPS, render a map or call
providers.

## Trust and states

- Valid values update the demo list immediately.
- Invalid values remain visible and show an inline alert.
- Incomplete motor-vehicle data invalidates the plan instead of assuming zero
  cost or unlimited range.
- Bicycle profiles do not invent energy or fuel costs.
- Vehicle selection is limited to profiles compatible with the chosen transport
  mode. Deleting the final compatible profile returns the plan to walking
  instead of retaining a dangling reference.
- No recommendation is labelled safe: routing is not connected.
- The helper text states that return feasibility is not yet calculated.
- Empty results mean the current synthetic missions do not fit the declared
  duration/budget heuristic; they are not proof that no real activity exists.

## Responsive behavior

- Mobile is the base layout: it uses a compact editorial introduction followed
  by a single-column control surface, full-width 48 px inputs and actions with
  at least 44 px touch height.
- Tablet widths progressively expose a two-column configuration grid, paired
  hub fields and two mission columns without changing the input order.
- Wide screens place the planning context and configurator side by side and
  expose three mission columns. Additional width carries useful controls rather
  than empty decorative space.
- Long mission names and enlarged text reflow without horizontal page scrolling.
- Safe-area insets are respected and controls have visible keyboard focus,
  hover, pressed, disabled and forced-color behavior.
- Touch is primary on compact screens: controls avoid delayed double-tap
  handling, vertical finger scrolling remains native and critical operations
  never depend on an undisclosed gesture.
- Every field has a visible label and a stable `id`/`htmlFor` association.
- Valid configuration is restored from IndexedDB after reload. JSON export and
  import provide a user-controlled recovery path; invalid imports are rejected
  without replacing the current state.

## Acceptance evidence

- Browser check at `http://localhost:3000/` confirmed all controls render.
- Synthetic latitude `91` produced `origin.latitude is invalid`.
- Browser console had no errors or warnings from the screen.
- Responsive browser checks cover the canonical compact mobile, landscape,
  tablet and desktop widths, including horizontal-overflow and touch-target
  measurements. Automated UI, full accessibility and route-provider checks
  remain pending. Browser verification confirmed IndexedDB restoration;
  import/export still needs dedicated end-to-end coverage.

## Resumen en español

Plan Ahora configura hora de salida, límite de regreso, presupuesto, personas,
transporte, varias fichas de vehículo seleccionables y hub manual. Su base
móvil usa una sola columna y objetivos táctiles amplios; tablet y escritorio
añaden contexto y columnas sin alterar el orden de la tarea. La pantalla valida
los datos, conserva la configuración válida en el dispositivo y ofrece
exportación/importación JSON. Todavía no existe cálculo real de regreso, no pide
GPS y no presenta una recomendación como segura.
