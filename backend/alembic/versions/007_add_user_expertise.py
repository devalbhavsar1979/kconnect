"""add user_expertise table

Revision ID: 007
Revises: 006
Create Date: 2026-09-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_expertise",
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
            unique=True,
        ),
        sa.Column("total_experience",     sa.String(100), nullable=False),
        sa.Column("teaching_experience",  sa.String(100), nullable=False),
        sa.Column("corporate_training",   sa.String(100), nullable=False),
        sa.Column("online_training",      sa.String(100), nullable=False),
        sa.Column("classroom_training",   sa.String(100), nullable=False),
        sa.Column("primary_expertise",    sa.String(200), nullable=False),
        sa.Column("secondary_expertise",  sa.String(200), nullable=True),
        sa.Column(
            "audience_levels",
            postgresql.ARRAY(sa.String(50)),
            nullable=False,
            server_default="{}",
        ),
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
    op.create_index("ix_user_expertise_user_id", "user_expertise", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_user_expertise_user_id", table_name="user_expertise")
    op.drop_table("user_expertise")
