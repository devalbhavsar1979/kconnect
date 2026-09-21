from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AchievementResponse(BaseModel):
    id          : UUID
    user_id     : UUID
    title       : str
    description : str
    file_path   : Optional[str]
    file_name   : Optional[str]
    created_at  : datetime
    updated_at  : datetime

    model_config = ConfigDict(from_attributes=True)
