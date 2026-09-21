import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.application import ApplicationStatus


class ApplicationCreateRequest(BaseModel):
    opportunity_id: uuid.UUID
    cover_note: str | None = None


class ApplicationUpdateRequest(BaseModel):
    status: ApplicationStatus | None = None
    cover_note: str | None = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    opportunity_id: uuid.UUID
    applicant_id: uuid.UUID
    status: ApplicationStatus
    cover_note: str | None
    applied_at: datetime
    updated_at: datetime
