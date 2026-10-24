import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.models.organization import OrganizationType


class OrganizationCreateRequest(BaseModel):
    organization_name: str
    organization_type: OrganizationType | None = None
    website: str | None = None
    email: EmailStr | None = None
    mobile_number: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None

    @field_validator("organization_name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Organization name cannot be blank")
        return v


class OrganizationUpdateRequest(BaseModel):
    organization_name: str | None = None
    organization_type: OrganizationType | None = None
    website: str | None = None
    email: EmailStr | None = None
    mobile_number: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None


class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_name: str
    organization_type: OrganizationType | None
    website: str | None
    email: str | None
    mobile_number: str | None
    address: str | None
    city: str | None
    state: str | None
    country: str | None
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime
