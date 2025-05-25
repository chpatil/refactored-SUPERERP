from fastapi import APIRouter

from app.api.routes import (
    attendance,
    items,
    leave_requests,
    login,
    private,
    qr_auth,
    reports,
    teams,
    users,
    utils,
    workers,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(workers.router)
api_router.include_router(leave_requests.router, prefix="/leave-requests", tags=["leave-requests"])
api_router.include_router(qr_auth.router, prefix="/qr-auth", tags=["qr-authentication"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
