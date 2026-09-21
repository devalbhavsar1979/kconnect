from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.academic import AcademicDetail
from app.models.user import User
from app.schemas.academic import AcademicDetailCreate, AcademicDetailResponse, AcademicDetailUpdate

router = APIRouter()


@router.get("", response_model=list[AcademicDetailResponse])
def list_academic(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return (
        db.query(AcademicDetail)
        .filter(AcademicDetail.user_id == current_user.id)
        .order_by(AcademicDetail.end_year.desc().nullslast(), AcademicDetail.created_at.desc())
        .all()
    )


@router.post("", response_model=AcademicDetailResponse, status_code=status.HTTP_201_CREATED)
def create_academic(
    data: AcademicDetailCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    entry = AcademicDetail(**data.model_dump(), user_id=current_user.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=AcademicDetailResponse)
def update_academic(
    entry_id: UUID,
    data: AcademicDetailUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    entry = (
        db.query(AcademicDetail)
        .filter(AcademicDetail.id == entry_id, AcademicDetail.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Academic entry not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_academic(
    entry_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    entry = (
        db.query(AcademicDetail)
        .filter(AcademicDetail.id == entry_id, AcademicDetail.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Academic entry not found")
    db.delete(entry)
    db.commit()
