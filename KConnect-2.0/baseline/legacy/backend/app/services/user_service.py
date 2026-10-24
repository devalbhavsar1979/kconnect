import uuid

from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def list_users(db: Session, skip: int = 0, limit: int = 50) -> list[User]:
    return db.query(User).filter(User.is_active.is_(True)).offset(skip).limit(limit).all()
