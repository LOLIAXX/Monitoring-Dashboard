from fastapi import APIRouter, Depends

from app.api.deps import require_permission
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/test")
def admin_test(current_user: User = Depends(require_permission("admin:users"))) -> dict:
    return {"message": "access granted"}
