---
name: Design a FreeTimers screen
description: Define product intent, states, responsive behavior, and accessibility before implementation
agent: agent
---

Design or redesign the requested FreeTimers screen.

Do not write JSX or CSS immediately.

First:

1. Read `docs/design/README.md` and its linked canonical documents.
2. Inspect the current implementation and reuse established patterns.
3. State:
   - the user context;
   - the primary decision;
   - the primary action;
   - the most harmful possible misunderstanding.
4. Separate immediately visible information from progressive disclosure.
5. Define initial, loading, empty, partial, stale, offline, denied-permission,
   unsupported, error, and success states.
6. Define compact mobile, landscape/tablet, and desktop composition. Describe
   structural changes, not only dimensions.
7. Define keyboard, touch, focus, feedback, confirmation, undo, and reduced
   motion behavior.
8. Identify any new visual pattern and justify why existing patterns are
   insufficient.
9. Check the proposal against the anti-generic checklist in
   `docs/design/visual-direction.md`.

Present the screen specification and the smallest coherent implementation plan.
If the request contains a consequential unresolved product decision, ask one
focused question. Otherwise make explicit, reversible assumptions.

After the specification is accepted or the task explicitly requests immediate
implementation:

1. Implement the complete smallest vertical slice.
2. Preserve deterministic safety and data provenance.
3. Add or update tests for behavior rather than appearance alone.
4. Validate in a real browser at representative viewports.
5. Report the implemented states, validation performed, and remaining
   limitations.

