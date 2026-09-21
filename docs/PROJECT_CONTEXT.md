# K-CONNECT — Full Project Context for AI Assistants

> **Purpose:** Drop this file as context into any AI coding tool (Cursor, Copilot, Windsurf, etc.) to get full project awareness without re-explaining the codebase.
> **Last updated:** 2026-09-20

---

## 1. What is K-CONNECT?

K-CONNECT is a **PWA marketplace** connecting Organisations with subject-matter experts — Trainers, SMEs, Freelancers, Consultants, and Industry Professionals. Organisations post Opportunities; experts browse, filter, and apply.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3, React Router 6, Axios, Zustand, vite-plugin-pwa |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.x (mapped columns), Alembic, Pydantic v2 |
| Database | PostgreSQL 15 |
| Auth | JWT (access token + refresh token), HTTPBearer, python-jose |
| Runtime | Uvicorn (Windows service via NSSM) |
| Web server | IIS 8.5 (static files) + ARR 3.0 (reverse proxy to Uvicorn:8000) |
| OS | Windows Server 2022 Standard (development) — target is WS 2012 R2 |

### Critical Version Constraints (WS 2012 R2 deployment target)

- **Node.js 18.x LTS only** — Node 20+ dropped WS 2012 R2 support
- **Python 3.12.x only** — 3.13 dropped WS 2012 R2 support
- **PostgreSQL 15.x only** — 16 may fail installer on WS 2012 R2
- **NO Docker, NO Docker Compose, NO Gunicorn, NO systemd**

---

## 3. Repository Structure

```
c:\Relisant\KConnect\kconnect\
├── backend/
│   ├── app/
│   │   ├── api/v1/              ← FastAPI routers
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── opportunities.py  ← expert-facing listing API
│   │   │   ├── applications.py
│   │   │   ├── organizations.py
│   │   │   ├── dashboard.py
│   │   │   ├── academic.py
│   │   │   ├── experience.py
│   │   │   ├── expertise.py
│   │   │   ├── preferences.py
│   │   │   ├── achievements.py
│   │   │   ├── service_delivery.py
│   │   │   └── admin/
│   │   │       ├── opportunities.py  ← admin CRUD API
│   │   │       ├── organisations.py
│   │   │       ├── users.py
│   │   │       ├── categories.py
│   │   │       └── dashboard.py
│   │   ├── models/              ← SQLAlchemy ORM models
│   │   ├── schemas/             ← Pydantic request/response schemas
│   │   ├── core/                ← config, database, security
│   │   └── dependencies/        ← auth.py (get_current_user, require_super_admin)
│   ├── alembic/versions/        ← 15 migrations (001–015)
│   └── uploads/opportunities/   ← file uploads stored here
├── frontend/
│   ├── src/
│   │   ├── api/                 ← Axios API clients
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── opportunities/   ← expert listing page
│   │   │   └── admin/
│   │   │       ├── pages/       ← all admin pages
│   │   │       └── components/
│   │   │           ├── opportunity/   ← 9-section form components
│   │   │           └── organisation/  ← org form components
│   │   ├── types/               ← TypeScript interfaces and constants
│   │   ├── routes/index.tsx     ← all routes
│   │   ├── store/               ← Zustand stores (authStore)
│   │   └── components/          ← shared UI components
├── docs/
│   ├── PROJECT_CONTEXT.md       ← this file
│   ├── OPPORTUNITY_PAGE_DESIGN.md
│   └── ORGANIZATION_PAGE_DESIGN.md
├── iis/                         ← web.config, URL Rewrite rules
├── deployment/                  ← PowerShell deployment scripts
└── services.bat                 ← start/stop/restart NSSM services
```

---

## 4. Deployment & Services

```bat
# Restart both services (run from project root)
services.bat restart backend
services.bat restart frontend

# Individual service management via NSSM
nssm restart KConnect-Backend
nssm restart KConnect-Frontend
```

- Backend runs at: `http://localhost:8000`
- Frontend dev server runs at: `http://localhost:5173` (Vite)
- Production: IIS serves static build; `/api/*` proxied via ARR to Uvicorn

---

## 5. Authentication

- **Login:** `POST /api/v1/auth/login` → `{ access_token, refresh_token, user }`
- **Refresh:** `POST /api/v1/auth/refresh` → `{ access_token }`
- **Register:** `POST /api/v1/auth/register`
- All protected endpoints require `Authorization: Bearer <access_token>`
- Frontend: `src/api/client.ts` — Axios interceptor attaches token; auto-refreshes on 401
- Frontend state: `src/store/authStore.ts` (Zustand)

