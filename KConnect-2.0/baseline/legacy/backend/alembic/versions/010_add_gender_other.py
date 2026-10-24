"""add OTHER to gendertype enum

Revision ID: 010
Revises: 009
Create Date: 2026-09-15
"""
from alembic import op

revision = "010"
down_revision = "009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE gendertype ADD VALUE IF NOT EXISTS 'OTHER'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values; downgrade is a no-op.
    pass
