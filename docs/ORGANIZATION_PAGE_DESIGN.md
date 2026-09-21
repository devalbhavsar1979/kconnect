# Organisation Master — Design Documentation & Development Guide

**Project:** K-CONNECT  
**Page:** Organisations (`/admin/organisations`, `/admin/organisations/new`, `/admin/organisations/:id/edit`)  
**Version:** 1.0  
**Date:** 2026-09-20  
**Status:** Design-complete · Implementation approved  
**Actor:** Super Admin (via Admin Panel)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Page Architecture](#2-page-architecture)
3. [Component Inventory](#3-component-inventory)
4. [Field Specifications](#4-field-specifications)
5. [Data Model](#5-data-model)
6. [API Endpoints](#6-api-endpoints)
7. [Form UX Rules](#7-form-ux-rules)
8. [Validation Rules](#8-validation-rules)
9. [Development Prompts](#9-development-prompts)
10. [Decisions & Assumptions](#10-decisions--assumptions)

---

## 1. Overview

The **Organisation Master** allows Super Admins to maintain a master list of organisations/institutes. Organisations are referenced by the Opportunity form (§2 Organization Details dropdown) and by the public profile system.

### Design Relationship

The organisation record is the source of truth for the opportunity's organisation panel. When an admin selects an organisation in the opportunity form, the read-only details displayed are pulled from this master — including the new `industry` field added in Migration 015.

### Current State

- `OrganisationsPage` is a placeholder.
- The `organizations` table exists with 10 columns.
- Admin list/get API exists. Create/update/delete endpoints are missing.
- `organization_type` is stored as an ENUM (`organizationtype`) with values `CORPORATE / STARTUP / NGO / GOVERNMENT / EDUCATIONAL / OTHER` — this will be converted to VARCHAR for flexibility.
- `industry` field does not exist — Migration 015 adds it.

---

## 2. Page Architecture

### Routes

| Route | Purpose |
|---|---|
| `/admin/organisations` | List all organisations (replace placeholder) |
| `/admin/organisations/new` | Create a new organisation |
| `/admin/organisations/:id/edit` | Edit an existing organisation |

### List Page Layout

```
┌────────────────────────────────────────────────────────────┐
│  PAGE HEADER                                                │
│  Title: "Organisations"   [+ Add Organisation]             │
├────────────────────────────────────────────────────────────┤
│  FILTER BAR: [Search box]  [Industry filter]               │
├────────────────────────────────────────────────────────────┤
│  TABLE                                                      │
│  Name | Industry | Type | City | Country | Opps | Actions  │
│  …    | …        | …    | …    | …       | n    | Edit     │
│  Pagination                                                  │
└────────────────────────────────────────────────────────────┘
```

### Create / Edit Page Layout

```
┌────────────────────────────────────────────────────────────┐
│  BREADCRUMB + TITLE + [Cancel] [Save]                      │
├────────────────────────────┬───────────────────────────────┤
│  §1 Identity               │  §2 Contact & Location        │
│  • Name (required)         │  • Email                      │
│  • Industry (required)     │  • Mobile / Phone             │
│  • Organization Type (req) │  • Location / City            │
│  • Website                 │  • State                      │
│                            │  • Country                    │
│                            │  • Address                    │
└────────────────────────────┴───────────────────────────────┘
│  [Cancel]                  [Save Organisation]              │
```

Mobile: both sections stack full-width.

---

## 3. Component Inventory

| Component | File | Responsibility |
|---|---|---|
| `OrganisationsPage` | `features/admin/pages/OrganisationsPage.tsx` | List with search, filter, create button |
| `CreateOrganisationPage` | `features/admin/pages/CreateOrganisationPage.tsx` | Create + Edit form |
| `OrgFormHeader` | `features/admin/components/organisation/OrgFormHeader.tsx` | Breadcrumb + title + action buttons |
| `OrgIdentitySection` | `features/admin/components/organisation/OrgIdentitySection.tsx` | §1 fields |
| `OrgContactSection` | `features/admin/components/organisation/OrgContactSection.tsx` | §2 fields |

---

## 4. Field Specifications

### §1 — Identity

| # | Field | DB Column | Control | Required | Notes |
|---|---|---|---|---|---|
| 1 | Organisation / Institute Name | `organization_name` | Text input | Yes | Max 255 chars |
| 2 | Industry / Domain | `industry` | Dropdown | Yes | See values below |
| 3 | Organization Type | `organization_type` | Dropdown | Yes | See values below |
| 4 | Website | `website` | URL input | No | Max 512 chars |

**Industry / Domain values:**

| Value | Display Label |
|---|---|
| `IT Services & Consultancy` | IT Services & Consultancy |
| `Banking & Financial Services` | Banking & Financial Services (BFSI) |
| `Healthcare & Pharmaceuticals` | Healthcare & Pharmaceuticals |
| `Manufacturing & Engineering` | Manufacturing & Engineering |
| `Education & Training` | Education & Training |
| `Retail & E-Commerce` | Retail & E-Commerce |
| `Media & Entertainment` | Media & Entertainment |
| `FMCG & Consumer Goods` | FMCG & Consumer Goods |
| `Telecom & Networking` | Telecom & Networking |
| `Automotive` | Automotive |
| `Real Estate & Construction` | Real Estate & Construction |
| `Energy & Utilities` | Energy & Utilities |
| `Government & Public Sector` | Government & Public Sector |
| `Non-Profit / NGO` | Non-Profit / NGO |
| `Agriculture & Food` | Agriculture & Food |
| `Legal & Compliance` | Legal & Compliance |
| `Logistics & Supply Chain` | Logistics & Supply Chain |
| `Other` | Other |

**Organization Type values** (replaces old CORPORATE/STARTUP/NGO enum):

| Value | Display Label |
|---|---|
| `Private Limited Company` | Private Limited Company |
| `Public Limited Company` | Public Limited Company |
| `LLP / Partnership Firm` | LLP / Partnership Firm |
| `Sole Proprietorship` | Sole Proprietorship |
| `NGO / Non-Profit Trust` | NGO / Non-Profit Trust |
| `Government / PSU` | Government / PSU |
| `Educational Institution` | Educational Institution |
| `Startup` | Startup |
| `Other` | Other |

---

### §2 — Contact & Location

| # | Field | DB Column | Control | Required | Notes |
|---|---|---|---|---|---|
| 1 | Contact Email | `email` | Email input | No | Max 255 chars |
| 2 | Mobile / Phone | `mobile_number` | Tel input | No | Max 20 chars |
| 3 | Location / City | `city` | Text input | No | Max 100 chars |
| 4 | State | `state` | Select dropdown | No | See values below |
| 5 | Country | `country` | Select dropdown | No | See values below |
| 6 | Address / Notes | `address` | Textarea | No | Max 500 chars |

**State values** (Indian states + territories — primary market):

Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal, Andaman & Nicobar Islands, Chandigarh, Dadra & Nagar Haveli, Daman & Diu, Delhi, Lakshadweep, Puducherry, Jammu & Kashmir, Ladakh, Other

**Country values:**

India, United States, United Kingdom, United Arab Emirates, Canada, Australia, Singapore, Germany, France, Other

---

## 5. Data Model

### Migration 015 — Two changes

```sql
-- 1. Convert organization_type from ENUM to VARCHAR (flexible, no future migrations needed for new types)
ALTER TABLE organizations
  ALTER COLUMN organization_type TYPE VARCHAR(100) USING organization_type::text;

DROP TYPE IF EXISTS organizationtype;

-- 2. Add industry field
ALTER TABLE organizations ADD COLUMN industry VARCHAR(200);

CREATE INDEX ix_organizations_industry ON organizations(industry);
```

**Why VARCHAR instead of new ENUM for organization_type:**
The existing 6 ENUM values (CORPORATE/STARTUP/NGO/GOVERNMENT/EDUCATIONAL/OTHER) do not match the new labels (Private Limited Company, etc.). Converting to VARCHAR eliminates the need for future migrations every time the list changes. The values are enforced by a dropdown in the frontend.

### Updated organizations table (after Migration 015)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | — |
| `organization_name` | VARCHAR(255) NOT NULL | — |
| `industry` | VARCHAR(200) | **NEW** |
| `organization_type` | VARCHAR(100) | Changed from ENUM to VARCHAR |
| `website` | VARCHAR(512) | — |
| `email` | VARCHAR(255) | — |
| `mobile_number` | VARCHAR(20) | — |
| `city` | VARCHAR(100) | Shown as "Location / City" in UI |
| `state` | VARCHAR(100) | — |
| `country` | VARCHAR(100) | — |
| `address` | TEXT | — |
| `created_by` | UUID FK users | — |
| `created_at` | TIMESTAMPTZ | — |
| `updated_at` | TIMESTAMPTZ | — |

---

## 6. API Endpoints

All endpoints require `SUPER_ADMIN` role.

| Method | Path | Body | Response | Purpose |
|---|---|---|---|---|
| `GET` | `/api/v1/admin/organisations` | — | `PaginatedResponse[AdminOrgResponse]` | List with search + industry filter |
| `POST` | `/api/v1/admin/organisations` | `AdminOrgCreateRequest` | `AdminOrgResponse` | Create |
| `GET` | `/api/v1/admin/organisations/{id}` | — | `AdminOrgResponse` | Get single |
| `PUT` | `/api/v1/admin/organisations/{id}` | `AdminOrgUpdateRequest` | `AdminOrgResponse` | Full update |
| `DELETE` | `/api/v1/admin/organisations/{id}` | — | 204 | Delete (only if 0 linked opportunities) |

---

## 7. Form UX Rules

- **Save**: validates required fields; on success, redirects to `/admin/organisations`
- **Cancel**: navigates back; shows "discard changes?" prompt if form is dirty
- **Delete** (edit page only): confirmation dialog; blocked if org has linked opportunities (shows count)
- **Existing org type values** in DB (CORPORATE, STARTUP, etc.) are displayed as-is if they don't match the new dropdown — the admin can update them when editing

---

## 8. Validation Rules

| Field | Rule |
|---|---|
| `organization_name` | Required, non-blank, max 255 |
| `industry` | Required, must be one of the listed values |
| `organization_type` | Required, must be one of the listed values |
| `website` | Optional; if provided, must start with `http://` or `https://` |
| `email` | Optional; if provided, must be valid email format |
| `mobile_number` | Optional; max 20 chars |

---

## 9. Development Prompts

### PROMPT 1 — Migration 015

Create `backend/alembic/versions/015_update_organizations.py`
- `down_revision = '014'`
- Convert `organization_type` column from ENUM to VARCHAR(100)
- Drop `organizationtype` ENUM
- Add `industry VARCHAR(200) nullable`
- Add index `ix_organizations_industry`

### PROMPT 2 — Backend: Model + Schema + API

1. Update `backend/app/models/organization.py`:
   - Change `organization_type` from `Enum(OrganizationType)` to `String(100)`
   - Add `industry: Mapped[str | None]` VARCHAR(200) field
   - Keep `OrganizationType` Python enum class (for reference only, not used as DB type)

2. Update `backend/app/schemas/admin/organisations.py`:
   - Add `AdminOrgCreateRequest` with all fields
   - Add `AdminOrgUpdateRequest` (same fields, all optional)
   - Update `AdminOrgResponse` to include `industry`

3. Update `backend/app/api/v1/admin/organisations.py`:
   - Add `POST ""` — create
   - Add `PUT "/{org_id}"` — update
   - Add `DELETE "/{org_id}"` — delete (block if has opportunities)
   - Update `GET ""` to support `?industry=` filter

### PROMPT 3 — Frontend: Types + API + Pages

1. Update `frontend/src/types/admin.ts`:
   - Add `industry` to `AdminOrganisation`
   - Add `AdminOrgCreatePayload`, `AdminOrgUpdatePayload`

2. Update `frontend/src/api/adminOrgsApi.ts`:
   - Add `create`, `update`, `delete` methods

3. Build `OrganisationsPage.tsx` (list with search, filter, create button)
4. Build `CreateOrganisationPage.tsx` (create + edit)
5. Wire routes: `/admin/organisations/new` + `/admin/organisations/:id/edit`

### PROMPT 4 — Update Opportunity Organisation Panel

Update `frontend/src/features/admin/components/opportunity/OrganizationDetailsSection.tsx`:
- Add `industry` to the read-only display panel (now available from org master)

---

## 10. Decisions & Assumptions

| # | Question | Decision |
|---|---|---|
| 1 | Full Industry/Domain list? | 18 values defined in §4 — can be extended without migration (VARCHAR) |
| 2 | Organization Type — update or replace existing enum? | Replace (convert to VARCHAR). Existing values like "CORPORATE" shown as-is until admin edits them |
| 3 | "Location" field meaning? | Maps to existing `city` column; labelled "Location / City" in UI |
| 4 | State — dropdown or free text? | Dropdown of Indian states + "Other" (primary market); stored as VARCHAR |
| 5 | Country — dropdown or free text? | Dropdown of 10 major countries + "Other" |
| 6 | Include email, phone, address on form? | Yes — existing fields, kept as optional Contact section |
| 7 | Delete allowed? | Yes, but blocked if org has ≥1 linked opportunities |
| 8 | Who can create/edit orgs? | SUPER_ADMIN only |
