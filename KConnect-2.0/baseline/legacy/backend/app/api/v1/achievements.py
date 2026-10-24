from pathlib import Path
from typing import Annotated, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.achievement import Achievement
from app.models.user import User
from app.schemas.achievement import AchievementResponse

router = APIRouter()

_ACHIEVEMENTS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads" / "achievements"
_ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
_ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".docx"}
_MAX_BYTES = 10 * 1024 * 1024  # 10 MB


async def _save_file(entry_id: UUID, user_id: UUID, upload: UploadFile) -> tuple[str, str]:
    content_type = upload.content_type or ""
    suffix = Path(upload.filename or "").suffix.lower()
    if content_type not in _ALLOWED_TYPES and suffix not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File must be PDF, JPG, PNG, or DOCX",
        )
    data = await upload.read()
    if len(data) > _MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File must be smaller than 10 MB",
        )
    user_dir = _ACHIEVEMENTS_DIR / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(upload.filename or "file").name
    dest_name = f"{entry_id}_{safe_name}"
    (user_dir / dest_name).write_bytes(data)
    file_path = f"uploads/achievements/{user_id}/{dest_name}"
    return file_path, safe_name


def _delete_file(file_path: Optional[str]) -> None:
    if not file_path:
        return
    parts = file_path.split("/")
    if len(parts) >= 2:
        dest = _ACHIEVEMENTS_DIR / "/".join(parts[2:])
        dest.unlink(missing_ok=True)


@router.get("", response_model=list[AchievementResponse])
def list_achievements(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return (
        db.query(Achievement)
        .filter(Achievement.user_id == current_user.id)
        .order_by(Achievement.created_at.desc())
        .all()
    )


@router.post("", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
async def create_achievement(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    title: str = Form(...),
    description: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    if not title.strip():
        raise HTTPException(status_code=422, detail="Title cannot be blank")
    if not description.strip():
        raise HTTPException(status_code=422, detail="Description cannot be blank")

    entry_id = uuid4()
    file_path, file_name = None, None
    if file and file.filename:
        file_path, file_name = await _save_file(entry_id, current_user.id, file)

    entry = Achievement(
        id=entry_id,
        user_id=current_user.id,
        title=title.strip(),
        description=description.strip(),
        file_path=file_path,
        file_name=file_name,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=AchievementResponse)
async def update_achievement(
    entry_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    clear_file: Optional[str] = Form(None),
):
    entry = db.query(Achievement).filter(
        Achievement.id == entry_id,
        Achievement.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Achievement not found")

    if title is not None:
        if not title.strip():
            raise HTTPException(status_code=422, detail="Title cannot be blank")
        entry.title = title.strip()
    if description is not None:
        if not description.strip():
            raise HTTPException(status_code=422, detail="Description cannot be blank")
        entry.description = description.strip()

    if file and file.filename:
        _delete_file(entry.file_path)
        entry.file_path, entry.file_name = await _save_file(entry_id, current_user.id, file)
    elif clear_file == "true":
        _delete_file(entry.file_path)
        entry.file_path = None
        entry.file_name = None

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(
    entry_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    entry = db.query(Achievement).filter(
        Achievement.id == entry_id,
        Achievement.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Achievement not found")
    _delete_file(entry.file_path)
    db.delete(entry)
    db.commit()
