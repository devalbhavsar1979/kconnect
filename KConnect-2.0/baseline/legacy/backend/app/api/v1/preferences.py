from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.preferences import UserPreferences
from app.models.user import User
from app.schemas.preferences import UserPreferencesPayload, UserPreferencesResponse

router = APIRouter()


@router.get("", response_model=UserPreferencesResponse)
def get_preferences(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    record = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return record


@router.put("", response_model=UserPreferencesResponse)
def upsert_preferences(
    data: UserPreferencesPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    values = {**data.model_dump(), "user_id": current_user.id}
    stmt = (
        pg_insert(UserPreferences)
        .values(**values)
        .on_conflict_do_update(
            index_elements=["user_id"],
            set_={k: v for k, v in values.items() if k != "user_id"},
        )
    )
    db.execute(stmt)
    db.commit()
    record = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    return record
