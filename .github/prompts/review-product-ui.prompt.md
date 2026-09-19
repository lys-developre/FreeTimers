---
name: Review FreeTimers product UI
description: Critique an implemented screen for product clarity, identity, responsiveness, and accessibility
agent: agent
---

Review the requested FreeTimers interface in a real browser.

Read `docs/design/README.md` and inspect the implementation. Test representative
mobile and desktop viewports and relevant interaction states.

Do not modify code during the first phase.

## Phase 1: evidence

Collect:

- Page structure and primary actions.
- Screenshots at representative widths when useful.
- Write generated screenshots, snapshots, traces, and console logs only under
  `.playwright-mcp/`. They are local-only and must never be committed.
- Keyboard and focus behavior.
- Loading, empty, error, stale, offline, and permission behavior.
- Console and runtime errors.
- Responsive transformations.
- Accessibility signals that can be verified in the browser.

## Phase 2: critique

Answer:

1. Is the primary decision clear within the first view?
2. Is the primary action obvious without overpowering safety information?
3. Does it resemble a generic SaaS template, component-library demo, or travel
   marketplace?
4. Are cards, icons, labels, metrics, or containers present without purpose?
5. Does typography create hierarchy before borders and decoration?
6. Does the map function as a decision surface rather than decoration?
7. Are safe, tight, unviable, and unknown distinguishable without color?
8. Does mobile reorganize the task instead of shrinking desktop?
9. Are critical actions usable with one hand and keyboard?
10. Are loading, empty, partial, stale, offline, permission, and error states
    honest and recoverable?
11. Is any important information hidden, duplicated, or overly verbose?
12. Does motion explain state and respect reduced motion?
13. Does the screen protect privacy and avoid exposing personal data?
14. What are the three highest-impact improvements?

Classify findings:

- **Blocker:** can cause an unsafe decision, inaccessible core task, data loss,
  or serious misunderstanding.
- **High:** prevents or materially slows the primary task.
- **Medium:** weakens hierarchy, responsiveness, trust, or product identity.
- **Low:** polish with limited task impact.

## Phase 3: recommendation

Present:

- What already works.
- Findings ordered by severity and impact.
- Three highest-impact changes.
- A concise proposed implementation sequence.

Only modify code after presenting the critique, unless the user explicitly asks
for review and immediate fixes in the same request. After changes, repeat the
relevant browser checks and report before/after evidence.
