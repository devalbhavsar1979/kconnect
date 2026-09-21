# Opportunity Pages — Design Documentation & Development Guide

**Project:** K-CONNECT  
**Pages:**
- Admin Create/Edit Opportunity (`/admin/opportunities/new`, `/admin/opportunities/:id/edit`)
- Expert Opportunity Listing (`/opportunities`)

**Version:** 1.1  
**Date:** 2026-09-20  
**Status:** Admin Create/Edit — Design-complete, Implemented · Expert Listing — Design-complete, Not started

---

## Table of Contents

1. [Overview](#1-overview)
2. [Page Architecture](#2-page-architecture)
3. [Component Inventory](#3-component-inventory)
4. [Section Field Specifications](#4-section-field-specifications)
   - [§4a. Opportunity Basics](#4a-opportunity-basics)
   - [§4b. Organization Details](#4b-organization-details)
   - [§4c. Opportunity Details](#4c-opportunity-details)
   - [§4d. Schedule & Location](#4d-schedule--location)
   - [§4e. Requirements](#4e-requirements)
   - [§4f. Eligibility & Preferences](#4f-eligibility--preferences)
   - [§4g. Compensation & Benefits](#4g-compensation--benefits)
   - [§4h. Attachments & Documents](#4h-attachments--documents)
   - [§4i. Visibility & Status](#4i-visibility--status)
5. [Data Model](#5-data-model)
6. [API Endpoints](#6-api-endpoints)
7. [Form UX Rules](#7-form-ux-rules)
8. [Validation Rules](#8-validation-rules)
9. [Section Status](#9-section-status)
10. [Step-by-Step Development Prompts](#10-step-by-step-development-prompts)
11. [Delivery Sequence Summary](#11-delivery-sequence-summary)
12. [Decisions & Open Questions](#12-decisions--open-questions)
13. [Expert Opportunity Listing Page (`/opportunities`)](#13-expert-opportunity-listing-page-opportunities)
    - [§13.1 Page Purpose](#131-page-purpose)
    - [§13.2 Overall Layout](#132-overall-layout)
    - [§13.3 Tab Navigation](#133-tab-navigation)
    - [§13.4 Filter Bar](#134-filter-bar-top)
    - [§13.5 Opportunity Card Design](#135-opportunity-card-design)
    - [§13.6 Left Sidebar — Profile Completion Widget](#136-left-sidebar--profile-completion-widget)
    - [§13.7 Right Sidebar — Filter Panel](#137-right-sidebar--filter-panel)
    - [§13.8 API Requirements](#138-api-requirements)
    - [§13.9 Opportunity Type Display Labels](#139-opportunity-type--display-labels--visual-identity)
    - [§13.10 Decisions & Defaults](#1310-listing-page--decisions--defaults)
    - [§13.11 Development Prompts](#1311-listing-page--development-prompts)

---

## 1. Overview

The **Create New Opportunity** page allows the Super Admin to post new work opportunities for K-CONNECT experts. Opportunities are the core transactional unit of the platform — they connect organisations' needs with expert capabilities.

### Design References

- UI screenshot: `create new opportunity.pdf` (admin panel mockup by "Ravi Sharma – Super Admin")
- Field specification: `create new opportunity.pdf` — 6-page attribute table

### Current State (Stub)

The existing `opportunities` table has 13 columns — a placeholder built before the attribute spec was received. This design supersedes it. Migration 014 will replace the stub columns with the full schema (no data loss risk since the API returns placeholder responses).

### Key Principles

- **Multi-section single-page form:** All 9 sections are visible simultaneously in a 3-column grid — no steps/wizard.
- **Draft-first:** The form defaults to `DRAFT` status. Publishing is a deliberate secondary action.
- **Preview before publish:** A "Preview Opportunity" button shows a read-only view before committing.
- **Admin-only creation:** Only SUPER_ADMIN can create/edit/publish. Future phase may allow organisation users.
- **Attachment support:** Up to 5 files per opportunity (PDF, DOC, DOCX, PPT, PPTX — max 10 MB each), stored in a separate `opportunity_attachments` table.

---

## 2. Page Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER                                                                │
│  Breadcrumb: Opportunities > Create New Opportunity                         │
│  Title: "Create New Opportunity"   [Save as Draft]  [Preview Opportunity]  │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  ROW 1                               │                                      │
│  §1 Opportunity Basics (col-span-2)  │  §2 Organization Details (col-span-1)│
├──────────────────┬───────────────────┼──────────────────────────────────────┤
│  ROW 2           │                   │                                      │
│  §3 Opportunity  │  §4 Schedule &    │  §5 Compensation & Benefits          │
│  Details         │  Location         │                                      │
├──────────────────┼───────────────────┼──────────────────────────────────────┤
│  ROW 3           │                   │                                      │
│  §6 Requirements │  §7 Eligibility & │  §8 Attachments & Documents          │
│                  │  Preferences      │  §9 Visibility & Status              │
├──────────────────┴───────────────────┴──────────────────────────────────────┤
│  PAGE FOOTER                                                                │
│  [Cancel]                           [Save as Draft]   [Publish Opportunity] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Grid Specification

| Row | Section | Desktop Columns | Notes |
|---|---|---|---|
| Row 1 | §1 Opportunity Basics | `col-span-2` | Left 2/3 of 3-col grid |
| Row 1 | §2 Organization Details | `col-span-1` | Right 1/3 |
| Row 2 | §3 Opportunity Details | `col-span-1` | Left third |
| Row 2 | §4 Schedule & Location | `col-span-1` | Center third |
| Row 2 | §5 Compensation & Benefits | `col-span-1` | Right third |
| Row 3 | §6 Requirements | `col-span-1` | Left third |
| Row 3 | §7 Eligibility & Preferences | `col-span-1` | Center third |
| Row 3 | §8 Attachments + §9 Visibility | `col-span-1` | Right third (stacked) |

Mobile: all sections stack to full-width single column in document order (§1 → §2 → §3 → §4 → §5 → §6 → §7 → §8 → §9).

### Routes

| Route | Purpose |
|---|---|
| `/admin/opportunities/new` | Create a new opportunity (blank form) |
| `/admin/opportunities/:id/edit` | Edit an existing opportunity (pre-filled form) |
| `/admin/opportunities` | List all opportunities (existing placeholder page) |

---

## 3. Component Inventory

### Page Components

| Component | File | Responsibility |
|---|---|---|
| `CreateOpportunityPage` | `features/admin/pages/CreateOpportunityPage.tsx` | Page container — form state, validation, API calls, routing |
| `OpportunityFormHeader` | `features/admin/components/opportunity/OpportunityFormHeader.tsx` | Breadcrumb + title + top action buttons |
| `OpportunityFormFooter` | `features/admin/components/opportunity/OpportunityFormFooter.tsx` | Cancel / Save Draft / Publish buttons |

### Section Form Components (9 sections)

| Component | File | Section |
|---|---|---|
| `OpportunityBasicsSection` | `.../opportunity/OpportunityBasicsSection.tsx` | §1 |
| `OrganizationDetailsSection` | `.../opportunity/OrganizationDetailsSection.tsx` | §2 |
| `OpportunityDetailsSection` | `.../opportunity/OpportunityDetailsSection.tsx` | §3 |
| `ScheduleLocationSection` | `.../opportunity/ScheduleLocationSection.tsx` | §4 |
| `CompensationBenefitsSection` | `.../opportunity/CompensationBenefitsSection.tsx` | §5 |
| `RequirementsSection` | `.../opportunity/RequirementsSection.tsx` | §6 |
| `EligibilityPreferencesSection` | `.../opportunity/EligibilityPreferencesSection.tsx` | §7 |
| `AttachmentsSection` | `.../opportunity/AttachmentsSection.tsx` | §8 |
| `VisibilityStatusSection` | `.../opportunity/VisibilityStatusSection.tsx` | §9 |

### Shared Sub-Components

| Component | Purpose |
|---|---|
| `TagInput` | Text field with Enter-to-add tag chips (used in Skills, Tags) |
| `SectionCard` | White card wrapper with numbered section heading |
| `FormField` | Label + input + error message wrapper |
| `RadioGroup` | Radio button group with accessible labels |

---

## 4. Section Field Specifications

### §4a. Opportunity Basics

**Section number on UI:** 1  
**Grid position:** Row 1, col-span-2

| # | Field | DB Column | Control | Required | Options / Constraints |
|---|---|---|---|---|---|
| 1 | Opportunity Title | `title` | Text input | Yes | Max 512 chars |
| 2 | Opportunity Type | `opportunity_type` | Dropdown | Yes | Lecture; Content & Course Development; Language & Media; Learning Support & Evaluation; Content & E-Learning; Editing & Review |
| 3 | Category | `category` | Text input | Yes | Free text, max 200 chars |
| 4 | Sub Category | `sub_category` | Text input | No | Free text, max 200 chars |
| 5 | Delivery Mode | `delivery_mode` | Dropdown (multi-select) | Yes | Classroom; Online; Hybrid; Offline Recording; Chat Support / Q&A |
| 6 | Number of Openings | `number_of_openings` | Number input | Yes | Min 1, integer |
| 7 | Session / Program Structure | `session_structure` | Radio | Yes | Single Session; Multiple Sessions; Ongoing Program |
| 8 | Total Duration | `total_duration` | Text input | Yes | Free text, e.g. "3 hours", "2 days", "6 weeks" |
| 9 | Duration Per Session | `duration_per_session` | Text input | Yes | Free text, e.g. "1 hour", "90 minutes" |

**Layout:** 3-column sub-grid within the section card
- Row 1: Opportunity Title (full-width)
- Row 2: Opportunity Type | Category
- Row 3: Sub Category | Delivery Mode | Number of Openings
- Row 4: Session / Program Structure (radio row, full-width)
- Row 5: Total Duration | Duration Per Session

---

### §4b. Organization Details

**Section number on UI:** 2  
**Grid position:** Row 1, col-span-1 (right panel)

| # | Field | DB Column | Control | Required | Options / Constraints |
|---|---|---|---|---|---|
| 1 | Organization | `organization_id` | Dropdown (search-select) | Yes (for publish) | Loads from organizations master via `/api/v1/admin/organisations`; displays name in dropdown; stores UUID FK |

**Auto-filled read-only display (shown after org is selected — not stored on opportunity):**

| Display Field | Source | Notes |
|---|---|---|
| Industry / Domain | `organizations.industry` | Read-only label — available after Migration 015 |
| Organization Type | `organizations.organization_type` | Read-only label (VARCHAR after Migration 015) |
| Website | `organizations.website` | Read-only link, opens new tab |
| City | `organizations.city` | Read-only label (shown as "Location / City") |
| State | `organizations.state` | Read-only label |

**UX Note:** Organization is a master entity — the admin selects it from the dropdown and the section card auto-fills the display fields from the selected record. These fields are display-only (not editable on this form). If org details need updating, admin goes to the Organizations admin page.  
Draft save: `organization_id` may be null (org selection optional for drafts).  
Publish: `organization_id` is required.

---

### §4c. Opportunity Details

**Section number on UI:** 3  
**Grid position:** Row 2, col-span-1 (left)

| # | Field | DB Column | Control | Required | Options / Constraints |
|---|---|---|---|---|---|
| 1 | Short Description | `short_description` | Text input | Yes | Max 200 chars; character counter shown |
| 2 | Detailed Description | `detailed_description` | Textarea (plain text — MVP) | Yes | Max 4000 chars; character counter shown; rich text toolbar added in MVP2 |
| 3 | Tags | `tags` | Tag input | Yes | Comma/Enter to add; suggested: Workshop, Training Program, Guest Lecture, Webinar, Bootcamp, Seminar |

---

### §4d. Schedule & Location

**Section number on UI:** 4  
**Grid position:** Row 2, col-span-1 (center)

| # | Field | DB Column | Control | Required | Options / Constraints |
|---|---|---|---|---|---|
| 1 | Date | `event_date` | Date picker | Yes | Cannot be in the past |
| 2 | Start Time | `start_time` | Time picker | No | Optional |
| 3 | End Time | `end_time` | Time picker | No | Optional; must be after `start_time` if both provided |
| 4 | Venue / Location Name | `venue_name` | Text input | Yes | Max 500 chars |
| 5 | Location Type | `venue_location_type` | Dropdown | Yes | Corporate; Institute; University; Online; Others |
| 6 | Address / Venue Details | `venue_address` | Textarea | Yes | Full address; max 1000 chars |
| 7 | Target Audience | `target_audience` | Multi-select dropdown | Yes | School; College / University; Freshers; Working Professionals; Managers; Senior Management; Technical Teams; Non-Technical Teams |

---

### §4e. Requirements

**Section number on UI:** 6  
**Grid position:** Row 3, col-span-1 (left)

| # | Field | DB Column | Control | Required | Options / Constraints |
|---|---|---|---|---|---|
| 1 | Required Skills / Keywords | `skills_required` | Tag input (+ Add button) | Yes | Min 1 tag |
| 2 | Minimum Experience | `minimum_experience` | Dropdown | Yes | Fresher (0 yrs); 1–2 years; 3–5 years; 5–8 years; 8–10 years; 10+ years |
| 3 | Expertise Level | `expertise_level` | Dropdown | Yes | Fresher; Experienced; Expert |
| 4 | Additional Requirements | `additional_requirements` | Textarea | No | Max 300 chars |
| 5 | Language of Delivery | `language_of_delivery` | Dropdown | Yes | English; Hindi; Marathi; Tamil; Telugu; Kannada; Malayalam; Bengali; Gujarati; Punjabi; Other |

---

### §4f. Eligibility & Preferences

**Section number on UI:** 7  
**Grid position:** Row 3, col-span-1 (center)

| # | Field | DB Column | Control | Required | Options / Constraints |
|---|---|---|---|---|---|
| 1 | Preferred Location / Area | `preferred_location` | Text input | No | e.g. "Mumbai", "Across Maharashtra", "Pan India" |
| 2 | Gender Preference | `gender_preference` | Dropdown | No | No Preference; Male; Female; Any |
| 3 | Candidate Preference | `candidate_preference` | Text input | No | Free text, max 300 chars |
| 4 | Notes for Applicants | `notes_for_applicants` | Textarea | No | Max 300 chars; shown to applicants |
| 5 | Application Deadline | `application_deadline` | Date picker | No | Cannot be after `event_date` |

---

### §4g. Compensation & Benefits

**Section number on UI:** 5  
**Grid position:** Row 2, col-span-1 (right)

| # | Field | DB Column | Control | Required | Options / Constraints |
|---|---|---|---|---|---|
| 1 | Compensation Type | `compensation_type` | Dropdown | Yes | Paid; Voluntary / Unpaid; Negotiable; TBD |
| 2 | Fee Structure | `fee_structure` | Radio + Amount | No | Per Session; Per Program; Per Task — with INR amount text field |
| 3 | Fee / Honorarium Amount | `fee_amount` | Number input | No | Shown only when Compensation Type = Paid; INR currency label prepended |
| 4 | Payment Terms | `payment_terms` | Dropdown | No | Advance; On Completion; 50-50; Monthly; As Agreed |
| 5 | Travel Required | `travel_required` | Radio | Yes | Yes / No |
| 6 | Travel Reimbursement | `travel_reimbursement` | Radio | Yes | Yes / No |
| 7 | Other Benefits | `other_benefits` | Textarea | No | e.g. "Certificates, Meals, Accommodation" — max 300 chars |

**Conditional logic:**
- If `compensation_type` = "Voluntary / Unpaid" → hide `fee_structure`, `fee_amount`, `payment_terms`
- If `travel_required` = No → hide `travel_reimbursement`

---

### §4h. Attachments & Documents

**Section number on UI:** 8  
**Grid position:** Row 3, col-span-1 right (top half, stacked above §9)

| # | Field | DB | Control | Required | Constraints |
|---|---|---|---|---|---|
| 1 | Upload Documents | `opportunity_attachments` table | File drop zone + "Choose Files" | No | PDF, DOC, DOCX, PPT, PPTX only; max 10 MB each; max 5 files total |

**UX:**
- Drag-and-drop zone with dashed border
- File chip list below dropzone (name + size + × to remove)
- Progress indicator during upload

---

### §4i. Visibility & Status

**Section number on UI:** 9  
**Grid position:** Row 3, col-span-1 right (bottom half, stacked below §8)

| # | Field | DB Column | Control | Required | Options |
|---|---|---|---|---|---|
| 1 | Visibility | `visibility` | Radio | Yes | Visible to All (all matching experts can view); Shortlisted Only (only shortlisted experts can view) |
| 2 | Status | `status` | Dropdown | Yes | Active (Publish Now); Draft (Save as Draft) — maps to OPEN / DRAFT enum |

---

## 5. Data Model

### Strategy

The existing `opportunities` table is a stub (13 columns, no real data). Migration 014 will drop it and recreate it with the full schema, also dropping/replacing the stale ENUMs. A new `opportunity_attachments` table is added for file uploads.

### New ENUMs (Migration 014)

```sql
-- Drop old stubs
DROP TYPE IF EXISTS opportunitytype CASCADE;
DROP TYPE IF EXISTS locationtype CASCADE;
-- (opportunitystatus and statustype kept if referenced elsewhere)

-- New opportunity type
CREATE TYPE opportunitytype AS ENUM (
    'LECTURE',
    'CONTENT_COURSE_DEVELOPMENT',
    'LANGUAGE_MEDIA',
    'LEARNING_SUPPORT_EVALUATION',
    'CONTENT_ELEARNING',
    'EDITING_REVIEW'
);

-- Delivery mode (multi-value stored as TEXT[])
-- No enum — store as TEXT[] for multi-select

-- Session / program structure
CREATE TYPE sessionstructuretype AS ENUM (
    'SINGLE_SESSION',
    'MULTIPLE_SESSIONS',
    'ONGOING_PROGRAM'
);

-- Venue location type
CREATE TYPE venuelocationtype AS ENUM (
    'CORPORATE',
    'INSTITUTE',
    'UNIVERSITY',
    'ONLINE',
    'OTHERS'
);

-- Expertise level
CREATE TYPE expertiseleveltype AS ENUM (
    'FRESHER',
    'EXPERIENCED',
    'EXPERT'
);

-- Compensation type
CREATE TYPE compensationtype AS ENUM (
    'PAID',
    'VOLUNTARY',
    'NEGOTIABLE',
    'TBD'
);

-- Fee structure
CREATE TYPE feestructuretype AS ENUM (
    'PER_SESSION',
    'PER_PROGRAM',
    'PER_TASK'
);

-- Visibility
CREATE TYPE opportunityvisibility AS ENUM (
    'VISIBLE_TO_ALL',
    'SHORTLISTED_ONLY'
);

-- Status (extended)
CREATE TYPE opportunitystatus AS ENUM (
    'DRAFT',
    'OPEN',
    'CLOSED',
    'CANCELLED',
    'ARCHIVED'
);
```

### opportunities Table (full redesign)

```sql
CREATE TABLE opportunities (
    id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),

    -- §1 Opportunity Basics
    title                 VARCHAR(512)            NOT NULL,
    opportunity_type      opportunitytype         NOT NULL,
    category              VARCHAR(200)            NOT NULL,
    sub_category          VARCHAR(200),
    delivery_modes        TEXT[]                  NOT NULL DEFAULT '{}',
    number_of_openings    INTEGER                 NOT NULL DEFAULT 1,
    session_structure     sessionstructuretype    NOT NULL,
    total_duration        VARCHAR(100)            NOT NULL,
    duration_per_session  VARCHAR(100)            NOT NULL,

    -- §2 Organization Details (FK to organizations master — no local overrides)
    -- Nullable: allowed for drafts; required for publish (enforced at API layer)
    organization_id       UUID REFERENCES organizations(id) ON DELETE SET NULL,

    -- §3 Opportunity Details
    short_description     VARCHAR(500)            NOT NULL,
    detailed_description  TEXT                    NOT NULL,
    tags                  TEXT[]                  NOT NULL DEFAULT '{}',

    -- §4 Schedule & Location
    event_date            DATE                    NOT NULL,
    start_time            TIME,
    end_time              TIME,
    venue_name            VARCHAR(500),
    venue_location_type   venuelocationtype,
    venue_address         TEXT,
    target_audience       TEXT[]                  NOT NULL DEFAULT '{}',

    -- §5 Requirements
    skills_required       TEXT[]                  NOT NULL DEFAULT '{}',
    minimum_experience    VARCHAR(100),
    expertise_level       expertiseleveltype,
    additional_requirements TEXT,
    language_of_delivery  VARCHAR(100)            NOT NULL,

    -- §6 Eligibility & Preferences
    preferred_location    VARCHAR(200),
    gender_preference     VARCHAR(50),
    candidate_preference  TEXT,
    notes_for_applicants  TEXT,
    application_deadline  DATE,

    -- §7 Compensation & Benefits
    compensation_type     compensationtype        NOT NULL DEFAULT 'TBD',
    fee_structure         feestructuretype,
    fee_amount            NUMERIC(12, 2),
    payment_terms         VARCHAR(200),
    travel_required       BOOLEAN                 NOT NULL DEFAULT FALSE,
    travel_reimbursement  BOOLEAN                 NOT NULL DEFAULT FALSE,
    other_benefits        TEXT,

    -- §8 Visibility & Status
    visibility            opportunityvisibility   NOT NULL DEFAULT 'VISIBLE_TO_ALL',
    status                opportunitystatus       NOT NULL DEFAULT 'DRAFT',

    -- Metadata
    created_by            UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX ix_opportunities_status       ON opportunities(status);
CREATE INDEX ix_opportunities_created_by   ON opportunities(created_by);
CREATE INDEX ix_opportunities_organization ON opportunities(organization_id);
CREATE INDEX ix_opportunities_event_date   ON opportunities(event_date);
```

### opportunity_attachments Table

```sql
CREATE TABLE opportunity_attachments (
    id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id   UUID    NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    file_name        VARCHAR(300) NOT NULL,
    file_path        VARCHAR(1024) NOT NULL,
    file_size_bytes  INTEGER NOT NULL,
    uploaded_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX ix_opp_attachments_opp_id ON opportunity_attachments(opportunity_id);
```

**File storage:** `uploads/opportunities/{opportunity_id}/{uuid}_{original_filename}`  
**Served at:** `/uploads/opportunities/{opportunity_id}/{filename}`

---

## 6. API Endpoints

All admin opportunity endpoints require `SUPER_ADMIN` role.

### Admin Opportunity Endpoints

| Method | Path | Auth | Body / Params | Response | Purpose |
|---|---|---|---|---|---|
| `GET` | `/api/v1/admin/opportunities` | SUPER_ADMIN | Query: `?status=&search=&page=&size=` | `PaginatedResponse[OpportunityListItem]` | List all opportunities with filters |
| `POST` | `/api/v1/admin/opportunities` | SUPER_ADMIN | `OpportunityCreateRequest` | `OpportunityResponse` | Create (always starts as DRAFT) |
| `GET` | `/api/v1/admin/opportunities/{id}` | SUPER_ADMIN | — | `OpportunityResponse` | Get full detail |
| `PUT` | `/api/v1/admin/opportunities/{id}` | SUPER_ADMIN | `OpportunityUpdateRequest` | `OpportunityResponse` | Full update |
| `POST` | `/api/v1/admin/opportunities/{id}/publish` | SUPER_ADMIN | — | `OpportunityResponse` | Change status DRAFT → OPEN |
| `POST` | `/api/v1/admin/opportunities/{id}/archive` | SUPER_ADMIN | — | `OpportunityResponse` | Change status → ARCHIVED |
| `DELETE` | `/api/v1/admin/opportunities/{id}` | SUPER_ADMIN | — | 204 | Hard delete (only DRAFT allowed) |

### Attachment Endpoints

| Method | Path | Auth | Body | Response | Purpose |
|---|---|---|---|---|---|
| `POST` | `/api/v1/admin/opportunities/{id}/attachments` | SUPER_ADMIN | `multipart/form-data: file` | `AttachmentResponse` | Upload a file attachment |
| `DELETE` | `/api/v1/admin/opportunities/{id}/attachments/{attachment_id}` | SUPER_ADMIN | — | 204 | Delete file from disk + DB |

### Supporting Endpoints (existing — consumed by the Create form)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/organisations` | Populates the Organization dropdown in §4b (already exists — paginated list) |

### Public / Expert Endpoints (future phase)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/opportunities` | Optional | Browse open opportunities (status=OPEN, visibility=VISIBLE_TO_ALL) |
| `GET` | `/api/v1/opportunities/{id}` | Optional | View single opportunity |

---

## 7. Form UX Rules

### Action Buttons

| Button | Location | Behaviour |
|---|---|---|
| **Save as Draft** | Header (top-right) + Footer | POSTs/PUTs with `status=DRAFT`. Validates only required basics (title, type). All other fields optional on draft save. |
| **Preview Opportunity** | Header (top-right) | Opens a full-screen modal popup showing a formatted read-only view of the form data. No API call — pure local state. Admin closes the modal to return to the form and continue editing. |
| **Publish Opportunity** | Footer (primary CTA) | Runs full validation on all required fields, then POSTs + hits `/publish` endpoint. Shows confirmation prompt. |
| **Cancel** | Footer (left) | Navigates back to `/admin/opportunities` with a "discard changes?" confirmation if form is dirty. |
| **Archive Opportunity** | Available on Edit page only | Calls `/archive` endpoint. Requires confirmation dialog. |

### Section Cards

Each section renders inside a `SectionCard` component:
- White card, `rounded-xl shadow-sm border border-slate-200 p-6`
- Section heading: numbered badge + title (e.g. `1. Opportunity Basics`)
- Section heading colour: `text-slate-800 font-semibold`

### Tag Input Behaviour

- `TagInput` component: user types a skill/keyword → presses Enter or comma → converts to a chip
- Chip has `×` button to remove
- "+ Add" button also commits current input
- Max 20 tags per field

### Detailed Description Field (MVP)

- Plain `<textarea>` with `min-h-[200px]` and resize-y
- Max 4000 characters; character counter shown bottom-right (`current / 4000`)
- Plain text stored in DB (`TEXT` column)
- **MVP2:** Replace with a rich-text toolbar (B / I / U / lists / link). No schema change needed — rich text will produce plain text fallback.

### Conditional Field Visibility

| Trigger | Condition | Effect |
|---|---|---|
| `compensation_type` | = Voluntary / TBD | Hide `fee_structure`, `fee_amount`, `payment_terms` |
| `travel_required` | = No | Hide `travel_reimbursement` |
| `organization_id` selected | From org dropdown | Fetch org record and display read-only fields: Industry, Type, Website, City, State below the dropdown |
| `organization_id` cleared | Dropdown cleared | Hide read-only org detail display |

### Target Audience Value Alignment

Target Audience on opportunities uses the **same 8 values** as `audience_levels` in the expert Expertise tab — enabling the future matching engine to compare directly:

| Value | Display Label |
|---|---|
| `SCHOOL` | School |
| `COLLEGE_UNIVERSITY` | College / University |
| `FRESHERS` | Freshers |
| `WORKING_PROFESSIONALS` | Working Professionals |
| `MANAGERS` | Managers |
| `SENIOR_MANAGEMENT` | Senior Management |
| `TECHNICAL_TEAMS` | Technical Teams |
| `NON_TECHNICAL_TEAMS` | Non-Technical Teams |

---

## 8. Validation Rules

### Draft Save (lenient)

Only the following must be valid before saving as draft:

| Field | Rule |
|---|---|
| `title` | Non-blank, max 512 chars |
| `opportunity_type` | Must be selected |

All other fields may be empty when saving as draft.

### Publish (strict — full validation)

All fields marked **Required** in §4 must be present. `organization_id` is also required for publish (may be null in drafts). Additional cross-field rules:

| Rule | Fields |
|---|---|
| `end_time` > `start_time` | If both provided |
| `application_deadline` ≤ `event_date` | If both provided |
| `fee_amount` > 0 | If `compensation_type = PAID` and `fee_structure` selected |
| `delivery_modes` | At least one value |
| `skills_required` | At least one tag |
| `target_audience` | At least one value |
| `event_date` | Not in the past |

### Frontend Error Display

- Per-field inline error below each control (red text, `text-xs text-red-500`)
- Section-level summary banner if section has errors: `"This section has X errors — please review."`
- Scroll to first error on publish attempt

---

## 9. Section Status

| Section | Fields | Required Fields | Notes |
|---|---|---|---|
| §1 Opportunity Basics | 9 | 8 (sub_category optional) | Core identity of the posting |
| §2 Organization Details | 1 (dropdown) | 1 for publish (org_id required); 0 for draft | Org detail fields (industry, type, website, city, state) are read-only display from org master — not stored on opportunity |
| §3 Opportunity Details | 3 | 3 | Short desc, detailed desc, tags all required |
| §4 Schedule & Location | 7 | 5 (start/end time optional) | Date, venue, location type, address, audience required |
| §5 Requirements | 5 | 4 (additional requirements optional) | Skills, experience, expertise level, language required |
| §6 Eligibility & Preferences | 5 | 0 (all optional) | Soft preferences — none block publish |
| §7 Compensation & Benefits | 7 | 2 (travel_required, travel_reimbursement) | conditional visibility reduces clutter |
| §8 Attachments | 1 | 0 (optional) | Max 5 files, 10 MB each |
| §9 Visibility & Status | 2 | 2 | visibility + status |

---

## 10. Step-by-Step Development Prompts

Each prompt is self-contained. Complete in order. Run `npx tsc --noEmit` and restart backend after every backend change.

---

### PROMPT 1 — Migration 014: Redesign opportunities table

```
Create backend/alembic/versions/014_redesign_opportunities.py

This migration replaces the stub opportunities table with the full schema
from §5 of OPPORTUNITY_PAGE_DESIGN.md.

Steps:
1. Drop existing FK constraints on applications that reference opportunities
   (use op.drop_constraint if they exist — handle gracefully with try/except)
2. Drop existing table: op.drop_table('opportunities')
3. Drop stale ENUMs:
   - op.execute("DROP TYPE IF EXISTS opportunitytype CASCADE")
   - op.execute("DROP TYPE IF EXISTS locationtype CASCADE")
4. Create new ENUMs (see §5):
   - opportunitytype (6 values)
   - sessionstructuretype (3 values)
   - venuelocationtype (5 values)
   - expertiseleveltype (3 values)
   - compensationtype (4 values)
   - feestructuretype (3 values)
   - opportunityvisibility (2 values)
   - opportunitystatus (5 values)
5. Create opportunities table with all columns from §5
6. Create opportunity_attachments table from §5
7. Recreate FK on applications (opportunity_id → opportunities.id)
8. Create all indexes listed in §5

down_revision = '013'
downgrade: drop tables + enums (no need to restore old stub)

Run: alembic upgrade head
Verify: \d opportunities in psql shows all columns
```

---

### PROMPT 2 — Backend: Updated models

```
1. Rewrite backend/app/models/opportunity.py

   - Replace OpportunityType enum class with new values:
     LECTURE, CONTENT_COURSE_DEVELOPMENT, LANGUAGE_MEDIA,
     LEARNING_SUPPORT_EVALUATION, CONTENT_ELEARNING, EDITING_REVIEW

   - Replace LocationType with:
     class VenueLocationType(str, PyEnum):
       CORPORATE, INSTITUTE, UNIVERSITY, ONLINE, OTHERS

   - Add new enum classes matching §5:
     SessionStructureType, ExpertiseLevelType, CompensationType,
     FeeStructureType, OpportunityVisibility, OpportunityStatus

   - Rewrite Opportunity mapped_column class with ALL columns from §5.
     Use ARRAY(String) from sqlalchemy.dialects.postgresql for TEXT[] columns.

   - Keep relationships:
     organization: → Organization
     creator: → User
     applications: → list[Application]
     Add: attachments: → list[OpportunityAttachment] (lazy="select")

2. Create backend/app/models/opportunity_attachment.py

   SQLAlchemy ORM model OpportunityAttachment mapped to
   'opportunity_attachments'. Columns: id, opportunity_id (FK), file_name,
   file_path, file_size_bytes, uploaded_at.

Run: python -c "from app.models.opportunity import Opportunity; print('OK')"
```

---

### PROMPT 3 — Backend: Schemas

```
Create/rewrite backend/app/schemas/opportunity.py

Define the following Pydantic v2 models:

1. OpportunityCreateRequest
   All fields from §4 (all sections), all optional EXCEPT those marked
   Required for draft save (title, opportunity_type). This single schema
   handles both draft save and publish — validation level controlled by
   query param or endpoint.

2. OpportunityPublishRequest (extends OpportunityCreateRequest or separate)
   All Required fields from §4 are truly required (not Optional) for publish.
   Use a model_validator to enforce cross-field rules from §8.

3. OpportunityUpdateRequest
   All fields Optional (partial update for PUT).

4. OpportunityListItem
   Lightweight schema for list view: id, title, opportunity_type, status,
   event_date, number_of_openings, created_at, organization_id.
   Join organization name at query time for display: org_name: str | None
   (via SQLAlchemy join, added to OpportunityListItem).

5. AttachmentResponse
   id, opportunity_id, file_name, file_path, file_size_bytes, uploaded_at.

6. OpportunityResponse
   Full schema — all columns + attachments: list[AttachmentResponse].
   model_config = ConfigDict(from_attributes=True)
   delivery_modes and other TEXT[] → list[str]

Cross-field validators (on OpportunityPublishRequest):
  - end_time must be after start_time if both provided
  - application_deadline must be <= event_date if both provided
  - fee_amount required if compensation_type=PAID and fee_structure set

Run: npx tsc --noEmit (after frontend types added in P6)
```

---

### PROMPT 4 — Backend: Admin Opportunities CRUD API

```
Create backend/app/api/v1/admin/opportunities.py

Use require_super_admin dependency on all endpoints.

Implement the following routes (router prefix will be set in main.py):

GET ""
  - Query params: status (optional), search (optional title search), page, size
  - Returns PaginatedResponse[OpportunityListItem]
  - Filter by status if provided; search via ILIKE '%search%' on title
  - Order by created_at DESC

POST ""
  - Body: OpportunityCreateRequest
  - Creates with status=DRAFT always (never publish on create)
  - Sets created_by = current_user.id
  - Returns OpportunityResponse (201)

GET "/{opp_id}"
  - Returns full OpportunityResponse including attachments list
  - 404 if not found

PUT "/{opp_id}"
  - Body: OpportunityUpdateRequest (all fields optional)
  - Only update non-None fields
  - Cannot update status via this endpoint (use /publish or /archive)
  - Returns OpportunityResponse

POST "/{opp_id}/publish"
  - Load opportunity; validate all required-for-publish fields (§8)
  - If valid: set status=OPEN, updated_at=now()
  - Returns OpportunityResponse (400 with validation errors if not valid)

POST "/{opp_id}/archive"
  - Set status=ARCHIVED
  - Returns OpportunityResponse

DELETE "/{opp_id}"
  - Only allowed if status=DRAFT (raise 409 if OPEN/CLOSED/etc.)
  - Hard delete opportunity + cascade deletes attachments + removes files from disk
  - Returns 204

Register in main.py:
  from app.api.v1.admin import opportunities as admin_opportunities
  app.include_router(admin_opportunities.router,
                     prefix="/api/v1/admin/opportunities",
                     tags=["Admin"])

Restart backend. Test:
  POST /api/v1/admin/opportunities → creates draft
  GET /api/v1/admin/opportunities → returns list
```

---

### PROMPT 5 — Backend: Attachment Upload/Delete API

```
Add attachment endpoints to backend/app/api/v1/admin/opportunities.py

POST "/{opp_id}/attachments"
  - Accepts multipart/form-data with single File field
  - Validate: opportunity must exist (404 otherwise)
  - Validate: max 5 attachments per opportunity (409 if exceeded)
  - Validate: file extension in {pdf, doc, docx, ppt, pptx} (400 if not)
  - Validate: file size <= 10 MB (400 if exceeded)
  - Save to: uploads/opportunities/{opp_id}/{uuid}_{secure_filename}
  - Insert row in opportunity_attachments
  - Return AttachmentResponse (201)

DELETE "/{opp_id}/attachments/{attachment_id}"
  - Load attachment; 404 if not found or wrong opp_id
  - Delete file from disk (use pathlib.Path.unlink(missing_ok=True))
  - Delete DB row
  - Return 204

Ensure uploads/opportunities/ directory exists on startup (same
pattern as uploads/ in main.py lifespan).

Test:
  POST /api/v1/admin/opportunities/{id}/attachments with a PDF file
  → file appears in uploads/opportunities/{id}/
  GET /api/v1/admin/opportunities/{id} → attachments list shows the file
```

---

### PROMPT 6 — Frontend: TypeScript types + opportunityAdminApi.ts

```
1. Create frontend/src/types/opportunity.ts

   Export the following interfaces and constants:

   OPPORTUNITY_TYPES: { value: string; label: string }[] = [
     { value: 'LECTURE', label: 'Lecture' },
     { value: 'CONTENT_COURSE_DEVELOPMENT', label: 'Content & Course Development' },
     { value: 'LANGUAGE_MEDIA', label: 'Language & Media' },
     { value: 'LEARNING_SUPPORT_EVALUATION', label: 'Learning Support & Evaluation' },
     { value: 'CONTENT_ELEARNING', label: 'Content & E-Learning' },
     { value: 'EDITING_REVIEW', label: 'Editing & Review' },
   ]

   DELIVERY_MODES: { value: string; label: string }[] = [
     { value: 'CLASSROOM', label: 'Classroom' },
     { value: 'ONLINE', label: 'Online' },
     { value: 'HYBRID', label: 'Hybrid' },
     { value: 'OFFLINE_RECORDING', label: 'Offline Recording' },
     { value: 'CHAT_SUPPORT_QA', label: 'Chat Support / Q&A' },
   ]

   SESSION_STRUCTURES, VENUE_LOCATION_TYPES, EXPERTISE_LEVELS,
   COMPENSATION_TYPES, FEE_STRUCTURES, TARGET_AUDIENCE_OPTIONS,
   MINIMUM_EXPERIENCE_OPTIONS, LANGUAGE_OPTIONS, PAYMENT_TERMS_OPTIONS,
   ORG_TYPES — similar constant arrays for all dropdown/radio fields.

   Interface OpportunityAttachment { id, opportunity_id, file_name,
     file_path, file_size_bytes, uploaded_at }

   Interface Opportunity {
     id, title, opportunity_type, category, sub_category,
     delivery_modes: string[], number_of_openings, session_structure,
     total_duration, duration_per_session,
     organization_id: string | null,
     org_name: string | null,          // joined from organizations.name (read-only display)
     short_description, detailed_description, tags: string[],
     event_date, start_time, end_time, venue_name, venue_location_type,
     venue_address, target_audience: string[],
     skills_required: string[], minimum_experience, expertise_level,
     additional_requirements, language_of_delivery,
     preferred_location, gender_preference, candidate_preference,
     notes_for_applicants, application_deadline,
     compensation_type, fee_structure, fee_amount: number | null,
     payment_terms, travel_required, travel_reimbursement, other_benefits,
     visibility, status,
     created_by, created_at, updated_at,
     attachments: OpportunityAttachment[]
   }

   Interface OpportunityListItem { id, title, opportunity_type, status,
     event_date, number_of_openings, created_at, organization_id: string | null,
     org_name: string | null }

   Interface OrganisationOption { id: string; name: string }
   // Used to populate the organization dropdown; fetched from /api/v1/admin/organisations

   Type OpportunityCreatePayload = Partial<Omit<Opportunity,
     'id' | 'created_by' | 'created_at' | 'updated_at' | 'attachments'>>
     & { title: string; opportunity_type: string }

   Const EMPTY_OPPORTUNITY: OpportunityCreatePayload — all fields with
   sensible defaults (empty strings, empty arrays, false for booleans,
   'TBD' for compensation_type, 'VISIBLE_TO_ALL' for visibility).

2. Create frontend/src/api/opportunityAdminApi.ts

   import apiClient from './client'
   import type { Opportunity, OpportunityListItem, OpportunityCreatePayload, OpportunityAttachment } from '@/types/opportunity'
   import type { PaginatedResponse } from '@/types'

   const BASE = '/admin/opportunities'

   export const opportunityAdminApi = {
     list: (params?: { status?: string; search?: string; page?: number; size?: number })
       → Promise<PaginatedResponse<OpportunityListItem>>
     create: (payload: OpportunityCreatePayload) → Promise<Opportunity>
     get: (id: string) → Promise<Opportunity>
     update: (id: string, payload: Partial<OpportunityCreatePayload>) → Promise<Opportunity>
     publish: (id: string) → Promise<Opportunity>
     archive: (id: string) → Promise<Opportunity>
     delete: (id: string) → Promise<void>
     uploadAttachment: (id: string, file: File) → Promise<OpportunityAttachment>
     deleteAttachment: (id: string, attachmentId: string) → Promise<void>
   }

Run: npx tsc --noEmit — no errors
```

---

### PROMPT 7 — Frontend: Page shell + shared form components

```
1. Create frontend/src/features/admin/components/opportunity/SectionCard.tsx

   Props: { number: number; title: string; children: React.ReactNode }
   Renders a white card with numbered heading:
   <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
     <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-5">
       <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs
                        flex items-center justify-center">{number}</span>
       {title}
     </h2>
     {children}
   </div>

2. Create frontend/src/features/admin/components/opportunity/FormField.tsx

   Props: { label: string; required?: boolean; error?: string; hint?: string;
            children: React.ReactNode }
   Renders label + children + optional error + optional hint.

3. Create frontend/src/features/admin/components/opportunity/TagInput.tsx

   Props: { tags: string[]; onChange: (tags: string[]) => void;
            placeholder?: string; maxTags?: number }
   - Text input; pressing Enter or comma adds a tag chip
   - "+ Add" button also commits
   - Each chip shows tag text + × button to remove
   - Enforces maxTags limit (default 20)

4. Create frontend/src/features/admin/components/opportunity/OpportunityFormHeader.tsx

   Props: { title: string; isNew: boolean; isSaving: boolean;
            onSaveDraft: () => void; onPreview: () => void }
   Renders: breadcrumb + h1 + top-right buttons (Save as Draft, Preview Opportunity)

5. Create frontend/src/features/admin/components/opportunity/OpportunityFormFooter.tsx

   Props: { isNew: boolean; isSaving: boolean; isPublishing: boolean;
            onCancel: () => void; onSaveDraft: () => void; onPublish: () => void }
   Renders: Cancel (left) + [Save as Draft] [Publish Opportunity] (right)

Run: npx tsc --noEmit — no errors
```

---

### PROMPT 8 — Frontend: §1 Opportunity Basics + §2 Organization Details sections

```
1. Create OpportunityBasicsSection.tsx

   Props: { form: OpportunityCreatePayload;
            onChange: (patch: Partial<OpportunityCreatePayload>) => void;
            errors: Partial<Record<string, string>> }

   Renders inside <SectionCard number={1} title="Opportunity Basics">:
   - Row 1: Opportunity Title (full-width text input)
   - Row 2: Opportunity Type (dropdown, OPPORTUNITY_TYPES) | Category (text)
   - Row 3: Sub Category (text) | Delivery Mode (multi-checkbox pills or
             multi-select dropdown, DELIVERY_MODES) | Number of Openings (number input)
   - Row 4: Session / Program Structure (radio group: Single Session |
             Multiple Sessions | Ongoing Program)
   - Row 5: Total Duration (text) | Duration Per Session (text)

   Delivery Mode: render as a flex-wrap group of toggle pills (user clicks
   to select/deselect; selected = blue bg, unselected = white border).

2. Create OrganizationDetailsSection.tsx

   Props: {
     organizationId: string | null
     organisations: OrganisationOption[]   // list loaded by parent page on mount
     onChange: (orgId: string | null) => void
     error?: string
   }

   On mount in the parent page (CreateOpportunityPage):
     fetch all organisations via GET /api/v1/admin/organisations?size=200
     store in state: const [organisations, setOrganisations] = useState<OrganisationOption[]>([])

   Renders inside <SectionCard number={2} title="Organization Details">:

   a) Organization dropdown (searchable <select> or native dropdown):
      - Options: [{ value: '', label: '— Select Organisation —' }, ...organisations]
      - Required for publish; optional for draft
      - Error label shown below if validation fails

   b) Read-only detail panel (shown only when organizationId is selected):
      Find the selected org from the organisations array. If the admin
      organisations API returns full org objects (with industry, org_type,
      website, city, state), display:
        Industry / Domain   [value or "—"]
        Organization Type   [value or "—"]
        Website             [clickable link or "—"]
        City                [value or "—"]
        State               [value or "—"]
      Styled as a light grey info block: bg-slate-50 rounded-lg p-4 mt-3
      with "Organization details from master record" sub-label.

   Note: The admin organisations API (/api/v1/admin/organisations) may need
   to return additional fields (industry, org_type, website, city, state)
   that are currently not in AdminOrgResponse. Add these to the schema
   in Prompt 4 if not already present.

Run: npx tsc --noEmit — no errors
```

---

### PROMPT 9 — Frontend: §3 Opportunity Details + §4 Schedule & Location sections

```
1. Create OpportunityDetailsSection.tsx

   Props: same pattern

   Renders inside <SectionCard number={3} title="Opportunity Details">:
   - Short Description (text input, max 200, char counter)
   - Detailed Description (textarea with min-h-[200px]; for Phase 1 use plain
     <textarea> with basic styling — rich text editor can be added in Phase 2)
   - Tags (<TagInput> — suggested chips below input: "Workshop", "Training Program",
     "Guest Lecture", "Webinar", "Bootcamp", "Seminar")

2. Create ScheduleLocationSection.tsx

   Props: same pattern

   Renders inside <SectionCard number={4} title="Schedule & Location">:
   - Date (type="date" input) — required
   - Row: Start Time (type="time") | End Time (type="time") — both optional
   - Venue / Location Name (text) — required
   - Location Type (dropdown: Corporate; Institute; University; Online; Others)
   - Address / Venue Details (textarea)
   - Target Audience (multi-checkbox pills, TARGET_AUDIENCE_OPTIONS)

   Target Audience pills: same toggle-pill pattern as Delivery Mode in §1.

Run: npx tsc --noEmit — no errors
```

---

### PROMPT 10 — Frontend: §5 Requirements section

```
Create RequirementsSection.tsx

Props: same pattern

Renders inside <SectionCard number={5} title="Requirements">:

- Required Skills / Keywords: <TagInput> with "+ Add" button
- Row: Minimum Experience (dropdown, MINIMUM_EXPERIENCE_OPTIONS) |
        Expertise Level (dropdown: Fresher; Experienced; Expert)
- Language of Delivery (dropdown, LANGUAGE_OPTIONS)
- Additional Requirements (textarea, optional, max 300, char counter)

Run: npx tsc --noEmit — no errors
```

---

### PROMPT 11 — Frontend: §6 Eligibility & Preferences + §7 Compensation & Benefits sections

```
1. Create EligibilityPreferencesSection.tsx

   Props: same pattern

   Renders inside <SectionCard number={6} title="Eligibility & Preferences">:
   - Preferred Location / Area (text, optional)
   - Gender Preference (dropdown: No Preference; Male; Female; Any)
   - Candidate Preference (text, optional)
   - Notes for Applicants (textarea, optional, max 300, char counter)
   - Application Deadline (type="date", optional)

2. Create CompensationBenefitsSection.tsx

   Props: same pattern

   Renders inside <SectionCard number={7} title="Compensation & Benefits">:
   - Compensation Type (dropdown: Paid; Voluntary / Unpaid; Negotiable; TBD)
   - If compensation_type = 'PAID':
       Fee Structure (radio: Per Session | Per Program | Per Task)
       Fee Amount (INR prefix + number input)
       Payment Terms (dropdown, PAYMENT_TERMS_OPTIONS)
   - Travel Required (radio: Yes / No) — required
   - If travel_required = true:
       Travel Reimbursement (radio: Yes / No)
   - Other Benefits (textarea, optional, max 300)

   Conditional rendering: use form.compensation_type and form.travel_required
   to show/hide fields. No animation needed for Phase 1.

Run: npx tsc --noEmit — no errors
```

---

### PROMPT 12 — Frontend: §8 Attachments + §9 Visibility & Status sections

```
1. Create AttachmentsSection.tsx

   Props: { opportunityId: string | null; attachments: OpportunityAttachment[];
            pendingFiles: File[];
            onAddFiles: (files: File[]) => void;
            onRemovePending: (index: number) => void;
            onDeleteAttachment: (attachmentId: string) => void }

   Renders inside <SectionCard number={8} title="Attachments & Documents">:
   - Drag-and-drop zone (dashed border, icon, "Drag & drop files here or")
   - "Choose Files" button (hidden <input type="file" multiple accept=...>)
   - Accepted formats label: "PDF, DOC, DOCX, PPT, PPTX (Max 10MB each)"
   - File chip list:
       Already-uploaded: show file_name + file_size + × (calls onDeleteAttachment)
       Pending (not yet uploaded): show name + × (calls onRemovePending)
   - Max 5 files indicator

   Note: Actual file upload happens when the form is submitted (saved/published),
   not on file selection. This keeps the UX clean for drafts.

2. Create VisibilityStatusSection.tsx

   Props: { form: OpportunityCreatePayload;
            onChange: (patch: Partial<OpportunityCreatePayload>) => void;
            errors: Partial<Record<string, string>> }

   Renders inside <SectionCard number={9} title="Visibility & Status">:
   - Visibility (radio group):
       ● Visible to All — "All matching experts can view"
       ○ Shortlisted Only — "Only shortlisted experts can view"
   - Status (dropdown): Active (Publish Now) | Draft (Save as Draft)
     Note: Status dropdown is informational — actual publish action is
     via the Publish button, not this dropdown. This dropdown lets admin
     set the intended target status for context.

Run: npx tsc --noEmit — no errors
```

---

### PROMPT 13 — Frontend: CreateOpportunityPage assembly

```
Create frontend/src/features/admin/pages/CreateOpportunityPage.tsx

This is the main page container. It:
1. Manages a single form state object: useState<OpportunityCreatePayload>(EMPTY_OPPORTUNITY)
2. Manages: isSaving, isPublishing, errors, pendingFiles (File[]),
   uploadedAttachments (OpportunityAttachment[]), opportunityId (string | null)
3. On mount: if route param :id exists, fetch the opportunity and populate form state

Form layout (matches §2 grid):
  <div className="space-y-6">
    <OpportunityFormHeader ... />

    {/* Row 1 */}
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <OpportunityBasicsSection form={form} onChange={patch} errors={errors} />
      </div>
      <div className="col-span-1">
        <OrganizationDetailsSection ... />
      </div>
    </div>

    {/* Row 2 */}
    <div className="grid grid-cols-3 gap-6">
      <OpportunityDetailsSection ... />
      <ScheduleLocationSection ... />
      <CompensationBenefitsSection ... />
    </div>

    {/* Row 3 */}
    <div className="grid grid-cols-3 gap-6">
      <RequirementsSection ... />
      <EligibilityPreferencesSection ... />
      <div className="space-y-6">
        <AttachmentsSection ... />
        <VisibilityStatusSection ... />
      </div>
    </div>

    <OpportunityFormFooter ... />
  </div>

handleSaveDraft():
  1. Validate title + opportunity_type only
  2. Call opportunityAdminApi.create(form) if new, .update(id, form) if editing
  3. If pendingFiles.length > 0: upload each via opportunityAdminApi.uploadAttachment()
  4. Navigate to /admin/opportunities on success or show toast

handlePublish():
  1. Run full field validation (all required fields from §8)
  2. If errors: setErrors(errs); scroll to first error
  3. Else: save form first (same as draft), then call .publish(id)
  4. Navigate to /admin/opportunities on success or show toast

handlePreview():
  Set local state: showPreview = true
  Render an OpportunityPreviewModal (fixed inset-0 z-50 overlay — same
  backdrop pattern as delete confirm modals elsewhere):
    - Semi-transparent backdrop (bg-black/50)
    - Centered white panel: max-w-4xl w-full max-h-[90vh] overflow-y-auto
      rounded-xl shadow-xl p-8
    - "× Close" button top-right closes the modal (showPreview = false)
    - Inside: a read-only formatted view of all form data grouped by
      the 9 section headings
    - No API call — purely renders local form state
  The form stays open behind the modal; closing returns to exact edit state.

Run: npx tsc --noEmit — no errors
Smoke test: navigate to /admin/opportunities/new → form renders all 9 sections
```

---

### PROMPT 14 — Frontend: Wire routes + update AdminOpportunitiesPage

```
1. In frontend/src/routes/index.tsx:
   Import CreateOpportunityPage from '@/features/admin/pages/CreateOpportunityPage'
   
   Inside the admin route group, add:
     { path: '/admin/opportunities/new',      element: <CreateOpportunityPage /> }
     { path: '/admin/opportunities/:id/edit', element: <CreateOpportunityPage /> }

2. In frontend/src/features/admin/pages/OpportunitiesPage.tsx:
   Replace the PlaceholderPage with a real list view:
   - Page header: "Opportunities" + "Post New Opportunity" button (→ /admin/opportunities/new)
   - Table: Title | Type | Status (badge) | Event Date | Openings | Created At | Actions
   - Actions per row: Edit (→ /admin/opportunities/:id/edit) | Archive | Delete
   - Filters row: Status dropdown | Search input
   - Pagination using the PaginatedResponse pattern from adminUsersApi
   - Use opportunityAdminApi.list() for data fetch

3. Update AdminSidebar to link "Opportunities" → /admin/opportunities
   (it should already route there; verify the active state highlights correctly)

Run: npx tsc --noEmit, restart frontend.

End-to-end test:
  a. Navigate to /admin/opportunities → list page with "Post New Opportunity" button
  b. Click button → /admin/opportunities/new → form with 9 sections
  c. Fill title + type → "Save as Draft" → redirects to list → new row appears (status=DRAFT)
  d. Click Edit → form pre-filled
  e. Complete all required fields → "Publish Opportunity" → status changes to OPEN
  f. Upload a PDF attachment → visible in attachment chip list
  g. Archive the opportunity → status = ARCHIVED in list
```

---

## 11. Delivery Sequence Summary

```
SECTION 1 — Backend Foundation (Prompts 1–5)
  Step 01  →  Prompt 01  Migration 014 (redesign opportunities table + ENUMs + attachments table)
  Step 02  →  Prompt 02  Updated Opportunity model + OpportunityAttachment model
  Step 03  →  Prompt 03  Schemas: CreateRequest, UpdateRequest, ListItem, Response
  Step 04  →  Prompt 04  Admin Opportunities CRUD API (list, create, get, update, publish, archive, delete)
  Step 05  →  Prompt 05  Attachment upload/delete API

SECTION 2 — Frontend Foundation (Prompt 6)
  Step 06  →  Prompt 06  TypeScript types + constants + opportunityAdminApi.ts

SECTION 3 — Shared Form Components (Prompt 7)
  Step 07  →  Prompt 07  SectionCard + FormField + TagInput + FormHeader + FormFooter

SECTION 4 — Section Form Components (Prompts 8–12)
  Step 08  →  Prompt 08  OpportunityBasicsSection (§1) + OrganizationDetailsSection (§2)
  Step 09  →  Prompt 09  OpportunityDetailsSection (§3) + ScheduleLocationSection (§4)
  Step 10  →  Prompt 10  RequirementsSection (§5)
  Step 11  →  Prompt 11  EligibilityPreferencesSection (§6) + CompensationBenefitsSection (§7)
  Step 12  →  Prompt 12  AttachmentsSection (§8) + VisibilityStatusSection (§9)

SECTION 5 — Page Assembly & Routing (Prompts 13–14)
  Step 13  →  Prompt 13  CreateOpportunityPage — form state, save/publish/preview logic, layout
  Step 14  →  Prompt 14  Route wiring + AdminOpportunitiesPage list view + end-to-end test
```

---

## 12. Decisions & Open Questions

All questions below are **resolved**. No open items remain before development begins.

| # | Question | ✅ Final Decision | Design Impact |
|---|---|---|---|
| 1 | Rich text for Detailed Description? | **Plain `<textarea>` for MVP.** Rich toolbar (Quill / TipTap) deferred to MVP2. Plain text stored in DB — no schema change needed for MVP2 upgrade. | §4c and §7 updated |
| 2 | Category / Sub Category — free text or master list? | **Free text for MVP.** Category master (like the admin Categories page) introduced in MVP2 if needed. | No change — already free text |
| 3 | Organization linkage — free text or dropdown? | **Organization dropdown from master.** `organization_id` FK stored on opportunity. Org detail fields (industry, type, website, city, state) shown read-only from the master record — not duplicated on the opportunity. `org_name_override` and related columns removed from DB. | §4b, §5, §6, §7, §9, Prompts 3/6/8 updated |
| 4 | Delivery Modes — single or multi-select? | **Multi-select** (`TEXT[]`). Admin picks one or more delivery modes per opportunity. | No change — already TEXT[] |
| 5 | Application Deadline — required for publish? | **Optional** at publish. Opportunities may be open-ended with no deadline. | No change |
| 6 | Target Audience value set? | **Aligned with expert `audience_levels`** — same 8 values (SCHOOL, COLLEGE_UNIVERSITY, FRESHERS, WORKING_PROFESSIONALS, MANAGERS, SENIOR_MANAGEMENT, TECHNICAL_TEAMS, NON_TECHNICAL_TEAMS). Enables direct expert–opportunity matching in MVP2. | §7 alignment table added |
| 7 | Who can create opportunities? | **SUPER_ADMIN only for MVP.** MVP2 allows Organisation users to self-post. | No change |
| 8 | Preview Opportunity — slide-over or popup? | **Full-screen modal popup** (fixed `inset-0` overlay, `max-w-4xl` centered panel, close button). Renders local form state — no API call. | §7 and Prompt 13 updated |
| 9 | Fee amount currency? | **INR only for MVP.** Multi-currency deferred to MVP2. | INR label in UI only |
| 10 | Applications table FK update on migration? | **Yes — migration 014 drops + recreates FK** (`applications.opportunity_id → opportunities.id`) when the opportunities table is rebuilt. See Prompt 1. | Handled in migration |

---

*Document maintained by the K-CONNECT development team.*

---

## 13. Expert Opportunity Listing Page (`/opportunities`)

### 13.1 Page Purpose

The `/opportunities` page is the **expert-facing browse experience**. Authenticated experts discover, filter, and apply for OPEN opportunities posted by admins. This section replaces the current placeholder implementation in `frontend/src/features/opportunities/OpportunitiesPage.tsx`.

---

### 13.2 Overall Layout

Three-column layout on desktop; collapses to single column on mobile.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER                                                                    │
│  Breadcrumb: Home > Opportunities                                               │
│  Title: "Browse Opportunities"              Showing X opportunities  [Filters]  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  TAB BAR                                                                        │
│  [All Opportunities]  [Recommended]  [Applied (N)]  [Closing Soon]              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  FILTER BAR                                                                     │
│  [🔍 Search…] [Location ▼] [Type ▼] [Duration ▼] [Date ▼] [Category ▼]        │
│  [Sort: Most Relevant ▼]   [Save Search — Phase 2 / disabled]                  │
├────────────┬────────────────────────────────────────────┬───────────────────────┤
│  LEFT      │  MAIN CONTENT — 2-column card grid        │  RIGHT SIDEBAR        │
│  SIDEBAR   │                                            │  Filter Panel         │
│  220px     │  ┌──────────────┐  ┌──────────────┐      │  ─ Opp Type           │
│            │  │  Card        │  │  Card        │      │  ─ Location Type      │
│  Profile   │  └──────────────┘  └──────────────┘      │  ─ Experience Level   │
│  Completion│  ┌──────────────┐  ┌──────────────┐      │                       │
│  Widget    │  │  Card        │  │  Card        │      │  260px                │
│            │  └──────────────┘  └──────────────┘      │                       │
│            │                                            │                       │
│            │  [← Previous]  Page 1 of N  [Next →]      │                       │
└────────────┴────────────────────────────────────────────┴───────────────────────┘
```

**Responsive breakpoints:**

| Breakpoint | Layout |
|---|---|
| `≥ 1280px (xl)` | Full 3-column: left sidebar (220px) + 2-col card grid + right filter panel (260px) |
| `≥ 768px (md)` | 2-column: left sidebar hidden; right filter panel collapses to "Filters" slide-over drawer |
| `< 768px` | Single column; both sidebars hidden; right sidebar accessible via floating "Filters" button |

---

### 13.3 Tab Navigation

| # | Label | Content | Backend param |
|---|-------|---------|---------------|
| 1 | All Opportunities | All OPEN opportunities, paginated | `tab=all` (default) |
| 2 | Recommended | Phase 2 — show placeholder "Coming Soon" card | `tab=recommended` |
| 3 | Applied (N) | Opportunities the current user has applied to; N = count | `tab=applied` |
| 4 | Closing Soon | OPEN opportunities with `application_deadline ≤ today + 3 days` | `tab=closing_soon` |

- Active tab: blue bottom-border + `font-semibold`
- "Applied" badge count: from `GET /api/v1/applications/me/count` or included in listing response meta
- Recommended tab renders a single centered card: "Personalised recommendations coming soon. Complete your profile to be matched."

---

### 13.4 Filter Bar (Top)

Seven controls in a horizontal row immediately below the tab bar:

| # | Control | Type | Backend param | Notes |
|---|---------|------|---------------|-------|
| 1 | Search | Text input with debounce 300ms | `search` | ILIKE match on `title`, `short_description`, `tags`, `skills_required` |
| 2 | Location | Dropdown | `state` | Indian states list (same as `INDIAN_STATES` constant); default "All Locations" |
| 3 | Opportunity Type | Dropdown | `opportunity_type` | DB enum values with display labels (§13.9); default "All Types" |
| 4 | Duration | Dropdown | `duration_keyword` | Options: All Durations, Half Day (keyword "hour"), 1 Day, 2–3 Days, 1 Week, Ongoing; text keyword match on `total_duration` field |
| 5 | Date | Dropdown | `date_filter` | Options: Any Date, This Week (event_date ≤ +7d), This Month (≤ +30d), Next 3 Months (≤ +90d) |
| 6 | Category | Dropdown | `category` | Options populated from distinct `category` values in DB; default "All Categories" |
| 7 | Sort by | Dropdown | `sort_by` | Most Relevant (default, `created_at DESC`), Newest First, Closing Soon First (`application_deadline ASC NULLS LAST`), Fee: High to Low (`fee_amount DESC NULLS LAST`) |

Additional row:
- **"Clear all filters"** link — shown when any non-default filter is active; resets all params
- **"Save Search"** button — disabled with tooltip "Coming soon" for MVP (Phase 2)

---

### 13.5 Opportunity Card Design

Cards laid out in a 2-column grid in the main content area. Each card:

```
┌──────────────────────────────────────────────────────────────────┐
│  [TYPE BADGE]  [NEW ●]  [CLOSING SOON ⏰]         [♡ Ph2]        │
│                                                                  │
│  [TYPE ICON BLOCK — 48×48 colored icon per opportunity type]     │
│                                                                  │
│  Title (font-semibold, text-slate-900, 2-line clamp)            │
│  Organisation Name · 📍 City, State                             │
│                                                                  │
│  Short description (text-slate-500, text-sm, 3-line clamp)      │
│                                                                  │
│  Delivery: [chip] [chip]                  Openings: X           │
│  Skills:   [chip] [chip] [chip] [+N more]                       │
│                                                                  │
│  ────────────────────────────────────────────────────────────── │
│  💰 Fee display (see §13.10 D5)   📅 Apply by: DD Mon YYYY      │
│                      [View Details]              [Apply →]       │
└──────────────────────────────────────────────────────────────────┘
```

**Attribute specification:**

| Attribute | Source field | Display rule |
|-----------|-------------|--------------|
| Type badge | `opportunity_type` | Colored pill using §13.9 badge colors |
| NEW badge | `created_at` | Green badge when `now − created_at ≤ 7 days` |
| CLOSING SOON badge | `application_deadline` | Orange badge when `deadline − now ≤ 3 days` AND deadline is not null |
| Bookmark icon ♡ | — | Rendered (grey, not functional). Phase 2. |
| Type icon block | `opportunity_type` | 48×48 rounded block; icon + background color per §13.9 |
| Title | `title` | 2-line clamp; `font-semibold text-slate-900` |
| Organisation name | `organization_name` (JOIN) | `text-sm text-slate-600` |
| Location | `venue_city` + org `state` | Format: "City, State"; if all delivery_modes are ONLINE and no venue_city → "Online / Remote" |
| Short description | `short_description` | 3-line clamp; `text-sm text-slate-500` |
| Delivery mode chips | `delivery_modes` | ONLINE → "Online", ONSITE → "In-Person", HYBRID → "Hybrid"; `text-xs bg-slate-100` chips |
| Openings | `number_of_openings` | "X openings"; if `number_of_openings = 0` → "Unlimited openings" |
| Skills chips | `skills_required` | First 3 as chips, `+N more` label if overflow; same style as delivery chips |
| Fee display | `compensation_type` + `fee_amount` + `fee_structure` | See §13.10 D5 |
| Deadline | `application_deadline` | "Apply by DD Mon YYYY"; if null → "Open-ended" |
| View Details button | — | Opens `OpportunityDetailModal` (see §13.10 D11) |
| Apply button | — | Disabled with tooltip "Coming soon" for MVP (Phase 2) |

---

### 13.6 Left Sidebar — Profile Completion Widget

Sticky card shown only when expert's profile is < 100% complete:

```
┌──────────────────────────────────────┐
│  Your Profile                        │
│  ██████████░░░░  72% complete        │
│                                      │
│  Complete your profile to receive    │
│  personalised recommendations.       │
│                                      │
│  [Complete Profile →]                │
└──────────────────────────────────────┘
```

- Progress percentage: from `GET /api/v1/profile/me` → compute completeness from filled fields
- Progress bar: Tailwind `bg-blue-500` fill on `bg-slate-200` track
- Button links to `/profile`
- Widget hidden when profile is 100% complete
- Widget always shown (not just when tab=recommended) — serves as persistent nudge

---

### 13.7 Right Sidebar — Filter Panel

Three collapsible accordion sections. Each section has a "Clear" link when filters are active.

**Group 1 — Opportunity Type**

Checkboxes using display labels from §13.9:
- [ ] Lecture / Guest Faculty
- [ ] Course Development
- [ ] Language & Media
- [ ] Learning Support
- [ ] E-Learning Content
- [ ] Editing & Review

**Group 2 — Location Type** (derived from `delivery_modes`)

- [ ] Online / Remote (delivery_modes @> '{ONLINE}')
- [ ] In-Person / Onsite (delivery_modes @> '{ONSITE}')
- [ ] Hybrid (delivery_modes @> '{HYBRID}')

**Group 3 — Experience Level** (maps to `expertise_level` enum)

- [ ] Beginner
- [ ] Intermediate
- [ ] Expert

Behaviour:
- Sidebar selections sync with filter bar dropdowns (shared filter state)
- Total active filter count shown as a badge on the mobile "Filters" button
- Sidebar selections applied immediately (no "Apply Filters" button needed)

---

### 13.8 API Requirements

**New router:** `backend/app/api/v1/opportunities.py` (expert-facing, separate from admin router)
**Register in:** `backend/app/main.py` at prefix `/api/v1/opportunities`
**Auth:** Requires authenticated expert (existing `get_current_user` dependency)

---

#### `GET /api/v1/opportunities`

Query parameters:

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | int | 1 | Pagination page number |
| `size` | int | 12 | Cards per page; max 50 |
| `search` | str \| None | — | ILIKE on title, short_description; array overlap on tags, skills_required |
| `opportunity_type` | str \| None | — | Single enum value filter |
| `delivery_mode` | str \| None | — | ARRAY contains filter (`@>`) on delivery_modes |
| `expertise_level` | str \| None | — | Exact match on expertise_level |
| `state` | str \| None | — | ILIKE filter on preferred_location OR org state (from JOIN) |
| `category` | str \| None | — | ILIKE filter on category field |
| `date_filter` | str \| None | — | `this_week`, `this_month`, `next_3_months` — filters on event_date |
| `duration_keyword` | str \| None | — | Keyword text match on total_duration field |
| `sort_by` | str | `newest` | `newest`, `closing_soon`, `fee_desc`, `relevant` |
| `tab` | str | `all` | `all`, `applied`, `closing_soon` |

Base filter always applied: `status = 'OPEN'` AND `visibility = 'PUBLIC'`

Tab-specific filters:
- `tab=applied`: JOIN applications WHERE `applications.user_id = current_user.id`
- `tab=closing_soon`: AND `application_deadline <= NOW() + INTERVAL '3 days'`

---

#### Response Schema — `PaginatedOpportunityListings`

```python
class OpportunityListingCard(BaseModel):
    id: str
    title: str
    opportunity_type: str
    organization_name: str | None      # from JOIN with organizations
    short_description: str | None
    delivery_modes: list[str]
    skills_required: list[str]
    tags: list[str]
    venue_city: str | None
    preferred_location: str | None
    expertise_level: str | None
    compensation_type: str | None
    fee_amount: float | None
    fee_structure: str | None
    number_of_openings: int | None
    application_deadline: date | None
    event_date: date | None
    created_at: datetime
    status: str

class PaginatedOpportunityListings(BaseModel):
    items: list[OpportunityListingCard]
    total: int
    page: int
    size: int
```

New schema file: `backend/app/schemas/opportunity_listing.py`

---

### 13.9 Opportunity Type — Display Labels & Visual Identity

DB enum values are kept unchanged. Frontend maps them to friendly labels and visual styles:

| DB Value | Display Label | Badge color | Card icon background | Lucide icon |
|---------|---------------|-------------|---------------------|-------------|
| `LECTURE` | Lecture / Guest Faculty | `bg-blue-100 text-blue-700` | `bg-blue-50` | `Mic2` |
| `CONTENT_COURSE_DEVELOPMENT` | Course Development | `bg-purple-100 text-purple-700` | `bg-purple-50` | `BookOpen` |
| `LANGUAGE_MEDIA` | Language & Media | `bg-teal-100 text-teal-700` | `bg-teal-50` | `Globe` |
| `LEARNING_SUPPORT_EVALUATION` | Learning Support | `bg-orange-100 text-orange-700` | `bg-orange-50` | `ClipboardCheck` |
| `CONTENT_ELEARNING` | E-Learning Content | `bg-green-100 text-green-700` | `bg-green-50` | `Monitor` |
| `EDITING_REVIEW` | Editing & Review | `bg-rose-100 text-rose-700` | `bg-rose-50` | `Pencil` |

Frontend constants to add to `frontend/src/types/opportunity.ts`:
- `OPPORTUNITY_TYPE_LISTING_LABELS: Record<OpportunityType, string>`
- `OPPORTUNITY_TYPE_BADGE_CLASSES: Record<OpportunityType, string>`
- `OPPORTUNITY_TYPE_ICON_BG: Record<OpportunityType, string>`
- `OPPORTUNITY_TYPE_ICON: Record<OpportunityType, LucideIcon>` (imported in component)

---

### 13.10 Listing Page — Decisions & Defaults

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| D1 | Opportunity type enum — keep or redesign? | **Keep DB enum values; add display labels in frontend constants.** No migration needed. | User chose to avoid migration risk. |
| D2 | Bookmark / Save feature | **Phase 2.** Bookmark icon rendered as grey placeholder only — no click handler, no DB table. | User decision. |
| D3 | "NEW" badge threshold | **7 days** from `created_at`. | User confirmed. |
| D4 | "CLOSING SOON" badge threshold | **3 days** before `application_deadline`. | User confirmed. |
| D5 | Fee display in cards | PAID → "₹{amount} / {fee_structure_label}"; NEGOTIABLE → "Negotiable"; VOLUNTARY → "Voluntary"; TBD → "Fee: TBD" | Consistent with compensation_type enum values. |
| D6 | Thumbnails | **Auto-generated icon per opportunity_type** (Lucide icon + background color). No admin image upload. | User decision. |
| D7 | `number_of_openings = 0` | Display as **"Unlimited openings."** | Standard industry pattern. |
| D8 | Duration filter | **Keyword match on `total_duration` free text.** Options: All Durations, Half Day, 1 Day, 2–3 Days, 1 Week, Ongoing. No new DB column. | Avoids schema change for MVP. |
| D9 | Location sidebar filter | Filter on opportunity's `preferred_location` field (string ILIKE match). Not geo-computed from expert's profile. | Simpler; no profile lookup needed. |
| D10 | "Applied" tab content | JOIN `applications` table: `WHERE applications.user_id = current_user.id AND applications.opportunity_id = opportunities.id`. | Natural relational query. |
| D11 | View Details / Apply actions | MVP: "View Details" opens `OpportunityDetailModal` (full-screen read-only modal of opportunity data). "Apply" button disabled with tooltip "Coming soon." Full apply flow is Phase 2. | Scope control — avoids building Apply flow in this iteration. |
| D12 | Save Your Search | **Phase 2.** Rendered as disabled button in filter bar. | Complexity deferred. |
| D13 | Recommended tab | **Phase 2 placeholder.** Tab renders a single card: "Personalised recommendations coming soon." | No matching algorithm yet. |

---

### 13.11 Listing Page — Development Prompts

```
PROMPT L1 — Backend: Expert Listing API

  New files:
    backend/app/api/v1/opportunities.py      ← new expert-facing router
    backend/app/schemas/opportunity_listing.py ← OpportunityListingCard + PaginatedOpportunityListings

  Register in backend/app/main.py:
    from app.api.v1 import opportunities as opp_listing
    app.include_router(opp_listing.router, prefix="/api/v1/opportunities", tags=["opportunities"])

  Endpoint: GET /api/v1/opportunities
    - Auth: get_current_user (expert must be logged in)
    - Query: JOIN organizations ON opportunities.organization_id = organizations.id
    - Always filter: status='OPEN', visibility='PUBLIC'
    - tab=applied:       JOIN applications a ON a.opportunity_id=opportunities.id AND a.user_id=:user_id
    - tab=closing_soon:  AND application_deadline <= NOW() + INTERVAL '3 days'
    - search:            ILIKE on title/short_description; array_to_string on tags/skills_required
    - opportunity_type:  WHERE opportunity_type = :val
    - delivery_mode:     WHERE :val = ANY(delivery_modes)
    - expertise_level:   WHERE expertise_level = :val
    - state:             ILIKE on preferred_location OR organizations.state
    - category:          ILIKE on category
    - date_filter:       event_date BETWEEN NOW() AND NOW()+INTERVAL '7 days/30 days/90 days'
    - duration_keyword:  ILIKE on total_duration
    - sort_by: newest → created_at DESC; closing_soon → application_deadline ASC NULLS LAST;
               fee_desc → fee_amount DESC NULLS LAST; relevant → created_at DESC
    - Paginate with offset/limit; return total, page, size, items

PROMPT L2 — Frontend: Types + API Client

  Update frontend/src/types/opportunity.ts:
    - Add OpportunityListingCard (subset type for listing)
    - Add PaginatedOpportunityListings
    - Add OPPORTUNITY_TYPE_LISTING_LABELS, OPPORTUNITY_TYPE_BADGE_CLASSES,
      OPPORTUNITY_TYPE_ICON_BG constants (see §13.9)

  New file: frontend/src/api/opportunityListingApi.ts
    - listOpportunities(params: ListingParams): Promise<PaginatedOpportunityListings>
    - GET /api/v1/opportunities with axios, passing all filter params

PROMPT L3 — Shared Listing Components

  New directory: frontend/src/features/opportunities/components/

  Files to create:
    OpportunityCard.tsx
      - Props: card: OpportunityListingCard
      - Layout per §13.5: type badge, NEW/CLOSING SOON badges, icon block,
        title, org, location, description, delivery chips, skills chips,
        fee display, deadline, View Details + Apply buttons
      - Uses OPPORTUNITY_TYPE_* constants for colors and icon

    ProfileCompletionWidget.tsx
      - Calls GET /api/v1/profile/me (already exists), computes % complete
      - Progress bar + "Complete Profile →" link to /profile
      - Returns null if profile is 100% complete

    FilterSidebar.tsx
      - Props: filters (state object), onChange (callback)
      - Three accordion groups: Opportunity Type, Location Type, Experience Level
      - Checkbox per option; "Clear" link per group when active

    OpportunityDetailModal.tsx
      - Props: opportunityId: string | null, onClose: () => void
      - Fetches GET /api/v1/opportunities/:id (add this single-item endpoint in PROMPT L1)
      - Full-screen modal (fixed inset-0) showing all opportunity fields read-only
      - Close button top-right; ESC key closes

PROMPT L4 — Redesigned OpportunitiesPage

  File: frontend/src/features/opportunities/OpportunitiesPage.tsx (full rewrite)

  State:
    - filters: { search, opportunity_type, delivery_mode, expertise_level, state,
                 category, date_filter, duration_keyword, sort_by, tab, page }
    - Sync filters to URL with useSearchParams (deep-link support)
    - data: PaginatedOpportunityListings | null
    - loading: boolean
    - detailModalId: string | null   ← which card's detail modal is open

  Layout:
    - Page header + results count + mobile "Filters" button
    - Tab bar (§13.3) — clicking tab resets page to 1
    - Filter bar (§13.4) — 7 controls in flex-wrap row; search debounced 300ms
    - 3-column grid (left sidebar + card grid + right sidebar)
    - ProfileCompletionWidget in left sidebar
    - FilterSidebar in right sidebar (shared state with filter bar)
    - Card grid: 2 columns (gap-4); loading → 4 skeleton cards; empty → empty state illustration
    - Pagination: Previous / Page N of M / Next
    - OpportunityDetailModal — rendered when detailModalId is set

  Data fetching:
    - useEffect on filters → call opportunityListingApi.listOpportunities(filters)
    - Replace all SAMPLE_OPPORTUNITIES references with real API data
    - Recommended tab: skip API call, render placeholder card instead

  Responsive:
    - left sidebar: hidden below xl breakpoint
    - right sidebar: hidden below md breakpoint; shown in slide-over drawer triggered by "Filters" button
    - Cards: 1 column below md, 2 columns at md+
```
