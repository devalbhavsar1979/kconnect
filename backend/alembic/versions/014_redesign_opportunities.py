"""Redesign opportunities table with full schema

Revision ID: 014
Revises: 013
Create Date: 2026-09-20
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY

revision = '014'
down_revision = '013'
branch_labels = None
depends_on = None


def upgrade():
    # ── 1. Drop FK + unique constraint on applications ────────────────────────
    op.execute(
        "ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_opportunity_id_fkey"
    )
    op.execute(
        "ALTER TABLE applications DROP CONSTRAINT IF EXISTS uq_application_opportunity_applicant"
    )

    # ── 2. Drop existing opportunities table ─────────────────────────────────
    op.drop_table("opportunities")

    # ── 3. Drop stale ENUMs ───────────────────────────────────────────────────
    op.execute("DROP TYPE IF EXISTS opportunitytype CASCADE")
    op.execute("DROP TYPE IF EXISTS locationtype CASCADE")
    op.execute("DROP TYPE IF EXISTS opportunitystatus CASCADE")

    # ── 4. Create new ENUMs ───────────────────────────────────────────────────
    op.execute("""
        CREATE TYPE opportunitytype AS ENUM (
            'LECTURE',
            'CONTENT_COURSE_DEVELOPMENT',
            'LANGUAGE_MEDIA',
            'LEARNING_SUPPORT_EVALUATION',
            'CONTENT_ELEARNING',
            'EDITING_REVIEW'
        )
    """)

    op.execute("""
        CREATE TYPE sessionstructuretype AS ENUM (
            'SINGLE_SESSION',
            'MULTIPLE_SESSIONS',
            'ONGOING_PROGRAM'
        )
    """)

    op.execute("""
        CREATE TYPE venuelocationtype AS ENUM (
            'CORPORATE',
            'INSTITUTE',
            'UNIVERSITY',
            'ONLINE',
            'OTHERS'
        )
    """)

    op.execute("""
        CREATE TYPE expertiseleveltype AS ENUM (
            'FRESHER',
            'EXPERIENCED',
            'EXPERT'
        )
    """)

    op.execute("""
        CREATE TYPE compensationtype AS ENUM (
            'PAID',
            'VOLUNTARY',
            'NEGOTIABLE',
            'TBD'
        )
    """)

    op.execute("""
        CREATE TYPE feestructuretype AS ENUM (
            'PER_SESSION',
            'PER_PROGRAM',
            'PER_TASK'
        )
    """)

    op.execute("""
        CREATE TYPE opportunityvisibility AS ENUM (
            'VISIBLE_TO_ALL',
            'SHORTLISTED_ONLY'
        )
    """)

    op.execute("""
        CREATE TYPE opportunitystatus AS ENUM (
            'DRAFT',
            'OPEN',
            'CLOSED',
            'CANCELLED',
            'ARCHIVED'
        )
    """)

    # ── 5. Create new opportunities table ────────────────────────────────────
    op.execute("""
        CREATE TABLE opportunities (
            id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            -- §1 Opportunity Basics
            title                   VARCHAR(512) NOT NULL,
            opportunity_type        opportunitytype NOT NULL,
            category                VARCHAR(200) NOT NULL,
            sub_category            VARCHAR(200),
            delivery_modes          TEXT[] NOT NULL DEFAULT '{}',
            number_of_openings      INTEGER NOT NULL DEFAULT 1,
            session_structure       sessionstructuretype NOT NULL,
            total_duration          VARCHAR(100) NOT NULL,
            duration_per_session    VARCHAR(100) NOT NULL,

            -- §2 Organization Details
            organization_id         UUID REFERENCES organizations(id) ON DELETE SET NULL,

            -- §3 Opportunity Details
            short_description       VARCHAR(500) NOT NULL,
            detailed_description    TEXT NOT NULL,
            tags                    TEXT[] NOT NULL DEFAULT '{}',

            -- §4 Schedule & Location
            event_date              DATE NOT NULL,
            start_time              TIME,
            end_time                TIME,
            venue_name              VARCHAR(500),
            venue_location_type     venuelocationtype,
            venue_address           TEXT,
            target_audience         TEXT[] NOT NULL DEFAULT '{}',

            -- §5 Requirements
            skills_required         TEXT[] NOT NULL DEFAULT '{}',
            minimum_experience      VARCHAR(100),
            expertise_level         expertiseleveltype,
            additional_requirements TEXT,
            language_of_delivery    VARCHAR(100) NOT NULL,

            -- §6 Eligibility & Preferences
            preferred_location      VARCHAR(200),
            gender_preference       VARCHAR(50),
            candidate_preference    TEXT,
            notes_for_applicants    TEXT,
            application_deadline    DATE,

            -- §7 Compensation & Benefits
            compensation_type       compensationtype NOT NULL DEFAULT 'TBD',
            fee_structure           feestructuretype,
            fee_amount              NUMERIC(12, 2),
            payment_terms           VARCHAR(200),
            travel_required         BOOLEAN NOT NULL DEFAULT FALSE,
            travel_reimbursement    BOOLEAN NOT NULL DEFAULT FALSE,
            other_benefits          TEXT,

            -- §8 Visibility & Status
            visibility              opportunityvisibility NOT NULL DEFAULT 'VISIBLE_TO_ALL',
            status                  opportunitystatus NOT NULL DEFAULT 'DRAFT',

            -- Metadata
            created_by              UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
            created_at              TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at              TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
    """)

    op.execute("CREATE INDEX ix_opportunities_status       ON opportunities(status)")
    op.execute("CREATE INDEX ix_opportunities_created_by   ON opportunities(created_by)")
    op.execute("CREATE INDEX ix_opportunities_organization ON opportunities(organization_id)")
    op.execute("CREATE INDEX ix_opportunities_event_date   ON opportunities(event_date)")

    # ── 6. Create opportunity_attachments table ───────────────────────────────
    op.execute("""
        CREATE TABLE opportunity_attachments (
            id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            opportunity_id   UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
            file_name        VARCHAR(300) NOT NULL,
            file_path        VARCHAR(1024) NOT NULL,
            file_size_bytes  INTEGER NOT NULL,
            uploaded_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
    """)

    op.execute(
        "CREATE INDEX ix_opp_attachments_opp_id ON opportunity_attachments(opportunity_id)"
    )

    # ── 7. Recreate FK + unique constraint on applications ────────────────────
    op.create_foreign_key(
        "applications_opportunity_id_fkey",
        "applications", "opportunities",
        ["opportunity_id"], ["id"]
    )
    op.create_unique_constraint(
        "uq_application_opportunity_applicant",
        "applications",
        ["opportunity_id", "applicant_id"]
    )


def downgrade():
    op.execute(
        "ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_opportunity_id_fkey"
    )
    op.execute(
        "ALTER TABLE applications DROP CONSTRAINT IF EXISTS uq_application_opportunity_applicant"
    )

    op.drop_table("opportunity_attachments")
    op.drop_table("opportunities")

    op.execute("DROP TYPE IF EXISTS opportunitytype CASCADE")
    op.execute("DROP TYPE IF EXISTS sessionstructuretype CASCADE")
    op.execute("DROP TYPE IF EXISTS venuelocationtype CASCADE")
    op.execute("DROP TYPE IF EXISTS expertiseleveltype CASCADE")
    op.execute("DROP TYPE IF EXISTS compensationtype CASCADE")
    op.execute("DROP TYPE IF EXISTS feestructuretype CASCADE")
    op.execute("DROP TYPE IF EXISTS opportunityvisibility CASCADE")
    op.execute("DROP TYPE IF EXISTS opportunitystatus CASCADE")
