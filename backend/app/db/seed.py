"""Seed the database with fixture data that mirrors the frontend mock data.

Run once after init_db(). Safe to call again — checks for existing data first.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.models import (
    Action, Decision, EvidenceLink, Issue, Meeting, Outcome,
    Sprint, Team, Theme, User,
)


def seed(db: Session) -> None:
    """Insert all fixture data. No-op if team 'platform' already exists."""
    existing = db.query(Team).filter_by(id="platform").first()
    if existing:
        return

    # ── Team ─────────────────────────────────────────────────────────────────
    team = Team(id="platform", name="Platform Team")
    db.add(team)

    # ── Users ─────────────────────────────────────────────────────────────────
    users = [
        User(id="priya",  team_id="platform", name="Priya",  role="SRE"),
        User(id="arjun",  team_id="platform", name="Arjun",  role="PO"),
        User(id="mei",    team_id="platform", name="Mei",    role="QA"),
        User(id="ishan",  team_id="platform", name="Ishan",  role="EM"),
        User(id="lena",   team_id="platform", name="Lena",   role="Dev"),
    ]
    db.add_all(users)

    # ── Sprints S19–S24 ───────────────────────────────────────────────────────
    sprints = [
        Sprint(id="s19", team_id="platform", name="Sprint 19", start_date="2025-12-08", end_date="2025-12-19", state="closed"),
        Sprint(id="s20", team_id="platform", name="Sprint 20", start_date="2025-12-22", end_date="2026-01-09", state="closed"),
        Sprint(id="s21", team_id="platform", name="Sprint 21", start_date="2026-01-12", end_date="2026-01-23", state="closed"),
        Sprint(id="s22", team_id="platform", name="Sprint 22", start_date="2026-01-26", end_date="2026-02-06", state="closed"),
        Sprint(id="s23", team_id="platform", name="Sprint 23", start_date="2026-02-09", end_date="2026-03-06", state="closed"),
        Sprint(id="s24", team_id="platform", name="Sprint 24", start_date="2026-04-06", end_date="2026-04-17", state="active"),
    ]
    db.add_all(sprints)

    # ── Themes ────────────────────────────────────────────────────────────────
    themes = [
        Theme(id="t_env",   team_id="platform", canonical_name="Environment instability",    description="Staging/CI environment failures blocking QA or deployments"),
        Theme(id="t_ac",    team_id="platform", canonical_name="Unclear acceptance criteria", description="AC ambiguity causing mid-sprint clarification or rewrites"),
        Theme(id="t_flaky", team_id="platform", canonical_name="Flaky automation",            description="Non-deterministic test failures costing engineer time"),
        Theme(id="t_dep",   team_id="platform", canonical_name="External dependency delays",  description="Blocked on third-party APIs or team dependencies"),
        Theme(id="t_scope", team_id="platform", canonical_name="Mid-sprint scope creep",      description="Stories expanded or added after sprint start"),
        Theme(id="t_carry", team_id="platform", canonical_name="Story carryover",             description="Stories not completed within the sprint"),
    ]
    db.add_all(themes)

    # ── Issues S24 ────────────────────────────────────────────────────────────
    issues = [
        Issue(id="i1", sprint_id="s24", theme_id="t_env",   description="Staging environment flaky; blocks QA verification",         severity="high",   confidence_score=0.88),
        Issue(id="i2", sprint_id="s24", theme_id="t_ac",    description="Ambiguous acceptance criteria on checkout flow",             severity="medium", confidence_score=0.74),
        Issue(id="i3", sprint_id="s24", theme_id="t_flaky", description="Regression suite flakiness on payment gateway mocks",        severity="high",   confidence_score=0.81),
        Issue(id="i4", sprint_id="s23", theme_id="t_env",   description="Staging incidents slowed final validation sprint 23",        severity="high",   confidence_score=0.85),
        Issue(id="i5", sprint_id="s22", theme_id="t_flaky", description="Payment gateway test failures S22",                          severity="medium", confidence_score=0.79),
    ]
    db.add_all(issues)

    # ── Evidence ──────────────────────────────────────────────────────────────
    evidence = [
        EvidenceLink(id="e1", sprint_id="s24", source_type="transcript", source_ref="standup-2026-04-08", description="Standup 04/08: 'env down ~2h'"),
        EvidenceLink(id="e2", sprint_id="s24", source_type="transcript", source_ref="standup-2026-04-11", description="Standup 04/11: 'deploy failed, rolled back'"),
        EvidenceLink(id="e3", sprint_id="s24", source_type="transcript", source_ref="retro-s24",          description="Retro: 'PO clarified mid-sprint'"),
        EvidenceLink(id="e4", sprint_id="s24", source_type="github",     source_ref="PR#812",             description="PR #812 reopened after review"),
    ]
    db.add_all(evidence)

    # ── Actions ───────────────────────────────────────────────────────────────
    actions = [
        Action(id="a1", sprint_id="s24", issue_id="i1", description="Stabilize staging: containerize DB seeds + add health-check retry", owner_name="Priya", due_date="2026-04-22", status="in_progress"),
        Action(id="a2", sprint_id="s24", issue_id="i2", description="PO pre-reads stories 48h before sprint start",                      owner_name="Arjun", due_date="2026-04-20", status="new"),
        Action(id="a3", sprint_id="s24", issue_id="i3", description="Isolate payment-gateway tests with deterministic fixtures",          owner_name="Mei",   due_date="2026-04-02", status="completed", effectiveness_score=78),
        Action(id="a4", sprint_id="s23", issue_id=None,  description="Reduce WIP limit to 4 per engineer",                               owner_name="Ishan", due_date="2026-03-18", status="effective",  effectiveness_score=84),
        Action(id="a5", sprint_id="s23", issue_id=None,  description="Split planning into scoping + estimation sessions",                 owner_name="Lena",  due_date="2026-03-19", status="not_effective", effectiveness_score=31),
        Action(id="a6", sprint_id="s23", issue_id=None,  description="Add definition-of-ready checklist to Jira template",               owner_name="Arjun", due_date="2026-03-03", status="completed", effectiveness_score=66),
    ]
    db.add_all(actions)

    # ── Decisions ─────────────────────────────────────────────────────────────
    decisions = [
        Decision(id="d1", sprint_id="s24", description="Checkout v2 shipped ahead of demo — no rollback needed"),
        Decision(id="d2", sprint_id="s24", description="Analytics dashboard scope reduced by 1 story to protect deadline"),
    ]
    db.add_all(decisions)

    # ── Outcomes ──────────────────────────────────────────────────────────────
    outcomes = [
        Outcome(id="o1", action_id="a4", next_sprint_id="s24", outcome_label="improved",  notes="Flaky rate -62% S23→S24 after deterministic fixtures"),
        Outcome(id="o2", action_id="a5", next_sprint_id="s24", outcome_label="no_change", notes="Scope creep persisted despite split planning sessions"),
    ]
    db.add_all(outcomes)

    # ── Meeting transcript placeholder ────────────────────────────────────────
    meeting = Meeting(
        id="m1",
        sprint_id="s24",
        meeting_type="retrospective",
        title="Sprint 24 Retrospective",
        transcript_text=(
            "Facilitator: Let's start with what went well.\n"
            "Priya: Checkout v2 launched with zero rollbacks.\n"
            "Arjun: PO pre-reads are working — almost no AC rewrites mid-sprint.\n"
            "Mei: Payment gateway tests finally stable with deterministic fixtures.\n"
            "Facilitator: What didn't go well?\n"
            "Ishan: Staging was down again on 04/08 for ~2h. Blocked QA verification.\n"
            "Lena: Two stories carried over — scope crept on analytics dashboard.\n"
            "Priya: Flaky tests spiked 22% vs last sprint.\n"
        ),
    )
    db.add(meeting)

    db.commit()
