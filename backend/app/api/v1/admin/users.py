from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_super_admin
from app.models.user import User, UserType
from app.schemas.admin.users import AdminUserResponse, AdminUserUpdate
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[AdminUserResponse])
def list_users(
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    user_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    is_verified: Optional[bool] = Query(None),
):
    q = db.query(User).filter(User.user_type != UserType.SUPER_ADMIN)

    if search:
        term = f"%{search}%"
        q = q.filter(
            (User.first_name.ilike(term))
            | (User.last_name.ilike(term))
            | (User.email.ilike(term))
        )
    if user_type:
        q = q.filter(User.user_type == user_type)
    if is_active is not None:
        q = q.filter(User.is_active.is_(is_active))
    if is_verified is not None:
        q = q.filter(User.is_verified.is_(is_verified))

    total = q.count()
    items = q.order_by(User.created_at.desc()).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.get("/{user_id}", response_model=AdminUserResponse)
def get_user(
    user_id: UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(User.id == user_id, User.user_type != UserType.SUPER_ADMIN).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=AdminUserResponse)
def update_user(
    user_id: UUID,
    data: AdminUserUpdate,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(User.id == user_id, User.user_type != UserType.SUPER_ADMIN).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
