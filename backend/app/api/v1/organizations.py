from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user, require_user_type
from app.models.user import User, UserType

router = APIRouter()


@router.get("/")
def list_organizations(
    _current_user: Annotated[User, Depends(get_current_user)],
):
    return {"message": "Organization endpoints coming soon", "items": []}


@router.post("/", status_code=201)
def create_organization(
    _current_user: Annotated[User, Depends(require_user_type(UserType.VENDOR, UserType.ADMIN))],
):
    return {"message": "Organization creation coming soon"}
