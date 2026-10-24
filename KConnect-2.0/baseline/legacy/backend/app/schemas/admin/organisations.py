from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class AdminOrgCreateRequest(BaseModel):
    organization_name: str = Field(..., max_length=255)
    industry: str = Field(..., max_length=200)
    organization_type: str = Field(..., max_length=100)
    website: Optional[str] = Field(None, max_length=512)
    email: Optional[str] = Field(None, max_length=255)
    mobile_number: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None

    @field_validator('organization_name')
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Organisation name cannot be blank')
        return v

    @field_validator('website')
    @classmethod
    def website_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if v and not (v.startswith('http://') or v.startswith('https://')):
                raise ValueError('Website must start with http:// or https://')
        return v or None


class AdminOrgUpdateRequest(BaseModel):
    organization_name: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=200)
    organization_type: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=512)
    email: Optional[str] = Field(None, max_length=255)
    mobile_number: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None

    @field_validator('website')
    @classmethod
    def website_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if v and not (v.startswith('http://') or v.startswith('https://')):
                raise ValueError('Website must start with http:// or https://')
        return v or None


class AdminOrgResponse(BaseModel):
    id: UUID
    organization_name: str
    industry: Optional[str]
    organization_type: Optional[str]
    website: Optional[str]
    email: Optional[str]
    mobile_number: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    address: Optional[str]
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    opportunity_count: int = 0

    model_config = ConfigDict(from_attributes=True)
