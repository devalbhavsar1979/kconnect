from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AcademicDetailCreate(BaseModel):
    school:         str           = Field(..., min_length=1, max_length=200)
    degree:         str           = Field(..., min_length=1, max_length=200)
    field_of_study: Optional[str] = Field(None, max_length=200)
    end_month:      Optional[int] = Field(None, ge=1, le=12)
    end_year:       Optional[int] = Field(None, ge=1950)
    grade:          Optional[str] = Field(None, max_length=50)
    description:    Optional[str] = None

    @field_validator("school", "degree")
    @classmethod
    def non_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("This field cannot be blank")
        return v.strip()

    @field_validator("end_year")
    @classmethod
    def year_not_future(cls, v: Optional[int]) -> Optional[int]:
        if v and v > date.today().year:
            raise ValueError("End year cannot be in the future")
        return v



class AcademicDetailUpdate(BaseModel):
    school:         Optional[str] = Field(None, min_length=1, max_length=200)
    degree:         Optional[str] = Field(None, min_length=1, max_length=200)
    field_of_study: Optional[str] = Field(None, max_length=200)
    end_month:      Optional[int] = Field(None, ge=1, le=12)
    end_year:       Optional[int] = Field(None, ge=1950)
    grade:          Optional[str] = Field(None, max_length=50)
    description:    Optional[str] = None


class AcademicDetailResponse(BaseModel):
    id:             UUID
    user_id:        UUID
    school:         str
    degree:         str
    field_of_study: Optional[str]
    end_month:      Optional[int]
    end_year:       Optional[int]
    grade:          Optional[str]
    description:    Optional[str]
    created_at:     datetime
    updated_at:     datetime

    model_config = ConfigDict(from_attributes=True)