### User Types (DB enum `usertype`)

| Value | Description |
|---|---|
| `SUPER_ADMIN` | Full platform access, creates opportunities |
| `ADMIN` | Admin access |
| `SME` | Subject Matter Expert |
| `PROFESSIONAL_SERVICE_PROVIDER` | Freelancer / Consultant |
| `TRAINER` / `FREELANCER` / `CONSULTANT` / `VENDOR` | Legacy / future use |

---

## 6. Database Schema

### Migration Chain (Alembic)

```
001_initial_schema
 └─ e858521fde2d_initial_schema (branch)
002_add_user_profile_fields
003_add_psp_usertype
004_add_profile_fields
005_add_academic_details
006_add_experience_entries
007_add_user_expertise
008_add_user_preferences
009_add_achievements
010_add_gender_other
011_add_super_admin_usertype
012_add_categories
013_add_user_service_delivery
014_redesign_opportunities       ← dropped old table, created full schema
015_update_organizations         ← org VARCHAR type + industry field
                                 (HEAD — current)
```

Run migrations: `cd backend && alembic upgrade head`

---

### Table: `users`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| first_name, last_name | VARCHAR(150) | |
| email | VARCHAR(255) UNIQUE | |
| mobile_number | VARCHAR(20) | |
| password_hash | VARCHAR(255) | bcrypt |
| user_type | ENUM usertype | SUPER_ADMIN, ADMIN, SME, etc. |
| profile_status | ENUM profilestatus | INCOMPLETE / COMPLETE |
| is_active, is_verified | BOOLEAN | |
| date_of_birth | DATE | |
| cv_file_path | VARCHAR(512) | |
| profile_photo_path | VARCHAR(512) | |
| title | ENUM titletype | MR/MRS/MISS/DR/PROF |
| gender | ENUM gendertype | MALE/FEMALE/OTHER/PREFER_NOT_TO_SAY |
| website, linkedin, company | VARCHAR(100) | |
| designation | ENUM designationtype | PROFESSOR/ASST_PROFESSOR/TRAINER/GUEST_FACULTY |
| short_bio | TEXT | |
| address_flat, address_area, address_city, address_state, address_country, address_pincode | VARCHAR | |
| consent | BOOLEAN | |
| created_at, updated_at | TIMESTAMPTZ | |

---

### Table: `organizations`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| organization_name | VARCHAR(255) NOT NULL | |
| industry | VARCHAR(200) | 18 predefined values (see orgConstants.ts) |
| organization_type | VARCHAR(100) | Free text (was ENUM, converted in migration 015) |
| website | VARCHAR(512) | Must start http/https |
| email | VARCHAR(255) | |
| mobile_number | VARCHAR(20) | |
| city | VARCHAR(100) | |
| state | VARCHAR(100) | |
| country | VARCHAR(100) | |
| address | TEXT | |
| created_by | UUID FK → users.id | |
| created_at, updated_at | TIMESTAMPTZ | |

---

### Table: `opportunities`

