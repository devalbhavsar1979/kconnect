from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.service_delivery import UserServiceDelivery
from app.models.user import User
from app.schemas.service_delivery import UserServiceDeliveryPayload, UserServiceDeliveryResponse

router = APIRouter()


def _all_false_defaults(user_id) -> UserServiceDeliveryResponse:
    """Return an all-false record without hitting the DB (user has never saved)."""
    return UserServiceDeliveryResponse(
        id=uuid4(),
        user_id=user_id,
        can_take_lecture=False,
        lecture_classroom=False,
        lecture_online=False,
        lecture_offline_recording=False,
        lecture_blended_flipped=False,
        lecture_hybrid_hyflex=False,
        lecture_hands_on_workshop=False,
        lecture_mentoring=False,
        can_create_content=False,
        content_creation=False,
        content_explainer=False,
        content_presentation=False,
        content_course_design=False,
        content_syllabus_design=False,
        content_reference_material=False,
        lang_translation=False,
        lang_transcription=False,
        lang_transcript_review=False,
        lang_proofreading=False,
        lang_voiceover=False,
        lang_localization=False,
        lang_subtitling=False,
        eval_case_study_creation=False,
        eval_case_study_review=False,
        eval_case_study_mentoring=False,
        eval_assignment_creation=False,
        eval_assignment_review=False,
        eval_assignment_mentoring=False,
        eval_qbank_creation=False,
        eval_qbank_review=False,
        eval_qpaper_creation=False,
        eval_qpaper_review=False,
        eval_qpaper_grading=False,
        created_at=__import__('datetime').datetime.utcnow(),
        updated_at=__import__('datetime').datetime.utcnow(),
    )


@router.get("", response_model=UserServiceDeliveryResponse)
def get_service_delivery(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    record = (
        db.query(UserServiceDelivery)
        .filter(UserServiceDelivery.user_id == current_user.id)
        .first()
    )
    if not record:
        return _all_false_defaults(current_user.id)
    return record


@router.put("", response_model=UserServiceDeliveryResponse)
def upsert_service_delivery(
    data: UserServiceDeliveryPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    values = {**data.model_dump(), "user_id": current_user.id}
    stmt = (
        pg_insert(UserServiceDelivery)
        .values(**values)
        .on_conflict_do_update(
            index_elements=["user_id"],
            set_={k: v for k, v in values.items() if k != "user_id"},
        )
    )
    db.execute(stmt)
    db.commit()
    record = (
        db.query(UserServiceDelivery)
        .filter(UserServiceDelivery.user_id == current_user.id)
        .first()
    )
    return record
