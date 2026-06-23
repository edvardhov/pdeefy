from fastapi import APIRouter

from app.constants import API_VERSION, HEALTH_STATUS_OK

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": HEALTH_STATUS_OK, "version": API_VERSION}
