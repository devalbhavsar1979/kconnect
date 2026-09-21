from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.expertise import VALID_AUDIENCE_LEVELS


class UserExpertisePayload(BaseModel):
    total_experience    : str           = Field(..., min_length=1, max_length=100)
    teaching_experience : str           = Field(..., min_length=1, max_length=100)
    corporate_training  : str           = Field(..., min_length=1, max_length=100)
    online_training     : str           = Field(..., min_length=1, max_length=100)
    classroom_training  : str           = Field(..., min_length=1, max_length=100)
    primary_expertise   : str           = Field(..., min_length=1, max_length=200)
    secondary_expertise : Optional[str] = Field(None, max_length=200)
    audience_levels     : list[str]     = Field(..., min_length=1)

    @field_validator(
        "total_experience", "teaching_experience", "corporate_training",
        "online_training", "classroom_training", "primary_expertise",
    )
    @classmethod
    def non_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("This field cannot be blank")
        return v.strip()

    @field_validator("audience_levels")
    @classmethod
    def validate_audience(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("Select at least one audience level")
        invalid = [x for x in v if x not in VALID_AUDIENCE_LEVELS]
        if invalid:
            raise ValueError(f"Invalid audience level(s): {invalid}")
        return v


class UserExpertiseResponse(BaseModel):
    id                  : UUID
    user_id             : UUID
    total_experience    : str
    teaching_experience : str
    corporate_training  : str
    online_training     : str
    classroom_training  : str
    primary_expertise   : str
    secondary_expertise : Optional[str]
    audience_levels     : list[str]
    created_at          : datetime
    updated_at          : datetime

    model_config = ConfigDict(from_attributes=True)
