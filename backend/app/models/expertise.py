from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY

from app.core.database import Base


VALID_AUDIENCE_LEVELS = {
    "SCHOOL", "COLLEGE_UNIVERSITY", "FRESHERS",
    "WORKING_PROFESSIONALS", "MANAGERS", "SENIOR_MANAGEMENT",
    "TECHNICAL_TEAMS", "NON_TECHNICAL_TEAMS",
}


class UserExpertise(Base):
    __tablename__ = "user_expertise"

    id                  : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id             : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    total_experience    : Mapped[str]            = mapped_column(String(100), nullable=False)
    teaching_experience : Mapped[str]            = mapped_column(String(100), nullable=False)
    corporate_training  : Mapped[str]            = mapped_column(String(100), nullable=False)
    online_training     : Mapped[str]            = mapped_column(String(100), nullable=False)
    classroom_training  : Mapped[str]            = mapped_column(String(100), nullable=False)
    primary_expertise   : Mapped[str]            = mapped_column(String(200), nullable=False)
    secondary_expertise : Mapped[Optional[str]]  = mapped_column(String(200), nullable=True)
    audience_levels     : Mapped[list[str]]      = mapped_column(ARRAY(String(50)), nullable=False, default=list)
    created_at          : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at          : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
