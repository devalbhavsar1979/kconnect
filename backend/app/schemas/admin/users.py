from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.user import DesignationType, GenderType, ProfileStatus, TitleType, UserType


class AdminUserResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    mobile_number: Optional[str]
    user_type: UserType
    profile_status: ProfileStatus
    is_active: bool
    is_verified: bool
    title: Optional[TitleType]
    gender: Optional[GenderType]
    designation: Optional[DesignationType]
    company: Optional[str]
    address_city: Optional[str]
    address_state: Optional[str]
    address_country: Optional[str]
    date_of_birth: Optional[date]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserUpdate(BaseModel):
    user_type: Optional[UserType] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
