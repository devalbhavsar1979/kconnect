import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserType

_bearer = HTTPBearer()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(credentials.credentials)
        user_id: str = payload.get("sub", "")
        token_type: str = payload.get("type", "")
        if not user_id or token_type != "access":
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    user = (
        db.query(User)
        .filter(User.id == uuid.UUID(user_id), User.is_active.is_(True))
        .first()
    )
    if not user:
        raise credentials_exc
    return user


def require_super_admin(
    current_user: Annotated["User", Depends(get_current_user)],
) -> "User":
    if current_user.user_type != UserType.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required",
        )
    return current_user


def require_user_type(*user_types: UserType):
    """
    Dependency factory for role-based access control.

    Usage:
        @router.get("/admin-only")
        def admin_endpoint(user: Annotated[User, Depends(require_user_type(UserType.ADMIN))]):
            ...
    """

    def _check(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        if current_user.user_type not in user_types:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return _check
