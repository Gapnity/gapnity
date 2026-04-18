"""Seed the Neon database via HTTP API. No SQLAlchemy session needed."""
from __future__ import annotations

from app.db.base import execute_sql_write, execute_sql


def _insert(table: str, row: dict) -> None:
    cols = ", ".join(row.keys())
    vals = ", ".join([f"${i+1}" for i in range(len(row))])
    params = list(row.values())
    execute_sql_write(f"INSERT INTO {table} ({cols}) VALUES ({vals}) ON CONFLICT (id) DO NOTHING", params)


def seed() -> None:
    existing = execute_sql("SELECT id FROM teams WHERE id = 'platform'")
    if existing:
        return

    _insert("teams", {"id": "platform", "name": "Platform Team"})

    for u in [
        {"id": "priya",  "team_id": "platform", "name": "Priya",  "role": "SRE"},
        {"id": "arjun",  "team_id": "platform", "name": "Arjun",  "role": "PO"},
        {"id": "mei",    "team_id": "platform", "name": "Mei",    "role": "QA"},
        {"id": "ishan",  "team_id": "platform", "name": "Ishan",  "role": "EM"},
        {"id": "lena",   "team_id": "platform", "name": "Lena",   "role": "Dev"},
    ]:
        _insert("users", u)

    for s in [
        {"id": "s19", "team_id": "platform", "name": "Sprint 19", "start_date": "2025-12-08", "end_date": "2025-12-19", "state": "closed"},
        {"id": "s20", "team_id": "platform", "name": "Sprint 20", "start_date": "2025-12-22", "end_date": "2026-01-09", "state": "closed"},
        {"id": "s21", "team_id": "platform", "name": "Sprint 21", "start_date": "2026-01-12", "end_date": "2026-01-23", "state": "closed"},
        {"id": "s22", "team_id": "platform", "name": "Sprint 22", "start_date": "2026-01-26", "end_date": "2026-02-06", "state": "closed"},
        {"id": "s23", "team_id": "platform", "name": "Sprint 23", "start_date": "2026-02-09", "end_date": "2026-03-06", "state": "closed"},
        {"id": "s24", "team_id": "platform", "name": "Sprint 24", "start_date": "2026-04-06", "end_date": "2026-04-17", "state": "active"},
    ]:
        _insert("sprints", s)

    for t in [
        {"id": "t_env",   "team_id": "platform", "canonical_name": "Environment instability",    "description": "Staging/CI environment failures blocking QA or deployments"},
        {"id": "t_ac",    "team_id": "platform", "canonical_name": "Unclear acceptance criteria", "description": "AC ambiguity causing mid-sprint clarification or rewrites"},
        {"id": "t_flaky", "team_id": "platform", "canonical_name": "Flaky automation",            "description": "Non-deterministic test failures costing engineer time"},
        {"id": "t_dep",   "team_id": "platform", "canonical_name": "External dependency delays",  "description": "Blocked on third-party APIs or team dependencies"},
        {"id": "t_scope", "team_id": "platform", "canonical_name": "Mid-sprint scope creep",      "description": "Stories expanded or added after sprint start"},
        {"id": "t_carry", "team_id": "platform", "canonical_name": "Story carryover",             "description": "Stories not completed within the sprint"},
    ]:
        _insert("themes", t)

    for i in [
        {"id": "i1", "sprint_id": "s24", "theme_id": "t_env",   "description": "Staging environment flaky; blocks QA verification",    "severity": "high",   "confidence_score": 0.88},
        {"id": "i2", "sprint_id": "s24", "theme_id": "t_ac",    "description": "Ambiguous acceptance criteria on checkout flow",        "severity": "medium", "confidence_score": 0.74},
        {"id": "i3", "sprint_id": "s24", "theme_id": "t_flaky", "description": "Regression suite flakiness on payment gateway mocks",   "severity": "high",   "confidence_score": 0.81},
        {"id": "i4", "sprint_id": "s23", "theme_id": "t_env",   "description": "Staging incidents slowed final validation sprint 23",   "severity": "high",   "confidence_score": 0.85},
        {"id": "i5", "sprint_id": "s22", "theme_id": "t_flaky", "description": "Payment gateway test failures S22",                     "severity": "medium", "confidence_score": 0.79},
    ]:
        _insert("issues", i)

    for a in [
        {"id": "a1", "sprint_id": "s24", "issue_id": "i1", "description": "Stabilize staging: containerize DB seeds + add health-check retry", "owner_name": "Priya", "due_date": "2026-04-22", "status": "in_progress"},
        {"id": "a2", "sprint_id": "s24", "issue_id": "i2", "description": "PO pre-reads stories 48h before sprint start",                      "owner_name": "Arjun", "due_date": "2026-04-20", "status": "new"},
        {"id": "a3", "sprint_id": "s24", "issue_id": "i3", "description": "Isolate payment-gateway tests with deterministic fixtures",          "owner_name": "Mei",   "due_date": "2026-04-02", "status": "completed", "effectiveness_score": 78},
        {"id": "a4", "sprint_id": "s23", "description": "Reduce WIP limit to 4 per engineer",                                                   "owner_name": "Ishan", "due_date": "2026-03-18", "status": "effective",  "effectiveness_score": 84},
        {"id": "a5", "sprint_id": "s23", "description": "Split planning into scoping + estimation sessions",                                     "owner_name": "Lena",  "due_date": "2026-03-19", "status": "not_effective", "effectiveness_score": 31},
        {"id": "a6", "sprint_id": "s23", "description": "Add definition-of-ready checklist to Jira template",                                   "owner_name": "Arjun", "due_date": "2026-03-03", "status": "completed", "effectiveness_score": 66},
    ]:
        _insert("actions", a)

    for e in [
        {"id": "e1", "sprint_id": "s24", "source_type": "transcript", "source_ref": "standup-2026-04-08", "description": "Standup 04/08: 'env down ~2h'"},
        {"id": "e2", "sprint_id": "s24", "source_type": "transcript", "source_ref": "standup-2026-04-11", "description": "Standup 04/11: 'deploy failed, rolled back'"},
        {"id": "e3", "sprint_id": "s24", "source_type": "transcript", "source_ref": "retro-s24",          "description": "Retro: 'PO clarified mid-sprint'"},
        {"id": "e4", "sprint_id": "s24", "source_type": "github",     "source_ref": "PR#812",             "description": "PR #812 reopened after review"},
    ]:
        _insert("evidence_links", e)

    for o in [
        {"id": "o1", "action_id": "a4", "next_sprint_id": "s24", "outcome_label": "improved",  "notes": "Flaky rate -62% S23->S24 after deterministic fixtures"},
        {"id": "o2", "action_id": "a5", "next_sprint_id": "s24", "outcome_label": "no_change", "notes": "Scope creep persisted despite split planning sessions"},
    ]:
        _insert("outcomes", o)

    print("✅ Seed data inserted into Neon.")
