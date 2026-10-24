"""add user_service_delivery table

Revision ID: 013
Revises: 012
Create Date: 2026-09-17
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "013"
down_revision = "012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_service_delivery",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id", name="uq_user_service_delivery_user_id"),
        # Section 1: Lecture Delivery
        sa.Column("can_take_lecture",           sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lecture_classroom",           sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lecture_online",              sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lecture_offline_recording",   sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lecture_blended_flipped",     sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lecture_hybrid_hyflex",       sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lecture_hands_on_workshop",   sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lecture_mentoring",           sa.Boolean(), nullable=False, server_default="false"),
        # Section 2: Content & Course Development
        sa.Column("can_create_content",          sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("content_creation",            sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("content_explainer",           sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("content_presentation",        sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("content_course_design",       sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("content_syllabus_design",     sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("content_reference_material",  sa.Boolean(), nullable=False, server_default="false"),
        # Section 3: Language & Media
        sa.Column("lang_translation",            sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lang_transcription",          sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lang_transcript_review",      sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lang_proofreading",           sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lang_voiceover",              sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lang_localization",           sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("lang_subtitling",             sa.Boolean(), nullable=False, server_default="false"),
        # Section 4: Learning Support & Evaluation
        sa.Column("eval_case_study_creation",    sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_case_study_review",      sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_case_study_mentoring",   sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_assignment_creation",    sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_assignment_review",      sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_assignment_mentoring",   sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_qbank_creation",         sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_qbank_review",           sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_qpaper_creation",        sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_qpaper_review",          sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("eval_qpaper_grading",         sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index(
        "ix_user_service_delivery_user_id",
        "user_service_delivery",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_user_service_delivery_user_id", table_name="user_service_delivery")
    op.drop_table("user_service_delivery")