39 columns. Key fields:

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title | VARCHAR(512) | |
| opportunity_type | ENUM opportunitytype | LECTURE / CONTENT_COURSE_DEVELOPMENT / LANGUAGE_MEDIA / LEARNING_SUPPORT_EVALUATION / CONTENT_ELEARNING / EDITING_REVIEW |
| category | VARCHAR(200) | Free text |
| sub_category | VARCHAR(200) | |
| delivery_modes | TEXT[] | ARRAY — Classroom/Online/Hybrid/etc. |
| number_of_openings | INTEGER | 0 = Unlimited |
| session_structure | ENUM sessionstructuretype | SINGLE_SESSION / MULTIPLE_SESSIONS / ONGOING_PROGRAM |
| total_duration | VARCHAR(100) | Free text e.g. "3 days" |
| duration_per_session | VARCHAR(100) | |
| organization_id | UUID FK → organizations.id | SET NULL on delete |
| short_description | VARCHAR(500) | |
| detailed_description | TEXT | |
| tags | TEXT[] | ARRAY |
| event_date | DATE | |
| start_time, end_time | TIME | |
| venue_name | VARCHAR(500) | |
| venue_location_type | ENUM venuelocationtype | CORPORATE/INSTITUTE/UNIVERSITY/ONLINE/OTHERS |
| venue_address | TEXT | |
| target_audience | TEXT[] | ARRAY |
| skills_required | TEXT[] | ARRAY |
| minimum_experience | VARCHAR(100) | |
| expertise_level | ENUM expertiseleveltype | FRESHER / EXPERIENCED / EXPERT |
| additional_requirements | TEXT | |
| language_of_delivery | VARCHAR(100) | |
| preferred_location | VARCHAR(200) | |
| gender_preference | VARCHAR(50) | |
| candidate_preference | TEXT | |
| notes_for_applicants | TEXT | |
| application_deadline | DATE | |
| compensation_type | ENUM compensationtype | PAID / VOLUNTARY / NEGOTIABLE / TBD |
| fee_structure | ENUM feestructuretype | PER_SESSION / PER_PROGRAM / PER_TASK |
| fee_amount | NUMERIC(12,2) | |
| payment_terms | VARCHAR(200) | |
| travel_required | BOOLEAN | |
| travel_reimbursement | BOOLEAN | |
| other_benefits | TEXT | |
| visibility | ENUM opportunityvisibility | VISIBLE_TO_ALL / SHORTLISTED_ONLY |
| status | ENUM opportunitystatus | DRAFT / OPEN / CLOSED / CANCELLED / ARCHIVED |
| created_by | UUID FK → users.id | |
| created_at, updated_at | TIMESTAMPTZ | |

---

### Table: `opportunity_attachments`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| opportunity_id | UUID FK → opportunities.id CASCADE DELETE | |
| file_name | VARCHAR(255) | |
| file_path | VARCHAR(512) | Relative path under uploads/ |
| file_size_bytes | INTEGER | |
| uploaded_at | TIMESTAMPTZ | |

Files stored at: `backend/uploads/opportunities/{opportunity_id}/{uuid}_{filename}`
Allowed types: `.pdf .doc .docx .ppt .pptx` — max 10 MB each, max 5 per opportunity

---

### Table: `applications`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| opportunity_id | UUID FK → opportunities.id | |
| applicant_id | UUID FK → users.id | |
| status | ENUM applicationstatus | APPLIED/UNDER_REVIEW/SHORTLISTED/REJECTED/SELECTED/WITHDRAWN |
| cover_note | TEXT | |
| applied_at, updated_at | TIMESTAMPTZ | |
| UNIQUE | (opportunity_id, applicant_id) | One application per expert per opportunity |

---

### Other Tables

| Table | Purpose |
|---|---|
| `refresh_tokens` | JWT refresh token storage |
| `academic_details` | Education history (degree, institution, year) |
| `experience_entries` | Work experience records |
| `user_expertise` | Skills, domains, audience levels |
| `user_preferences` | Preferred engagement types |
| `achievements` | Certifications, awards, publications |
| `service_delivery` | How expert delivers services |
| `categories` | Admin-managed content categories |

---

## 7. Backend API Reference

All endpoints prefixed with `/api/v1`.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login → tokens |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Bearer | Logout (invalidate refresh) |

### Expert-Facing Opportunities
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/opportunities` | Bearer | Paginated listing with filters |
| GET | `/opportunities/{id}` | Bearer | Single opportunity card (for detail modal) |

**GET `/opportunities` query params:**
`page`, `size` (max 50), `search`, `opportunity_type`, `delivery_mode`, `expertise_level`, `state`, `category`, `date_filter` (this_week/this_month/next_3_months), `duration_keyword`, `sort_by` (newest/closing_soon/fee_desc/relevant), `tab` (all/applied/closing_soon)

Base filter always applied: `status = 'OPEN'` AND `visibility = 'VISIBLE_TO_ALL'`

### Admin — Opportunities
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/opportunities` | SUPER_ADMIN | Paginated list (search, status, opportunity_type filters) |
| POST | `/admin/opportunities` | SUPER_ADMIN | Create opportunity (returns DRAFT) |
| GET | `/admin/opportunities/{id}` | SUPER_ADMIN | Get full opportunity |
| PUT | `/admin/opportunities/{id}` | SUPER_ADMIN | Update opportunity |
| POST | `/admin/opportunities/{id}/publish` | SUPER_ADMIN | Change status to OPEN |
| POST | `/admin/opportunities/{id}/archive` | SUPER_ADMIN | Change status to ARCHIVED |
| DELETE | `/admin/opportunities/{id}` | SUPER_ADMIN | Delete opportunity |
| POST | `/admin/opportunities/{id}/attachments` | SUPER_ADMIN | Upload attachment (multipart/form-data) |
| DELETE | `/admin/opportunities/{id}/attachments/{att_id}` | SUPER_ADMIN | Delete attachment |

