"""Add date_of_birth and cv_file_path to users

Revision ID: 002
Revises: 001
Create Date: 2026-09-09
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "e858521fde2d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("date_of_birth", sa.Date(), nullable=True))
    op.add_column("users", sa.Column("cv_file_path", sa.String(512), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "cv_file_path")
    op.drop_column("users", "date_of_birth")
