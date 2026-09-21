from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_user_type
from app.models.user import User, UserType
from app.schemas.user import (
    ProfileCompletionResponse,
    UserProfileUpdateRequest,
    UserResponse,
)

router = APIRouter()

_PHOTOS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads" / "photos"
_ALLOWED_PHOTO_TYPES = {"image/jpeg": "jpg", "image/png": "png"}
_MAX_PHOTO_BYTES = 2 * 1024 * 1024  # 2 MB

_COMPLETION_FIELDS = [
    "first_name",
    "last_name",
    "title",
    "gender",
    "mobile_number",
    "website",
    "linkedin",
    "date_of_birth",
    "company",
    "designation",
    "short_bio",
    "address_city",
    "address_state",
    "address_country",
    "profile_photo_path",
]


# ── Existing endpoints ────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user


@router.get("/", response_model=list[UserResponse])
def list_users(
    _admin: Annotated[User, Depends(require_user_type(UserType.ADMIN))],
):
    return []


# ── Profile endpoints ─────────────────────────────────────────────────────────

@router.get("/me/profile", response_model=UserResponse)
def get_profile(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user


@router.put("/me/profile", response_model=UserResponse)
def update_profile(
    data: UserProfileUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/profile/photo", response_model=UserResponse)
async def upload_profile_photo(
    photo: Annotated[UploadFile, File()],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    content_type = photo.content_type or ""
    if content_type not in _ALLOWED_PHOTO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Photo must be a JPEG or PNG image",
        )

    data = await photo.read()
    if len(data) > _MAX_PHOTO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Photo must be smaller than 2 MB",
        )

    ext = _ALLOWED_PHOTO_TYPES[content_type]
    _PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
    dest = _PHOTOS_DIR / f"{current_user.id}.{ext}"
    dest.write_bytes(data)

    current_user.profile_photo_path = f"uploads/photos/{current_user.id}.{ext}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/completion", response_model=ProfileCompletionResponse)
def get_completion(
    current_user: Annotated[User, Depends(get_current_user)],
):
    missing = [
        f for f in _COMPLETION_FIELDS
        if not getattr(current_user, f, None)
    ]
    percentage = round(
        (len(_COMPLETION_FIELDS) - len(missing)) / len(_COMPLETION_FIELDS) * 100
    )
    return ProfileCompletionResponse(percentage=percentage, missing_fields=missing)
