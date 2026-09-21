import re
import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.models.user import (
    DesignationType,
    GenderType,
    ProfileStatus,
    TitleType,
    UserType,
)


class UserResponse(BaseModel):
    """Public user representation — password_hash is intentionally excluded."""

    model_config = ConfigDict(from_attributes=True)

    id:             uuid.UUID
    first_name:     str
    last_name:      str
    email:          EmailStr
    mobile_number:  str | None
    user_type:      UserType
    profile_status: ProfileStatus
    is_active:      bool
    is_verified:    bool

    # migration 002
    date_of_birth: date | None
    cv_file_path:  str | None

    # migration 004 — extended profile
    profile_photo_path: str | None
    title:              TitleType | None
    gender:             GenderType | None
    website:            str | None
    linkedin:           str | None
    company:            str | None
    designation:        DesignationType | None
    short_bio:          str | None
    address_flat:       str | None
    address_area:       str | None
    address_city:       str | None
    address_state:      str | None
    address_country:    str | None
    address_pincode:    str | None
    consent:            bool

    created_at: datetime
    updated_at: datetime


class UserProfileUpdateRequest(BaseModel):
    """Partial update payload — all fields optional; email excluded (security flow)."""

    first_name:     str | None = None
    last_name:      str | None = None
    title:          TitleType | None = None
    gender:         GenderType | None = None
    mobile_number:  str | None = None
    website:        str | None = None
    linkedin:       str | None = None
    date_of_birth:  date | None = None
    company:        str | None = None
    designation:    DesignationType | None = None
    short_bio:      str | None = None
    address_flat:   str | None = None
    address_area:   str | None = None
    address_city:   str | None = None
    address_state:  str | None = None
    address_country: str | None = None
    address_pincode: str | None = None
    user_type:      UserType | None = None
    consent:        bool | None = None

    @field_validator("first_name", "last_name")
    @classmethod
    def name_not_blank(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Name cannot be blank")
        return v

    @field_validator("mobile_number")
    @classmethod
    def mobile_ten_digits(cls, v: str | None) -> str | None:
        if v is not None and v != "":
            if not re.fullmatch(r"\d{10}", v):
                raise ValueError("Mobile number must be exactly 10 digits")
        return v

    @field_validator("date_of_birth")
    @classmethod
    def age_at_least_21(cls, v: date | None) -> date | None:
        if v is not None:
            from datetime import date as date_cls
            today = date_cls.today()
            age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
            if age < 21:
                raise ValueError("Must be at least 21 years old")
        return v

    @field_validator("website", "linkedin")
    @classmethod
    def valid_url(cls, v: str | None) -> str | None:
        if v is not None and v != "":
            if not re.match(r"^https?://", v):
                raise ValueError("Must start with http:// or https://")
        return v

    @field_validator("address_pincode")
    @classmethod
    def pincode_digits(cls, v: str | None) -> str | None:
        if v is not None and v != "":
            if not re.fullmatch(r"\d{1,6}", v):
                raise ValueError("Pincode must be up to 6 digits")
        return v


class ProfileCompletionResponse(BaseModel):
    percentage:     int
    missing_fields: list[str]


# kept for backwards compatibility with auth routes
class UserUpdateRequest(BaseModel):
    first_name:    str | None = None
    last_name:     str | None = None
    mobile_number: str | None = None
