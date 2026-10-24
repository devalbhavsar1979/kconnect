from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.preferences import (
    VALID_DELIVERY_MODES, VALID_GEO_PREFS, VALID_AUDIENCES, VALID_SERVICES, VALID_DISTANCES,
)


class UserPreferencesPayload(BaseModel):
    delivery_modes        : list[str]      = Field(..., min_length=1)
    geographic_preference : list[str]      = Field(..., min_length=1)
    willing_to_travel     : bool
    max_travel_distance   : Optional[str]  = None
    travel_reimbursement  : bool
    preferred_audience    : list[str]      = Field(..., min_length=1)
    services              : list[str]      = Field(..., min_length=1)
    training_topics       : list[str]      = Field(..., min_length=1)

    @field_validator("delivery_modes")
    @classmethod
    def validate_delivery(cls, v: list[str]) -> list[str]:
        invalid = [x for x in v if x not in VALID_DELIVERY_MODES]
        if invalid:
            raise ValueError(f"Invalid delivery mode(s): {invalid}")
        return v

    @field_validator("geographic_preference")
    @classmethod
    def validate_geo(cls, v: list[str]) -> list[str]:
        invalid = [x for x in v if x not in VALID_GEO_PREFS]
        if invalid:
            raise ValueError(f"Invalid geographic preference(s): {invalid}")
        return v

    @field_validator("preferred_audience")
    @classmethod
    def validate_audience(cls, v: list[str]) -> list[str]:
        invalid = [x for x in v if x not in VALID_AUDIENCES]
        if invalid:
            raise ValueError(f"Invalid audience(s): {invalid}")
        return v

    @field_validator("services")
    @classmethod
    def validate_services(cls, v: list[str]) -> list[str]:
        invalid = [x for x in v if x not in VALID_SERVICES]
        if invalid:
            raise ValueError(f"Invalid service(s): {invalid}")
        return v

    @field_validator("training_topics")
    @classmethod
    def validate_topics(cls, v: list[str]) -> list[str]:
        cleaned = [t.strip() for t in v if t.strip()]
        if not cleaned:
            raise ValueError("At least one non-blank training topic is required")
        return cleaned

    @model_validator(mode="after")
    def check_travel_distance(self) -> "UserPreferencesPayload":
        if self.willing_to_travel:
            if not self.max_travel_distance:
                raise ValueError("Maximum travel distance is required when willing to travel")
            if self.max_travel_distance not in VALID_DISTANCES:
                raise ValueError(f"Invalid travel distance: {self.max_travel_distance}")
        else:
            self.max_travel_distance = None
        return self


class UserPreferencesResponse(BaseModel):
    id                    : UUID
    user_id               : UUID
    delivery_modes        : list[str]
    geographic_preference : list[str]
    willing_to_travel     : bool
    max_travel_distance   : Optional[str]
    travel_reimbursement  : bool
    preferred_audience    : list[str]
    services              : list[str]
    training_topics       : list[str]
    created_at            : datetime
    updated_at            : datetime

    model_config = ConfigDict(from_attributes=True)
