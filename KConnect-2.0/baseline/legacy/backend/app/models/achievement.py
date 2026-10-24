from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.core.database import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id          : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id     : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title       : Mapped[str]            = mapped_column(String(200), nullable=False)
    description : Mapped[str]            = mapped_column(Text, nullable=False)
    file_path   : Mapped[Optional[str]]  = mapped_column(String(500), nullable=True)
    file_name   : Mapped[Optional[str]]  = mapped_column(String(200), nullable=True)
    created_at  : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at  : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
