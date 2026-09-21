"""add experience_entries table

Revision ID: 006
Revises: 005
Create Date: 2026-09-14
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types only if they don't already exist (DO block handles duplicate gracefully)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE locationtype AS ENUM ('ON_SITE', 'HYBRID', 'REMOTE');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE employmenttype AS ENUM (
                'FULL_TIME', 'PART_TIME', 'FREELANCE',
                'SELF_EMPLOYED', 'INTERNSHIP', 'APPRENTICESHIP'
            );
        EXCEPTION WHEN duplicate_object THEN null;
        END $$
    """)

    op.create_table(
        "experience_entries",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("job_title",    sa.String(200), nullable=False),
        sa.Column("organization", sa.String(200), nullable=False),
        sa.Column("location",     sa.String(200), nullable=True),
        sa.Column(
            "location_type",
            postgresql.ENUM("ON_SITE", "HYBRID", "REMOTE", name="locationtype", create_type=False),
            nullable=True,
        ),
        sa.Column(
            "employment_type",
            postgresql.ENUM(
                "FULL_TIME", "PART_TIME", "FREELANCE",
                "SELF_EMPLOYED", "INTERNSHIP", "APPRENTICESHIP",
                name="employmenttype", create_type=False,
            ),
            nullable=True,
        ),
        sa.Column("is_current",  sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("start_month", sa.Integer, nullable=False),
        sa.Column("start_year",  sa.Integer, nullable=False),
        sa.Column("end_month",   sa.Integer, nullable=True),
        sa.Column("end_year",    sa.Integer, nullable=True),
        sa.Column("highlights",  sa.Text,    nullable=True),
        sa.Column("skills",      postgresql.ARRAY(sa.String(100)), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_experience_entries_user_id",
        "experience_entries",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_experience_entries_user_id", table_name="experience_entries")
    op.drop_table("experience_entries")
    # locationtype is shared with opportunities — do NOT drop it
    sa.Enum(name="employmenttype").drop(op.get_bind(), checkfirst=True)
