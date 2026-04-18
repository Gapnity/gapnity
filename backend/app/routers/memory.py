"""Memory graph router — builds knowledge graph from live DB data."""
from __future__ import annotations

from fastapi import APIRouter
from app.db.base import execute_sql, DATABASE_URL
from app.schemas.models import MemoryEdge, MemoryGraph, MemoryNode

router = APIRouter()


def _fixture_graph() -> MemoryGraph:
    nodes = [
        MemoryNode(id="th-env",   label="Environment instability",   kind="theme"),
        MemoryNode(id="th-flaky", label="Flaky automation",          kind="theme"),
        MemoryNode(id="th-ac",    label="Unclear AC",                kind="theme"),
        MemoryNode(id="i1",       label="Staging down (S24)",        kind="issue"),
        MemoryNode(id="i3",       label="Payment-gateway flakiness", kind="issue"),
        MemoryNode(id="i2",       label="Checkout AC ambiguity",     kind="issue"),
        MemoryNode(id="a1",       label="Stabilize staging",         kind="action"),
        MemoryNode(id="a3",       label="Deterministic fixtures",    kind="action"),
        MemoryNode(id="a2",       label="PO pre-reads",              kind="action"),
        MemoryNode(id="o1",       label="Flaky rate -62% (S23→S24)", kind="outcome"),
        MemoryNode(id="u-priya",  label="Priya",                     kind="owner"),
        MemoryNode(id="u-mei",    label="Mei",                       kind="owner"),
        MemoryNode(id="u-arjun",  label="Arjun",                     kind="owner"),
    ]
    edges = [
        MemoryEdge(**{"from": "i1",      "to": "th-env",   "kind": "belongs_to"}),
        MemoryEdge(**{"from": "i3",      "to": "th-flaky", "kind": "belongs_to"}),
        MemoryEdge(**{"from": "i2",      "to": "th-ac",    "kind": "belongs_to"}),
        MemoryEdge(**{"from": "a1",      "to": "i1",       "kind": "addresses"}),
        MemoryEdge(**{"from": "a3",      "to": "i3",       "kind": "addresses"}),
        MemoryEdge(**{"from": "a2",      "to": "i2",       "kind": "addresses"}),
        MemoryEdge(**{"from": "a3",      "to": "o1",       "kind": "resolves"}),
        MemoryEdge(**{"from": "u-priya", "to": "a1",       "kind": "owns"}),
        MemoryEdge(**{"from": "u-mei",   "to": "a3",       "kind": "owns"}),
        MemoryEdge(**{"from": "u-arjun", "to": "a2",       "kind": "owns"}),
    ]
    return MemoryGraph(nodes=nodes, edges=edges)


@router.get("/graph", response_model=MemoryGraph)
def memory_graph() -> MemoryGraph:
    if not DATABASE_URL:
        return _fixture_graph()

    nodes: list[MemoryNode] = []
    edges: list[MemoryEdge] = []

    # Themes → nodes
    themes = execute_sql("SELECT id, canonical_name FROM themes")
    for t in themes:
        nodes.append(MemoryNode(id=t["id"], label=t["canonical_name"], kind="theme"))

    # Issues → nodes + edges to themes
    issues = execute_sql("SELECT id, description, theme_id, sprint_id FROM issues")
    for i in issues:
        label = (i["description"] or "")[:40]
        nodes.append(MemoryNode(id=i["id"], label=label, kind="issue"))
        if i.get("theme_id"):
            edges.append(MemoryEdge(**{"from": i["id"], "to": i["theme_id"], "kind": "belongs_to"}))

    # Actions → nodes + edges to issues
    actions = execute_sql("SELECT id, description, issue_id, owner_name FROM actions")
    owner_ids: dict[str, str] = {}
    for a in actions:
        label = (a["description"] or "")[:40]
        nodes.append(MemoryNode(id=a["id"], label=label, kind="action"))
        if a.get("issue_id"):
            edges.append(MemoryEdge(**{"from": a["id"], "to": a["issue_id"], "kind": "addresses"}))
        # Track unique owners
        if a.get("owner_name"):
            owner_id = f"u-{a['owner_name'].lower()}"
            owner_ids[owner_id] = a["owner_name"]
            edges.append(MemoryEdge(**{"from": owner_id, "to": a["id"], "kind": "owns"}))

    # Owner nodes
    for oid, oname in owner_ids.items():
        nodes.append(MemoryNode(id=oid, label=oname, kind="owner"))

    # Outcomes → nodes + edges to actions
    outcomes = execute_sql("SELECT id, action_id, outcome_label, notes FROM outcomes")
    for o in outcomes:
        label = (o["notes"] or o["outcome_label"] or "")[:40]
        nodes.append(MemoryNode(id=o["id"], label=label, kind="outcome"))
        if o.get("action_id"):
            edges.append(MemoryEdge(**{"from": o["action_id"], "to": o["id"], "kind": "resolves"}))

    return MemoryGraph(nodes=nodes, edges=edges)
