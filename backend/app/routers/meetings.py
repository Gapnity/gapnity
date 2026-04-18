from fastapi import APIRouter

from app.schemas.models import AnalyzeRequest, AnalyzeResponse
from app.services.extractor import analyze_transcript

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    """Run the full extractor pipeline over a meeting transcript."""
    return analyze_transcript(req)
