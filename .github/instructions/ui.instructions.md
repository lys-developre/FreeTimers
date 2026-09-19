---
description: Product-specific UX, visual, responsive, and accessibility rules
applyTo: "src/**/*.{ts,tsx,css}"
---

# UI implementation rules

Before implementing a substantial screen or redesign:

1. Read `docs/design/README.md`.
2. Identify the primary user decision and action.
3. Define mobile structure and non-happy states before JSX.
4. Use `docs/design/screen-spec-template.md` for significant screens.

Preserve these invariants:

- FreeTimers is a personal cartographic planning instrument, not a SaaS
  dashboard, marketplace, or social feed.
- Design mobile-first. Wider layouts expose context; they do not merely enlarge
  mobile components.
- Return deadline, feasibility, margin, and stale/unknown data outrank
  decorative content.
- Never use color as the only indicator of reachability or risk.
- The map must have an equivalent textual activity list and status summary.
- Do not default to cards, pills, icons, gradients, centered composition, or
  generic dashboard navigation.
- Reuse semantic tokens and existing patterns. Justify new product-wide visual
  patterns.
- Define default, focus-visible, active, disabled, loading, error, and touch
  behavior for interactive components.
- Preserve the last valid result while recalculating, but label it stale.
- Respect reduced motion and avoid motion that delays critical information.
- Keep the interface interactive while maps, routes, or LLM explanations load.
- Use Spanish for product copy and English for code identifiers.

After implementation:

- Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` when
  they cover the change.
- Validate in a real browser at representative mobile and desktop widths.
- Check keyboard focus, 200% zoom, reduced motion, and console errors.
- Use `.github/prompts/review-product-ui.prompt.md` for significant screens.
