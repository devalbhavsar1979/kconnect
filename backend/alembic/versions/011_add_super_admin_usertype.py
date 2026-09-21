"""add SUPER_ADMIN to usertype enum

Revision ID: 011
Revises: 010
Create Date: 2026-09-17
"""
from alembic import op

revision = "011"
down_revision = "010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE usertype ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values; downgrade is a no-op.
    pass
