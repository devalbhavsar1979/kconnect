"""Initial schema — users, refresh_tokens, organizations, opportunities, applications

Revision ID: 001
Revises:
Create Date: 2026-09-07
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("first_name", sa.String(150), nullable=False),
        sa.Column("last_name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("mobile_number", sa.String(20), nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "user_type",
            sa.Enum(
                "ADMIN", "VENDOR", "TRAINER", "SME", "FREELANCER", "CONSULTANT",
                name="usertype",
            ),
            nullable=False,
        ),
        sa.Column(
            "profile_status",
            sa.Enum("INCOMPLETE", "COMPLETE", name="profilestatus"),
            nullable=False,
            server_default="INCOMPLETE",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── refresh_tokens ────────────────────────────────────────────────────────
    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"])

    # ── organizations ─────────────────────────────────────────────────────────
    op.create_table(
        "organizations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_name", sa.String(255), nullable=False),
        sa.Column(
            "organization_type",
            sa.Enum(
                "CORPORATE", "STARTUP", "NGO", "GOVERNMENT", "EDUCATIONAL", "OTHER",
                name="organizationtype",
            ),
            nullable=True,
        ),
        sa.Column("website", sa.String(512), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("mobile_number", sa.String(20), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("state", sa.String(100), nullable=True),
        sa.Column("country", sa.String(100), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_organizations_created_by", "organizations", ["created_by"])

    # ── opportunities ─────────────────────────────────────────────────────────
    op.create_table(
        "opportunities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "opportunity_type",
            sa.Enum(
                "TRAINING", "SME", "FREELANCE", "CONSULTING",
                "PROJECT", "WORKSHOP", "LECTURE", "OTHER",
                name="opportunitytype",
            ),
            nullable=False,
        ),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "location_type",
            sa.Enum("REMOTE", "ONSITE", "HYBRID", name="locationtype"),
            nullable=True,
        ),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("skills_required", sa.JSON(), nullable=True),
        sa.Column("experience_required", sa.String(100), nullable=True),
        sa.Column("budget_min", sa.Integer(), nullable=True),
        sa.Column("budget_max", sa.Integer(), nullable=True),
        sa.Column("currency", sa.String(3), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "DRAFT", "OPEN", "CLOSED", "CANCELLED",
                name="opportunitystatus",
            ),
            nullable=False,
            server_default="DRAFT",
        ),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_opportunities_organization_id", "opportunities", ["organization_id"])
    op.create_index("ix_opportunities_status", "opportunities", ["status"])
    op.create_index("ix_opportunities_created_by", "opportunities", ["created_by"])

    # ── applications ──────────────────────────────────────────────────────────
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("opportunity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("applicant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "SELECTED", "WITHDRAWN",
                name="applicationstatus",
            ),
            nullable=False,
            server_default="APPLIED",
        ),
        sa.Column("cover_note", sa.Text(), nullable=True),
        sa.Column(
            "applied_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["opportunity_id"], ["opportunities.id"]),
        sa.ForeignKeyConstraint(["applicant_id"], ["users.id"]),
        sa.UniqueConstraint(
            "opportunity_id", "applicant_id",
            name="uq_application_opportunity_applicant",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_applications_opportunity_id", "applications", ["opportunity_id"])
    op.create_index("ix_applications_applicant_id", "applications", ["applicant_id"])


def downgrade() -> None:
    op.drop_table("applications")
    op.drop_table("opportunities")
    op.drop_table("organizations")
    op.drop_table("refresh_tokens")
    op.drop_table("users")

    for enum_name in (
        "applicationstatus",
        "locationtype",
        "opportunitystatus",
        "opportunitytype",
        "organizationtype",
        "profilestatus",
        "usertype",
    ):
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
