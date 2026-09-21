from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_super_admin
from app.models.application import Application
from app.models.opportunity import Opportunity, OpportunityStatus
from app.models.user import User, UserType
from app.schemas.admin.dashboard import DashboardStats

router = APIRouter()


@router.get("", response_model=DashboardStats)
def get_dashboard_stats(
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> DashboardStats:
    total_users = (
        db.query(User)
        .filter(User.user_type != UserType.SUPER_ADMIN)
        .count()
    )
    active_users = (
        db.query(User)
        .filter(User.user_type != UserType.SUPER_ADMIN, User.is_active.is_(True))
        .count()
    )
    total_opportunities = db.query(Opportunity).count()
    open_opportunities = (
        db.query(Opportunity)
        .filter(Opportunity.status == OpportunityStatus.OPEN)
        .count()
    )
    total_applications = db.query(Application).count()
    pending_verifications = (
        db.query(User)
        .filter(
            User.user_type != UserType.SUPER_ADMIN,
            User.is_verified.is_(False),
            User.is_active.is_(True),
        )
        .count()
    )

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_opportunities=total_opportunities,
        open_opportunities=open_opportunities,
        total_applications=total_applications,
        pending_verifications=pending_verifications,
    )
