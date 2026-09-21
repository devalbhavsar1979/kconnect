import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class OpportunityListingCard(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    opportunity_type: str
    organization_name: str | None = None
    short_description: str | None = None
    delivery_modes: list[str] = []
    skills_required: list[str] = []
    tags: list[str] = []
    venue_city: str | None = None
    preferred_location: str | None = None
    expertise_level: str | None = None
    compensation_type: str | None = None
    fee_amount: float | None = None
    fee_structure: str | None = None
    number_of_openings: int | None = None
    application_deadline: date | None = None
    event_date: date | None = None
    created_at: datetime
    status: str


class PaginatedOpportunityListings(BaseModel):
    items: list[OpportunityListingCard]
    total: int
    page: int
    size: int
