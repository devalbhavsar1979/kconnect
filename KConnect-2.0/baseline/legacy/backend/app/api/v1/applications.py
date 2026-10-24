from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/")
def list_my_applications(
    _current_user: Annotated[User, Depends(get_current_user)],
):
    # Full implementation in the next phase
    return {"message": "Application endpoints coming soon", "items": []}


@router.post("/", status_code=201)
def submit_application(
    _current_user: Annotated[User, Depends(get_current_user)],
):
    return {"message": "Application submission coming soon"}
