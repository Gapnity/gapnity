"""Thin LLM abstraction.

Supports four providers via the LLM_PROVIDER env var:
  "anthropic" — Claude via Anthropic SDK
  "openai"    — OpenAI or any OpenAI-compatible API (Groq, Together, etc.)
  "groq"      — Groq (free tier, fast) — uses OpenAI SDK with Groq base URL
  "mock"      — deterministic stubs, no keys needed (default)

For Groq: set LLM_PROVIDER=groq, LLM_MODEL=llama-3.3-70b-versatile,
          GROQ_API_KEY=your-key-here
"""
from __future__ import annotations

import json
import os
from typing import Any


class LLM:
    def __init__(self) -> None:
        self.provider = os.getenv("LLM_PROVIDER", "mock")
        self.model = os.getenv("LLM_MODEL", "claude-sonnet-4-6")

    # ─── public API ───────────────────────────────────────────────────────────
    def complete(self, system: str, user: str, json_mode: bool = False) -> str:
        if self.provider == "anthropic":
            return self._anthropic(system, user, json_mode)
        if self.provider in ("openai", "groq"):
            return self._openai_compat(system, user, json_mode)
        return self._mock(system, user, json_mode)

    def complete_json(self, system: str, user: str) -> Any:
        raw = self.complete(system, user, json_mode=True)
        try:
            return json.loads(raw)
        except Exception:
            start = raw.find("[")
            if start == -1:
                start = raw.find("{")
            end = raw.rfind("]")
            if end == -1:
                end = raw.rfind("}")
            if start != -1 and end != -1:
                try:
                    return json.loads(raw[start : end + 1])
                except Exception:
                    pass
            return None

    # ─── providers ────────────────────────────────────────────────────────────
    def _anthropic(self, system: str, user: str, json_mode: bool) -> str:
        from anthropic import Anthropic  # type: ignore
        client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
        msg = client.messages.create(
            model=self.model,
            max_tokens=1500,
            system=system + ("\nRespond ONLY with valid JSON." if json_mode else ""),
            messages=[{"role": "user", "content": user}],
        )
        return "".join(getattr(c, "text", "") for c in msg.content)

    def _openai_compat(self, system: str, user: str, json_mode: bool) -> str:
        """Works with OpenAI, Groq, Together, or any OpenAI-compatible API."""
        from openai import OpenAI  # type: ignore

        if self.provider == "groq":
            client = OpenAI(
                api_key=os.getenv("GROQ_API_KEY", ""),
                base_url="https://api.groq.com/openai/v1",
            )
            model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
        else:
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
            model = os.getenv("LLM_MODEL", "gpt-4o-mini")

        kwargs: dict = dict(
            model=model,
            messages=[
                {"role": "system", "content": system + ("\nRespond ONLY with valid JSON." if json_mode else "")},
                {"role": "user", "content": user},
            ],
            max_tokens=1500,
        )
        # Groq supports json_object mode for most models
        if json_mode and self.provider != "groq":
            kwargs["response_format"] = {"type": "json_object"}

        resp = client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content or ""

    # ─── mock (offline dev) ───────────────────────────────────────────────────
    def _mock(self, system: str, user: str, json_mode: bool) -> str:
        # JSON-mode: structured extraction endpoints
        if json_mode:
            if "theme" in system.lower() or "theme" in user.lower():
                return json.dumps([
                    {"theme_name": "Environment instability",
                     "description": "Staging/QA environments drift or fail unexpectedly.",
                     "evidence": ["'staging down ~2h'", "'deploy rolled back'"]},
                    {"theme_name": "Unclear acceptance criteria",
                     "description": "Stories enter sprint with ambiguous requirements.",
                     "evidence": ["'PO clarified mid-sprint'", "'PR reopened after review'"]},
                ])
            if "root" in system.lower() or "root" in user.lower():
                return json.dumps([
                    {"issue": "Staging down blocked QA",
                     "root_cause": "Seed data drift between dev and staging",
                     "confidence": 0.82,
                     "evidence": ["'same error after deploy'"]},
                ])
            if "action" in system.lower() and "extract" in system.lower():
                return json.dumps([
                    {"description": "Stabilize staging with deterministic seed data",
                     "owner": "Priya", "due_date": "2026-04-22",
                     "related_issue_or_theme": "Environment instability",
                     "confidence": 0.9},
                ])
            if "compare" in system.lower():
                return json.dumps({
                    "recurring_themes": ["Environment instability", "Flaky automation"],
                    "newly_introduced": ["Ambiguous acceptance criteria (checkout)"],
                    "improved": ["Review turnaround time"],
                    "unresolved_actions": 3,
                    "contradictions": ["Planning assumed stable staging; 3 incidents occurred"],
                })
            if "recommend" in system.lower() or "experiment" in system.lower():
                return json.dumps([
                    {"hypothesis": "Pinning seed data reduces staging incidents",
                     "proposed_change": "Containerize seeds; health-check retries",
                     "success_metric": "incidents/sprint <= 1",
                     "expected_impact": "Unblock QA by ~14h/sprint",
                     "owner_suggestion": "Priya (SRE)"},
                    {"hypothesis": "Pre-reading stories reduces AC ambiguity",
                     "proposed_change": "48h pre-read before planning",
                     "success_metric": "zero AC rewrites mid-sprint",
                     "expected_impact": "Cuts mid-sprint scope changes in half",
                     "owner_suggestion": "Arjun (PO)"},
                ])
            return json.dumps({
                "went_well": ["Team collaborated well"],
                "did_not_go_well": ["Testing started late"],
                "decisions": ["Define acceptance criteria earlier"],
                "risks": ["Flaky tests may hide regressions"],
                "open_questions": ["Who owns staging reliability?"],
            })

        # Natural language (copilot chat)
        q = user.lower()

        if "spill" in q or "carryover" in q or "carry" in q:
            return (
                "Two stories carried over in Sprint 24 due to mid-sprint scope creep on the analytics dashboard "
                "and a staging outage on 04/08 that blocked QA verification for ~2h. "
                "The staging incident (conf 88%) is the primary culprit — it ate into the QA window. "
                "Priya's 'Stabilize staging' action (due 2026-04-22) is the direct fix."
            )
        if "environment" in q or "staging" in q or "instability" in q:
            return (
                "Environment instability has appeared in 5 of the last 6 sprints with severity 2–3 each time. "
                "In Sprint 24, staging was down ~2h on 04/08 and a deploy rolled back on 04/11 (conf 88%). "
                "Root cause: seed data drift between dev and staging. "
                "Priya is containerizing DB seeds + adding health-check retries by 2026-04-22."
            )
        if "action" in q and ("improv" in q or "metric" in q or "work" in q or "effective" in q):
            return (
                "Two actions have measurably improved metrics:\n\n"
                "1. Reduce WIP limit to 4 per engineer (Ishan, S22) — effectiveness score 84/100.\n"
                "2. Isolate payment-gateway tests with deterministic fixtures (Mei, S24) — score 78/100, "
                "flaky test rate dropped 62% from S23 to S24.\n\n"
                "One underperformed: 'Split planning sessions' (Lena, S22) scored 31/100 — scope creep persisted."
            )
        if "focus" in q and ("sprint 25" in q or "next" in q):
            return (
                "Top 3 priorities for Sprint 25:\n\n"
                "1. Verify staging fix lands — Priya's action due 2026-04-22. If it doesn't close, "
                "environment instability hits S25 for the 6th straight sprint.\n"
                "2. AC pre-reads — Arjun's 48h pre-read (due 2026-04-20) targets the checkout AC issue.\n"
                "3. Watch carryover — 2 stories carried over again. Revisit scope commitment at planning."
            )
        if "health" in q or "trend" in q:
            return (
                "Team health over 6 sprints: S19 (61) → S20 (64) → S21 (67) → S22 (69) → S23 (66) → S24 (72). "
                "The S23 dip correlated with peak staging incidents. Current 72/100 is the window high. "
                "Action effectiveness at 64/100 (↓3%) is the lagging indicator to watch."
            )
        if "recurring" in q or "failed" in q or "unresolved" in q:
            return (
                "Two themes have resisted resolution across 5+ sprints:\n\n"
                "1. Environment instability (5/6 sprints) — current action is the most targeted fix yet.\n"
                "2. Flaky automation (5/6 sprints) — Mei's fixtures reduced flakiness 62% but "
                "full quarantine logic is still needed to close it permanently."
            )
        return (
            "Sprint 24: completion 78% (↑4%), team health 72/100 (↑6%), action effectiveness 64/100 (↓3%). "
            "Primary risk: environment instability in 5/6 sprints, 3 incidents this sprint. "
            "Priya owns the staging fix due 2026-04-22. Ask me about patterns, actions, or specific sprints."
        )


llm = LLM()