"""add achievements table

Revision ID: 009
Revises: 008
Create Date: 2026-09-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "achievements",
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
        sa.Column("title",       sa.String(200), nullable=False),
        sa.Column("description", sa.Text,        nullable=False),
        sa.Column("file_path",   sa.String(500), nullable=True),
        sa.Column("file_name",   sa.String(200), nullable=True),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_achievements_user_id", "achievements", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_achievements_user_id", table_name="achievements")
    op.drop_table("achievements")
