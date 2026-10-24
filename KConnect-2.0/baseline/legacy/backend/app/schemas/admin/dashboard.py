from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_opportunities: int
    open_opportunities: int
    total_applications: int
    pending_verifications: int
