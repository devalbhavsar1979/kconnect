from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY

from app.core.database import Base


VALID_DELIVERY_MODES = {"CLASSROOM", "ONLINE", "HYBRID", "OFFLINE_RECORDING"}
VALID_GEO_PREFS      = {"MY_CITY", "NEARBY_CITIES", "ENTIRE_STATE", "NEIGHBOURING_STATES", "PAN_INDIA", "REMOTE_ONLINE"}
VALID_AUDIENCES      = {"WORKING_PROFESSIONALS", "COLLEGE_UNIVERSITY_INSTITUTES", "MANAGEMENT", "SENIOR_MANAGEMENT"}
VALID_SERVICES       = {"LECTURE_TRAINING", "WORKSHOP", "TRANSLATION", "PROOFREADING", "CONTENT_REVIEW"}
VALID_DISTANCES      = {"25 km", "50 km", "100 km", "200 km", "500 km", "Any distance"}


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id                    : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id               : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    delivery_modes        : Mapped[list[str]]      = mapped_column(ARRAY(String(50)),  nullable=False, default=list)
    geographic_preference : Mapped[list[str]]      = mapped_column(ARRAY(String(50)),  nullable=False, default=list)
    willing_to_travel     : Mapped[bool]           = mapped_column(Boolean, nullable=False, default=False)
    max_travel_distance   : Mapped[Optional[str]]  = mapped_column(String(20), nullable=True)
    travel_reimbursement  : Mapped[bool]           = mapped_column(Boolean, nullable=False, default=False)
    preferred_audience    : Mapped[list[str]]      = mapped_column(ARRAY(String(50)),  nullable=False, default=list)
    services              : Mapped[list[str]]      = mapped_column(ARRAY(String(50)),  nullable=False, default=list)
    training_topics       : Mapped[list[str]]      = mapped_column(ARRAY(String(200)), nullable=False, default=list)
    created_at            : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at            : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
