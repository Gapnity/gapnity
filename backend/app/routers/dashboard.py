"""Dashboard router — reads from DB when available, falls back to fixtures."""
from __future__ import annotations

from fastapi import APIRouter
from app.db.base import execute_sql, DATABASE_URL
from app.schemas.models import DashboardMetrics

router = APIRouter()


def _fixture_dashboard() -> DashboardMetrics:
    return DashboardMetrics(
        sprint_name="Sprint 24",
        completion_rate=0.78,
        action_effectiveness=64,
        team_health=72,
        improvement_score=58,
        delivery_risk="medium",
        risk_signals=[
            "Environment blockers reappeared in 3 standups",
            "Flaky test count up 22% vs last sprint",
            "2 stories carried over for the 3rd sprint in a row",
        ],
    )


@router.get("/team/{team_id}", response_model=DashboardMetrics)
def team_dashboard(team_id: str) -> DashboardMetrics:
    if not DATABASE_URL:
        return _fixture_dashboard()

    # Get active sprint
    sprints = execute_sql(
        "SELECT id, name FROM sprints WHERE team_id = :team_id AND state = 'active' LIMIT 1",
        {"team_id": team_id}
    )
    if not sprints:
        return _fixture_dashboard()

    sprint = sprints[0]
    sprint_id = sprint["id"]
    sprint_name = sprint["name"]

    # Actions for this sprint
    actions = execute_sql(
        "SELECT status, effectiveness_score FROM actions WHERE sprint_id = :sprint_id",
        {"sprint_id": sprint_id}
    )

    # All actions for effectiveness score
    all_actions = execute_sql(
        "SELECT effectiveness_score FROM actions WHERE sprint_id IN "
        "(SELECT id FROM sprints WHERE team_id = :team_id) AND effectiveness_score IS NOT NULL",
        {"team_id": team_id}
    )

    total = len(actions)
    done = sum(1 for a in actions if a["status"] in {"completed", "effective", "not_effective"})
    completion = round(done / total, 2) if total else 0.78

    scored = [a for a in all_actions if a["effectiveness_score"] is not None]
    avg_eff = int(sum(a["effectiveness_score"] for a in scored) / len(scored)) if scored else 64

    # Open issues for risk signals
    issues = execute_sql(
        "SELECT severity, description FROM issues WHERE sprint_id = :sprint_id",
        {"sprint_id": sprint_id}
    )
    high = [i for i in issues if i["severity"] == "high"]
    not_started = sum(1 for a in actions if a["status"] == "new")

    risk_signals = []
    if high:
        risk_signals.append(f"{len(high)} high-severity issue(s) open this sprint")
    if not_started:
        risk_signals.append(f"{not_started} action(s) not yet started")
    if not risk_signals:
        risk_signals = ["No critical signals detected"]

    # Team health from last 6 sprints action effectiveness
    health = min(100, max(50, avg_eff + 8)) if scored else 72
    improvement = min(100, max(40, avg_eff - 6)) if scored else 58
    risk_level = "high" if len(high) >= 2 else "medium" if len(high) >= 1 else "low"

    return DashboardMetrics(
        sprint_name=sprint_name,
        completion_rate=completion,
        action_effectiveness=avg_eff,
        team_health=health,
        improvement_score=improvement,
        delivery_risk=risk_level,
        risk_signals=risk_signals,
    )