### Admin — Organisations
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/organisations` | SUPER_ADMIN | List (search, industry filters; max size=200) |
| POST | `/admin/organisations` | SUPER_ADMIN | Create organisation |
| GET | `/admin/organisations/{id}` | SUPER_ADMIN | Get organisation |
| PUT | `/admin/organisations/{id}` | SUPER_ADMIN | Update organisation |
| DELETE | `/admin/organisations/{id}` | SUPER_ADMIN | Delete (409 if linked opportunities exist) |

### Admin — Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | SUPER_ADMIN | Paginated user list |
| GET | `/admin/users/{id}` | SUPER_ADMIN | Get user |
| PUT | `/admin/users/{id}/verify` | SUPER_ADMIN | Verify user account |
| PUT | `/admin/users/{id}/deactivate` | SUPER_ADMIN | Deactivate user |

### Profile (Expert)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | Bearer | Get own profile |
| PUT | `/users/me` | Bearer | Update own profile |
| POST | `/users/me/photo` | Bearer | Upload profile photo |
| GET | `/users/me/completion` | Bearer | Profile completeness % + missing fields |
| GET/POST/PUT/DELETE | `/users/me/academic` | Bearer | Academic details CRUD |
| GET/POST/PUT/DELETE | `/users/me/experience` | Bearer | Work experience CRUD |
| GET/PUT | `/users/me/expertise` | Bearer | Skills, domains, audience levels |
| GET/PUT | `/users/me/preferences` | Bearer | Preferred engagement types |
| GET/POST/PUT/DELETE | `/users/me/achievements` | Bearer | Certifications, awards CRUD |
| GET/PUT | `/users/me/service-delivery` | Bearer | Service delivery preferences |

---

## 8. Frontend Routes

```
/                     → redirect to /dashboard
/login                → LoginPage
/register             → RegisterPage

/dashboard            → DashboardPage (expert)
/opportunities        → OpportunitiesPage (expert listing — card grid)
/profile              → MyProfilePage (multi-tab profile editor)
/applications         → PlaceholderPage (Phase 2)
/sessions             → PlaceholderPage (Phase 2)
/availability         → PlaceholderPage (Phase 2)
/messages             → PlaceholderPage (Phase 2)
/earnings             → PlaceholderPage (Phase 2)
/reviews              → PlaceholderPage (Phase 2)
/notifications        → PlaceholderPage (Phase 2)
/settings             → PlaceholderPage (Phase 2)
/help                 → PlaceholderPage (Phase 2)

/admin                → redirect to /admin/dashboard
/admin/dashboard      → AdminDashboardPage
/admin/users          → UsersPage (list + verification tab)
/admin/opportunities              → OpportunitiesPage (card grid)
/admin/opportunities/new          → CreateOpportunityPage
/admin/opportunities/:id/edit     → CreateOpportunityPage (edit mode)
/admin/organisations              → OrganisationsPage
/admin/organisations/new          → CreateOrganisationPage
/admin/organisations/:id/edit     → CreateOrganisationPage (edit mode)
/admin/applications   → ApplicationsPage (placeholder)
/admin/categories     → CategoriesPage
/admin/sessions       → SessionsPage (placeholder)
/admin/analytics      → AnalyticsPage (placeholder)
/admin/settings/platform → SettingsPage (placeholder)
/admin/support        → SupportPage (placeholder)
```

Route guards:
- `<ProtectedRoute>` — requires valid JWT, redirects to /login
- `<AdminGuard>` — requires `user_type === SUPER_ADMIN`, redirects to /dashboard

---

## 9. Frontend API Clients (`src/api/`)

| File | Base path | Purpose |
|---|---|---|
| `client.ts` | `/api/v1` | Axios instance with token interceptor + auto-refresh |
| `auth.ts` | `/auth` | login, register, refresh, logout |
| `profileApi.ts` | `/users/me` | profile CRUD, photo upload, completion |
| `academicApi.ts` | `/users/me/academic` | academic details CRUD |
| `experienceApi.ts` | `/users/me/experience` | work experience CRUD |
| `expertiseApi.ts` | `/users/me/expertise` | skills + domains |
| `preferencesApi.ts` | `/users/me/preferences` | engagement preferences |
| `achievementsApi.ts` | `/users/me/achievements` | certifications, awards |
| `serviceDeliveryApi.ts` | `/users/me/service-delivery` | delivery preferences |
| `opportunityListingApi.ts` | `/opportunities` | expert listing + detail |
| `opportunityAdminApi.ts` | `/admin/opportunities` | admin CRUD + attachments + publish/archive |
| `adminOrgsApi.ts` | `/admin/organisations` | org CRUD |
| `adminUsersApi.ts` | `/admin/users` | user management |
| `adminCategoriesApi.ts` | `/admin/categories` | category management |
| `adminDashboardApi.ts` | `/admin/dashboard` | dashboard stats |

---

## 10. Key TypeScript Types (`src/types/`)

### `opportunity.ts` — Enums

```typescript
OpportunityType = 'LECTURE' | 'CONTENT_COURSE_DEVELOPMENT' | 'LANGUAGE_MEDIA'
               | 'LEARNING_SUPPORT_EVALUATION' | 'CONTENT_ELEARNING' | 'EDITING_REVIEW'

OpportunityStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED' | 'ARCHIVED'

CompensationType = 'PAID' | 'VOLUNTARY' | 'NEGOTIABLE' | 'TBD'

FeeStructureType = 'PER_SESSION' | 'PER_PROGRAM' | 'PER_TASK'

ExpertiseLevelType = 'FRESHER' | 'EXPERIENCED' | 'EXPERT'
```

### `opportunity.ts` — Key display maps

```typescript
OPPORTUNITY_TYPE_LISTING_LABELS  // DB value → friendly label for expert/admin cards
OPPORTUNITY_TYPE_BADGE_CLASSES   // DB value → Tailwind badge classes
OPPORTUNITY_TYPE_ICON_BG         // DB value → icon background classes
FEE_STRUCTURE_SHORT_LABELS       // '/ session', '/ program', '/ task'
```

### `admin.ts`

```typescript
AdminOrganisation { id, organization_name, industry, organization_type, website,
                    email, mobile_number, city, state, country, address,
                    created_at, opportunity_count }
AdminOrgCreatePayload { organization_name, industry, organization_type, website,
                        email, mobile_number, city, state, country, address }
```

---

## 11. Implemented Features (Fully Working)

### Expert-Facing

#### `/opportunities` — Opportunity Listing Page
- **3-column layout**: left sidebar (profile completion widget), 2-column card grid, right filter panel
- **Tab bar**: All Opportunities | Recommended (Phase 2 placeholder) | Applied | Closing Soon
- **Filter bar** (7 controls): keyword search (debounced 300ms), Location (Indian states), Type, Duration, Date range, Category, Sort by
- **Right sidebar** (3 groups): Opportunity Type checkboxes, Location Type, Experience Level
- **Card** shows: type badge + icon, NEW badge (≤7 days), CLOSING SOON badge (≤3 days), title, org name, location, description (3-line), delivery chips, skills chips (+N more), fee display, deadline, **View Details** button (opens detail modal), Apply (disabled — Phase 2)
- **URL-synced filters** via `useSearchParams`
- **Mobile drawer** for filters (< md breakpoint)
- **Profile completion widget**: hides when 100% complete, links to /profile

#### `/profile` — Expert Profile Editor
- Multi-tab: Personal Info, Bio, Academic, Experience, Expertise, Preferences, Achievements, Service Delivery
- Profile photo upload, CV upload
- Profile completion percentage display

---

### Admin Panel (`/admin/*`)

#### `/admin/opportunities` — Opportunity Management (Card Grid)
- Same card style as expert page: type icon, badges, description, skills, fee
- **Status badge** on every card (DRAFT / OPEN / CLOSED / ARCHIVED)
- **Tab bar**: All | Draft | Open | Closed | Archived
- **Publish button** on DRAFT cards; **Archive button** on OPEN cards
- **Edit pencil** on every card → navigates to `/admin/opportunities/:id/edit`
- Filters: debounced search, type dropdown, clear button
- Toast notifications for publish/archive

#### `/admin/opportunities/new` and `/admin/opportunities/:id/edit` — Create/Edit Form
- **9-section single-page form** in 3-column grid
- **Draft-first flow**: Save as Draft (only title + type required) → Save & Publish
- **Preview modal**: full-screen read-only preview from form state (no API call)
- **Dirty-state guard**: confirms before cancel/navigate away

**9 Sections:**

| # | Section | Key Fields |
|---|---|---|
| 1 | Opportunity Basics | Title, Type, Category, Delivery Modes (multi), Openings, Session Structure, Duration |
| 2 | Organization Details | Organisation dropdown (search filter), read-only detail panel (industry, type, city, state, website) |
| 3 | Opportunity Details | Short Desc (500 chars), Detailed Desc (plain textarea), Tags (chip input) |
| 4 | Schedule & Location | Event Date, Start/End Time, Venue Name/Type/Address, Target Audience (multi) |
| 5 | Compensation & Benefits | Type (PAID/VOLUNTARY/NEGOTIABLE/TBD), Fee Amount (₹ INR), Fee Structure, Payment Terms, Travel |
| 6 | Requirements | Skills (chip input), Min Experience, Expertise Level, Language, Additional Requirements |
| 7 | Eligibility & Preferences | Preferred Location, Gender, Application Deadline, Candidate Preference, Notes |
| 8 | Attachments | Drag-and-drop zone, PDF/DOC/DOCX/PPT/PPTX only, max 5 files × 10 MB |
| 9 | Visibility & Status | Radio: Visible to All / Shortlisted Only; Radio: DRAFT / OPEN |

#### `/admin/organisations` — Organisation Management
- Card list with search + industry filter
- Create / Edit / Delete (delete blocked if linked opportunities exist)

#### `/admin/organisations/new` and `/admin/organisations/:id/edit`
- Section 1: Name, Industry, Org Type, Website
- Section 2: Email, Phone, City, State (Indian states dropdown), Country, Address

#### `/admin/users` — User Management
- List + verification tab, verify/deactivate actions

#### `/admin/categories` — Category Management
- CRUD for content categories

---

## 12. What is Phase 2 (NOT yet implemented)

| Feature | Notes |
|---|---|
| Apply for opportunity | Full application flow, Apply button currently disabled with tooltip |
| Bookmark / Save opportunity | Needs `saved_opportunities` DB table |
| Personalised Recommendations tab | Needs matching algorithm |
| Save Your Search | Needs saved filters storage |
| Organisation user self-posting | Currently SUPER_ADMIN only |
| Multi-currency fees | INR only for now |
| Rich text editor for descriptions | Plain textarea for now |
| Full Sessions / Applications / Earnings pages | Currently placeholder pages |

---

## 13. Opportunity Type Display Map

The DB enum values differ from what a user sees. Frontend maps them:

| DB Value | Display Label | Badge Color |
|---|---|---|
| `LECTURE` | Lecture / Guest Faculty | Blue |
| `CONTENT_COURSE_DEVELOPMENT` | Course Development | Purple |
| `LANGUAGE_MEDIA` | Language & Media | Teal |
| `LEARNING_SUPPORT_EVALUATION` | Learning Support | Orange |
| `CONTENT_ELEARNING` | E-Learning Content | Green |
| `EDITING_REVIEW` | Editing & Review | Rose |

---

## 14. Organisation Constants (`orgConstants.ts`)

```typescript
INDUSTRY_OPTIONS (18 values):
  IT Services & Consultancy, Banking & Financial Services, Healthcare & Pharmaceuticals,
  Manufacturing & Engineering, Education & Training, Retail & E-Commerce, Media & Entertainment,
  FMCG & Consumer Goods, Telecom & Networking, Automotive, Real Estate & Construction,
  Energy & Utilities, Government & Public Sector, Non-Profit / NGO, Agriculture & Food,
  Legal & Compliance, Logistics & Supply Chain, Other

ORG_TYPE_OPTIONS (9 values):
  Private Limited Company, Public Limited Company, LLP / Partnership Firm,
  Sole Proprietorship, NGO / Non-Profit Trust, Government / PSU,
  Educational Institution, Startup, Other

INDIAN_STATES (38 values + Other)

COUNTRY_OPTIONS (10 values + Other):
  India, United States, United Kingdom, Canada, Australia,
  Singapore, UAE, Germany, France, Other
```

---

## 15. Environment & Config

```
# backend/.env (example)
DATABASE_URL=postgresql://user:password@localhost:5432/kconnect
SECRET_KEY=<jwt-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# frontend/.env (example)
VITE_API_BASE_URL=/api/v1
```

---

## 16. Key Architectural Decisions

| Decision | Choice | Why |
|---|---|---|
| Opportunity types | Keep existing DB enum (LECTURE, CONTENT_COURSE_DEVELOPMENT, etc.) | Avoids migration; frontend maps to friendly labels |
| Organization type | VARCHAR(100) not ENUM | Easy to add new types without migrations |
| Array fields | PostgreSQL TEXT[] | delivery_modes, tags, skills_required, target_audience |
| Fee currency | INR only (₹) | MVP — multi-currency Phase 2 |
| Rich text | Plain textarea | MVP — Quill/TipTap Phase 2 |
| Opportunity creation | SUPER_ADMIN only | MVP — org self-posting Phase 2 |
| Apply flow | Disabled (Phase 2) | Out of scope this iteration |
| Bookmark | Phase 2 placeholder | No saved_opportunities table yet |
| Thumbnails | Auto-generated icon per type | No image upload needed |
| number_of_openings = 0 | Means "Unlimited" | Displayed as "Unlimited openings" |
| Profile completeness | Computed by backend at `/users/me/completion` | Single source of truth |
| Attachment storage | Local filesystem under `uploads/` | No S3 for WS 2012 R2 target |

---

## 17. Code Patterns to Follow

### Backend pattern — admin list endpoint with JOIN
```python
q = (
    db.query(ModelA, ModelB)
    .outerjoin(ModelB, ModelA.foreign_id == ModelB.id)
)
# Build response manually (don't use from_attributes when JOIN involved):
items = [Schema(field=row[0].field, joined_field=row[1].field) for row in rows]
```

### Backend pattern — auth dependency
```python
from app.dependencies.auth import get_current_user, require_super_admin

@router.get("")
def endpoint(current_user: Annotated[User, Depends(get_current_user)], ...):
    ...

@router.post("")  # admin only
def admin_endpoint(_: Annotated[User, Depends(require_super_admin)], ...):
    ...
```

### Backend pattern — SQLAlchemy ARRAY filter
```python
# Contains element:
q = q.filter(Opportunity.delivery_modes.any("Online"))
# Array text search:
from sqlalchemy import func
q = q.filter(func.array_to_string(Opportunity.tags, ",").ilike(f"%{term}%"))
```

### Frontend pattern — API client
```typescript
// src/api/someApi.ts
import apiClient from './client'

export const someApi = {
  list: (params = {}) => apiClient.get('/endpoint', { params }).then(r => r.data),
  get:  (id: string)  => apiClient.get(`/endpoint/${id}`).then(r => r.data),
  create: (data: Payload) => apiClient.post('/endpoint', data).then(r => r.data),
  update: (id: string, data: Partial<Payload>) => apiClient.put(`/endpoint/${id}`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/endpoint/${id}`).then(() => undefined),
}
```

### Frontend pattern — debounced search
```typescript
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

function handleSearchChange(value: string) {
  setSearchInput(value)
  if (debounceRef.current) clearTimeout(debounceRef.current)
  debounceRef.current = setTimeout(() => setSearch(value), 300)
}
```

### Frontend pattern — toast notifications
```typescript
const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

function showToast(msg: string, type: 'success' | 'error') {
  setToast({ msg, type })
  if (toastTimer.current) clearTimeout(toastTimer.current)
  toastTimer.current = setTimeout(() => setToast(null), 4000)
}
// Render:
// {toast && <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-white text-sm
//   ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>}
```

---

## 18. Tailwind CSS Conventions Used

```
Layout:     rounded-xl, shadow-sm, border border-slate-200
Cards:      bg-white rounded-xl border border-slate-100 shadow-sm p-5
            hover:shadow-md hover:border-blue-100 transition-all duration-200
Badges:     inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
Buttons:    px-4 py-2 text-sm font-medium rounded-lg transition-colors
            Primary:   bg-blue-600 text-white hover:bg-blue-500
            Secondary: border border-slate-200 text-slate-600 hover:bg-slate-50
            Danger:    bg-red-600 text-white hover:bg-red-500
            Ghost:     text-slate-500 hover:text-slate-700
Inputs:     w-full px-3 py-2 text-sm border border-slate-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
Chip tags:  px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md text-xs
Table rows: hover:bg-slate-50 transition-colors
Skeleton:   animate-pulse bg-slate-100 rounded
```

---

*Generated from full conversation context — K-CONNECT project, session ending 2026-09-20*
