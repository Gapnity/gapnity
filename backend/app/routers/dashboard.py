"""Dashboard router — reads from DB when available, falls back to fixtures."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.schemas.models import DashboardMetrics
from app.services.scorer import delivery_risk

router = APIRouter()


def _fixture_dashboard() -> DashboardMetrics:
    risk_signals = [
        "Environment blockers reappeared in 3 standups",
        "Flaky test count up 22% vs last sprint",
        "2 stories carried over for the 3rd sprint in a row",
    ]
    return DashboardMetrics(
        sprint_name="Sprint 24",
        completion_rate=0.78,
        action_effectiveness=64,
        team_health=72,
        improvement_score=58,
        delivery_risk="medium",
        risk_signals=risk_signals,
    )


@router.get("/team/{team_id}", response_model=DashboardMetrics)
def team_dashboard(team_id: str, db: Session = Depends(get_db)) -> DashboardMetrics:
    if db is None:
        return _fixture_dashboard()

    from app.db.models import Sprint, Action, Issue
    from app.services.scorer import action_effectiveness_score, team_health_score, improvement_score

    # Get the active sprint for this team
    active_sprint = (
        db.query(Sprint)
        .filter(Sprint.team_id == team_id, Sprint.state == "active")
        .first()
    )
    if not active_sprint:
        return _fixture_dashboard()

    sprint_id = active_sprint.id

    # Actions for current sprint
    sprint_actions = db.query(Action).filter(Action.sprint_id == sprint_id).all()
    all_actions = db.query(Action).filter(Action.sprint_id.in_(
        [s.id for s in db.query(Sprint).filter(Sprint.team_id == team_id).all()]
    )).all()

    # Completion rate: completed + effective + not_effective / total
    total = len(sprint_actions)
    done_statuses = {"completed", "effective", "not_effective"}
    completed = sum(1 for a in sprint_actions if a.status in done_statuses)
    completion = round(completed / total, 2) if total else 0.78

    # Action effectiveness score
    scored = [a for a in all_actions if a.effectiveness_score is not None]
    avg_effectiveness = int(sum(a.effectiveness_score for a in scored) / len(scored)) if scored else 64

    # Risk signals from open issues
    open_issues = db.query(Issue).filter(
        Issue.sprint_id == sprint_id
    ).all()
    risk_signals = []
    high_issues = [i for i in open_issues if i.severity == "high"]
    if high_issues:
        risk_signals.append(f"{len(high_issues)} high-severity issue(s) open this sprint")
    carried = sum(1 for a in sprint_actions if a.status == "new")
    if carried > 0:
        risk_signals.append(f"{carried} action(s) not yet started")
    if not risk_signals:
        risk_signals = ["No critical signals detected"]

    risk_level = delivery_risk([True] * len([s for s in risk_signals if s]))

    return DashboardMetrics(
        sprint_name=active_sprint.name,
        completion_rate=completion,
        action_effectiveness=avg_effectiveness,
        team_health=team_health_score(),
        improvement_score=improvement_score(),
        delivery_risk=risk_level if len(risk_signals) >= 2 else "low",
        risk_signals=risk_signals,
    )
