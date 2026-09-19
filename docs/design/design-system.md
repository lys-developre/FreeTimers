# Design system

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Accessibility](./accessibility.md)

## Status

This document defines the intended system. Existing CSS is an early prototype
and should migrate incrementally rather than be rewritten without a product
need.

CSS custom properties and CSS Modules are the default. Tailwind and shadcn/ui
are not current dependencies and must not be introduced solely for convention.
Accessible headless primitives may be evaluated for genuinely complex
interactions.

## Token architecture

Use semantic tokens in components. Primitive values may exist behind them, but
components should not depend on raw palette names.

### Color tokens

```css
:root {
  --color-canvas: #f4f1ea;
  --color-surface: #fffdf8;
  --color-text: #17231e;
  --color-text-muted: #596761;
  --color-border: #d9ded7;
  --color-control-border: #68736d;
  --color-action: #1f5c47;
  --color-action-hover: #184936;
  --color-accent: #934323;

  --color-reach-safe: #287a55;
  --color-reach-tight: #754400;
  --color-reach-unviable: #a63e37;
  --color-reach-unknown: #505a55;

  --color-focus: #155eef;
  --color-danger: #a63e37;
  --color-warning: #8a570d;
  --color-success: #287a55;
}
```

Values remain candidates until contrast is verified in implementation. Semantic
status colors may be used as text on the canvas or surface only after meeting
the required contrast. When used as fills, choose a separately tested
foreground token; do not assume white text is valid. Add dark tokens only after
testing map readability and outdoor/night use.

`--color-border` is for structural or decorative separation only. It must not be
the sole visual boundary of an interactive control. Use
`--color-control-border`, `--color-focus`, or another verified token when a
boundary communicates that a control exists or identifies its state.

New code uses the `--color-*` vocabulary. Existing prototype tokens migrate as
components are touched:

| Legacy token | Semantic replacement |
| --- | --- |
| `--paper` | `--color-canvas` |
| `--card` | `--color-surface` |
| `--ink` | `--color-text` |
| `--muted` | `--color-text-muted` |
| `--line` | `--color-border` |
| `--green` | `--color-action` |
| `--orange` | `--color-accent` |

Do not add new legacy-named tokens.
Define the semantic tokens (or explicit temporary aliases) in the loaded
stylesheet before replacing component references. A token named only in this
document has no runtime value. Remove an old token only after checking all
consumers; test contrast in each migrated state.

This migration intentionally changes some values as well as their names. In
particular, muted text and the accent become darker to meet contrast
requirements; this is a deliberate accessibility correction.

### Typography tokens

```css
:root {
  --font-ui: var(--font-geist-sans), system-ui, sans-serif;
  --font-numeric: var(--font-geist-mono), ui-monospace, monospace;
  --font-editorial: Georgia, "Times New Roman", serif;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.75rem;
  --text-display: clamp(2.25rem, 1.5rem + 4vw, 4.5rem);
}
```

- Body text should normally remain at least `1rem`.
- Dense metadata may use `0.875rem`.
- Critical times and margins use tabular numerals.
- All-caps labels must remain short and use restrained letter spacing.
- The editorial family is optional and limited to mission narratives, memory
  artifacts, and selected display headings. Never use it for controls, maps, or
  dense operational information.

Fluid `clamp()` sizes are candidates, not proof of accessible scaling.
Verify text enlargement to 200% and reflow at 400% browser zoom; viewport terms
and maximum clamps can limit enlargement even when a formula includes `rem`.

### Spacing tokens

Use a 4 px base with a limited scale:

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;
}
```

Spacing communicates grouping. Do not insert a container merely to create
separation.

### Shape and elevation

```css
:root {
  --radius-control: 0.5rem;
  --radius-panel: 0.75rem;
  --radius-sheet: 1rem;
  --shadow-floating: 0 12px 32px rgb(23 35 30 / 14%);
}
```

- Controls: small radius.
- Context panels: moderate radius.
- Bottom sheets: larger top corners only where appropriate.
- Cards are not a default layout primitive.

### Motion

```css
:root {
  --duration-fast: 120ms;
  --duration-standard: 220ms;
  --duration-map: 360ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

Respect `prefers-reduced-motion`. Never animate critical status changes in a way
that delays their announcement.

## Core component families

### Planning controls

- Date-time range.
- Return margin.
- Location picker.
- Vehicle selector.
- Travelers stepper.
- Budget input.

Requirements:

- Visible labels.
- Large touch targets.
- Inline validation.
- Last valid value remains visible during recalculation.
- Clearly distinguish edited input from the old result; neither can imply that
  retained geometry was computed for the new values.

### Reachability legend

Contains label, shape/pattern, color, and plain-language meaning. It must also
explain “unknown” and state that estimates are not guarantees.

### Mission marker and cluster

- Category is secondary to feasibility.
- Selected state is visually and programmatically distinct.
- Markers do not encode more than two simultaneous concepts.

### Mission summary

Shows, in order:

1. Feasibility status.
2. Title.
3. Return estimate and remaining margin.
4. Activity duration.
5. Total and per-person cost.
6. Reason for recommendation.
7. Primary action.

### Active mission status

Optimized for glanceability:

- Current time.
- Recommended departure time.
- Estimated return.
- Remaining margin.
- Route freshness.
- Start return action.

### Feedback surfaces

- Inline field feedback for local errors.
- Banner for degraded external data.
- Toast only for transient confirmations.
- Dialog only for consequential confirmation that cannot be safely undone.

## Component acceptance

Every reusable interactive component must define:

- Default.
- Hover where applicable.
- Focus-visible.
- Active/pressed.
- Disabled.
- Loading.
- Error.
- Touch behavior.
- Keyboard behavior.
- Accessible name and state.

## Icons

- Use icons to reinforce meaning, not replace labels for critical actions.
- Keep one icon family and consistent stroke weight.
- Decorative icons are hidden from assistive technology.
- Do not add an icon to every metadata item.

## Content style

- Use direct Spanish in the product UI.
- Prefer exact times: “Vuelve antes de las 05:00”.
- State uncertainty: “Ruta estimada hace 8 min”.
- Avoid false certainty: use “viable con margen estimado”, not “viaje seguro”.
- Primary buttons use verbs: “Activar misión”, “Guardar para después”.

## Resumen en español

El sistema usa tokens semánticos, CSS Modules y variables CSS. Tailwind y
shadcn/ui no se incorporan por defecto. La tipografía debe priorizar
legibilidad, los números críticos usan cifras tabulares y las cards no son la
unidad universal de composición. Todo componente interactivo debe definir sus
estados, teclado y nombre accesible.
Los tokens deben existir en CSS antes de usarse; nombrarlos aquí no los define.
Las escalas fluidas requieren comprobar ampliación y reflujo, no solo usar rem.
