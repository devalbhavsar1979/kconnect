# All models imported here so Alembic autogenerate detects every table.
from app.models.user import User, UserType, ProfileStatus
from app.models.refresh_token import RefreshToken
from app.models.organization import Organization, OrganizationType
from app.models.opportunity import (
    Opportunity,
    OpportunityType,
    OpportunityStatus,
    SessionStructureType,
    VenueLocationType,
    ExpertiseLevelType,
    CompensationType,
    FeeStructureType,
    OpportunityVisibility,
)
from app.models.opportunity_attachment import OpportunityAttachment
from app.models.application import Application, ApplicationStatus

__all__ = [
    "User",
    "UserType",
    "ProfileStatus",
    "RefreshToken",
    "Organization",
    "OrganizationType",
    "Opportunity",
    "OpportunityType",
    "OpportunityStatus",
    "SessionStructureType",
    "VenueLocationType",
    "ExpertiseLevelType",
    "CompensationType",
    "FeeStructureType",
    "OpportunityVisibility",
    "OpportunityAttachment",
    "Application",
    "ApplicationStatus",
]
