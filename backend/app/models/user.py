import uuid
from datetime import date, datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Boolean, Date, DateTime, Enum, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserType(str, PyEnum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    SME = "SME"
    PROFESSIONAL_SERVICE_PROVIDER = "PROFESSIONAL_SERVICE_PROVIDER"
    # kept for future use / legacy data:
    VENDOR = "VENDOR"
    TRAINER = "TRAINER"
    FREELANCER = "FREELANCER"
    CONSULTANT = "CONSULTANT"


class ProfileStatus(str, PyEnum):
    INCOMPLETE = "INCOMPLETE"
    COMPLETE = "COMPLETE"


class TitleType(str, PyEnum):
    MR   = "MR"
    MRS  = "MRS"
    MISS = "MISS"
    DR   = "DR"
    PROF = "PROF"


class GenderType(str, PyEnum):
    MALE              = "MALE"
    FEMALE            = "FEMALE"
    OTHER             = "OTHER"
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"


class DesignationType(str, PyEnum):
    PROFESSOR      = "PROFESSOR"
    ASST_PROFESSOR = "ASST_PROFESSOR"
    TRAINER        = "TRAINER"
    GUEST_FACULTY  = "GUEST_FACULTY"


class User(Base):
    __tablename__ = "users"

    # ── Identity ──────────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    first_name: Mapped[str] = mapped_column(String(150), nullable=False)
    last_name:  Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    mobile_number: Mapped[str | None] = mapped_column(String(20),  nullable=True)
    password_hash: Mapped[str]        = mapped_column(String(255), nullable=False)

    # ── Role / status ─────────────────────────────────────────────────────────
    user_type: Mapped[UserType] = mapped_column(
        Enum(UserType, name="usertype"), nullable=False, default=UserType.FREELANCER
    )
    profile_status: Mapped[ProfileStatus] = mapped_column(
        Enum(ProfileStatus, name="profilestatus"),
        nullable=False,
        default=ProfileStatus.INCOMPLETE,
    )
    is_active:   Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # ── Personal info (migration 002) ─────────────────────────────────────────
    date_of_birth: Mapped[date | None] = mapped_column(Date(),       nullable=True)
    cv_file_path:  Mapped[str | None]  = mapped_column(String(512),  nullable=True)

    # ── Extended profile (migration 004) ──────────────────────────────────────
    profile_photo_path: Mapped[str | None] = mapped_column(String(512), nullable=True)

    title: Mapped[TitleType | None] = mapped_column(
        Enum(TitleType, name="titletype"), nullable=True
    )
    gender: Mapped[GenderType | None] = mapped_column(
        Enum(GenderType, name="gendertype"), nullable=True
    )

    website:  Mapped[str | None] = mapped_column(String(100), nullable=True)
    linkedin: Mapped[str | None] = mapped_column(String(100), nullable=True)
    company:  Mapped[str | None] = mapped_column(String(100), nullable=True)

    designation: Mapped[DesignationType | None] = mapped_column(
        Enum(DesignationType, name="designationtype"), nullable=True
    )

    short_bio:       Mapped[str | None] = mapped_column(Text(),       nullable=True)
    address_flat:    Mapped[str | None] = mapped_column(String(200),  nullable=True)
    address_area:    Mapped[str | None] = mapped_column(String(200),  nullable=True)
    address_city:    Mapped[str | None] = mapped_column(String(100),  nullable=True)
    address_state:   Mapped[str | None] = mapped_column(String(100),  nullable=True)
    address_country: Mapped[str | None] = mapped_column(String(100),  nullable=True)
    address_pincode: Mapped[str | None] = mapped_column(String(10),   nullable=True)
    consent:         Mapped[bool]       = mapped_column(Boolean, nullable=False, default=False)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    # ── Relationships ─────────────────────────────────────────────────────────
    organizations: Mapped[list["Organization"]] = relationship(
        "Organization", back_populates="creator", lazy="select"
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan", lazy="select"
    )
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="applicant", lazy="select"
    )
    opportunities: Mapped[list["Opportunity"]] = relationship(
        "Opportunity", back_populates="creator", lazy="select"
    )
