from typing import List
from fastapi import APIRouter
from app.schemas.models import Theme

router = APIRouter()

_THEMES: List[Theme] = [
    Theme(id="th-env",   canonical_name="Environment instability",
          description="Staging/QA environments go down or drift", occurrences=5),
    Theme(id="th-ac",    canonical_name="Unclear acceptance criteria",
          description="Stories enter sprint with ambiguity", occurrences=4),
    Theme(id="th-flaky", canonical_name="Flaky automation",
          description="Non-deterministic test failures", occurrences=4),
    Theme(id="th-dep",   canonical_name="External dependency delays",
          description="Blocking work from other teams", occurrences=3),
    Theme(id="th-scope", canonical_name="Mid-sprint scope creep",
          description="New work added after commitment", occurrences=3),
    Theme(id="th-carry", canonical_name="Story carryover",
          description="Unfinished work rolled to next sprint", occurrences=3),
]


@router.get("/recurring", response_model=List[Theme])
def recurring_themes() -> List[Theme]:
    return _THEMES
