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
- manual latitude and longitude hub.

The current screen uses synthetic vehicle IDs, persists the valid configuration
locally, and offers JSON export/import for recovery. It does not request GPS,
render a map or call providers.

## Trust and states

- Valid values update the demo list immediately.
- Invalid values remain visible and show an inline alert.
- No recommendation is labelled safe: routing is not connected.
- The helper text states that return feasibility is not yet calculated.
- Empty results mean the current synthetic missions do not fit the declared
  duration/budget heuristic; they are not proof that no real activity exists.

## Responsive behavior

- Mobile uses a single-column control surface with native date/time inputs.
- Wider screens use a two-column configuration grid and a full-width hub field.
- Every field has a visible label and a stable `id`/`htmlFor` association.
- Valid configuration is restored from IndexedDB after reload. JSON export and
  import provide a user-controlled recovery path; invalid imports are rejected
  without replacing the current state.

## Acceptance evidence

- Browser check at `http://localhost:3000/` confirmed all controls render.
- Synthetic latitude `91` produced `origin.latitude is invalid`.
- Browser console had no errors or warnings from the screen.
- Automated UI, accessibility and route-provider checks remain pending. Browser
  verification confirmed IndexedDB restoration; import/export still needs
  dedicated end-to-end coverage.

## Resumen en español

Plan Ahora configura hora de salida, límite de regreso, presupuesto, personas,
transporte y hub manual. La pantalla valida los datos, conserva la configuración
válida en el dispositivo y ofrece exportación/importación JSON. Todavía no
existe cálculo real de regreso, no pide GPS y no presenta una recomendación como
segura.
