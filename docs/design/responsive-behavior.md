# Responsive behavior

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Accessibility](./accessibility.md)

## Principle

Responsive design changes task structure, not merely dimensions. FreeTimers
adapts according to available space, input mode, mobility context, and map
visibility.

Breakpoints are implementation tools, not device categories. Add them when the
content requires a structural change.

## Compact mobile

Typical context:

- One-handed use.
- Portrait orientation.
- Outdoor conditions.
- Frequent interruptions.

Structure:

```text
Compact header
Quick planner
Plan summary
Map
Bottom sheet / selected mission
Contextual bottom actions
```

Rules:

- Map and critical planner status remain reachable without deep navigation.
- Selected activity opens in a bottom sheet with collapsed, partial, and
  expanded states.
- The primary action remains above safe-area insets.
- Inputs use appropriate mobile keyboards.
- Touch targets are at least 44 by 44 CSS pixels.
- Do not rely on hover.
- Avoid a permanent desktop-style sidebar or dense top navigation.

## Large mobile and small tablet

Structure:

- Planner may become a compact horizontal summary.
- Map remains full-width.
- Detail sheet may occupy a larger portion of the viewport.
- Secondary controls can move into a drawer.

Landscape:

- Keep enough map height to understand reachability.
- Use a side sheet when it improves visibility.
- Do not simply retain portrait proportions.

## Tablet

Structure:

```text
Compact planner rail | Map
Context sheet overlays or docks when selected
```

Rules:

- Controls may remain visible while adjusting the map.
- Mission details should not cover the destination marker.
- Support touch and keyboard equally.

## Desktop

Structure:

```text
Planner panel | Map canvas | Context panel
```

Rules:

- Additional width exposes context; it does not create decorative whitespace.
- The map remains the largest visual region.
- The context panel appears only when useful.
- Keyboard shortcuts may enhance, never replace, visible controls.

## Active mission transformation

The active mission is a distinct responsive mode.

Mobile:

- Return margin and departure recommendation become persistent.
- Planning inputs collapse.
- Map and return action dominate.

Desktop:

- Route and timeline can be visible together.
- Preparation details remain secondary.

## Content priority by width

Never hide:

- Return deadline.
- Feasibility state.
- Data freshness when degraded.
- Primary action.

May collapse:

- Recommendation explanation.
- Detailed cost breakdown.
- Provenance list.
- Nearby secondary activities.

## Map behavior

- Reflow overlays rather than shrinking their text.
- Reserve space for attribution.
- Keep zoom and location controls reachable and separated from primary actions.
- When a sheet expands, adjust map padding so the selected marker remains
  visible.
- Preserve map center and selected activity across orientation changes.

## Responsive test matrix

At minimum verify:

- 320 × 568: constrained legacy mobile.
- 390 × 844: representative modern mobile.
- 844 × 390: mobile landscape.
- 768 × 1024: tablet portrait.
- 1024 × 768: tablet landscape.
- 1440 × 900: desktop.
- 200% text resizing and 400% browser zoom from a 1280 px viewport (320 CSS px).
- An open software keyboard and expanded sheet on a mobile-sized viewport.

Check:

- No clipped critical actions.
- No horizontal page scroll.
- Dialogs and sheets fit the viewport.
- Focus is not hidden behind sticky UI.
- Map attribution remains visible.
- Text resizing does not remove information.
- Sheet controls remain reachable without dragging; modal/nonmodal focus
  follows the [accessibility contract](./accessibility.md#keyboard-and-focus).

## Resumen en español

Responsive no significa encoger el escritorio. En móvil se usa configurador
compacto, mapa y hoja inferior; en tablet aparece un rail y en escritorio pueden
coexistir planificador, mapa y contexto. La misión activa transforma la
prioridad para destacar la hora de regreso y el margen restante.
También se comprueban el teclado móvil abierto, hojas expandidas y reflujo a
320 píxeles CSS con zoom al 400%, sin ocultar controles críticos.
