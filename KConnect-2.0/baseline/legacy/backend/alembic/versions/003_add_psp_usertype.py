"""Add PROFESSIONAL_SERVICE_PROVIDER to usertype enum

Revision ID: 003
Revises: 002
Create Date: 2026-09-09
"""

from typing import Sequence, Union

from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE usertype ADD VALUE IF NOT EXISTS 'PROFESSIONAL_SERVICE_PROVIDER'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values natively.
    # A full type recreation would be required — skipped intentionally.
    pass
