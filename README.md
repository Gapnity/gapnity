# GAPNITY

Retrospective intelligence platform — turn sprint meetings into measurable improvement.

This repository is a working starter based on the GAPNITY Product Pack.
It contains a Next.js 14 frontend and a FastAPI backend, wired together with
fixture data so you can demo the whole UI immediately, and a clean path to
swap in a real LLM and Postgres.

```
gapnity/
├── frontend/     Next.js 14 App Router, Tailwind, Recharts, Lucide
├── backend/      FastAPI + Pydantic + SQLAlchemy + pgvector
└── docker-compose.yml
```

## Quick start — no LLM, no DB

```bash
# Terminal 1 — backend (uses in-memory fixtures)
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev        # → http://localhost:3000
```

The frontend automatically falls back to mock data when the backend is
unreachable, so you can even demo the UI standalone.

## Quick start with LLM + Postgres

```bash
cp backend/.env.example backend/.env
# fill in ANTHROPIC_API_KEY and set LLM_PROVIDER=anthropic
docker compose up --build
```

## What's implemented

Frontend screens (from Product Pack §9):

- Dashboard — metric cards, trends, top recurring issues, stakeholder pulse
- Sprint detail — summary, root causes with evidence, comparison panel
- Action effectiveness board — New → In progress → Completed → Effective → Not effective
- Recurring patterns heatmap — 6-sprint severity matrix + AI experiment suggestions
- Memory graph — SVG visualization of themes/issues/actions/owners/outcomes
- Ingest page — paste transcript, analyze
- AI Copilot — suggested prompts + global side panel

Smart improvements layered on top (see `DESIGN_IMPROVEMENTS.md`):

- `⌘K` command palette for navigation + NL queries
- Persistent AI Copilot side panel (toggle with `⌘⇧K`)
- Predictive delivery-risk banner above the fold
- One-click sprint comparison
- Contradiction-detector callout in sprint detail
- Stakeholder-specific pulse card

Backend endpoints (§14):

- `POST /api/meetings/analyze`
- `GET  /api/sprints`, `GET /api/sprints/{id}`
- `GET  /api/dashboard/team/{team_id}`
- `GET  /api/actions`, `POST /api/actions/{id}/evaluate`
- `GET  /api/themes/recurring`
- `GET  /api/memory/graph`
- `POST /api/copilot`

Plus:

- `app/prompts/library.py` — verbatim Product Pack §13 prompts
- `app/services/scorer.py` — action effectiveness, team health, improvement score (§12)
- `app/services/llm.py` — Anthropic / OpenAI / mock provider switch
- `app/db/models.py` — SQLAlchemy models mirroring §11

## Build order (from Product Pack §19)

1. ✅ Transcript upload + analysis API
2. ✅ Structured output persisted in DB (schema ready; wire `get_db` into routers)
3. ✅ Dashboard + sprint detail pages
4. ✅ Sprint comparison
5. ✅ Recurring issue detection (heatmap)
6. ✅ Action effectiveness scoring
7. ⬜ Jira integration (start with `/api/integrations/jira/import`)

## Evaluation criteria (§20)

When wiring in a real LLM, track:

- Extraction accuracy (manual gold set)
- Hallucination rate (did the model invent owners, tickets, metrics?)
- Action identification accuracy
- Theme clustering quality (V-measure on labeled data)
- Recommendation usefulness (PM rating 1–5)
- User trust score (periodic survey)
