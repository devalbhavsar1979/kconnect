from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_super_admin
from app.models.opportunity import Opportunity
from app.models.organization import Organization
from app.models.user import User
from app.schemas.admin.organisations import (
    AdminOrgCreateRequest,
    AdminOrgResponse,
    AdminOrgUpdateRequest,
)
from app.schemas.common import PaginatedResponse

router = APIRouter()


def _build_response(org: Organization, db: Session) -> AdminOrgResponse:
    opp_count = (
        db.query(func.count(Opportunity.id))
        .filter(Opportunity.organization_id == org.id)
        .scalar()
    ) or 0
    resp = AdminOrgResponse.model_validate(org)
    resp.opportunity_count = opp_count
    return resp


def _get_org_or_404(org_id: UUID, db: Session) -> Organization:
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")
    return org


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[AdminOrgResponse])
def list_organisations(
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=200),
    search: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
):
    q = db.query(Organization)
    if search:
        term = f"%{search}%"
        q = q.filter(
            (Organization.organization_name.ilike(term))
            | (Organization.city.ilike(term))
        )
    if industry:
        q = q.filter(Organization.industry == industry)

    total = q.count()
    orgs = q.order_by(Organization.created_at.desc()).offset((page - 1) * size).limit(size).all()

    opp_counts = dict(
        db.query(Opportunity.organization_id, func.count(Opportunity.id))
        .filter(Opportunity.organization_id.in_([o.id for o in orgs]))
        .group_by(Opportunity.organization_id)
        .all()
    )

    results = []
    for org in orgs:
        resp = AdminOrgResponse.model_validate(org)
        resp.opportunity_count = opp_counts.get(org.id, 0)
        results.append(resp)

    return {"items": results, "total": total, "page": page, "size": size}


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("", response_model=AdminOrgResponse, status_code=201)
def create_organisation(
    body: AdminOrgCreateRequest,
    current_user: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    org = Organization(**body.model_dump(), created_by=current_user.id)
    db.add(org)
    db.commit()
    db.refresh(org)
    return _build_response(org, db)


# ── Get ───────────────────────────────────────────────────────────────────────

@router.get("/{org_id}", response_model=AdminOrgResponse)
def get_organisation(
    org_id: UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    org = _get_org_or_404(org_id, db)
    return _build_response(org, db)


# ── Update ────────────────────────────────────────────────────────────────────

@router.put("/{org_id}", response_model=AdminOrgResponse)
def update_organisation(
    org_id: UUID,
    body: AdminOrgUpdateRequest,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    org = _get_org_or_404(org_id, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    db.commit()
    db.refresh(org)
    return _build_response(org, db)


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/{org_id}", status_code=204)
def delete_organisation(
    org_id: UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    org = _get_org_or_404(org_id, db)
    opp_count = (
        db.query(func.count(Opportunity.id))
        .filter(Opportunity.organization_id == org_id)
        .scalar()
    ) or 0
    if opp_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete — organisation has {opp_count} linked opportunit{'y' if opp_count == 1 else 'ies'}",
        )
    db.delete(org)
    db.commit()
