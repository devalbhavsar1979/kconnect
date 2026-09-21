from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.core.database import Base


class UserServiceDelivery(Base):
    __tablename__ = "user_service_delivery"

    id      : Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id : Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Section 1 — Lecture Delivery
    can_take_lecture          : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lecture_classroom         : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lecture_online            : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lecture_offline_recording : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lecture_blended_flipped   : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lecture_hybrid_hyflex     : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lecture_hands_on_workshop : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lecture_mentoring         : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Section 2 — Content & Course Development
    can_create_content         : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    content_creation           : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    content_explainer          : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    content_presentation       : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    content_course_design      : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    content_syllabus_design    : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    content_reference_material : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Section 3 — Language & Media
    lang_translation       : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lang_transcription     : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lang_transcript_review : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lang_proofreading      : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lang_voiceover         : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lang_localization      : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lang_subtitling        : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Section 4 — Learning Support & Evaluation
    eval_case_study_creation  : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_case_study_review    : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_case_study_mentoring : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_assignment_creation  : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_assignment_review    : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_assignment_mentoring : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_qbank_creation       : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_qbank_review         : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_qpaper_creation      : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_qpaper_review        : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eval_qpaper_grading       : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
