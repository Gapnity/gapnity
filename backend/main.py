"""GAPNITY — FastAPI entrypoint."""

from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()


import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import meetings, sprints, dashboard, actions, themes, memory, copilot


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    from app.db.base import init_db, db_is_empty, get_db, SessionLocal
    init_db()
    if SessionLocal:
        db = SessionLocal()
        try:
            if db_is_empty(db):
                from app.db.seed import seed
                seed(db)
                print("✅ Database seeded with fixture data.")
            else:
                print("✅ Database already has data — skipping seed.")
        finally:
            db.close()
    else:
        print("⚠️  No DATABASE_URL set — running with in-memory fixtures.")
    yield
    # ── Shutdown (nothing to do) ──────────────────────────────────────────────


app = FastAPI(
    title="GAPNITY",
    version="0.1.0",
    description="Retrospective intelligence API",
    lifespan=lifespan,
)

origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "gapnity", "version": app.version}


app.include_router(meetings.router,  prefix="/api/meetings",  tags=["meetings"])
app.include_router(sprints.router,   prefix="/api/sprints",   tags=["sprints"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(actions.router,   prefix="/api/actions",   tags=["actions"])
app.include_router(themes.router,    prefix="/api/themes",    tags=["themes"])
app.include_router(memory.router,    prefix="/api/memory",    tags=["memory"])
app.include_router(copilot.router,   prefix="/api/copilot",   tags=["copilot"])
