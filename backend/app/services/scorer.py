"""Scoring logic from the Product Pack §12.

These are intentionally simple, explainable formulas. Each signal is on a
0..100 scale so dashboards read consistently.
"""
from __future__ import annotations

from typing import Iterable


def action_effectiveness(
    completed: bool,
    on_time: bool,
    issue_recurrence_reduced: bool,
    sprint_kpi_improved: bool,
    sentiment_improved: bool,
) -> int:
    """Weighted sum. Reasonable starting weights; tune with eval data."""
    score = 0
    score += 30 if completed else 0
    score += 15 if on_time else 0
    score += 25 if issue_recurrence_reduced else 0
    score += 20 if sprint_kpi_improved else 0
    score += 10 if sentiment_improved else 0
    return min(max(score, 0), 100)


def team_health(signals: dict) -> int:
    """`signals` values should be 0..1. Missing signals are treated as neutral 0.5."""
    weights = dict(clarity=0.2, confidence=0.15, collaboration=0.2,
                   blockers=-0.15, burnout=-0.15, delivery_stability=0.15)
    total_pos = 0.0
    for key, w in weights.items():
        v = float(signals.get(key, 0.5))
        total_pos += (v if w > 0 else (1 - v)) * abs(w)
    return int(round(total_pos * 100))


def improvement_score(
    recurring_issue_reduction: float,   # 0..1 (share reduced vs prior)
    action_completion: float,           # 0..1
    spillover_reduction: float,         # 0..1
    defects_trend: float,               # -1..1 (positive = worse)
    cycle_time_trend: float,            # -1..1 (positive = worse)
) -> int:
    pos = (recurring_issue_reduction + action_completion + spillover_reduction) / 3
    neg = max(0.0, (defects_trend + cycle_time_trend) / 2)
    score = max(0.0, min(1.0, pos - 0.5 * neg))
    return int(round(score * 100))


def delivery_risk(level_signals: Iterable[bool]) -> str:
    hits = sum(1 for x in level_signals if x)
    if hits >= 3:
        return "high"
    if hits >= 1:
        return "medium"
    return "low"
