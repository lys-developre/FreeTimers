# Visual direction

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Design system](./design-system.md)

## Core statement

> FreeTimers is a contemporary field notebook combined with a precise
> cartographic planning instrument.

The interface should communicate exploration, time awareness, and calm
confidence. It is personal rather than promotional, editorial rather than
corporate, and useful rather than decorative.

## Personality

FreeTimers is:

- **Cartographic:** location, reachability, and movement are first-class.
- **Editorial:** missions are framed as meaningful experiences, not inventory.
- **Tactile:** controls should feel deliberate and usable outdoors.
- **Calm:** urgency is communicated clearly without constant alarm styling.
- **Honest:** uncertainty, stale data, and missing coverage remain visible.
- **Personal:** language feels like a trusted travel companion, not a sales
  funnel.

FreeTimers is not:

- A generic analytics dashboard.
- A travel booking marketplace.
- A social feed or gamified points system.
- A futuristic command center.
- A collection of interchangeable component-library cards.

## Composition

### Mobile

The mobile experience is map-led and decision-led:

- A compact planning control surface.
- A map that remains visually available while evaluating activities.
- A bottom sheet for contextual details.
- Persistent return-time status during an active mission.
- One obvious primary action per state.

Avoid stacking every section into isolated cards. Prefer:

- Shared surfaces.
- Dividers.
- Typographic hierarchy.
- Spatial grouping.
- Progressive disclosure.

### Wide screens

Use the extra space to show context simultaneously, not to inflate components:

- Planning controls in a stable side panel.
- Map as the primary canvas.
- Mission context in a secondary panel or contextual drawer.
- No decorative KPI row unless a metric directly changes the decision.

## Typography

The intended typographic voice combines:

- A readable humanist or grotesk sans serif for controls and dense information.
- An optional restrained editorial face for major mission titles or narrative
  memories.
- Tabular numerals for time, distance, budget, and return estimates.

Typography must create hierarchy before borders or containers do. Avoid extreme
letter spacing, tiny uppercase labels, and oversized marketing headlines in
operational screens.

## Color

The existing palette is a valid starting point:

- Warm paper background.
- Deep forest ink and action color.
- Muted mineral text.
- Terracotta accent.

Reachability colors have semantic meaning:

- Green: return estimate preserves the configured margin.
- Amber: return appears possible but consumes the margin.
- Red: the calculated trip exceeds the available window.
- Gray or hatched: unknown, stale, or unsupported.

These colors encode [temporal feasibility](../data/feasibility.md), never
ranking position, preference strength or physical safety. Selected and saved
states need a distinct visual treatment.

Never use color as the only signal. Pair it with:

- Labels.
- Patterns or line styles.
- Icons with accessible text.
- Numeric time information.

## Shape and elevation

- Prefer restrained radii or squared editorial geometry.
- Use elevation only for actual spatial layers: floating controls, bottom
  sheets, dialogs, and active map overlays.
- Do not wrap every content group in a rounded rectangle.
- Borders should clarify structure, not decorate empty space.

## Imagery and maps

- The map is not a hero background. It is an interactive decision surface.
- Photography should represent a mission or memory, not fill empty layout.
- Historical images must display source and license context.
- Map markers should encode category or status only when that distinction is
  useful.
- Cluster dense markers rather than creating visual noise.

## Motion

Motion explains:

- A recalculated reachability zone.
- A selected activity.
- A transition into an active mission.
- A changed return status.

Motion must not:

- Delay critical information.
- continuously pulse without actionable meaning;
- move the map unexpectedly while the user is reading;
- ignore reduced-motion preferences.

## Anti-generic checklist

Reject or revise a design when it relies on:

- Navbar, marketing hero, three cards, and a generic CTA.
- Purple or blue gradients unrelated to the product.
- Inter/Roboto plus large rounded cards as the only visual identity.
- Decorative statistics.
- Icons without semantic purpose.
- Centered layouts for operational data.
- Excessive pills, badges, and glass effects.
- Generic dashboard sidebars on mobile.
- Component-library defaults left visually unchanged.
- Empty whitespace that makes critical controls slower to reach.

## Resumen en español

FreeTimers debe parecer un cuaderno de campo contemporáneo combinado con una
herramienta cartográfica precisa. El mapa es funcional, las misiones tienen un
tratamiento editorial y la información de regreso tiene prioridad. Se deben
evitar dashboards SaaS, cards innecesarias, gradientes decorativos, métricas sin
función e interfaces centradas como una landing page.
