import uuid
from datetime import date, datetime, time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.opportunity import (
    CompensationType,
    ExpertiseLevelType,
    FeeStructureType,
    OpportunityStatus,
    OpportunityType,
    OpportunityVisibility,
    SessionStructureType,
    VenueLocationType,
)


# ── Attachment sub-schema ─────────────────────────────────────────────────────

class AttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    opportunity_id: uuid.UUID
    file_name: str
    file_path: str
    file_size_bytes: int
    uploaded_at: datetime


# ── Create / Update requests ─────────────────────────────────────────────────

class OpportunityCreateRequest(BaseModel):
    # §1 Basics
    title: str = Field(..., max_length=512)
    opportunity_type: OpportunityType
    category: str = Field(..., max_length=200)
    sub_category: str | None = Field(None, max_length=200)
    delivery_modes: list[str] = Field(default_factory=list)
    number_of_openings: int = Field(1, ge=1)
    session_structure: SessionStructureType
    total_duration: str = Field(..., max_length=100)
    duration_per_session: str = Field(..., max_length=100)

    # §2 Organization
    organization_id: uuid.UUID | None = None

    # §3 Details
    short_description: str = Field(..., max_length=500)
    detailed_description: str
    tags: list[str] = Field(default_factory=list)

    # §4 Schedule & Location
    event_date: date
    start_time: time | None = None
    end_time: time | None = None
    venue_name: str | None = Field(None, max_length=500)
    venue_location_type: VenueLocationType | None = None
    venue_address: str | None = None
    target_audience: list[str] = Field(default_factory=list)

    # §5 Requirements
    skills_required: list[str] = Field(default_factory=list)
    minimum_experience: str | None = Field(None, max_length=100)
    expertise_level: ExpertiseLevelType | None = None
    additional_requirements: str | None = None
    language_of_delivery: str = Field(..., max_length=100)

    # §6 Eligibility & Preferences
    preferred_location: str | None = Field(None, max_length=200)
    gender_preference: str | None = Field(None, max_length=50)
    candidate_preference: str | None = None
    notes_for_applicants: str | None = None
    application_deadline: date | None = None

    # §7 Compensation & Benefits
    compensation_type: CompensationType = CompensationType.TBD
    fee_structure: FeeStructureType | None = None
    fee_amount: Decimal | None = None
    payment_terms: str | None = Field(None, max_length=200)
    travel_required: bool = False
    travel_reimbursement: bool = False
    other_benefits: str | None = None

    # §8 Visibility & Status
    visibility: OpportunityVisibility = OpportunityVisibility.VISIBLE_TO_ALL
    status: OpportunityStatus = OpportunityStatus.DRAFT


class OpportunityUpdateRequest(OpportunityCreateRequest):
    # All fields optional for partial updates
    title: str | None = Field(None, max_length=512)
    opportunity_type: OpportunityType | None = None
    category: str | None = Field(None, max_length=200)
    session_structure: SessionStructureType | None = None
    total_duration: str | None = Field(None, max_length=100)
    duration_per_session: str | None = Field(None, max_length=100)
    short_description: str | None = Field(None, max_length=500)
    detailed_description: str | None = None
    event_date: date | None = None
    language_of_delivery: str | None = Field(None, max_length=100)


# ── List item ─────────────────────────────────────────────────────────────────

class OpportunityListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    opportunity_type: OpportunityType
    category: str
    status: OpportunityStatus
    visibility: OpportunityVisibility
    organization_id: uuid.UUID | None
    organization_name: str | None = None
    short_description: str | None = None
    delivery_modes: list[str] = []
    skills_required: list[str] = []
    compensation_type: CompensationType | None = None
    fee_amount: float | None = None
    fee_structure: FeeStructureType | None = None
    number_of_openings: int
    event_date: date
    application_deadline: date | None = None
    created_at: datetime
    updated_at: datetime


# ── Full response ─────────────────────────────────────────────────────────────

class OpportunityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID

    # §1 Basics
    title: str
    opportunity_type: OpportunityType
    category: str
    sub_category: str | None
    delivery_modes: list[str]
    number_of_openings: int
    session_structure: SessionStructureType
    total_duration: str
    duration_per_session: str

    # §2 Organization
    organization_id: uuid.UUID | None

    # §3 Details
    short_description: str
    detailed_description: str
    tags: list[str]

    # §4 Schedule & Location
    event_date: date
    start_time: time | None
    end_time: time | None
    venue_name: str | None
    venue_location_type: VenueLocationType | None
    venue_address: str | None
    target_audience: list[str]

    # §5 Requirements
    skills_required: list[str]
    minimum_experience: str | None
    expertise_level: ExpertiseLevelType | None
    additional_requirements: str | None
    language_of_delivery: str

    # §6 Eligibility & Preferences
    preferred_location: str | None
    gender_preference: str | None
    candidate_preference: str | None
    notes_for_applicants: str | None
    application_deadline: date | None

    # §7 Compensation & Benefits
    compensation_type: CompensationType
    fee_structure: FeeStructureType | None
    fee_amount: Decimal | None
    payment_terms: str | None
    travel_required: bool
    travel_reimbursement: bool
    other_benefits: str | None

    # §8 Visibility & Status
    visibility: OpportunityVisibility
    status: OpportunityStatus

    # Metadata
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    # Attached files
    attachments: list[AttachmentResponse] = []
