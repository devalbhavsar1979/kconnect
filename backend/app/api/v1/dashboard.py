from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/")
def get_dashboard(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return {
        "message": "Dashboard coming soon",
        "user_id": str(current_user.id),
        "user_type": current_user.user_type,
    }
