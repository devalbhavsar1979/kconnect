import uuid
from pathlib import Path
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.dependencies.auth import require_super_admin
from app.models.opportunity import Opportunity, OpportunityStatus
from app.models.opportunity_attachment import OpportunityAttachment
from app.models.organization import Organization
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.opportunity import (
    AttachmentResponse,
    OpportunityCreateRequest,
    OpportunityListItem,
    OpportunityResponse,
    OpportunityUpdateRequest,
)

router = APIRouter()

_UPLOADS_DIR = Path(__file__).resolve().parents[5] / "uploads" / "opportunities"
_MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
_ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx"}
_MAX_ATTACHMENTS = 5


def _get_opportunity_or_404(db: Session, opp_id: uuid.UUID) -> Opportunity:
    opp = (
        db.query(Opportunity)
        .options(selectinload(Opportunity.attachments))
        .filter(Opportunity.id == opp_id)
        .first()
    )
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[OpportunityListItem])
def list_opportunities(
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    opportunity_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    q = (
        db.query(Opportunity, Organization)
        .outerjoin(Organization, Opportunity.organization_id == Organization.id)
    )
    if status:
        q = q.filter(Opportunity.status == status)
    if opportunity_type:
        q = q.filter(Opportunity.opportunity_type == opportunity_type)
    if search:
        term = f"%{search}%"
        q = q.filter(
            or_(
                Opportunity.title.ilike(term),
                Opportunity.category.ilike(term),
                Opportunity.short_description.ilike(term),
            )
        )
    total = q.count()
    rows = (
        q.order_by(Opportunity.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    items = []
    for opp, org in rows:
        items.append(OpportunityListItem(
            id=opp.id,
            title=opp.title,
            opportunity_type=opp.opportunity_type,
            category=opp.category,
            status=opp.status,
            visibility=opp.visibility,
            organization_id=opp.organization_id,
            organization_name=org.organization_name if org else None,
            short_description=opp.short_description,
            delivery_modes=opp.delivery_modes or [],
            skills_required=opp.skills_required or [],
            compensation_type=opp.compensation_type,
            fee_amount=float(opp.fee_amount) if opp.fee_amount is not None else None,
            fee_structure=opp.fee_structure,
            number_of_openings=opp.number_of_openings,
            event_date=opp.event_date,
            application_deadline=opp.application_deadline,
            created_at=opp.created_at,
            updated_at=opp.updated_at,
        ))
    return {"items": items, "total": total, "page": page, "size": size}


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("", response_model=OpportunityResponse, status_code=201)
def create_opportunity(
    body: OpportunityCreateRequest,
    current_user: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    data = body.model_dump()
    data["created_by"] = current_user.id
    data["status"] = OpportunityStatus.DRAFT
    opp = Opportunity(**data)
    db.add(opp)
    db.commit()
    return _get_opportunity_or_404(db, opp.id)


# ── Get ───────────────────────────────────────────────────────────────────────

@router.get("/{opp_id}", response_model=OpportunityResponse)
def get_opportunity(
    opp_id: uuid.UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    return _get_opportunity_or_404(db, opp_id)


# ── Update ────────────────────────────────────────────────────────────────────

@router.put("/{opp_id}", response_model=OpportunityResponse)
def update_opportunity(
    opp_id: uuid.UUID,
    body: OpportunityUpdateRequest,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = _get_opportunity_or_404(db, opp_id)
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(opp, field, value)
    db.commit()
    db.refresh(opp)
    return _get_opportunity_or_404(db, opp.id)


# ── Publish ───────────────────────────────────────────────────────────────────

@router.post("/{opp_id}/publish", response_model=OpportunityResponse)
def publish_opportunity(
    opp_id: uuid.UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = _get_opportunity_or_404(db, opp_id)
    if opp.status not in (OpportunityStatus.DRAFT, OpportunityStatus.CLOSED):
        raise HTTPException(
            status_code=409,
            detail=f"Cannot publish opportunity with status {opp.status.value}",
        )
    if not opp.organization_id:
        raise HTTPException(
            status_code=422, detail="organization_id is required to publish"
        )
    opp.status = OpportunityStatus.OPEN
    db.commit()
    db.refresh(opp)
    return _get_opportunity_or_404(db, opp.id)


# ── Archive ───────────────────────────────────────────────────────────────────

@router.post("/{opp_id}/archive", response_model=OpportunityResponse)
def archive_opportunity(
    opp_id: uuid.UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = _get_opportunity_or_404(db, opp_id)
    opp.status = OpportunityStatus.ARCHIVED
    db.commit()
    db.refresh(opp)
    return _get_opportunity_or_404(db, opp.id)


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/{opp_id}", status_code=204)
def delete_opportunity(
    opp_id: uuid.UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    opp = _get_opportunity_or_404(db, opp_id)
    if opp.status != OpportunityStatus.DRAFT:
        raise HTTPException(
            status_code=409,
            detail="Only DRAFT opportunities can be deleted",
        )
    # Remove attachment files from disk
    for att in opp.attachments:
        att_path = Path(att.file_path)
        if att_path.exists():
            att_path.unlink(missing_ok=True)
    db.delete(opp)
    db.commit()


# ── Attachments ───────────────────────────────────────────────────────────────

@router.post("/{opp_id}/attachments", response_model=AttachmentResponse, status_code=201)
async def upload_attachment(
    opp_id: uuid.UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
):
    opp = _get_opportunity_or_404(db, opp_id)

    existing_count = (
        db.query(OpportunityAttachment)
        .filter(OpportunityAttachment.opportunity_id == opp_id)
        .count()
    )
    if existing_count >= _MAX_ATTACHMENTS:
        raise HTTPException(
            status_code=422,
            detail=f"Maximum {_MAX_ATTACHMENTS} attachments allowed per opportunity",
        )

    ext = Path(file.filename or "").suffix.lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"File type not allowed. Allowed: {', '.join(_ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > _MAX_FILE_SIZE:
        raise HTTPException(status_code=422, detail="File exceeds 10 MB limit")

    opp_dir = _UPLOADS_DIR / str(opp_id)
    opp_dir.mkdir(parents=True, exist_ok=True)

    file_id = uuid.uuid4()
    safe_name = f"{file_id}_{file.filename}"
    dest = opp_dir / safe_name
    dest.write_bytes(content)

    attachment = OpportunityAttachment(
        opportunity_id=opp.id,
        file_name=file.filename or safe_name,
        file_path=str(dest),
        file_size_bytes=len(content),
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


@router.delete("/{opp_id}/attachments/{attachment_id}", status_code=204)
def delete_attachment(
    opp_id: uuid.UUID,
    attachment_id: uuid.UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    att = (
        db.query(OpportunityAttachment)
        .filter(
            OpportunityAttachment.id == attachment_id,
            OpportunityAttachment.opportunity_id == opp_id,
        )
        .first()
    )
    if not att:
        raise HTTPException(status_code=404, detail="Attachment not found")

    att_path = Path(att.file_path)
    if att_path.exists():
        att_path.unlink(missing_ok=True)

    db.delete(att)
    db.commit()
