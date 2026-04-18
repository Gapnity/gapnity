from fastapi import APIRouter
from app.schemas.models import MemoryEdge, MemoryGraph, MemoryNode

router = APIRouter()


@router.get("/graph", response_model=MemoryGraph)
def memory_graph() -> MemoryGraph:
    nodes = [
        MemoryNode(id="th-env",   label="Environment instability", kind="theme"),
        MemoryNode(id="th-flaky", label="Flaky automation",        kind="theme"),
        MemoryNode(id="th-ac",    label="Unclear AC",              kind="theme"),
        MemoryNode(id="i1",       label="Staging down (S24)",      kind="issue"),
        MemoryNode(id="i3",       label="Payment-gateway flakiness", kind="issue"),
        MemoryNode(id="i2",       label="Checkout AC ambiguity",   kind="issue"),
        MemoryNode(id="a1",       label="Stabilize staging",       kind="action"),
        MemoryNode(id="a3",       label="Deterministic fixtures",  kind="action"),
        MemoryNode(id="a2",       label="PO pre-reads",            kind="action"),
        MemoryNode(id="o1",       label="Flaky rate -62% (S23→S24)", kind="outcome"),
        MemoryNode(id="u-priya",  label="Priya",                   kind="owner"),
        MemoryNode(id="u-mei",    label="Mei",                     kind="owner"),
        MemoryNode(id="u-arjun",  label="Arjun",                   kind="owner"),
    ]
    edges = [
        MemoryEdge(**{"from": "i1", "to": "th-env",   "kind": "belongs_to"}),
        MemoryEdge(**{"from": "i3", "to": "th-flaky", "kind": "belongs_to"}),
        MemoryEdge(**{"from": "i2", "to": "th-ac",    "kind": "belongs_to"}),
        MemoryEdge(**{"from": "a1", "to": "i1",       "kind": "addresses"}),
        MemoryEdge(**{"from": "a3", "to": "i3",       "kind": "addresses"}),
        MemoryEdge(**{"from": "a2", "to": "i2",       "kind": "addresses"}),
        MemoryEdge(**{"from": "a3", "to": "o1",       "kind": "resolves"}),
        MemoryEdge(**{"from": "u-priya", "to": "a1",  "kind": "owns"}),
        MemoryEdge(**{"from": "u-mei",   "to": "a3",  "kind": "owns"}),
        MemoryEdge(**{"from": "u-arjun", "to": "a2",  "kind": "owns"}),
    ]
    return MemoryGraph(nodes=nodes, edges=edges)
