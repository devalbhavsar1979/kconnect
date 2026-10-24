import uuid
from datetime import date, datetime, time, timezone
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean, Date, DateTime, Enum, ForeignKey, Integer,
    Numeric, String, Text, Time, func,
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OpportunityType(str, PyEnum):
    LECTURE = "LECTURE"
    CONTENT_COURSE_DEVELOPMENT = "CONTENT_COURSE_DEVELOPMENT"
    LANGUAGE_MEDIA = "LANGUAGE_MEDIA"
    LEARNING_SUPPORT_EVALUATION = "LEARNING_SUPPORT_EVALUATION"
    CONTENT_ELEARNING = "CONTENT_ELEARNING"
    EDITING_REVIEW = "EDITING_REVIEW"


class SessionStructureType(str, PyEnum):
    SINGLE_SESSION = "SINGLE_SESSION"
    MULTIPLE_SESSIONS = "MULTIPLE_SESSIONS"
    ONGOING_PROGRAM = "ONGOING_PROGRAM"


class VenueLocationType(str, PyEnum):
    CORPORATE = "CORPORATE"
    INSTITUTE = "INSTITUTE"
    UNIVERSITY = "UNIVERSITY"
    ONLINE = "ONLINE"
    OTHERS = "OTHERS"


class ExpertiseLevelType(str, PyEnum):
    FRESHER = "FRESHER"
    EXPERIENCED = "EXPERIENCED"
    EXPERT = "EXPERT"


class CompensationType(str, PyEnum):
    PAID = "PAID"
    VOLUNTARY = "VOLUNTARY"
    NEGOTIABLE = "NEGOTIABLE"
    TBD = "TBD"


class FeeStructureType(str, PyEnum):
    PER_SESSION = "PER_SESSION"
    PER_PROGRAM = "PER_PROGRAM"
    PER_TASK = "PER_TASK"


class OpportunityVisibility(str, PyEnum):
    VISIBLE_TO_ALL = "VISIBLE_TO_ALL"
    SHORTLISTED_ONLY = "SHORTLISTED_ONLY"


class OpportunityStatus(str, PyEnum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"
    ARCHIVED = "ARCHIVED"


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # §1 Opportunity Basics
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    opportunity_type: Mapped[OpportunityType] = mapped_column(
        Enum(OpportunityType, name="opportunitytype", create_type=False), nullable=False
    )
    category: Mapped[str] = mapped_column(String(200), nullable=False)
    sub_category: Mapped[str | None] = mapped_column(String(200), nullable=True)
    delivery_modes: Mapped[list[str]] = mapped_column(
        ARRAY(String), nullable=False, default=list
    )
    number_of_openings: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    session_structure: Mapped[SessionStructureType] = mapped_column(
        Enum(SessionStructureType, name="sessionstructuretype", create_type=False),
        nullable=False,
    )
    total_duration: Mapped[str] = mapped_column(String(100), nullable=False)
    duration_per_session: Mapped[str] = mapped_column(String(100), nullable=False)

    # §2 Organization Details
    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # §3 Opportunity Details
    short_description: Mapped[str] = mapped_column(String(500), nullable=False)
    detailed_description: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)

    # §4 Schedule & Location
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    end_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    venue_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    venue_location_type: Mapped[VenueLocationType | None] = mapped_column(
        Enum(VenueLocationType, name="venuelocationtype", create_type=False), nullable=True
    )
    venue_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_audience: Mapped[list[str]] = mapped_column(
        ARRAY(String), nullable=False, default=list
    )

    # §5 Requirements
    skills_required: Mapped[list[str]] = mapped_column(
        ARRAY(String), nullable=False, default=list
    )
    minimum_experience: Mapped[str | None] = mapped_column(String(100), nullable=True)
    expertise_level: Mapped[ExpertiseLevelType | None] = mapped_column(
        Enum(ExpertiseLevelType, name="expertiseleveltype", create_type=False), nullable=True
    )
    additional_requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    language_of_delivery: Mapped[str] = mapped_column(String(100), nullable=False)

    # §6 Eligibility & Preferences
    preferred_location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    gender_preference: Mapped[str | None] = mapped_column(String(50), nullable=True)
    candidate_preference: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes_for_applicants: Mapped[str | None] = mapped_column(Text, nullable=True)
    application_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)

    # §7 Compensation & Benefits
    compensation_type: Mapped[CompensationType] = mapped_column(
        Enum(CompensationType, name="compensationtype", create_type=False),
        nullable=False,
        default=CompensationType.TBD,
    )
    fee_structure: Mapped[FeeStructureType | None] = mapped_column(
        Enum(FeeStructureType, name="feestructuretype", create_type=False), nullable=True
    )
    fee_amount: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    payment_terms: Mapped[str | None] = mapped_column(String(200), nullable=True)
    travel_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    travel_reimbursement: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    other_benefits: Mapped[str | None] = mapped_column(Text, nullable=True)

    # §8 Visibility & Status
    visibility: Mapped[OpportunityVisibility] = mapped_column(
        Enum(OpportunityVisibility, name="opportunityvisibility", create_type=False),
        nullable=False,
        default=OpportunityVisibility.VISIBLE_TO_ALL,
    )
    status: Mapped[OpportunityStatus] = mapped_column(
        Enum(OpportunityStatus, name="opportunitystatus", create_type=False),
        nullable=False,
        default=OpportunityStatus.DRAFT,
    )

    # Metadata
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="opportunities"
    )
    creator: Mapped["User"] = relationship("User", back_populates="opportunities")
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="opportunity", lazy="select"
    )
    attachments: Mapped[list["OpportunityAttachment"]] = relationship(
        "OpportunityAttachment", back_populates="opportunity",
        cascade="all, delete-orphan", lazy="select"
    )
