from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserServiceDeliveryPayload(BaseModel):
    # Section 1 — Lecture Delivery
    can_take_lecture          : bool = False
    lecture_classroom         : bool = False
    lecture_online            : bool = False
    lecture_offline_recording : bool = False
    lecture_blended_flipped   : bool = False
    lecture_hybrid_hyflex     : bool = False
    lecture_hands_on_workshop : bool = False
    lecture_mentoring         : bool = False
    # Section 2 — Content & Course Development
    can_create_content         : bool = False
    content_creation           : bool = False
    content_explainer          : bool = False
    content_presentation       : bool = False
    content_course_design      : bool = False
    content_syllabus_design    : bool = False
    content_reference_material : bool = False
    # Section 3 — Language & Media
    lang_translation       : bool = False
    lang_transcription     : bool = False
    lang_transcript_review : bool = False
    lang_proofreading      : bool = False
    lang_voiceover         : bool = False
    lang_localization      : bool = False
    lang_subtitling        : bool = False
    # Section 4 — Learning Support & Evaluation
    eval_case_study_creation  : bool = False
    eval_case_study_review    : bool = False
    eval_case_study_mentoring : bool = False
    eval_assignment_creation  : bool = False
    eval_assignment_review    : bool = False
    eval_assignment_mentoring : bool = False
    eval_qbank_creation       : bool = False
    eval_qbank_review         : bool = False
    eval_qpaper_creation      : bool = False
    eval_qpaper_review        : bool = False
    eval_qpaper_grading       : bool = False


class UserServiceDeliveryResponse(UserServiceDeliveryPayload):
    model_config = ConfigDict(from_attributes=True)

    id         : UUID
    user_id    : UUID
    created_at : datetime
    updated_at : datetime
