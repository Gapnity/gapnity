# Smarter design ideas for GAPNITY

The Product Pack describes a solid agile retrospective analytics tool.
These improvements push it toward something people actually keep open
every day — closer to Linear's "feels alive" quality than a BI dashboard.

## 1. Command bar (`⌘K`)

Every page, every action, one keystroke away. Typing a question (not
just a command) opens the Copilot with the query pre-filled.

Why: the spec has 8 screens. Users currently need to know where things
live. A palette collapses the navigation cost to zero and is the single
best pattern for power users.

Implemented in `components/shared/CommandBar.tsx`.

## 2. Persistent AI Copilot side panel

Rather than a dedicated "AI facilitator" page you navigate to, the
Copilot is a right-side drawer that opens in context on any screen
with `⌘⇧K` or the top-bar button. It ships with suggested prompts that
change based on what the user is looking at (e.g. on the sprint page it
asks "why did 2 stories spill over?").

Why: the highest-value question in a retro is usually "why is this
happening right now?" — which means the AI must come to the user, not
the other way around.

Implemented in `components/layout/CopilotPanel.tsx`.

## 3. Predictive delivery-risk banner (above the fold)

Instead of waiting for the retro to reveal risk, the dashboard predicts
it *during* the sprint. Signals (recurring themes re-appearing, flaky
test spikes, carryover streaks) roll up into a LOW / MEDIUM / HIGH
banner with the top 3 signals explained inline.

Why: shifts the product from postmortem analytics to a leading
indicator. This is the real differentiator vs. meeting-summarizer tools.

Implemented in `components/dashboard/RiskBanner.tsx`.

## 4. Contradiction detector

The spec mentions "contradiction detection" as a unique feature but
doesn't surface it in the UI. Here it lives as a distinct amber panel
on the sprint detail page — "planning assumed X; execution showed Y."

Why: this is one of the most memorable, share-worthy things the product
can do. It should not be hidden inside an analytics tab.

Implemented in `app/sprints/[id]/page.tsx` (CompareRow + contradictions box).

## 5. One-click sprint comparison (split view)

Dashboard has a primary "Compare with Sprint 23" button. On the sprint
page, toggling compare mode enables a side-by-side diff of themes,
actions, and KPIs — not a separate tool, just a second column.

Why: comparison is the #1 retro question. Burying it behind a dropdown
is friction. The URL pattern `?compare=s23` makes it shareable.

## 6. Stakeholder pulse (instead of separate tabs)

The spec has a "stakeholder views" screen with tabs per role.
Tabs encourage context-switching. Instead, the dashboard has a small
"Stakeholder pulse" card that shows what each role should care about
right now, and clicking drills into a pre-filtered view.

Why: most teams live on one dashboard. Role-tailored insights should
be insight-first, not navigation-first.

## 7. Evidence-first cards

Every claim in the sprint detail (each inferred issue, each action)
shows confidence score + supporting evidence quotes. No floating
insights without a source.

Why: LLMs fail trust the moment they invent something. Making evidence
a first-class UI element — not an expandable — is the single best
trust-builder. Also makes the product QA-friendly.

Implemented in `app/sprints/[id]/page.tsx` (AI-inferred root causes list).

## 8. Memory graph as a real graph, not a sidebar

The graph gets its own page (`/memory`) with colored rings per entity
type. Users can jump from the graph to any theme/issue/action.

Why: the graph IS the product's moat. Burying it as a decoration in
the sprint page under-sells the core differentiator.

Implemented in `components/graph/MemoryGraph.tsx`.

## 9. Dark + accent gradient with subtle grid

Dark UI with a small indigo→sky accent on hero elements and brand
marks. Lots of neutral grays for data so colored cells (severity,
effectiveness) read naturally.

Why: the target users (engineering managers, QA leads, agile coaches)
spend all day in dashboards. Low-contrast dark UIs with pops of color
reduce eye strain and make variance pop.

## 10. Explainable scoring

`app/services/scorer.py` implements §12 as pure, readable functions —
so every score on the dashboard traces back to explicit signals and
weights. When a user asks "why is improvement score 58?", the answer
is a short code block, not a mystery.

Why: auditability is a product feature. Opaque AI scoring destroys trust.

---

## Stretch ideas worth considering next

- **Auto-experiment tracker.** When an AI recommendation becomes an
  action, record the hypothesis + success metric and watch for the
  result 1-2 sprints later. Surface it as "Experiment #14: pre-reading
  AC → zero AC rewrites ✅".
- **Silent failure mode.** When a recurring theme is *not* mentioned
  in the current retro but signals show it's still present, the
  Copilot should ask about it — prevents teams from moving on
  prematurely.
- **Weekly digest email.** Friday digest per role with 3 bullets + link
  back to the dashboard. Drives weekly active use.
- **Integrations as trust.** Every evidence line should link out to its
  source (Jira ticket, Slack message, CI log). The memory graph
  becomes a routing layer.
