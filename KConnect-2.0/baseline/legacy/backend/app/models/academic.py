from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AcademicDetail(Base):
    __tablename__ = "academic_details"

    id             : Mapped[UUID]       = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id        : Mapped[UUID]       = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    school         : Mapped[str]        = mapped_column(String(200), nullable=False)
    degree         : Mapped[str]        = mapped_column(String(200), nullable=False)
    field_of_study : Mapped[str | None] = mapped_column(String(200), nullable=True)
    end_month      : Mapped[int | None] = mapped_column(Integer, nullable=True)
    end_year       : Mapped[int | None] = mapped_column(Integer, nullable=True)
    grade          : Mapped[str | None] = mapped_column(String(50), nullable=True)
    description    : Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at     : Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at     : Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
