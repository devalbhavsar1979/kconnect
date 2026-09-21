# Super Admin Panel — Design Documentation & Development Guide

**Project:** K-CONNECT  
**Feature:** Super Admin Role & Admin Panel  
**Version:** 1.0  
**Date:** 2026-09-17  
**Status:** Design-complete · Development not started

---

## Table of Contents

1. [Overview](#1-overview)
2. [Role Definition](#2-role-definition)
3. [Authentication & Access](#3-authentication--access)
4. [Admin Panel Layout](#4-admin-panel-layout)
5. [Sidebar Navigation Structure](#5-sidebar-navigation-structure)
6. [Top Header Bar](#6-top-header-bar)
7. [Admin Sections — Specification](#7-admin-sections--specification)
8. [Backend Requirements](#8-backend-requirements)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Super Admin Seed Script](#10-super-admin-seed-script)
11. [Access Control Rules](#11-access-control-rules)
12. [Step-by-Step Development Prompts](#12-step-by-step-development-prompts)
13. [Delivery Sequence Summary](#13-delivery-sequence-summary)
14. [Decisions & Open Questions](#14-decisions--open-questions)

---

## 1. Overview

The **Super Admin Panel** is a dedicated, fully separate interface for platform administrators. It provides complete visibility and control over all K-CONNECT entities: users, opportunities, organisations, sessions, content, and platform configuration.

### Key Principles

- **No public registration.** Super Admin accounts are provisioned exclusively via a backend seed script run on the server. There is no sign-up page, no invite flow, and no self-service.
- **Same login endpoint.** Super Admin uses the existing `/api/v1/auth/login` endpoint. The frontend detects the `SUPER_ADMIN` role post-login and redirects to the admin panel.
- **Separate UI shell.** The admin panel has its own layout (collapsible sidebar + header) completely independent of the regular user interface. Regular users cannot see or reach it.
- **Role-gated backend.** All admin API endpoints are protected by a `require_super_admin` FastAPI dependency. Any attempt to call them with a non-admin token returns `403 Forbidden`.
- **Reference UI.** The attached screenshot (`Post New Opportunity` step in the admin panel) defines the visual language: dark left sidebar, white content area, right-side preview pane, breadcrumb header, notification bell.

---

## 2. Role Definition

### Enum Value

A new value `SUPER_ADMIN` is added to the existing `UserType` enum.

```
UserType (existing + new):
  ADMIN                        ← existing (keep; used for org-level admins if needed)
  SUPER_ADMIN                  ← NEW — platform-level administrator
  SME
  PROFESSIONAL_SERVICE_PROVIDER
  VENDOR
  TRAINER
  FREELANCER
  CONSULTANT
```

### Super Admin Capabilities

| Capability | Description |
|---|---|
| View all users | List, search, filter every registered user regardless of type |
| Manage users | Activate / deactivate, verify, change user type, reset password |
| View all organisations | Full organisation list with details |
| Manage opportunities | Create, edit, publish, close, delete any opportunity |
| Manage applications | View and update application status across all opportunities |
| Manage categories | Create / edit / delete opportunity categories |
| Manage sessions | View and manage training sessions |
| Content management | Announcements, banners, static content |
| Communications | Platform-wide notifications, email broadcasts |
| Reports & Analytics | Aggregate dashboards: user growth, opportunity stats, engagement |
| Settings | Platform configuration, feature toggles |
| Support & Help | View and respond to support requests |

### What Super Admin Cannot Do (by design)

- Cannot register via the public signup page.
- Cannot appear in the regular user directory.
- Cannot apply to opportunities (not a participant role).
- Cannot be created from within the admin panel itself (chicken-and-egg protection — provisioned only via script).

---

## 3. Authentication & Access

### Login Flow

```
User visits /login
    │
    ▼
Submits credentials → POST /api/v1/auth/login
    │
    ▼
Backend returns JWT with user_type = "SUPER_ADMIN"
    │
    ▼
Frontend auth store reads user_type
    │
    ├── user_type === "SUPER_ADMIN"  →  redirect to /admin/dashboard
    │
    └── any other type              →  redirect to /dashboard (existing flow)
```

### Route Protection

| Route prefix | Guard | Redirect on fail |
|---|---|---|
| `/admin/*` | `AdminGuard` (requires `SUPER_ADMIN`) | `/login` |
| `/dashboard`, `/profile`, etc. | `AuthGuard` (any authenticated user) | `/login` |
| Regular users visiting `/admin/*` | Blocked by `AdminGuard` | `/` (home) |

### Token Behaviour

- Same JWT structure as existing users.
- Backend `require_super_admin` dependency checks `user.user_type == UserType.SUPER_ADMIN`.
- Refresh token flow is identical to existing implementation.

---

## 4. Admin Panel Layout

### Shell Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOP HEADER BAR                                                      │
│  [Page Title + Breadcrumb]          [🔔 Bell]  [Avatar  Name  ▼]    │
├─────────────────┬────────────────────────────────────────────────────┤
│  SIDEBAR        │  CONTENT AREA                                      │
│  (collapsible)  │                                                    │
│                 │  ┌──────────────────────────┐  ┌──────────────┐  │
│  [K Logo]       │  │  Main Content            │  │  Preview /   │  │
│  K-CONNECT      │  │  (forms, tables,         │  │  Side Panel  │  │
│  Admin Panel    │  │   dashboards, etc.)      │  │  (context-   │  │
│  ─────────────  │  │                          │  │   specific)  │  │
│  Dashboard      │  └──────────────────────────┘  └──────────────┘  │
│  User Mgmt  ▶   │                                                    │
│  Opportunities▶ │  Note: Side panel only shown on applicable pages   │
│  Sessions   ▶   │  (e.g. opportunity creation). Most pages are       │
│  Content    ▶   │  full-width content.                               │
│  Comms      ▶   │                                                    │
│  Analytics  ▶   │                                                    │
│  Settings   ▶   │                                                    │
│  Support    ▶   │                                                    │
│  ─────────────  │                                                    │
│  ⟵ Collapse     │                                                    │
└─────────────────┴────────────────────────────────────────────────────┘
```

### Layout Dimensions

| Element | Width (expanded) | Width (collapsed) |
|---|---|---|
| Sidebar | 220 px | 64 px (icons only) |
| Content area | Remaining viewport | Remaining viewport |
| Top header | Full width | Full width |
| Header height | 60 px | 60 px |

### Sidebar Collapse Behaviour

- "Collapse Menu" button at the bottom of the sidebar toggles collapsed state.
- Collapsed: shows icon only, no text labels.
- Sub-menu items hidden when collapsed; hovering a parent icon shows a tooltip with the label.
- Collapse state persisted in `localStorage`.

### Responsive

- On screens < 1024 px: sidebar overlays content (drawer mode), toggled by a hamburger button in the header.
- On screens ≥ 1024 px: sidebar is always visible (collapsible but not hidden).

---

## 5. Sidebar Navigation Structure

### Menu Items

```
Sidebar
│
├── Dashboard                               /admin/dashboard
│
├── User Management                         ▶ (expandable)
│   ├── All Users                           /admin/users
│   ├── Verification Requests               /admin/users/verification
│   └── Roles & Permissions                 /admin/users/roles
│
├── Opportunities                           ▶ (expandable)
│   ├── All Opportunities                   /admin/opportunities
│   ├── Post New Opportunity                /admin/opportunities/new
│   ├── Applications                        /admin/applications
│   ├── Categories                          /admin/categories
│   └── Organisations                       /admin/organisations
│
├── Sessions                                ▶ (expandable)
│   ├── All Sessions                        /admin/sessions
│   └── Session Requests                    /admin/sessions/requests
│
├── Content Management                      ▶ (expandable)
│   ├── Announcements                       /admin/content/announcements
│   ├── Banners                             /admin/content/banners
│   └── Static Pages                        /admin/content/pages
│
├── Communications                          ▶ (expandable)
│   ├── Notifications                       /admin/communications/notifications
│   └── Email Broadcasts                    /admin/communications/email
│
├── Reports & Analytics                     ▶ (expandable)
│   ├── Overview                            /admin/analytics
│   ├── User Reports                        /admin/analytics/users
│   └── Opportunity Reports                 /admin/analytics/opportunities
│
├── Settings                                ▶ (expandable)
│   ├── Platform Settings                   /admin/settings/platform
│   └── Admin Accounts                      /admin/settings/admins
│
└── Support & Help                          ▶ (expandable)
    ├── Support Requests                    /admin/support
    └── FAQs / Help Content                 /admin/support/faq
```

### Visual Design (from reference screenshot)

| Property | Value |
|---|---|
| Background | Dark navy `#0F172A` (slate-900) |
| Text (default) | Muted slate `#94A3B8` (slate-400) |
| Text (active) | White `#FFFFFF` |
| Active item bg | `#1E3A5F` (blue-900 tint) or blue-700 |
| Active indicator | Left 3 px blue border or full-row highlight |
| Icon size | 18 px |
| Item height | 44 px |
| Sub-item indent | 16 px left padding beyond icon |
| Separator | 1 px `#1E293B` (slate-800) between groups |
| Brand area | K icon (square, blue bg) + "K-CONNECT" bold white + "Admin Panel" small slate-400 |

---

## 6. Top Header Bar

### Elements (left → right)

```
[Page Title]  [Breadcrumb trail]                [🔔 Badge]  [Avatar  Full Name  Role  ▼]
```

| Element | Description |
|---|---|
| Page title | Current page name in bold (e.g. "Post New Opportunity") |
| Breadcrumb | `Dashboard > Opportunities > Post New Opportunity` — each segment clickable |
| Notification bell | Icon with unread count badge (red dot or number) |
| User chip | Circular avatar initials + "Admin User" + "Super Admin" subtitle + dropdown chevron |

### Header Dropdown Menu

On clicking the user chip:

```
┌──────────────────────┐
│ 👤 Admin User         │
│    Super Admin        │
├──────────────────────┤
│ Profile Settings     │
│ Change Password      │
├──────────────────────┤
│ Logout               │
└──────────────────────┘
```

### Visual Design

| Property | Value |
|---|---|
| Background | White `#FFFFFF` |
| Border-bottom | 1 px `#E2E8F0` (slate-200) |
| Height | 60 px |
| Shadow | `shadow-sm` |

---

## 7. Admin Sections — Specification

### 7a. Dashboard — `/admin/dashboard`

> **Placeholder for now.** Full design to be provided separately.

Placeholder content: "Admin Dashboard — coming soon" centred in content area. Same layout shell (sidebar + header) applies.

Key widgets to be designed later:
- Total users (by type)
- Active opportunities
- Applications this week
- Pending verifications
- Recent activity feed
- Revenue / engagement metrics (TBD)

---

### 7b. User Management — `/admin/users`

**Purpose:** View and manage all registered users.

**List page columns:**

| Column | Notes |
|---|---|
| Name | First + Last, with avatar initials chip |
| Email | |
| User Type | Pill badge (SME, Trainer, etc.) |
| Status | Active / Inactive chip |
| Verified | Yes / No chip |
| Joined | Date |
| Actions | View · Edit · Activate/Deactivate |

**Filters:** User Type, Status (Active/Inactive), Verified (Yes/No), Date range.

**Search:** By name or email.

**User detail / edit drawer:**
- View all profile fields (read-only display)
- Edit: User Type, Active status, Verified flag
- Reset password (generates temp password, emails user)
- View linked organisations, opportunities applied to

---

### 7c. Opportunities — `/admin/opportunities`

**Purpose:** Full CRUD on all opportunities across all organisations.

**List page columns:**

| Column | Notes |
|---|---|
| Title | Linked to detail |
| Organisation | |
| Type | TRAINING, SME, etc. |
| Status | DRAFT · OPEN · CLOSED · CANCELLED |
| Applications | Count |
| Created | Date |
| Actions | Edit · Close · Delete |

**Post New Opportunity:** Multi-step wizard (5 steps as per reference screenshot):
1. Basic Information
2. Details (description, objectives, outcomes, audience, session structure)
3. Requirements (skills, experience, qualifications)
4. Additional Information (budget, timeline, location, travel)
5. Review & Publish

Each step has a right-side **Preview** panel showing how the opportunity will appear to applicants.

---

### 7d. Applications — `/admin/applications`

**Purpose:** View all applications across all opportunities.

**Columns:** Applicant Name · Opportunity Title · Organisation · Applied Date · Status · Actions (View · Update Status).

**Status update:** Inline dropdown or drawer — APPLIED → UNDER_REVIEW → SHORTLISTED → REJECTED / SELECTED.

---

### 7e. Categories — `/admin/categories`

**Purpose:** Manage opportunity categories / tags.

Simple CRUD list:
- Name, Description, Active toggle
- Add / Edit inline or in a small modal
- Delete with confirmation

---

### 7f. Organisations — `/admin/organisations`

**Purpose:** View and manage all registered organisations.

**Columns:** Name · Type · City · Country · Created By · Status · Actions.

**Detail/Edit:** Organisation profile fields, linked opportunities count.

---

### 7g. Sessions — `/admin/sessions`

> Design to be detailed separately.

Placeholder. Will show all training sessions, ability to view details and manage status.

---

### 7h. Content Management — `/admin/content`

> Design to be detailed separately.

Placeholder. Announcements, banners, static pages.

---

### 7i. Communications — `/admin/communications`

> Design to be detailed separately.

Placeholder. Platform-wide push notifications, email broadcast composer.

---

### 7j. Reports & Analytics — `/admin/analytics`

> Design to be detailed separately.

Placeholder. Summary stats cards + charts.

---

### 7k. Settings — `/admin/settings`

**Platform Settings:**
- Site name, contact email, support email
- Feature toggles (e.g. public registration enabled/disabled)
- Maintenance mode switch

**Admin Accounts (`/admin/settings/admins`):**
- List of all Super Admin accounts (email, created date, last login, status)
- Deactivate existing admin (cannot delete the last active admin)
- Note: New admins are still created via backend script, not from this UI — this page is view-only with deactivation only

---

### 7l. Support & Help — `/admin/support`

> Design to be detailed separately.

Placeholder. Incoming support requests from users, FAQ management.

---

## 8. Backend Requirements

### 8a. Model Change — UserType Enum

Add `SUPER_ADMIN` to the `UserType` enum in `backend/app/models/user.py` and a corresponding Alembic migration.

```python
class UserType(str, PyEnum):
    SUPER_ADMIN = "SUPER_ADMIN"    # ← NEW
    ADMIN       = "ADMIN"
    SME         = "SME"
    ...
```

### 8b. New Alembic Migration

**`011_add_super_admin_usertype.py`**

```
ALTER TYPE usertype ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
```

(Same safe pattern as `010_add_gender_other.py`)

### 8c. New Dependency — `require_super_admin`

**`backend/app/dependencies/auth.py`** (add alongside existing `get_current_user`):

```python
async def require_super_admin(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    if current_user.user_type != UserType.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user
```

### 8d. New API Router Group — `/api/v1/admin/`

All admin endpoints live under this prefix. Each sub-section gets its own router file:

```
backend/app/api/v1/admin/
├── __init__.py
├── users.py           # GET /admin/users, GET /admin/users/{id}, PATCH /admin/users/{id}
├── opportunities.py   # Full CRUD — wraps existing opportunity logic
├── applications.py    # GET list + PATCH status
├── categories.py      # CRUD
├── organisations.py   # GET list + PATCH
└── dashboard.py       # GET /admin/dashboard/stats
```

All routes in these files use `require_super_admin` as a dependency.

### 8e. New Schemas

```
backend/app/schemas/admin/
├── __init__.py
├── users.py           # AdminUserResponse, AdminUserUpdate
├── dashboard.py       # DashboardStats
├── categories.py      # CategoryCreate, CategoryResponse
└── organisations.py   # AdminOrgResponse
```

### 8f. main.py Registration

```python
from app.api.v1.admin import users as admin_users
from app.api.v1.admin import dashboard as admin_dashboard
# ... etc.

app.include_router(admin_dashboard.router,  prefix="/api/v1/admin/dashboard",       tags=["Admin"])
app.include_router(admin_users.router,      prefix="/api/v1/admin/users",           tags=["Admin"])
# ... etc.
```

---

## 9. Frontend Architecture

### New Feature Folder

```
frontend/src/features/admin/
├── components/
│   ├── AdminLayout.tsx            # Shell: sidebar + header + <Outlet>
│   ├── AdminSidebar.tsx           # Collapsible sidebar with nav items
│   ├── AdminHeader.tsx            # Top bar: breadcrumb + bell + user chip
│   ├── AdminNavItem.tsx           # Single nav item (icon + label + sub-items)
│   └── AdminGuard.tsx             # Route guard: redirects non-super-admins
├── pages/
│   ├── AdminDashboardPage.tsx     # /admin/dashboard — placeholder
│   ├── UsersPage.tsx              # /admin/users
│   ├── UserDetailPage.tsx         # /admin/users/:id
│   ├── OpportunitiesPage.tsx      # /admin/opportunities
│   ├── PostOpportunityPage.tsx    # /admin/opportunities/new (multi-step wizard)
│   ├── ApplicationsPage.tsx       # /admin/applications
│   ├── CategoriesPage.tsx         # /admin/categories
│   ├── OrganisationsPage.tsx      # /admin/organisations
│   ├── AnalyticsPage.tsx          # /admin/analytics — placeholder
│   └── SettingsPage.tsx           # /admin/settings
└── api/
    ├── adminUsersApi.ts
    ├── adminOpportunitiesApi.ts
    ├── adminApplicationsApi.ts
    ├── adminCategoriesApi.ts
    └── adminDashboardApi.ts
```

### New Types

```
frontend/src/types/admin.ts
```

Holds `AdminUser`, `AdminUserUpdate`, `DashboardStats`, `Category`, `AdminOrganisation`, etc.

### Routing

```
/admin/*           →  AdminGuard → AdminLayout
  /admin/dashboard                → AdminDashboardPage
  /admin/users                    → UsersPage
  /admin/users/:id                → UserDetailPage
  /admin/opportunities            → OpportunitiesPage
  /admin/opportunities/new        → PostOpportunityPage
  /admin/applications             → ApplicationsPage
  /admin/categories               → CategoriesPage
  /admin/organisations            → OrganisationsPage
  /admin/analytics                → AnalyticsPage
  /admin/settings/*               → SettingsPage
```

**`AdminGuard` logic:**

```tsx
function AdminGuard() {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.user_type !== 'SUPER_ADMIN') return <Navigate to="/" replace />
  return <Outlet />
}
```

### Auth Store Change

After login, `authStore` already stores `user_type`. The login success handler in the existing auth flow needs one additional branch:

```ts
if (user.user_type === 'SUPER_ADMIN') {
  navigate('/admin/dashboard')
} else {
  navigate('/dashboard')
}
```

No other changes to auth flow needed.

---

## 10. Super Admin Seed Script

### Location

```
backend/scripts/create_super_admin.py
```

### Usage

```bash
# Run once on the server (inside the backend virtualenv):
python backend/scripts/create_super_admin.py \
  --email admin@kconnect.in \
  --password "ChangeMe!2026"
```

### Script Behaviour

1. Connects to the database using the same config as the app.
2. Checks if an account with that email already exists.
   - If yes: prints warning, exits without creating a duplicate.
3. Hashes the password with bcrypt (same passlib context as the app).
4. Creates a `User` record with `user_type = SUPER_ADMIN`, `is_active = True`, `is_verified = True`.
5. Prints confirmation: "Super admin created: admin@kconnect.in".

### Script — Pseudo-structure

```python
# backend/scripts/create_super_admin.py
import argparse
import sys
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserType, ProfileStatus

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--email",    required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--first-name", default="Super")
    parser.add_argument("--last-name",  default="Admin")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == args.email).first()
        if existing:
            print(f"[WARN] Account already exists: {args.email}")
            sys.exit(0)

        admin = User(
            first_name     = args.first_name,
            last_name      = args.last_name,
            email          = args.email,
            password_hash  = get_password_hash(args.password),
            user_type      = UserType.SUPER_ADMIN,
            profile_status = ProfileStatus.COMPLETE,
            is_active      = True,
            is_verified    = True,
            consent        = True,
        )
        db.add(admin)
        db.commit()
        print(f"[OK] Super admin created: {args.email}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
```

---

## 11. Access Control Rules

| Action | Super Admin | Regular User |
|---|---|---|
| Access `/admin/*` routes | ✅ | ❌ (redirected to `/`) |
| Call `/api/v1/admin/*` endpoints | ✅ | ❌ (403) |
| Access `/api/v1/users/me/*` | ✅ (is a user) | ✅ |
| View own profile at `/profile` | ✅ | ✅ |
| Appear in user-facing search | ❌ (filtered out) | ✅ |
| Apply to opportunities | ❌ (by UI convention) | ✅ |
| Post opportunities (admin route) | ✅ | ❌ |

### Filtering Super Admin from Public APIs

Any existing endpoint that lists users publicly (e.g. user search, org member lists) must exclude `SUPER_ADMIN` users:

```python
.filter(User.user_type != UserType.SUPER_ADMIN)
```

---

## 12. Step-by-Step Development Prompts

> Each prompt is a discrete, testable unit of work. Execute in order.

---

### SECTION 1 — Backend Foundation

---

#### PROMPT 1 — Migration: Add SUPER_ADMIN to UserType

**File:** `backend/alembic/versions/011_add_super_admin_usertype.py`

**Task:** Create a migration that adds `SUPER_ADMIN` to the `usertype` PostgreSQL enum.

```python
def upgrade() -> None:
    op.execute("ALTER TYPE usertype ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'")
def downgrade() -> None:
    pass  # PostgreSQL does not support removing enum values
```

**Verify:** Run `alembic upgrade head`. No error.

---

#### PROMPT 2 — Model: Add SUPER_ADMIN to UserType enum

**File:** `backend/app/models/user.py`

**Task:** Add `SUPER_ADMIN = "SUPER_ADMIN"` as the first entry in `class UserType`.

**Verify:** Backend restarts without import errors.

---

#### PROMPT 3 — Dependency: require_super_admin

**File:** `backend/app/dependencies/auth.py`

**Task:** Add `require_super_admin` async dependency below `get_current_user`. Raises `HTTP 403` if `user.user_type != UserType.SUPER_ADMIN`.

**Verify:** Write a manual curl test calling a protected endpoint with a regular user token — must return 403.

---

#### PROMPT 4 — Seed Script: create_super_admin.py

**File:** `backend/scripts/create_super_admin.py`

**Task:** Implement the full seed script as specified in §10. Accept `--email`, `--password`, `--first-name`, `--last-name` args.

**Verify:** Run script once → account created. Run again with same email → warns, no duplicate.

---

#### PROMPT 5 — Admin API: Dashboard Stats

**Files:** `backend/app/api/v1/admin/dashboard.py`, `backend/app/schemas/admin/dashboard.py`

**Task:**
- Schema: `DashboardStats` with fields: `total_users: int`, `active_users: int`, `total_opportunities: int`, `open_opportunities: int`, `total_applications: int`, `pending_verifications: int`
- Endpoint: `GET /api/v1/admin/dashboard/stats` → returns `DashboardStats`
- Uses `require_super_admin` dependency
- Queries are simple counts from existing tables

**Register in `main.py`.**

---

#### PROMPT 6 — Admin API: Users

**Files:** `backend/app/api/v1/admin/users.py`, `backend/app/schemas/admin/users.py`

**Task:**
- `GET /api/v1/admin/users` — paginated list with optional filters: `user_type`, `is_active`, `is_verified`, `search` (name or email)
  - Excludes `SUPER_ADMIN` accounts from results
- `GET /api/v1/admin/users/{user_id}` — full user detail
- `PATCH /api/v1/admin/users/{user_id}` — update `user_type`, `is_active`, `is_verified` only

Schemas: `AdminUserResponse` (all user fields), `AdminUserUpdate` (`user_type?`, `is_active?`, `is_verified?`).

**Register in `main.py`.**

---

#### PROMPT 7 — Admin API: Organisations

**Files:** `backend/app/api/v1/admin/organisations.py`, `backend/app/schemas/admin/organisations.py`

**Task:**
- `GET /api/v1/admin/organisations` — paginated list; optional `search` filter on name/city
- `GET /api/v1/admin/organisations/{org_id}` — full detail

Schema: `AdminOrgResponse` (all org fields + `opportunity_count: int`).

**Register in `main.py`.**

---

#### PROMPT 8 — Admin API: Categories

**Files:** `backend/app/api/v1/admin/categories.py`, `backend/app/schemas/admin/categories.py`, new model `backend/app/models/category.py`, migration `012_add_categories.py`

**Task:**
- New `categories` table: `id (UUID PK)`, `name VARCHAR(100) UNIQUE NOT NULL`, `description TEXT`, `is_active BOOLEAN DEFAULT TRUE`, `created_at`, `updated_at`
- Full CRUD: `GET /`, `POST /`, `PUT /{id}`, `DELETE /{id}`
- Delete: soft-delete (set `is_active = False`) rather than hard delete

---

### SECTION 2 — Frontend Foundation

---

#### PROMPT 9 — Frontend: Admin Types

**File:** `frontend/src/types/admin.ts`

**Task:** Define all admin-specific TypeScript interfaces:
- `AdminUser` (extends `User` with no extra fields — same shape, separate named type for clarity)
- `AdminUserUpdate { user_type?: UserType; is_active?: boolean; is_verified?: boolean }`
- `DashboardStats`
- `Category { id, name, description, is_active, created_at, updated_at }`
- `CategoryPayload { name, description?, is_active? }`
- `AdminOrganisation` (same as `Organisation` + `opportunity_count: number`)
- `PaginatedAdminUsers`, `PaginatedAdminOrgs` (reuse `PaginatedResponse<T>` from existing types)

---

#### PROMPT 10 — Frontend: Admin API Layer

**Files:**
- `frontend/src/api/adminUsersApi.ts`
- `frontend/src/api/adminOrgsApi.ts`
- `frontend/src/api/adminCategoriesApi.ts`
- `frontend/src/api/adminDashboardApi.ts`

**Task:** Implement all API functions wrapping the endpoints from Prompts 5–8. Use existing `axiosInstance` (handles JWT automatically).

---

#### PROMPT 11 — Frontend: AdminGuard + Router Wiring

**Files:** `frontend/src/features/admin/components/AdminGuard.tsx`, `frontend/src/router/` (update)

**Task:**
- `AdminGuard`: checks `user?.user_type === 'SUPER_ADMIN'` from `useAuthStore`. Redirects to `/login` if no user, `/` if wrong role.
- Wire all `/admin/*` routes under `AdminGuard` → `AdminLayout` → individual page components (all initially rendering a `<PlaceholderPage title="..." />` component).
- Update login success handler in auth flow: if `user_type === 'SUPER_ADMIN'` → navigate to `/admin/dashboard`.

---

#### PROMPT 12 — Frontend: Admin Sidebar

**File:** `frontend/src/features/admin/components/AdminSidebar.tsx`

**Task:** Full sidebar component.
- Dark navy background (`bg-slate-900`)
- Brand area: K icon (blue square) + "K-CONNECT" + "Admin Panel"
- Nav items from §5 with icons (Lucide), labels, expand/collapse chevrons for groups
- `activeItem` highlighted with blue-700 bg + white text
- `isCollapsed` state: when collapsed, show icons only, 64 px width
- "Collapse Menu" toggle at bottom
- Persist collapse state in `localStorage`
- Sub-menus expand inline (accordion style) when parent is clicked
- Active state derived from `useLocation()` pathname

---

#### PROMPT 13 — Frontend: Admin Header

**File:** `frontend/src/features/admin/components/AdminHeader.tsx`

**Task:** Top header bar.
- Left: breadcrumb — derive from current pathname segments, each segment capitalised, linked
- Right: notification bell (static count badge for now — `0`), user chip (initials avatar + "Admin User" + "Super Admin" + dropdown chevron)
- Dropdown menu: Profile Settings, Change Password, separator, Logout (calls `authStore.logout()` + navigate to `/login`)
- Height 60 px, white bg, bottom border, shadow-sm

---

#### PROMPT 14 — Frontend: AdminLayout

**File:** `frontend/src/features/admin/components/AdminLayout.tsx`

**Task:** Shell component. Composes `AdminSidebar` + `AdminHeader` + `<Outlet />`.
- Sidebar on left (fixed height, scroll independently)
- Header fixed at top
- Content area fills remaining space, scrollable
- On mobile (< 1024 px): sidebar is a drawer, toggled by hamburger in header

---

#### PROMPT 15 — Frontend: Admin Dashboard Page (Placeholder)

**File:** `frontend/src/features/admin/pages/AdminDashboardPage.tsx`

**Task:** Dashboard page shell with the `AdminLayout` wired. Content: a 2×3 grid of stat cards using `DashboardStats` data from `adminDashboardApi.getStats()`. Each card: icon + label + big number. Loading skeletons while fetching.

Stats cards:
1. Total Users
2. Active Users
3. Total Opportunities
4. Open Opportunities
5. Total Applications
6. Pending Verifications

---

#### PROMPT 16 — Frontend: Users List Page

**File:** `frontend/src/features/admin/pages/UsersPage.tsx`

**Task:** Paginated user list table.
- Top bar: "Users" title + search input + filter dropdowns (User Type, Status, Verified)
- Table columns as per §7b
- Pagination controls (Prev / Page X of Y / Next)
- Row action: "Edit" opens inline drawer (`UserEditDrawer`) with `AdminUserUpdate` fields
- Status chips: Active = green, Inactive = red; Verified = blue badge

---

#### PROMPT 17 — Frontend: Categories Page

**File:** `frontend/src/features/admin/pages/CategoriesPage.tsx`

**Task:** Simple CRUD page.
- List of categories with Name, Description, Active toggle, Edit/Delete actions
- "Add Category" button → small modal with Name (required) + Description + Active checkbox
- Edit: same modal pre-filled
- Delete: confirmation modal
- Active toggle: immediate PATCH call on toggle

---

### SECTION 3 — Remaining Pages (Placeholders → Full Implementation Later)

---

#### PROMPT 18 — Placeholder Pages

**Task:** Create simple placeholder page components for all remaining routes:
- `OpportunitiesPage`, `ApplicationsPage`, `OrganisationsPage`, `AnalyticsPage`, `SettingsPage`, `SessionsPage`

Each renders within `AdminLayout` and shows a centred card with the section icon, title, and "Coming soon" message — same pattern as the existing `PlaceholderPage` component.

---

## 13. Delivery Sequence Summary

| Step | Prompt | Layer | Description |
|---|---|---|---|
| 1 | P1 | DB | Migration 011 — SUPER_ADMIN enum value |
| 2 | P2 | Backend | UserType model update |
| 3 | P3 | Backend | require_super_admin dependency |
| 4 | P4 | Backend | Seed script |
| 5 | P5 | Backend | Admin dashboard stats API |
| 6 | P6 | Backend | Admin users API |
| 7 | P7 | Backend | Admin organisations API |
| 8 | P8 | Backend | Categories model + migration + API |
| 9 | P9 | Frontend | Admin TypeScript types |
| 10 | P10 | Frontend | Admin API layer |
| 11 | P11 | Frontend | AdminGuard + router |
| 12 | P12 | Frontend | AdminSidebar |
| 13 | P13 | Frontend | AdminHeader |
| 14 | P14 | Frontend | AdminLayout |
| 15 | P15 | Frontend | Dashboard page |
| 16 | P16 | Frontend | Users list page |
| 17 | P17 | Frontend | Categories page |
| 18 | P18 | Frontend | Placeholder pages for remaining sections |

**Total prompts: 18**

---

## 14. Decisions & Open Questions

| # | Topic | Decision / Status |
|---|---|---|
| 1 | Super Admin creation method | Backend script only — no UI creation. ✅ Decided |
| 2 | Separate login page for admin | No — same `/login` page, role detected post-login. ✅ Decided |
| 3 | SUPER_ADMIN vs separate `is_super_admin` flag | Use `UserType.SUPER_ADMIN` to stay consistent with existing role model. ✅ Decided |
| 4 | Admin URL prefix | `/admin/*` for frontend; `/api/v1/admin/*` for backend. ✅ Decided |
| 5 | Multiple Super Admins | Supported — script can be run multiple times with different emails. ✅ Decided |
| 6 | Opportunity posting from admin | Admin uses same opportunity creation logic; wizard reused or adapted. ⏳ Pending full design |
| 7 | Dashboard widgets | Placeholder for now; full design to be provided separately. ⏳ Pending |
| 8 | Sessions management design | Placeholder; full design pending. ⏳ Pending |
| 9 | Communications (email broadcast) design | Placeholder; full design pending. ⏳ Pending |
| 10 | Analytics / Reports design | Placeholder; full design pending. ⏳ Pending |
| 11 | Admin password reset UI | Change Password in header dropdown (calls existing `/auth/change-password`). ⏳ Pending confirmation |
| 12 | Notifications (bell icon) | Static badge for now; real-time via polling or WebSocket TBD. ⏳ Pending |
