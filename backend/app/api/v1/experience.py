from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import nullslast
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.experience import ExperienceEntry
from app.models.user import User
from app.schemas.experience import (
    ExperienceEntryCreate,
    ExperienceEntryResponse,
    ExperienceEntryUpdate,
)

router = APIRouter()


@router.get("", response_model=list[ExperienceEntryResponse])
def list_experience(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return (
        db.query(ExperienceEntry)
        .filter(ExperienceEntry.user_id == current_user.id)
        .order_by(
            ExperienceEntry.is_current.desc(),
            nullslast(ExperienceEntry.start_year.desc()),
            nullslast(ExperienceEntry.start_month.desc()),
        )
        .all()
    )


@router.post("", response_model=ExperienceEntryResponse, status_code=status.HTTP_201_CREATED)
def create_experience(
    data: ExperienceEntryCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    entry = ExperienceEntry(**data.model_dump(), user_id=current_user.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=ExperienceEntryResponse)
def update_experience(
    entry_id: UUID,
    data: ExperienceEntryUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    entry = db.query(ExperienceEntry).filter(
        ExperienceEntry.id == entry_id,
        ExperienceEntry.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Experience entry not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    entry_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    entry = db.query(ExperienceEntry).filter(
        ExperienceEntry.id == entry_id,
        ExperienceEntry.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Experience entry not found")
    db.delete(entry)
    db.commit()
