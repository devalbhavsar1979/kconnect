from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY

from app.core.database import Base


class LocationType(str, PyEnum):
    ONSITE  = "ONSITE"
    HYBRID  = "HYBRID"
    REMOTE  = "REMOTE"


class EmploymentType(str, PyEnum):
    FULL_TIME      = "FULL_TIME"
    PART_TIME      = "PART_TIME"
    FREELANCE      = "FREELANCE"
    SELF_EMPLOYED  = "SELF_EMPLOYED"
    INTERNSHIP     = "INTERNSHIP"
    APPRENTICESHIP = "APPRENTICESHIP"


class ExperienceEntry(Base):
    __tablename__ = "experience_entries"

    id              : Mapped[UUID]                      = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id         : Mapped[UUID]                      = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_title       : Mapped[str]                       = mapped_column(String(200), nullable=False)
    organization    : Mapped[str]                       = mapped_column(String(200), nullable=False)
    location        : Mapped[Optional[str]]             = mapped_column(String(200), nullable=True)
    location_type   : Mapped[Optional[LocationType]]    = mapped_column(Enum(LocationType, name="locationtype", create_type=False), nullable=True)
    employment_type : Mapped[Optional[EmploymentType]]  = mapped_column(Enum(EmploymentType, name="employmenttype", create_type=False), nullable=True)
    is_current      : Mapped[bool]                      = mapped_column(Boolean, nullable=False, default=False)
    start_month     : Mapped[int]                       = mapped_column(Integer, nullable=False)
    start_year      : Mapped[int]                       = mapped_column(Integer, nullable=False)
    end_month       : Mapped[Optional[int]]             = mapped_column(Integer, nullable=True)
    end_year        : Mapped[Optional[int]]             = mapped_column(Integer, nullable=True)
    highlights      : Mapped[Optional[str]]             = mapped_column(Text, nullable=True)
    skills          : Mapped[Optional[list[str]]]       = mapped_column(ARRAY(String(100)), nullable=True)
    created_at      : Mapped[datetime]                  = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at      : Mapped[datetime]                  = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
