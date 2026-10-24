import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# Kept as Python enum for reference / validation in schemas only — not used as a DB type
class OrganizationType(str, PyEnum):
    PRIVATE_LIMITED = "Private Limited Company"
    PUBLIC_LIMITED = "Public Limited Company"
    LLP = "LLP / Partnership Firm"
    SOLE_PROPRIETORSHIP = "Sole Proprietorship"
    NGO = "NGO / Non-Profit Trust"
    GOVERNMENT = "Government / PSU"
    EDUCATIONAL = "Educational Institution"
    STARTUP = "Startup"
    OTHER = "Other"


INDUSTRY_OPTIONS = [
    "IT Services & Consultancy",
    "Banking & Financial Services",
    "Healthcare & Pharmaceuticals",
    "Manufacturing & Engineering",
    "Education & Training",
    "Retail & E-Commerce",
    "Media & Entertainment",
    "FMCG & Consumer Goods",
    "Telecom & Networking",
    "Automotive",
    "Real Estate & Construction",
    "Energy & Utilities",
    "Government & Public Sector",
    "Non-Profit / NGO",
    "Agriculture & Food",
    "Legal & Compliance",
    "Logistics & Supply Chain",
    "Other",
]


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    organization_name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str | None] = mapped_column(String(200), nullable=True, index=True)
    organization_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    website: Mapped[str | None] = mapped_column(String(512), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mobile_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
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

    creator: Mapped["User"] = relationship("User", back_populates="organizations")
    opportunities: Mapped[list["Opportunity"]] = relationship(
        "Opportunity", back_populates="organization", lazy="select"
    )
