import uuid
from datetime import date, timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.application import Application
from app.models.opportunity import Opportunity, OpportunityStatus, OpportunityVisibility
from app.models.organization import Organization
from app.models.user import User
from app.schemas.opportunity_listing import OpportunityListingCard, PaginatedOpportunityListings

router = APIRouter()


def _build_card(opp: Opportunity, org: Organization | None) -> OpportunityListingCard:
    return OpportunityListingCard(
        id=opp.id,
        title=opp.title,
        opportunity_type=opp.opportunity_type.value if hasattr(opp.opportunity_type, "value") else str(opp.opportunity_type),
        organization_name=org.organization_name if org else None,
        short_description=opp.short_description,
        delivery_modes=opp.delivery_modes or [],
        skills_required=opp.skills_required or [],
        tags=opp.tags or [],
        venue_city=opp.venue_name,
        preferred_location=opp.preferred_location,
        expertise_level=opp.expertise_level.value if opp.expertise_level and hasattr(opp.expertise_level, "value") else (str(opp.expertise_level) if opp.expertise_level else None),
        compensation_type=opp.compensation_type.value if hasattr(opp.compensation_type, "value") else str(opp.compensation_type),
        fee_amount=float(opp.fee_amount) if opp.fee_amount is not None else None,
        fee_structure=opp.fee_structure.value if opp.fee_structure and hasattr(opp.fee_structure, "value") else (str(opp.fee_structure) if opp.fee_structure else None),
        number_of_openings=opp.number_of_openings,
        application_deadline=opp.application_deadline,
        event_date=opp.event_date,
        created_at=opp.created_at,
        status=opp.status.value if hasattr(opp.status, "value") else str(opp.status),
    )


@router.get("", response_model=PaginatedOpportunityListings)
def list_opportunities(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    search: Optional[str] = Query(None),
    opportunity_type: Optional[str] = Query(None),
    delivery_mode: Optional[str] = Query(None),
    expertise_level: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    date_filter: Optional[str] = Query(None),
    duration_keyword: Optional[str] = Query(None),
    sort_by: str = Query("newest"),
    tab: str = Query("all"),
):
    q = (
        db.query(Opportunity, Organization)
        .outerjoin(Organization, Opportunity.organization_id == Organization.id)
    )

    # Base filters — always OPEN and PUBLIC
    q = q.filter(
        Opportunity.status == OpportunityStatus.OPEN,
        Opportunity.visibility == OpportunityVisibility.VISIBLE_TO_ALL,
    )

    # Tab-specific filters
    if tab == "applied":
        q = q.join(
            Application,
            (Application.opportunity_id == Opportunity.id) &
            (Application.applicant_id == current_user.id),
        )
    elif tab == "closing_soon":
        deadline = date.today() + timedelta(days=3)
        q = q.filter(
            Opportunity.application_deadline.isnot(None),
            Opportunity.application_deadline <= deadline,
        )

    # Search across title, short_description, and array fields
    if search:
        term = f"%{search}%"
        from sqlalchemy import func as sa_func
        q = q.filter(
            or_(
                Opportunity.title.ilike(term),
                Opportunity.short_description.ilike(term),
                sa_func.array_to_string(Opportunity.tags, ",").ilike(term),
                sa_func.array_to_string(Opportunity.skills_required, ",").ilike(term),
            )
        )

    if opportunity_type:
        q = q.filter(Opportunity.opportunity_type == opportunity_type)

    if delivery_mode:
        q = q.filter(Opportunity.delivery_modes.any(delivery_mode))

    if expertise_level:
        q = q.filter(Opportunity.expertise_level == expertise_level)

    if state:
        term = f"%{state}%"
        q = q.filter(
            or_(
                Opportunity.preferred_location.ilike(term),
                Organization.state.ilike(term),
            )
        )

    if category:
        q = q.filter(Opportunity.category.ilike(f"%{category}%"))

    if date_filter:
        today = date.today()
        if date_filter == "this_week":
            q = q.filter(Opportunity.event_date.between(today, today + timedelta(days=7)))
        elif date_filter == "this_month":
            q = q.filter(Opportunity.event_date.between(today, today + timedelta(days=30)))
        elif date_filter == "next_3_months":
            q = q.filter(Opportunity.event_date.between(today, today + timedelta(days=90)))

    if duration_keyword:
        q = q.filter(Opportunity.total_duration.ilike(f"%{duration_keyword}%"))

    # Sorting
    if sort_by == "closing_soon":
        q = q.order_by(Opportunity.application_deadline.asc().nullslast())
    elif sort_by == "fee_desc":
        q = q.order_by(Opportunity.fee_amount.desc().nullslast())
    else:
        q = q.order_by(Opportunity.created_at.desc())

    total = q.count()
    rows = q.offset((page - 1) * size).limit(size).all()

    items = [_build_card(opp, org) for opp, org in rows]
    return PaginatedOpportunityListings(items=items, total=total, page=page, size=size)


@router.get("/{opportunity_id}", response_model=OpportunityListingCard)
def get_opportunity(
    opportunity_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    row = (
        db.query(Opportunity, Organization)
        .outerjoin(Organization, Opportunity.organization_id == Organization.id)
        .filter(
            Opportunity.id == opportunity_id,
            Opportunity.status == OpportunityStatus.OPEN,
            Opportunity.visibility == OpportunityVisibility.VISIBLE_TO_ALL,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    opp, org = row
    return _build_card(opp, org)
