"""add user_preferences table

Revision ID: 008
Revises: 007
Create Date: 2026-09-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_preferences",
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
        sa.Column("delivery_modes",         postgresql.ARRAY(sa.String(50)),  nullable=False, server_default="{}"),
        sa.Column("geographic_preference",  postgresql.ARRAY(sa.String(50)),  nullable=False, server_default="{}"),
        sa.Column("willing_to_travel",      sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("max_travel_distance",    sa.String(20), nullable=True),
        sa.Column("travel_reimbursement",   sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("preferred_audience",     postgresql.ARRAY(sa.String(50)),  nullable=False, server_default="{}"),
        sa.Column("services",               postgresql.ARRAY(sa.String(50)),  nullable=False, server_default="{}"),
        sa.Column("training_topics",        postgresql.ARRAY(sa.String(200)), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_user_preferences_user_id", "user_preferences", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_user_preferences_user_id", table_name="user_preferences")
    op.drop_table("user_preferences")
