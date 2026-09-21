"""Update organizations: add industry, convert org_type to VARCHAR

Revision ID: 015
Revises: 014
Create Date: 2026-09-20
"""

from alembic import op
import sqlalchemy as sa

revision = '015'
down_revision = '014'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Convert organization_type from ENUM to VARCHAR
    #    USING cast preserves existing string values (CORPORATE, STARTUP, etc.)
    op.execute(
        "ALTER TABLE organizations "
        "ALTER COLUMN organization_type TYPE VARCHAR(100) "
        "USING organization_type::text"
    )

    # 2. Drop the old enum type
    op.execute("DROP TYPE IF EXISTS organizationtype")

    # 3. Add industry column
    op.add_column(
        'organizations',
        sa.Column('industry', sa.String(200), nullable=True)
    )

    # 4. Index on industry for filter queries
    op.create_index('ix_organizations_industry', 'organizations', ['industry'])


def downgrade():
    op.drop_index('ix_organizations_industry', table_name='organizations')
    op.drop_column('organizations', 'industry')

    # Recreate original enum (values only — existing data may not match)
    op.execute("""
        CREATE TYPE organizationtype AS ENUM (
            'CORPORATE', 'STARTUP', 'NGO', 'GOVERNMENT', 'EDUCATIONAL', 'OTHER'
        )
    """)
    op.execute(
        "ALTER TABLE organizations "
        "ALTER COLUMN organization_type TYPE organizationtype "
        "USING organization_type::organizationtype"
    )
