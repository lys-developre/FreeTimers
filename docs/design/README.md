# FreeTimers product design

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Documentation index](../README.md) · [Implementation status](../implementation-status.md)

This directory is the canonical source for FreeTimers product experience and
visual design decisions. It exists to keep human contributors and coding agents
aligned without turning design guidance into a long, always-on prompt.

## Design position

FreeTimers is a personal, local-first, mobile-first planning instrument. It
should feel like a contemporary field notebook and a precise cartographic tool,
not a SaaS dashboard, travel marketplace, or social feed.

The map is functional. Mission content is editorial. Safety and return-time
information always outrank decoration.

## Documents

| Document | Purpose |
| --- | --- |
| [Visual direction](./visual-direction.md) | Product personality, composition, imagery, and anti-generic rules |
| [Experience principles](./experience-principles.md) | User decisions, information hierarchy, and product behavior |
| [Design system](./design-system.md) | Tokens, typography, color, spacing, shape, and component rules |
| [Responsive behavior](./responsive-behavior.md) | How the experience changes across device capabilities |
| [Interaction states](./interaction-states.md) | Loading, error, success, active mission, and microinteraction behavior |
| [Voice, tone and Bardeo](./voice-and-tone.md) | Severity-aware communication, regional personality, strong-language opt-in and AI permissions |
| [Active mission](./active-mission.md) | Adaptive itinerary, progress, checklist, learned observations, voice and offline behavior |
| [Accessibility](./accessibility.md) | Accessibility requirements and verification checklist |
| [Screen specification template](./screen-spec-template.md) | Required planning artifact before implementing a significant screen |
| [Plan Now configurator](./plan-now.md) | Current implementation and evidence for the first planning screen |

## Required workflow

For a new screen or a substantial redesign:

1. Read the visual direction and experience principles.
2. Complete a screen specification using the template.
3. Identify the primary decision and action.
4. Define loading, empty, error, stale, offline, and permission states.
5. Define mobile behavior before wider layouts.
6. Reuse tokens and interaction patterns.
7. Implement the smallest coherent version.
8. Review it with
   [`.github/prompts/review-product-ui.prompt.md`](../../.github/prompts/review-product-ui.prompt.md).
9. Verify it in a real browser at representative viewport sizes.
10. Check keyboard operation, focus, contrast, and reduced motion.

## Governance

- These documents describe intent; executable checks remain the authority for
  code quality.
- A new visual pattern requires a documented need, not merely novelty.
- Update the relevant document in the same change that introduces a new
  product-wide pattern.
- Avoid duplicating guidance in agent instructions. Agent files should point
  here and contain only concise operational rules.
- Browser-validation captures, snapshots, and console logs are local-only
  artifacts stored in explicitly ignored directories, using synthetic data.
  Never commit raw captures. Intentionally prepared public demo assets need a
  separate privacy, metadata and license review; ignore rules alone do not
  prevent personal data from being captured.

Reusable workflows:

- [Design a screen](../../.github/prompts/design-screen.prompt.md)
- [Review product UI](../../.github/prompts/review-product-ui.prompt.md)

## Resumen en español

Esta carpeta es la fuente canónica del diseño de FreeTimers. La identidad elegida
es la de un instrumento cartográfico personal con sensibilidad editorial, no un
dashboard SaaS. Antes de implementar una pantalla importante hay que definir su
decisión principal, acción, estados, comportamiento móvil y criterios de
accesibilidad. Los documentos enlazados contienen las reglas completas.
