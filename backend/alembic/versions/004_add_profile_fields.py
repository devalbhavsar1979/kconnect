"""Add profile fields to users table (title, gender, designation, address, bio, etc.)

Revision ID: 004
Revises: 003
Create Date: 2026-09-14
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # op.add_column() does NOT auto-create enum types (unlike op.create_table),
    # so we create them explicitly first, then add columns with create_type=False.
    op.execute("CREATE TYPE titletype AS ENUM ('MR', 'MRS', 'MISS', 'DR', 'PROF')")
    op.execute("CREATE TYPE gendertype AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY')")
    op.execute("CREATE TYPE designationtype AS ENUM ('PROFESSOR', 'ASST_PROFESSOR', 'TRAINER', 'GUEST_FACULTY')")

    op.add_column("users", sa.Column("profile_photo_path", sa.String(512), nullable=True))

    op.add_column("users", sa.Column(
        "title",
        sa.Enum("MR", "MRS", "MISS", "DR", "PROF", name="titletype", create_type=False),
        nullable=True,
    ))
    op.add_column("users", sa.Column(
        "gender",
        sa.Enum("MALE", "FEMALE", "PREFER_NOT_TO_SAY", name="gendertype", create_type=False),
        nullable=True,
    ))

    op.add_column("users", sa.Column("website",  sa.String(100), nullable=True))
    op.add_column("users", sa.Column("linkedin", sa.String(100), nullable=True))
    op.add_column("users", sa.Column("company",  sa.String(100), nullable=True))

    op.add_column("users", sa.Column(
        "designation",
        sa.Enum("PROFESSOR", "ASST_PROFESSOR", "TRAINER", "GUEST_FACULTY", name="designationtype", create_type=False),
        nullable=True,
    ))

    op.add_column("users", sa.Column("short_bio",       sa.Text(),       nullable=True))
    op.add_column("users", sa.Column("address_flat",    sa.String(200),  nullable=True))
    op.add_column("users", sa.Column("address_area",    sa.String(200),  nullable=True))
    op.add_column("users", sa.Column("address_city",    sa.String(100),  nullable=True))
    op.add_column("users", sa.Column("address_state",   sa.String(100),  nullable=True))
    op.add_column("users", sa.Column("address_country", sa.String(100),  nullable=True))
    op.add_column("users", sa.Column("address_pincode", sa.String(10),   nullable=True))
    op.add_column("users", sa.Column(
        "consent",
        sa.Boolean(),
        nullable=False,
        server_default=sa.text("false"),
    ))


def downgrade() -> None:
    op.drop_column("users", "consent")
    op.drop_column("users", "address_pincode")
    op.drop_column("users", "address_country")
    op.drop_column("users", "address_state")
    op.drop_column("users", "address_city")
    op.drop_column("users", "address_area")
    op.drop_column("users", "address_flat")
    op.drop_column("users", "short_bio")
    op.drop_column("users", "designation")
    op.drop_column("users", "company")
    op.drop_column("users", "linkedin")
    op.drop_column("users", "website")
    op.drop_column("users", "gender")
    op.drop_column("users", "title")
    op.drop_column("users", "profile_photo_path")

    for enum_name in ("titletype", "gendertype", "designationtype"):
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
