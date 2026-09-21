"""add academic_details table

Revision ID: 005
Revises: 004
Create Date: 2026-09-14
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "academic_details",
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
        sa.Column("school",         sa.String(200),              nullable=False),
        sa.Column("degree",         sa.String(200),              nullable=False),
        sa.Column("field_of_study", sa.String(200),              nullable=True),
        sa.Column("end_month",      sa.Integer,                  nullable=True),
        sa.Column("end_year",       sa.Integer,                  nullable=True),
        sa.Column("grade",          sa.String(50),               nullable=True),
        sa.Column("description",    sa.Text,                     nullable=True),
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
        "ix_academic_details_user_id",
        "academic_details",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_academic_details_user_id", table_name="academic_details")
    op.drop_table("academic_details")
