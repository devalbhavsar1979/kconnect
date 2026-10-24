from datetime import date
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserType
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RefreshRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services import auth_service

router = APIRouter()

_ALLOWED_CV_EXTS = {".pdf", ".doc", ".docx"}
_MAX_CV_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    db: Annotated[Session, Depends(get_db)],
    first_name: Annotated[str, Form()],
    last_name: Annotated[str, Form()],
    email: Annotated[str, Form()],
    password: Annotated[str, Form()],
    confirm_password: Annotated[str, Form()],
    mobile_number: Annotated[str | None, Form()] = None,
    user_type: Annotated[UserType, Form()] = UserType.FREELANCER,
    date_of_birth: Annotated[str | None, Form()] = None,
    cv: Annotated[UploadFile | None, File()] = None,
):
    if password != confirm_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Passwords do not match",
        )
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters",
        )

    dob: date | None = None
    if date_of_birth:
        try:
            dob = date.fromisoformat(date_of_birth)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid date_of_birth — expected YYYY-MM-DD",
            )

    cv_bytes: bytes | None = None
    cv_ext: str | None = None
    if cv and cv.filename:
        ext = Path(cv.filename).suffix.lower()
        if ext not in _ALLOWED_CV_EXTS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="CV must be a PDF, DOC, or DOCX file",
            )
        cv_bytes = await cv.read()
        if len(cv_bytes) > _MAX_CV_BYTES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="CV file must be smaller than 5 MB",
            )
        cv_ext = ext

    return auth_service.register_user(
        db=db,
        first_name=first_name.strip(),
        last_name=last_name.strip(),
        email=email,
        password=password,
        mobile_number=mobile_number or None,
        user_type=user_type,
        date_of_birth=dob,
        cv_bytes=cv_bytes,
        cv_ext=cv_ext,
    )


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
):
    return auth_service.login_user(db, data)


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(
    data: RefreshRequest,
    db: Annotated[Session, Depends(get_db)],
):
    return auth_service.refresh_access_token(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    data: RefreshRequest,
    db: Annotated[Session, Depends(get_db)],
):
    auth_service.logout_user(db, data.refresh_token)


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user
