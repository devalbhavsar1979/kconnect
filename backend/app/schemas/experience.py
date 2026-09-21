from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

from app.models.experience import LocationType, EmploymentType


class ExperienceEntryCreate(BaseModel):
    job_title       : str                       = Field(..., min_length=1, max_length=200)
    organization    : str                       = Field(..., min_length=1, max_length=200)
    location        : Optional[str]             = Field(None, max_length=200)
    location_type   : Optional[LocationType]    = None
    employment_type : Optional[EmploymentType]  = None
    is_current      : bool                      = False
    start_month     : int                       = Field(..., ge=1, le=12)
    start_year      : int                       = Field(..., ge=1900)
    end_month       : Optional[int]             = Field(None, ge=1, le=12)
    end_year        : Optional[int]             = Field(None, ge=1900)
    highlights      : Optional[str]             = Field(None, max_length=1000)
    skills          : Optional[list[str]]       = None

    @field_validator("job_title", "organization")
    @classmethod
    def non_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("This field cannot be blank")
        return v.strip()

    @field_validator("skills")
    @classmethod
    def validate_skills(cls, v: Optional[list[str]]) -> Optional[list[str]]:
        if v is None:
            return v
        v = [s.strip() for s in v if s.strip()]
        if len(v) > 20:
            raise ValueError("Maximum 20 skills allowed")
        if any(len(s) > 100 for s in v):
            raise ValueError("Each skill must be 100 characters or less")
        return v

    @model_validator(mode="after")
    def validate_end_date(self):
        if self.is_current:
            if self.end_month is not None or self.end_year is not None:
                raise ValueError("End date must be empty when 'currently working here' is checked")
        else:
            if bool(self.end_month) != bool(self.end_year):
                raise ValueError("Provide both end month and end year, or neither")
        return self


class ExperienceEntryUpdate(BaseModel):
    job_title       : Optional[str]             = Field(None, min_length=1, max_length=200)
    organization    : Optional[str]             = Field(None, min_length=1, max_length=200)
    location        : Optional[str]             = Field(None, max_length=200)
    location_type   : Optional[LocationType]    = None
    employment_type : Optional[EmploymentType]  = None
    is_current      : Optional[bool]            = None
    start_month     : Optional[int]             = Field(None, ge=1, le=12)
    start_year      : Optional[int]             = Field(None, ge=1900)
    end_month       : Optional[int]             = Field(None, ge=1, le=12)
    end_year        : Optional[int]             = Field(None, ge=1900)
    highlights      : Optional[str]             = Field(None, max_length=1000)
    skills          : Optional[list[str]]       = None


class ExperienceEntryResponse(BaseModel):
    id              : UUID
    user_id         : UUID
    job_title       : str
    organization    : str
    location        : Optional[str]
    location_type   : Optional[LocationType]
    employment_type : Optional[EmploymentType]
    is_current      : bool
    start_month     : int
    start_year      : int
    end_month       : Optional[int]
    end_year        : Optional[int]
    highlights      : Optional[str]
    skills          : Optional[list[str]]
    created_at      : datetime
    updated_at      : datetime

    model_config = ConfigDict(from_attributes=True)
