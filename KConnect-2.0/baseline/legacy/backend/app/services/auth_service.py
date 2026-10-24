import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from fastapi import HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User, UserType
from app.schemas.auth import LoginRequest, TokenResponse

_DUMMY_HASH = "$2b$12$dummyhashtopreventtimingattacksxxxxxxxxxxxxxxxxxxxxxxxx"

_UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "cvs"


def register_user(
    db: Session,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    mobile_number: str | None,
    user_type: UserType,
    date_of_birth: date | None,
    cv_bytes: bytes | None,
    cv_ext: str | None,
) -> TokenResponse:
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        id=uuid.uuid4(),
        first_name=first_name,
        last_name=last_name,
        email=email,
        mobile_number=mobile_number,
        password_hash=hash_password(password),
        user_type=user_type,
        date_of_birth=date_of_birth,
    )
    db.add(user)

    if cv_bytes and cv_ext:
        _UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        dest = _UPLOADS_DIR / f"{user.id}{cv_ext}"
        dest.write_bytes(cv_bytes)
        user.cv_file_path = f"uploads/cvs/{user.id}{cv_ext}"

    db.commit()
    db.refresh(user)
    return _issue_tokens(db, user)


def login_user(db: Session, data: LoginRequest) -> TokenResponse:
    user = db.query(User).filter(User.email == data.email).first()

    candidate_hash = user.password_hash if user else _DUMMY_HASH
    valid = verify_password(data.password, candidate_hash)

    if not user or not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    return _issue_tokens(db, user)


def refresh_access_token(db: Session, refresh_token: str) -> dict:
    invalid_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
    )
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise invalid_exc
        user_id_str: str = payload.get("sub", "")
    except JWTError:
        raise invalid_exc

    stored = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.user_id == uuid.UUID(user_id_str),
            RefreshToken.token_hash == hash_token(refresh_token),
            RefreshToken.revoked.is_(False),
        )
        .first()
    )
    if not stored or stored.expires_at < datetime.now(timezone.utc):
        raise invalid_exc

    user = (
        db.query(User)
        .filter(User.id == uuid.UUID(user_id_str), User.is_active.is_(True))
        .first()
    )
    if not user:
        raise invalid_exc

    access_token = create_access_token({"sub": str(user.id), "user_type": user.user_type})
    return {"access_token": access_token, "token_type": "bearer"}


def logout_user(db: Session, refresh_token: str) -> None:
    try:
        payload = decode_token(refresh_token)
        user_id_str: str = payload.get("sub", "")
    except JWTError:
        return

    stored = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.user_id == uuid.UUID(user_id_str),
            RefreshToken.token_hash == hash_token(refresh_token),
            RefreshToken.revoked.is_(False),
        )
        .first()
    )
    if stored:
        stored.revoked = True
        db.commit()


def _issue_tokens(db: Session, user: User) -> TokenResponse:
    access_token = create_access_token({"sub": str(user.id), "user_type": user.user_type})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    db_token = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(db_token)
    db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
