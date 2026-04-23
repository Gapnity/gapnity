from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import meetings, sprints, dashboard, actions, themes, memory, copilot, integrations, workspaces, auth, oauth


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.db.base import init_db, db_is_empty, DATABASE_URL
    init_db()
    if DATABASE_URL:
        if db_is_empty():
            from app.db.seed import seed
            seed()
            print("✅ Database seeded with fixture data.")
        else:
            print("✅ Database already has data — skipping seed.")
    yield


app = FastAPI(title="GAPNITY", version="0.1.0", description="Retrospective intelligence API", lifespan=lifespan)

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "gapnity", "version": app.version}


app.include_router(meetings.router,  prefix="/api/meetings",  tags=["meetings"])
app.include_router(sprints.router,   prefix="/api/sprints",   tags=["sprints"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(actions.router,   prefix="/api/actions",   tags=["actions"])
app.include_router(themes.router,    prefix="/api/themes",    tags=["themes"])
app.include_router(memory.router,    prefix="/api/memory",    tags=["memory"])
app.include_router(copilot.router,        prefix="/api/copilot",        tags=["copilot"])
app.include_router(integrations.router,   prefix="/api/integrations",   tags=["integrations"])
app.include_router(workspaces.router,     prefix="/api/workspaces",     tags=["workspaces"])
app.include_router(auth.router,           prefix="/api/auth",           tags=["auth"])
app.include_router(oauth.router,          prefix="/api/auth",           tags=["oauth"])