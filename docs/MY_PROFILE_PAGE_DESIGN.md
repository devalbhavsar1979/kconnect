# My Profile Page — Design Documentation & Development Guide

**Project:** K-CONNECT  
**Page:** My Profile (`/profile`)  
**Version:** 1.0  
**Date:** 2026-09-14  
**Status:** Design-complete · Development not started

---

## Table of Contents

1. [Overview](#1-overview)
2. [Page Architecture](#2-page-architecture)
3. [Component Inventory](#3-component-inventory)
4. [Profile Header — Field Mapping](#4-profile-header--field-mapping)
5. [Tab Sections — Content Map](#5-tab-sections--content-map)
6. [Personal Information — Attribute Specification](#6-personal-information--attribute-specification)
7. [Backend Requirements](#7-backend-requirements)
8. [Edit UX Pattern](#8-edit-ux-pattern)
9. [Future Sections — Pending Attribute PDFs](#9-future-sections--pending-attribute-pdfs)
10. [Step-by-Step Development Prompts](#10-step-by-step-development-prompts)
11. [Delivery Sequence Summary](#11-delivery-sequence-summary)
12. [Decisions & Open Questions](#12-decisions--open-questions)

---

## 1. Overview

The **My Profile** page is the central identity page for every K-CONNECT user. It presents a read-only display of all profile attributes grouped into thematic tabs. Each section has its own dedicated **Edit** entry point (button, link, or inline control) that opens a drawer, modal, or sub-page for editing.

### Design Reference

UI screenshot provided (Arun Sharma — Faculty profile).  
Attribute specification provided for **Personal Information** section via PDF (`Profile-Attribute.xlsx - Profile-Attributes.pdf`).  
Attribute specifications for remaining sections to be provided separately.

### Key Principles

- **Display-first:** The profile page shows data, not forms. Editing happens in context-specific drawers or modals.
- **Progressive completion:** A Profile Completion card drives users to fill in missing fields.
- **Responsive:** 3-column desktop layout collapses to single-column on mobile.
- **Section-by-section delivery:** Each tab is built independently and wired into the same page container.

---

## 2. Page Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  PROFILE HEADER                                                 │
│  [Photo] [Name + Verified] [Role Tag] [Tagline] [Location]      │
│          [Skills Pills]               [Contact: Email/Ph/Web/LI]│
│                                        [Profile Completion Card]│
├─────────────────────────────────────────────────────────────────┤
│  TAB BAR                                                        │
│  Overview | Academic Details | Experience | Expertise & Skills  │
│  | Documents | Availability | Reviews & Ratings                 │
├───────────────────┬──────────────────────┬──────────────────────┤
│  LEFT COLUMN      │  CENTRE COLUMN       │  RIGHT COLUMN        │
│  (3 / 10)         │  (4 / 10)            │  (3 / 10)            │
│                   │                      │                      │
│  Personal Info    │  Expertise / Skills  │  Documents           │
│  Bio              │  Experience Summary  │  Availability Prefs  │
│                   │  Training Topics     │                      │
└───────────────────┴──────────────────────┴──────────────────────┘
```

> The 3-column grid applies only to the **Overview** tab.  
> All other tabs use a full-width single or 2-column layout (to be defined per section).

### Route

| Property | Value |
|---|---|
| Path | `/profile` |
| Auth | Protected (logged-in user only) |
| Shows | Own profile data |
| Layout wrapper | `MainLayout` (existing) |

### Column Proportions (Tailwind)

```
Left   : col-span-3   (30%)
Centre : col-span-4   (40%)
Right  : col-span-3   (30%)
Mobile : col-span-12  (100%, stacked: Centre → Left → Right)
```

---

## 3. Component Inventory

### Display Components

| Component | File (target path) | Responsibility |
|---|---|---|
| `ProfileHeader` | `features/profile/components/ProfileHeader.tsx` | Photo, name, role, contact info strip |
| `ProfileCompletionCard` | `features/profile/components/ProfileCompletionCard.tsx` | Circular progress, completion %, CTA buttons |
| `ProfileTabBar` | `features/profile/components/ProfileTabBar.tsx` | 7 tabs, active underline, scrollable on mobile |
| `PersonalInfoCard` | `features/profile/components/PersonalInfoCard.tsx` | Label:Value table for personal attributes |
| `BioCard` | `features/profile/components/BioCard.tsx` | Short bio paragraph + Edit Bio link |
| `ExpertiseSkillsCard` | `features/profile/components/ExpertiseSkillsCard.tsx` | Primary / Secondary / Other skill tags *(future)* |
| `ExperienceSummaryCard` | `features/profile/components/ExperienceSummaryCard.tsx` | 4 stat tiles (Teaching, Corporate, Online, Classroom) *(future)* |
| `TrainingTopicsCard` | `features/profile/components/TrainingTopicsCard.tsx` | Topic tag cloud + View All *(future)* |
| `DocumentsCard` | `features/profile/components/DocumentsCard.tsx` | File list with view/download + Upload CTA *(future)* |
| `AvailabilityPreviewCard` | `features/profile/components/AvailabilityPreviewCard.tsx` | Availability summary (Travel, Mode, Audience) *(future)* |

### Edit Components

| Component | File (target path) | Triggers |
|---|---|---|
| `EditPersonalInfoDrawer` | `features/profile/components/EditPersonalInfoDrawer.tsx` | "Edit Information" button in PersonalInfoCard |
| `EditBioDrawer` | `features/profile/components/EditBioDrawer.tsx` | "Edit Bio" link in BioCard |
| Photo upload | Inline in `ProfileHeader` | Camera icon overlay on avatar |

### Page Container

| Component | File (target path) |
|---|---|
| `MyProfilePage` | `features/profile/MyProfilePage.tsx` |

---

## 4. Profile Header — Field Mapping

| UI Element | Source Field | Rules |
|---|---|---|
| Avatar / photo | `profile_photo_path` | Fallback: initials circle (gradient blue→violet) |
| Camera overlay | — | Clicking opens file picker; triggers photo upload API |
| Full name | `first_name` + `last_name` | — |
| Blue verified tick | `is_verified` | Only shown when `true` |
| Role tag pill | `role` / `user_type` | "SME" or "Professional Service Provider" |
| Tagline | `title` + `designation` + `company` | Pipe-separated; skip null parts |
| Location | `address_city`, `address_state`, `address_country` | Comma-separated; skip nulls; prefix with map pin icon |
| Skill pills | Expertise section (future) | Show max 4 tags + "+N more" chip |
| Email | `email` | mailto: link |
| Phone | `mobile` | Display with `+91 ` prefix |
| Website | `website` | External link, open in new tab |
| LinkedIn | `linkedin` | External link, open in new tab |

---

## 5. Tab Sections — Content Map

### Tab 1 — Overview

Three-column grid. Summarises the most important data from all other tabs.

**Left column**
- `PersonalInfoCard` — Role, Gender, Title, Designation, Company, Location, DOB
- `BioCard` — `short_bio` text

**Centre column**
- `ExpertiseSkillsCard` — Primary / Secondary / Other skills *(attributes: Expertise & Skills PDF)*
- `ExperienceSummaryCard` — 4 stat tiles *(attributes: Experience PDF)*
- `TrainingTopicsCard` — Topics list *(attributes: Expertise & Skills PDF)*

**Right column**
- `DocumentsCard` — Uploaded file list *(attributes: Documents PDF)*
- `AvailabilityPreviewCard` — Key availability fields *(attributes: Availability PDF)*

---

### Tab 2 — Academic Details *(attributes pending)*

Full-width or 2-column layout.  
Expected content: qualifications, institutions, years, certificates.  
Likely a **1:many** relationship (multiple academic entries per user).

---

### Tab 3 — Experience *(attributes pending)*

Full-width timeline or card list.  
Expected content: work history entries (role, company, duration, description).  
Likely a **1:many** relationship.

---

### Tab 4 — Expertise & Skills *(attributes pending)*

Full-width tag-based layout.  
Expected content: Primary expertise, secondary expertise, other skills, training topics.  
Likely stored as **JSON array** or junction table.

---

### Tab 5 — Documents *(attributes pending)*

Full-width file manager layout.  
Expected content: CV, certifications, academic certificates, training credentials.  
Likely a **separate `documents` table** (1:many, user_id FK).  
CV already partially handled via `cv_file_path` on users table.

---

### Tab 6 — Availability *(attributes pending)*

Full-width form-like display.  
Expected content: willing to travel, delivery modes, geographic preference, audience type, max travel distance, calendar slots.

---

### Tab 7 — Reviews & Ratings *(attributes pending)*

Full-width review list.  
Reviews are written **by other users / organisations**, not by the profile owner.  
Requires a **separate `reviews` table** with FK to reviewer and reviewee.

---

## 6. Personal Information — Attribute Specification

**Source:** `Profile-Attribute.xlsx - Profile-Attributes.pdf`  
**Section:** Personal Information  
**Tab:** Overview (left column) + Profile Header

| # | Field Name | Label | Control | Data Type | Options | Required | Validation | Default | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `first_name` | First Name | Text input | `string(50)` | — | Yes | Non-blank | — | Already in DB |
| 2 | `last_name` | Last Name | Text input | `string(50)` | — | Yes | Non-blank | — | Already in DB |
| 3 | `profile_photo` | Photo | File upload | `file` | — | No | jpg/png ≤ 2 MB | — | Store path in `profile_photo_path` |
| 4 | `role` | Role | Radio button | `enum` | SME - Subject Matter Expert; Professional Service Provider | Yes | — | — | Maps to `user_type`; already in DB |
| 5 | `title` | Title | Radio button | `enum` | Mr.; Mrs.; Miss; Dr.; Prof. | Yes | — | — | New column needed |
| 6 | `gender` | Gender | Radio button | `enum` | Male; Female; Prefer not to say | Yes | — | — | New column needed |
| 7 | `email` | Email | Text input | `string(100)` | — | Yes | Email format; unique | — | Already in DB; change via separate security flow |
| 8 | `mobile` | Mobile | Text input | `string(10)` | — | Yes | 10 digits | — | Already in DB; display with `+91` prefix |
| 9 | `website` | Website | Text input | `string(100)` | — | Yes | URL format | — | New column needed |
| 10 | `linkedin` | LinkedIn | Text input | `string(100)` | — | Yes | URL format | — | New column needed |
| 11 | `dob` | Date of Birth | Date picker | `date` | — | Yes | Age ≥ 21 | — | Already in DB as `date_of_birth` |
| 12 | `company` | Company / Academy | Text input | `string(100)` | — | Yes | — | — | New column needed |
| 13 | `designation` | Designation | Dropdown | `enum` | Professor; Asst. Professor; Trainer; Guest Faculty | Yes | — | — | New column + enum needed |
| 14 | `short_bio` | Short Bio | Textarea | `text` | — | Yes | Max 500 chars | — | New column needed |
| 15 | `address_flat` | Flat / House / Building Name | Text input | `string(200)` | — | No | — | — | New column needed |
| 16 | `address_area` | Area | Text input | `string(200)` | — | No | — | — | New column needed |
| 17 | `address_city` | City | Text input | `string(100)` | — | No | — | — | New column needed |
| 18 | `address_state` | State | Text input | `string(100)` | — | No | — | — | New column needed |
| 19 | `address_country` | Country | Text input | `string(100)` | — | No | — | — | New column needed |
| 20 | `address_pincode` | Pincode | Text input | `string(6)` | — | No | 6 digits | — | New column needed |
| 21 | `is_active` | Active | Toggle | `boolean` | — | Yes | — | `TRUE` | Already in DB |
| 22 | `consent` | Consent | Checkbox | `boolean` | — | No | — | `FALSE` | New column needed |

### Fields Already in Database

| Field | DB Column | Notes |
|---|---|---|
| `first_name` | `users.first_name` | Added at registration |
| `last_name` | `users.last_name` | Added at registration |
| `email` | `users.email` | Unique; change via security flow |
| `mobile` | `users.mobile_number` | Added at registration |
| `dob` | `users.date_of_birth` | Added in migration 002 |
| `role` | `users.user_type` | `SME` or `PROFESSIONAL_SERVICE_PROVIDER` |
| `is_active` | `users.is_active` | Defaults to `TRUE` |
| `cv_file_path` | `users.cv_file_path` | Added in migration 002 |

---

## 6b. Academic Details — Attribute Specification

**Section:** Academic Details
**Tab:** Academic Details (Tab 2)
**Relationship:** 1:many — multiple entries per user
**New Table Required:** `academic_details`

| # | Field Name | Label | Control | Data Type | Required | Validation | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `school` | School / Institution | Text input | `string(200)` | Yes | Non-blank | University, college, or school name |
| 2 | `degree` | Degree | Text input | `string(200)` | Yes | Non-blank | e.g. B.Tech, M.Sc, MBA, Ph.D |
| 3 | `field_of_study` | Field of Study | Text input | `string(200)` | No | — | e.g. Computer Science, Data Science |
| 4 | `end_month` | End Month | Select dropdown | `integer (1–12)` | No | 1–12; required if `end_year` set | Jan=1 … Dec=12 |
| 5 | `end_year` | End Year | Select dropdown | `integer` | No | 1950–current year; required if `end_month` set | 4-digit year |
| 6 | `grade` | Grade / GPA | Text input | `string(50)` | No | — | e.g. 8.5 CGPA, First Class |
| 7 | `description` | Description | Textarea | `text` | No | Max 500 chars | Activities, achievements, thesis topic |

### New Table: `academic_details`

```sql
CREATE TABLE academic_details (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school         VARCHAR(200) NOT NULL,
    degree         VARCHAR(200) NOT NULL,
    field_of_study VARCHAR(200),
    end_month      INTEGER CHECK (end_month BETWEEN 1 AND 12),
    end_year       INTEGER CHECK (end_year >= 1950),
    grade          VARCHAR(50),
    description    TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX ix_academic_details_user_id ON academic_details(user_id);
```

### Academic Details API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/users/me/academic` | Required | List all academic entries for current user (ordered newest first) |
| `POST` | `/api/v1/users/me/academic` | Required | Create a new academic entry |
| `PUT` | `/api/v1/users/me/academic/{entry_id}` | Required | Update an entry (partial; only caller's own entries) |
| `DELETE` | `/api/v1/users/me/academic/{entry_id}` | Required | Delete an entry (only caller's own) |

---

## 6c. Experience — Attribute Specification

**Section:** Experience
**Tab:** Experience (Tab 3)
**Relationship:** 1:many — multiple entries per user
**New Table Required:** `experience_entries`

| # | Field Name | Label | Control | Data Type | Required | Validation | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `job_title` | Job Title | Text input | `string(200)` | Yes | Non-blank | e.g. Senior Data Scientist |
| 2 | `organization` | Organization | Text input | `string(200)` | Yes | Non-blank | Employer / company name |
| 3 | `location` | Location | Text input | `string(200)` | No | — | City name, e.g. Mumbai, India |
| 4 | `location_type` | Location Type | Select dropdown | `enum` | No | — | On-Site, Hybrid, Remote |
| 5 | `employment_type` | Employment Type | Select dropdown | `enum` | No | — | Full-time, Part-time, Freelance, Self-employed, Internship, Apprenticeship |
| 6 | `is_current` | I currently work here | Checkbox | `boolean` | No | Default: `false` | When `true`: End Date fields are hidden/disabled |
| 7 | `start_month` | Start Month | Select dropdown | `integer (1–12)` | Yes | 1–12 | Jan=1 … Dec=12 |
| 8 | `start_year` | Start Year | Select dropdown | `integer` | Yes | 1900–current year | 4-digit year |
| 9 | `end_month` | End Month | Select dropdown | `integer (1–12)` | No | 1–12; hidden when `is_current` is true; required if `end_year` set | Jan=1 … Dec=12 |
| 10 | `end_year` | End Year | Select dropdown | `integer` | No | 1900–current year; hidden when `is_current` is true; required if `end_month` set | 4-digit year |
| 11 | `highlights` | Highlights | Textarea | `text` | No | Max 1000 chars | Responsibilities, achievements |
| 12 | `skills` | Skills | Tag input | `text[]` | No | Max 20 tags; each tag ≤ 100 chars | Skills used in this role; press Enter or comma to add |

### ENUM Values

| Enum Name | Values |
|---|---|
| `locationtype` | `ON_SITE`, `HYBRID`, `REMOTE` |
| `employmenttype` | `FULL_TIME`, `PART_TIME`, `FREELANCE`, `SELF_EMPLOYED`, `INTERNSHIP`, `APPRENTICESHIP` |

### Label Maps

| `locationtype` value | Display label |
|---|---|
| `ON_SITE` | On-Site |
| `HYBRID` | Hybrid |
| `REMOTE` | Remote |

| `employmenttype` value | Display label |
|---|---|
| `FULL_TIME` | Full-time |
| `PART_TIME` | Part-time |
| `FREELANCE` | Freelance |
| `SELF_EMPLOYED` | Self-employed |
| `INTERNSHIP` | Internship |
| `APPRENTICESHIP` | Apprenticeship |

### New Table: `experience_entries`

```sql
CREATE TYPE locationtype AS ENUM ('ON_SITE', 'HYBRID', 'REMOTE');
CREATE TYPE employmenttype AS ENUM (
    'FULL_TIME', 'PART_TIME', 'FREELANCE',
    'SELF_EMPLOYED', 'INTERNSHIP', 'APPRENTICESHIP'
);

CREATE TABLE experience_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title       VARCHAR(200) NOT NULL,
    organization    VARCHAR(200) NOT NULL,
    location        VARCHAR(200),
    location_type   locationtype,
    employment_type employmenttype,
    is_current      BOOLEAN NOT NULL DEFAULT FALSE,
    start_month     INTEGER NOT NULL CHECK (start_month BETWEEN 1 AND 12),
    start_year      INTEGER NOT NULL CHECK (start_year >= 1900),
    end_month       INTEGER CHECK (end_month BETWEEN 1 AND 12),
    end_year        INTEGER CHECK (end_year >= 1900),
    highlights      TEXT,
    skills          TEXT[],
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX ix_experience_entries_user_id ON experience_entries(user_id);
```

### Experience API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/users/me/experience` | Required | List all experience entries (current first, then newest start_year) |
| `POST` | `/api/v1/users/me/experience` | Required | Create a new experience entry |
| `PUT` | `/api/v1/users/me/experience/{entry_id}` | Required | Update an entry (partial; only caller's own) |
| `DELETE` | `/api/v1/users/me/experience/{entry_id}` | Required | Delete an entry (only caller's own) |

---

## 6d. Expertise — Attribute Specification

**Section:** Expertise
**Tab:** Expertise (Tab 4)
**Relationship:** 1:1 — one expertise record per user
**New Table Required:** `user_expertise`

| # | Field Name | Label | Control | Data Type | Required | Validation | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `total_experience` | Total Academic / Professional Experience | Text input | `string(100)` | Yes | Non-blank | e.g. "10 years", "5+ years" |
| 2 | `teaching_experience` | Total Teaching Experience | Text input | `string(100)` | Yes | Non-blank | e.g. "3 years" |
| 3 | `corporate_training` | Corporate Training Experience | Text input | `string(100)` | Yes | Non-blank | e.g. "2 years" |
| 4 | `online_training` | Online Training Experience | Text input | `string(100)` | Yes | Non-blank | e.g. "1 year" |
| 5 | `classroom_training` | Classroom Training Experience | Text input | `string(100)` | Yes | Non-blank | e.g. "4 years" |
| 6 | `primary_expertise` | Primary Expertise | Text input | `string(200)` | Yes | Non-blank | e.g. "Machine Learning, Data Science" |
| 7 | `secondary_expertise` | Secondary Expertise | Text input | `string(200)` | No | — | e.g. "Python, Statistics" |
| 8 | `audience_levels` | Audience / Training Level, I have Delivered | Multi-select checkboxes | `text[]` | Yes | At least one value | School; College / University; Freshers; Working Professionals; Managers; Senior Management; Technical Teams; Non-Technical Teams |

### Audience Level Values

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

### New Table: `user_expertise`

```sql
CREATE TABLE user_expertise (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_experience     VARCHAR(100) NOT NULL,
    teaching_experience  VARCHAR(100) NOT NULL,
    corporate_training   VARCHAR(100) NOT NULL,
    online_training      VARCHAR(100) NOT NULL,
    classroom_training   VARCHAR(100) NOT NULL,
    primary_expertise    VARCHAR(200) NOT NULL,
    secondary_expertise  VARCHAR(200),
    audience_levels      TEXT[] NOT NULL DEFAULT '{}',
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at           TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX ix_user_expertise_user_id ON user_expertise(user_id);
```

### Expertise API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/users/me/expertise` | Required | Get expertise record — 404 if not yet created |
| `PUT` | `/api/v1/users/me/expertise` | Required | Create or update expertise record (upsert) |

---

## 6e. Preferences — Attribute Specification

**Section:** Preferences  
**Tab:** Preferences (Tab 5)  
**Relationship:** 1:1 — one preferences record per user  
**New Table Required:** `user_preferences`

| # | Field Name | Label | Control | Data Type | Required | Values |
|---|---|---|---|---|---|---|
| 1 | `delivery_modes` | Delivery Mode | Multi-select checkboxes | `text[]` | Yes | Classroom; Online; Hybrid; Offline Session Recording |
| 2 | `geographic_preference` | Geographic Preference | Multi-select checkboxes | `text[]` | Yes | My City; Nearby Cities; Entire State; Neighbouring States; Pan India; Remote / Online |
| 3 | `willing_to_travel` | Willing to Travel | Radio (Yes / No) | `boolean` | Yes | — |
| 4 | `max_travel_distance` | Maximum Travel Distance | Dropdown | `varchar(20)` | Conditional (required when willing\_to\_travel = true) | 25 km; 50 km; 100 km; 200 km; 500 km; Any distance |
| 5 | `travel_reimbursement` | Travel Reimbursement Required | Radio (Yes / No) | `boolean` | Yes | — |
| 6 | `preferred_audience` | Preferred Audience | Multi-select checkboxes | `text[]` | Yes | Working Professionals; College / University / Institutes; Management; Sr. Management |
| 7 | `services` | Services I Can Deliver | Multi-select checkboxes | `text[]` | Yes | Lecture / Training Session; Workshop; Translation; Proofreading; Content Review |
| 8 | `training_topics` | Training Topics I Can Deliver | Tag input (free text) | `text[]` | Yes | Free text; user types and presses Enter / comma to add tags |

### Field Value Constants

**Delivery Modes:**
| Value | Display |
|---|---|
| `CLASSROOM` | Classroom |
| `ONLINE` | Online |
| `HYBRID` | Hybrid |
| `OFFLINE_RECORDING` | Offline Session Recording |

**Geographic Preference:**
| Value | Display |
|---|---|
| `MY_CITY` | My City |
| `NEARBY_CITIES` | Nearby Cities |
| `ENTIRE_STATE` | Entire State |
| `NEIGHBOURING_STATES` | Neighbouring States |
| `PAN_INDIA` | Pan India |
| `REMOTE_ONLINE` | Remote / Online |

**Preferred Audience:**
| Value | Display |
|---|---|
| `WORKING_PROFESSIONALS` | Working Professionals |
| `COLLEGE_UNIVERSITY_INSTITUTES` | College / University / Institutes |
| `MANAGEMENT` | Management |
| `SENIOR_MANAGEMENT` | Sr. Management |

**Services:**
| Value | Display |
|---|---|
| `LECTURE_TRAINING` | Lecture / Training Session |
| `WORKSHOP` | Workshop |
| `TRANSLATION` | Translation |
| `PROOFREADING` | Proofreading |
| `CONTENT_REVIEW` | Content Review |

**Maximum Travel Distance options:** `25 km`, `50 km`, `100 km`, `200 km`, `500 km`, `Any distance`

### New Table: `user_preferences`

```sql
CREATE TABLE user_preferences (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    delivery_modes        TEXT[] NOT NULL DEFAULT '{}',
    geographic_preference TEXT[] NOT NULL DEFAULT '{}',
    willing_to_travel     BOOLEAN NOT NULL DEFAULT false,
    max_travel_distance   VARCHAR(20),
    travel_reimbursement  BOOLEAN NOT NULL DEFAULT false,
    preferred_audience    TEXT[] NOT NULL DEFAULT '{}',
    services              TEXT[] NOT NULL DEFAULT '{}',
    training_topics       TEXT[] NOT NULL DEFAULT '{}',
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX ix_user_preferences_user_id ON user_preferences(user_id);
```

### Preferences API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/users/me/preferences` | Required | Get preferences record — 404 if not yet created |
| `PUT` | `/api/v1/users/me/preferences` | Required | Create or update preferences record (upsert) |

---

## 6f. Achievements — Attribute Specification

**Section:** Achievements  
**Tab:** Achievements (Tab 7)  
**Relationship:** 1:many — multiple entries per user  
**New Table Required:** `achievements`

| # | Field Name | Label | Control | Data Type | Required | Validation | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `title` | Title | Text input | `string(200)` | Yes | Non-blank | e.g. "Best Trainer Award 2023", "Published Paper on ML" |
| 2 | `description` | Description | Textarea | `text` | Yes | Non-blank; max 2000 chars | Details, context, issuing body |
| 3 | `file_path` | File Upload | File input | `string(500)` | No | PDF / JPG / PNG / DOCX; max 10 MB | Stored in `uploads/achievements/{user_id}/` |
| 4 | `file_name` | — (display only) | — | `string(200)` | No | Set from uploaded filename | Original filename, shown in card |

### Tab Header Banner (static — no data)

The Achievements tab shows an info banner at the top explaining what users can upload. It is **not** a form field — purely display.

**Banner categories (shown as chips):**
Awards · Highlights · Publications · Professional Certification · Research Areas · Conferences · CV / Resume · Profile / Bio · Certifications · Academic Certificates · Training Credentials · Portfolio

### File Upload Rules

| Rule | Detail |
|---|---|
| Allowed types | PDF, JPG, JPEG, PNG, DOCX |
| Max size | 10 MB per file |
| Storage path | `uploads/achievements/{user_id}/{entry_id}_{original_filename}` |
| Served at | `/{file_path}` via existing StaticFiles mount |
| On update | If new file provided → old file deleted, new file saved; if `clear_file=true` → file deleted, path cleared; if neither → file unchanged |
| On delete entry | Associated file deleted from disk |

### New Table: `achievements`

```sql
CREATE TABLE achievements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    file_path   VARCHAR(500),
    file_name   VARCHAR(200),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX ix_achievements_user_id ON achievements(user_id);
```

### Achievements API Endpoints

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| `GET` | `/api/v1/users/me/achievements` | Required | — | List all entries (newest first) |
| `POST` | `/api/v1/users/me/achievements` | Required | `multipart/form-data`: title, description, file? | Create new entry |
| `PUT` | `/api/v1/users/me/achievements/{entry_id}` | Required | `multipart/form-data`: title?, description?, file?, clear_file? | Partial update |
| `DELETE` | `/api/v1/users/me/achievements/{entry_id}` | Required | — | Delete entry + file from disk |

---

## 6g. Service Delivery — Attribute Specification

**Section:** Service Delivery
**Tab:** Service Delivery (Tab 8 — rename from "Availability")
**Relationship:** 1:1 per user (single row in `user_service_delivery`, upsert pattern same as `user_expertise` / `user_preferences`)
**Migration:** 013

---

### Field Inventory (33 booleans)

All fields default to `FALSE`. No ENUMs needed.

#### Section 1 — Lecture Delivery (8 fields)

| # | DB Column | Display Label | Notes |
|---|---|---|---|
| 1 | `can_take_lecture` | I can deliver lectures | **Parent flag** for this section |
| 2 | `lecture_classroom` | Classroom / In-Person | Sub-capability |
| 3 | `lecture_online` | Online | Sub-capability |
| 4 | `lecture_offline_recording` | Offline Recording / Screen Casting | Sub-capability |
| 5 | `lecture_blended_flipped` | Blended / Flipped | Sub-capability |
| 6 | `lecture_hybrid_hyflex` | Hybrid / HyFlex | Sub-capability |
| 7 | `lecture_hands_on_workshop` | Hands-On / Workshop | Sub-capability |
| 8 | `lecture_mentoring` | Mentoring / Doubt-Clearing Sessions | Sub-capability |

> The parent checkbox (`can_take_lecture`) is independent — checking it does not auto-select children; children are visually indented under it.

#### Section 2 — Content & Course Development (7 fields)

| # | DB Column | Display Label | Notes |
|---|---|---|---|
| 9 | `can_create_content` | I can create content & courses | **Parent flag** for this section |
| 10 | `content_creation` | Content Creation | Sub-capability |
| 11 | `content_explainer` | Explainer Creation | Sub-capability |
| 12 | `content_presentation` | Content Presentation | Sub-capability |
| 13 | `content_course_design` | Course Design | Sub-capability |
| 14 | `content_syllabus_design` | Syllabus Design | Sub-capability |
| 15 | `content_reference_material` | Reference Material / PDCC | Sub-capability |

#### Section 3 — Language & Media (7 fields)

No parent flag. All fields are independent.

| # | DB Column | Display Label |
|---|---|---|
| 16 | `lang_translation` | Translation |
| 17 | `lang_transcription` | Transcription |
| 18 | `lang_transcript_review` | Transcript Review |
| 19 | `lang_proofreading` | Proofreading |
| 20 | `lang_voiceover` | Voice-over / Narration |
| 21 | `lang_localization` | Localization |
| 22 | `lang_subtitling` | Subtitling |

#### Section 4 — Learning Support & Evaluation (11 fields)

No parent flag. Three visual sub-groups (Case Study, Assignments, Assessments) for display organisation only — each field is still an independent boolean.

| # | DB Column | Display Label | Visual Sub-Group |
|---|---|---|---|
| 23 | `eval_case_study_creation` | Case Study / Projects — Creation | Case Study & Projects |
| 24 | `eval_case_study_review` | Case Study / Projects — Review | Case Study & Projects |
| 25 | `eval_case_study_mentoring` | Case Study / Projects — Mentoring | Case Study & Projects |
| 26 | `eval_assignment_creation` | Assignments — Creation | Assignments |
| 27 | `eval_assignment_review` | Assignments — Review | Assignments |
| 28 | `eval_assignment_mentoring` | Assignments — Mentoring | Assignments |
| 29 | `eval_qbank_creation` | Question Bank — Creation | Assessments |
| 30 | `eval_qbank_review` | Question Bank — Review | Assessments |
| 31 | `eval_qpaper_creation` | Question Paper — Creation | Assessments |
| 32 | `eval_qpaper_review` | Question Paper — Review | Assessments |
| 33 | `eval_qpaper_grading` | Question Paper — Grading / Evaluation | Assessments |

---

### Database Table

**Table name:** `user_service_delivery`

```sql
CREATE TABLE user_service_delivery (
    id                          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID    NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Section 1: Lecture Delivery
    can_take_lecture            BOOLEAN NOT NULL DEFAULT FALSE,
    lecture_classroom           BOOLEAN NOT NULL DEFAULT FALSE,
    lecture_online              BOOLEAN NOT NULL DEFAULT FALSE,
    lecture_offline_recording   BOOLEAN NOT NULL DEFAULT FALSE,
    lecture_blended_flipped     BOOLEAN NOT NULL DEFAULT FALSE,
    lecture_hybrid_hyflex       BOOLEAN NOT NULL DEFAULT FALSE,
    lecture_hands_on_workshop   BOOLEAN NOT NULL DEFAULT FALSE,
    lecture_mentoring           BOOLEAN NOT NULL DEFAULT FALSE,

    -- Section 2: Content & Course Development
    can_create_content          BOOLEAN NOT NULL DEFAULT FALSE,
    content_creation            BOOLEAN NOT NULL DEFAULT FALSE,
    content_explainer           BOOLEAN NOT NULL DEFAULT FALSE,
    content_presentation        BOOLEAN NOT NULL DEFAULT FALSE,
    content_course_design       BOOLEAN NOT NULL DEFAULT FALSE,
    content_syllabus_design     BOOLEAN NOT NULL DEFAULT FALSE,
    content_reference_material  BOOLEAN NOT NULL DEFAULT FALSE,

    -- Section 3: Language & Media
    lang_translation            BOOLEAN NOT NULL DEFAULT FALSE,
    lang_transcription          BOOLEAN NOT NULL DEFAULT FALSE,
    lang_transcript_review      BOOLEAN NOT NULL DEFAULT FALSE,
    lang_proofreading           BOOLEAN NOT NULL DEFAULT FALSE,
    lang_voiceover              BOOLEAN NOT NULL DEFAULT FALSE,
    lang_localization           BOOLEAN NOT NULL DEFAULT FALSE,
    lang_subtitling             BOOLEAN NOT NULL DEFAULT FALSE,

    -- Section 4: Learning Support & Evaluation
    eval_case_study_creation    BOOLEAN NOT NULL DEFAULT FALSE,
    eval_case_study_review      BOOLEAN NOT NULL DEFAULT FALSE,
    eval_case_study_mentoring   BOOLEAN NOT NULL DEFAULT FALSE,
    eval_assignment_creation    BOOLEAN NOT NULL DEFAULT FALSE,
    eval_assignment_review      BOOLEAN NOT NULL DEFAULT FALSE,
    eval_assignment_mentoring   BOOLEAN NOT NULL DEFAULT FALSE,
    eval_qbank_creation         BOOLEAN NOT NULL DEFAULT FALSE,
    eval_qbank_review           BOOLEAN NOT NULL DEFAULT FALSE,
    eval_qpaper_creation        BOOLEAN NOT NULL DEFAULT FALSE,
    eval_qpaper_review          BOOLEAN NOT NULL DEFAULT FALSE,
    eval_qpaper_grading         BOOLEAN NOT NULL DEFAULT FALSE,

    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX ix_user_service_delivery_user_id ON user_service_delivery(user_id);
```

---

### Service Delivery API Endpoints

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| `GET` | `/api/v1/users/me/service-delivery` | Required | — | Return current record; `null` if never saved (frontend treats all booleans as `false`) |
| `PUT` | `/api/v1/users/me/service-delivery` | Required | `UserServiceDeliveryPayload` (all 33 booleans) | Full upsert — `INSERT … ON CONFLICT (user_id) DO UPDATE SET …` |

---

### Display / UX Rules

**Read-only card (ServiceDeliveryCard):**
- Four collapsible section panels (or always-expanded)
- Within each section, render only the `true` fields as coloured pills/checkmark rows
- Section 1 & 2: if `can_take_lecture` / `can_create_content` is `true`, show a green header badge ("Can Deliver" / "Can Create Content"); sub-capabilities listed below
- If no fields are `true` in a section → show "Not specified" in muted grey
- Overall empty state (nothing checked anywhere) → show the same prompt-to-edit banner used in ExpertiseTab

**Inline form (ServiceDeliveryTab):**
- Same inline-edit pattern as ExpertiseTab / PreferencesTab (no modal)
- `isEditing` boolean toggles between card and form
- Form layout: each of the 4 sections is a fieldset with a section heading
- Sections 1 & 2: parent checkbox first, then sub-checkboxes indented with `pl-6`
- Section 4: group sub-checkboxes under sub-group labels (Case Study, Assignments, Assessments) as visual dividers (not independent booleans)
- Save calls `PUT /api/v1/users/me/service-delivery` with all 33 values
- On success: exit edit mode, show updated card

---

## 7. Backend Requirements

### 7.1 New Database Columns (Migration 004)

All added to the existing `users` table as nullable columns.

```sql
-- New ENUM types
CREATE TYPE titletype AS ENUM ('MR', 'MRS', 'MISS', 'DR', 'PROF');
CREATE TYPE gendertype AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY');
CREATE TYPE designationtype AS ENUM (
    'PROFESSOR', 'ASST_PROFESSOR', 'TRAINER', 'GUEST_FACULTY'
);

-- New columns on users table
ALTER TABLE users ADD COLUMN profile_photo_path  VARCHAR(512);
ALTER TABLE users ADD COLUMN title               titletype;
ALTER TABLE users ADD COLUMN gender              gendertype;
ALTER TABLE users ADD COLUMN website             VARCHAR(100);
ALTER TABLE users ADD COLUMN linkedin            VARCHAR(100);
ALTER TABLE users ADD COLUMN company             VARCHAR(100);
ALTER TABLE users ADD COLUMN designation         designationtype;
ALTER TABLE users ADD COLUMN short_bio           TEXT;
ALTER TABLE users ADD COLUMN address_flat        VARCHAR(200);
ALTER TABLE users ADD COLUMN address_area        VARCHAR(200);
ALTER TABLE users ADD COLUMN address_city        VARCHAR(100);
ALTER TABLE users ADD COLUMN address_state       VARCHAR(100);
ALTER TABLE users ADD COLUMN address_country     VARCHAR(100);
ALTER TABLE users ADD COLUMN address_pincode     VARCHAR(10);
ALTER TABLE users ADD COLUMN consent             BOOLEAN DEFAULT FALSE;
```

> **Alembic file:** `backend/alembic/versions/004_add_profile_fields.py`  
> **Revises:** `003`

### 7.2 Future Tables (for later sections)

| Table | When | Purpose |
|---|---|---|
| `user_academic_details` | Academic Details tab | Multiple qualifications per user |
| `user_experience` | Experience tab | Work history entries |
| `user_expertise_skills` | Expertise & Skills tab | OR add JSON columns to `users` |
| `user_documents` | Documents tab | File records beyond `cv_file_path` |
| `user_availability` | Availability tab | Slots, preferences |
| `reviews` | Reviews & Ratings tab | Written by other users |

### 7.3 New API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/users/me/profile` | Required | Full profile for current user |
| `PUT` | `/api/v1/users/me/profile` | Required | Update profile fields (partial OK) |
| `POST` | `/api/v1/users/me/profile/photo` | Required | Upload profile photo (multipart) |
| `GET` | `/api/v1/users/me/completion` | Required | Completion percentage + missing fields |

### 7.4 Profile Completion Logic

Calculated server-side. Required fields for 100%:

```python
REQUIRED_FOR_COMPLETION = [
    "first_name", "last_name", "title", "gender", "email",
    "mobile_number", "website", "linkedin", "date_of_birth",
    "company", "designation", "short_bio",
    "address_city", "address_state", "address_country",
    "profile_photo_path",
    # + fields from future sections (expertise, experience, documents, availability)
]
```

Percentage = `(filled_count / total_required) * 100`

### 7.5 File Storage Paths

| File Type | Storage Path | DB Column |
|---|---|---|
| Profile photo | `uploads/photos/{user_id}.{ext}` | `users.profile_photo_path` |
| CV | `uploads/cvs/{user_id}.{ext}` | `users.cv_file_path` |
| Other documents | `uploads/documents/{user_id}/{uuid}.{ext}` | `documents` table *(future)* |

---

## 8. Edit UX Pattern

Every section on the profile page follows this interaction model:

```
┌─────────────────────┐
│  Display Card       │  ← Read-only, always visible
│                     │
│  [Edit Information] │  ← Button at bottom of card
└─────────┬───────────┘
          │ click
          ▼
┌─────────────────────────────────────────┐
│  Slide-in Drawer (from right)           │
│  Width: 480px desktop / 100% mobile    │
│  Backdrop: semi-transparent overlay    │
│                                         │
│  ┌──── Section heading ──────────────┐  │
│  │  Field 1                         │  │
│  │  Field 2                         │  │
│  │  ...                             │  │
│  └──────────────────────────────────┘  │
│                                         │
│  [Cancel]          [Save Changes]       │
└─────────────────────────────────────────┘
          │ save success
          ▼
     Toast: "Profile updated successfully"
     Drawer closes
     Display card refreshes with new data
```

### Special Cases

| Scenario | UX |
|---|---|
| Profile photo | Inline — camera icon on avatar → file picker → instant preview → auto-save |
| Email change | Disabled in drawer; separate "Change Email" security flow (OTP verification) |
| Bio | Inline edit — "Edit Bio" link reveals textarea below the bio text |
| Documents | Upload via "Upload More Documents" button → file manager modal |

### Validation Feedback

- Inline error messages below each field (red, text-xs)
- Save button disabled while form has validation errors
- Toast on success (green, auto-dismiss 3 s)
- Toast on failure (red, manual dismiss)

---

## 9. Future Sections — Pending Attribute PDFs

The following tabs require attribute PDFs before development can begin.  
Once each PDF is provided, update this document with a new section mirroring §6.

| Tab | Status | Expected Content |
|---|---|---|
| Academic Details | ✅ Defined — see §6b | School, Degree, Field of Study, End Date, Grade, Description (1:many) |
| Experience | ✅ Defined — see §6c | Job Title, Organization, Location, Employment Type, Start/End Date, is_current, Highlights, Skills (1:many) |
| Expertise | ✅ Defined — see §6d | Total/Teaching/Corporate/Online/Classroom Experience, Primary/Secondary Expertise, Audience Levels (1:1 record) |
| Preferences | ✅ Defined — see §6e | Delivery Mode, Geographic Preference, Travel, Services, Training Topics (1:1 record) |
| Services / Service Delivery | ✅ Defined — see §6g | 33 boolean capability flags across 4 sections: Lecture Delivery, Content & Course Development, Language & Media, Learning Support & Evaluation (1:1 record) |
| Achievements | ✅ Defined — see §6f | Title, Description, File upload (1:many — Awards, Publications, Certifications, CV, etc.) |

---

## 10. Step-by-Step Development Prompts

Each prompt is self-contained and targeted at a single deliverable.  
Complete each step in order. Run TypeScript check and backend import check after every step.

---

### PROMPT 1 — Database Migration 004 (Personal Info fields)

```
Create Alembic migration 004_add_profile_fields.py in 
backend/alembic/versions/.

Revision ID: 004
Revises: 003

In upgrade():
  Create three new ENUM types:
    titletype:       MR, MRS, MISS, DR, PROF
    gendertype:      MALE, FEMALE, PREFER_NOT_TO_SAY
    designationtype: PROFESSOR, ASST_PROFESSOR, TRAINER, GUEST_FACULTY

  Add these nullable columns to the users table:
    profile_photo_path  VARCHAR(512)
    title               titletype (ENUM)
    gender              gendertype (ENUM)
    website             VARCHAR(100)
    linkedin            VARCHAR(100)
    company             VARCHAR(100)
    designation         designationtype (ENUM)
    short_bio           TEXT
    address_flat        VARCHAR(200)
    address_area        VARCHAR(200)
    address_city        VARCHAR(100)
    address_state       VARCHAR(100)
    address_country     VARCHAR(100)
    address_pincode     VARCHAR(10)
    consent             BOOLEAN server_default false

In downgrade():
  Drop all added columns.
  Drop the three new enum types.

Follow the pattern in 002_add_user_profile_fields.py.
Do NOT use op.execute() for CREATE TYPE — let SQLAlchemy handle it 
via sa.Enum() in op.add_column(), same as migration 002.
```

---

### PROMPT 2 — Backend: User Model Update

```
Update backend/app/models/user.py:

1. Add three new Python enums (after the existing UserType enum):
     class TitleType(str, PyEnum):
         MR = "MR"
         MRS = "MRS"
         MISS = "MISS"
         DR = "DR"
         PROF = "PROF"

     class GenderType(str, PyEnum):
         MALE = "MALE"
         FEMALE = "FEMALE"
         PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"

     class DesignationType(str, PyEnum):
         PROFESSOR = "PROFESSOR"
         ASST_PROFESSOR = "ASST_PROFESSOR"
         TRAINER = "TRAINER"
         GUEST_FACULTY = "GUEST_FACULTY"

2. Add these Mapped columns to the User class (after cv_file_path):
     profile_photo_path: Mapped[str | None]  = mapped_column(String(512), nullable=True)
     title:              Mapped[TitleType | None] = mapped_column(Enum(TitleType, name="titletype"), nullable=True)
     gender:             Mapped[GenderType | None] = mapped_column(Enum(GenderType, name="gendertype"), nullable=True)
     website:            Mapped[str | None]  = mapped_column(String(100), nullable=True)
     linkedin:           Mapped[str | None]  = mapped_column(String(100), nullable=True)
     company:            Mapped[str | None]  = mapped_column(String(100), nullable=True)
     designation:        Mapped[DesignationType | None] = mapped_column(Enum(DesignationType, name="designationtype"), nullable=True)
     short_bio:          Mapped[str | None]  = mapped_column(Text(), nullable=True)
     address_flat:       Mapped[str | None]  = mapped_column(String(200), nullable=True)
     address_area:       Mapped[str | None]  = mapped_column(String(200), nullable=True)
     address_city:       Mapped[str | None]  = mapped_column(String(100), nullable=True)
     address_state:      Mapped[str | None]  = mapped_column(String(100), nullable=True)
     address_country:    Mapped[str | None]  = mapped_column(String(100), nullable=True)
     address_pincode:    Mapped[str | None]  = mapped_column(String(10), nullable=True)
     consent:            Mapped[bool]        = mapped_column(Boolean, nullable=False, default=False)

   Add Text to the SQLAlchemy imports.
   Add the three new enum classes to imports from user.py in any file 
   that references UserType.
```

---

### PROMPT 3 — Backend: Schemas Update

```
Update backend/app/schemas/user.py:

1. Import date from datetime, Text from SQLAlchemy is not needed here 
   (already handled by model). Import TitleType, GenderType, DesignationType 
   from app.models.user.

2. Add all new fields to UserResponse (they are already on the model so 
   from_attributes=True will pick them up automatically):
     profile_photo_path: str | None
     title:              TitleType | None
     gender:             GenderType | None
     website:            str | None
     linkedin:           str | None
     company:            str | None
     designation:        DesignationType | None
     short_bio:          str | None
     address_flat:       str | None
     address_area:       str | None
     address_city:       str | None
     address_state:      str | None
     address_country:    str | None
     address_pincode:    str | None
     consent:            bool

3. Create a new Pydantic model UserProfileUpdateRequest with ALL fields 
   from UserResponse as Optional (except id, is_active, is_verified, 
   created_at, updated_at, email — email is read-only here):
     title, gender, first_name, last_name, mobile_number, website,
     linkedin, date_of_birth, company, designation, short_bio,
     address_flat, address_area, address_city, address_state,
     address_country, address_pincode, consent, user_type

   Add these validators:
     - mobile_number: must be exactly 10 digits if provided
     - date_of_birth: age must be >= 21 years if provided
     - website: basic URL format check (starts with http:// or https://) if provided
     - first_name, last_name: strip whitespace, non-blank if provided

4. Create ProfileCompletionResponse:
     class ProfileCompletionResponse(BaseModel):
         percentage: int
         missing_fields: list[str]
```

---

### PROMPT 4 — Backend: Profile API Router

```
Create backend/app/api/v1/users.py as a new FastAPI router.

Import: APIRouter, Depends, File, HTTPException, UploadFile, status, 
        Annotated, Path from pathlib, Session from sqlalchemy.orm,
        get_db, get_current_user, User model, UserResponse,
        UserProfileUpdateRequest, ProfileCompletionResponse.

Router prefix will be set in main.py — do not set prefix here.

Endpoints:

1. GET /users/me/profile
   - Dependency: get_current_user
   - Returns: UserResponse
   - Just returns current_user (SQLAlchemy model → Pydantic via from_attributes)

2. PUT /users/me/profile
   - Dependency: get_current_user, get_db
   - Body: UserProfileUpdateRequest
   - For each field in data.model_dump(exclude_unset=True), 
     setattr(current_user, field, value)
   - db.commit(); db.refresh(current_user)
   - Returns: UserResponse

3. POST /users/me/profile/photo
   - Dependency: get_current_user, get_db
   - Body: UploadFile via File()
   - Validate: content_type must be image/jpeg or image/png
   - Read bytes, validate size <= 2 * 1024 * 1024 (2 MB)
   - Save to uploads/photos/{current_user.id}.{ext}
     (ext derived from content_type: jpeg→jpg, png→png)
   - Update current_user.profile_photo_path
   - db.commit(); db.refresh(current_user)
   - Returns: UserResponse

4. GET /users/me/completion
   - Dependency: get_current_user
   - Define REQUIRED_FIELDS list:
       ["first_name", "last_name", "title", "gender", "mobile_number",
        "website", "linkedin", "date_of_birth", "company", "designation",
        "short_bio", "address_city", "address_state", "address_country",
        "profile_photo_path"]
   - missing = [f for f in REQUIRED_FIELDS if not getattr(current_user, f, None)]
   - percentage = round((len(REQUIRED_FIELDS) - len(missing)) / len(REQUIRED_FIELDS) * 100)
   - Returns: ProfileCompletionResponse(percentage=percentage, missing_fields=missing)

After creating the file, register the router in backend/app/main.py:
  from app.api.v1 import users as users_router
  app.include_router(users_router.router, prefix="/api/v1", tags=["users"])
```

---

### PROMPT 5 — Frontend: Types Update

```
Update frontend/src/types/index.ts:

1. Add new union types:
     export type TitleType = 'MR' | 'MRS' | 'MISS' | 'DR' | 'PROF'
     export type GenderType = 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY'
     export type DesignationType = 'PROFESSOR' | 'ASST_PROFESSOR' | 'TRAINER' | 'GUEST_FACULTY'

2. Update the User interface to add all new profile fields:
     profile_photo_path: string | null
     title: TitleType | null
     gender: GenderType | null
     date_of_birth: string | null    (already there from migration 002)
     website: string | null
     linkedin: string | null
     company: string | null
     designation: DesignationType | null
     short_bio: string | null
     address_flat: string | null
     address_area: string | null
     address_city: string | null
     address_state: string | null
     address_country: string | null
     address_pincode: string | null
     consent: boolean
     cv_file_path: string | null     (already there from migration 002)

3. Add new interfaces:
     export interface ProfileCompletion {
       percentage: number
       missing_fields: string[]
     }

     export interface ProfileUpdatePayload {
       first_name?: string
       last_name?: string
       title?: TitleType
       gender?: GenderType
       mobile_number?: string
       website?: string
       linkedin?: string
       date_of_birth?: string
       company?: string
       designation?: DesignationType
       short_bio?: string
       address_flat?: string
       address_area?: string
       address_city?: string
       address_state?: string
       address_country?: string
       address_pincode?: string
       user_type?: UserType
       consent?: boolean
     }
```

---

### PROMPT 6 — Frontend: Profile API Client

```
Create frontend/src/api/profileApi.ts:

Import: apiClient from './client'
Import types: User, ProfileCompletion, ProfileUpdatePayload from '@/types'

Export profileApi object with these methods:

  getProfile: async (): Promise<User>
    GET /users/me/profile
    Returns data

  updateProfile: async (payload: ProfileUpdatePayload): Promise<User>
    PUT /users/me/profile
    JSON body = payload
    Returns data

  uploadPhoto: async (file: File): Promise<User>
    POST /users/me/profile/photo
    FormData with file appended as 'file'
    Returns data
    (Let axios set Content-Type automatically for FormData)

  getCompletion: async (): Promise<ProfileCompletion>
    GET /users/me/completion
    Returns data
```

---

### PROMPT 7 — Frontend: ProfileCompletionCard Component

```
Create frontend/src/features/profile/components/ProfileCompletionCard.tsx

Props:
  percentage: number
  onEditProfile: () => void
  onCompleteProfile: () => void

Render:
  White card with subtle shadow (same style as other cards in the app).
  
  TOP ROW:
    Left: "Profile Completion" heading (text-sm font-semibold text-slate-700)
    Right: "Edit Profile ▾" button (outlined blue, small, chevron-down icon)
  
  BODY:
    Left: Circular SVG progress ring
      - Size: 80px × 80px
      - Stroke width: 6px
      - Background ring: stroke slate-200
      - Progress ring: stroke blue-600
      - Calculated via strokeDashoffset:
          circumference = 2 * π * radius (radius = 32)
          offset = circumference * (1 - percentage / 100)
      - Centre text: "{percentage}%" (text-lg font-bold text-slate-800)
    
    Right: 
      Status text (text-sm font-semibold):
        < 50%  → "Just getting started!"
        50-74% → "Keep going!"
        75-99% → "Almost there!"
        100%   → "Profile complete!"
      Sub-text (text-xs text-slate-500):
        "Complete your profile to increase your visibility."
      "Complete Profile" button (blue, full-width, hidden when percentage === 100)
  
  All percentages animate with CSS transition on strokeDashoffset.
```

---

### PROMPT 8 — Frontend: ProfileHeader Component

```
Create frontend/src/features/profile/components/ProfileHeader.tsx

Props:
  profile: User
  completion: ProfileCompletion
  onEditProfile: () => void
  onCompleteProfile: () => void

Render a white card that spans the full width above the tabs.

LEFT SECTION (avatar + name + details):
  
  Avatar circle (w-28 h-28, rounded-full):
    If profile.profile_photo_path: 
      <img src={`/api/v1/static/${profile.profile_photo_path}`} />
    Else: gradient div (blue→violet) with initials text
    
    Camera icon overlay (bottom-right of circle):
      Small blue circle button with Camera icon from lucide-react
      onClick: trigger hidden <input type="file" accept="image/jpeg,image/png" />
      On file selected: call profileApi.uploadPhoto(), show spinner overlay,
      on success update parent profile state, on error show error toast.
  
  Name row:
    `{profile.first_name} {profile.last_name}`  (text-2xl font-bold)
    Blue verified checkmark if profile.is_verified (CheckCircle2 icon, fill blue)
  
  Role tag:
    Pill/badge showing user_type label
    SME → "SME - Subject Matter Expert"
    PROFESSIONAL_SERVICE_PROVIDER → "Professional Service Provider"
    Style: small pill, blue border, blue text
  
  Tagline line:
    Build from: [title label] · [designation label] · [company]
    Skip null parts. Separator: " | " between present parts.
    Style: text-slate-500 text-sm
  
  Location line:
    MapPin icon + city, state, country (comma-separated, skip nulls)
    Style: text-slate-500 text-sm
  
  Skills pills row (placeholder for now — empty array):
    Show up to 4 blue-outlined pills + "+N more" chip if overflow

CONTACT SECTION (right of avatar, below name on mobile):
  4 rows, each: [icon] [value-as-link or text]
  - Mail icon + profile.email (mailto: link)
  - Phone icon + "+91 " + profile.mobile_number
  - Globe icon + profile.website (https link, new tab) — hide if null
  - Linkedin icon + profile.linkedin (https link, new tab) — hide if null
  Style: text-sm text-slate-600, icons slate-400

COMPLETION CARD (far right, fixed width ~220px):
  Render <ProfileCompletionCard ... />

Layout: flex row on desktop, stacked on mobile.
The outer card: bg-white, rounded-xl, shadow-sm, p-6.
```

---

### PROMPT 9 — Frontend: ProfileTabBar Component

```
Create frontend/src/features/profile/components/ProfileTabBar.tsx

Props:
  activeTab: string
  onChange: (tab: string) => void

Tab definitions (in order):
  const TABS = [
    { id: 'overview',          label: 'Overview' },
    { id: 'academic',          label: 'Academic Details' },
    { id: 'experience',        label: 'Experience' },
    { id: 'expertise',         label: 'Expertise & Skills' },
    { id: 'documents',         label: 'Documents' },
    { id: 'availability',      label: 'Availability' },
    { id: 'reviews',           label: 'Reviews & Ratings' },
  ]

Render:
  <div> with border-b border-slate-200, overflow-x-auto (for mobile scroll)
  
  For each tab:
    <button
      onClick={() => onChange(tab.id)}
      className={
        active: "text-blue-600 border-b-2 border-blue-600 font-semibold"
        inactive: "text-slate-500 hover:text-slate-700"
        base: "px-4 py-3 text-sm whitespace-nowrap transition-colors"
      }
    >
      {tab.label}
    </button>
  
  No wrapping — tabs scroll horizontally on mobile (scrollbar hidden via 
  scrollbar-hide utility or overflow-x:auto + no scrollbar CSS).
```

---

### PROMPT 10 — Frontend: PersonalInfoCard (Display)

```
Create frontend/src/features/profile/components/PersonalInfoCard.tsx

Props:
  profile: User
  onEdit: () => void

Helper maps (define inside the component file):
  TITLE_LABELS: Record<TitleType, string> = { MR: 'Mr.', MRS: 'Mrs.', ... }
  GENDER_LABELS: Record<GenderType, string> = { MALE: 'Male', FEMALE: 'Female', PREFER_NOT_TO_SAY: 'Prefer not to say' }
  DESIGNATION_LABELS: Record<DesignationType, string> = { PROFESSOR: 'Professor', ASST_PROFESSOR: 'Asst. Professor', ... }
  ROLE_LABELS: Record<string, string> = { SME: 'SME - Subject Matter Expert', PROFESSIONAL_SERVICE_PROVIDER: 'Professional Service Provider' }

Build a rows array:
  const rows = [
    { label: 'Role',                value: ROLE_LABELS[profile.user_type] },
    { label: 'Title',               value: profile.title ? TITLE_LABELS[profile.title] : null },
    { label: 'Gender',              value: profile.gender ? GENDER_LABELS[profile.gender] : null },
    { label: 'Current Designation', value: profile.designation ? DESIGNATION_LABELS[profile.designation] : null },
    { label: 'Company / Academy',   value: profile.company },
    { label: 'Location',            value: [profile.address_city, profile.address_state, profile.address_country].filter(Boolean).join(', ') || null },
    { label: 'Date of Birth',       value: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) : null },
    { label: 'Mobile',              value: profile.mobile_number ? `+91 ${profile.mobile_number}` : null },
  ]
  .filter(row => row.value)  // skip empty rows

Render:
  White card, section heading "Personal Information" (text-sm font-semibold uppercase tracking-wide text-slate-400)
  
  Table-like rows (no <table>, use flex divs):
    Each row: flex, border-b border-slate-100
      Left (w-40): label text-slate-500 text-sm
      Right: value text-slate-800 text-sm
  
  "Edit Information" button at the bottom:
    Pencil (Edit2) icon + "Edit Information" text
    Style: outlined, text-blue-600 border-blue-600, text-sm, w-full
    onClick: onEdit()
```

---

### PROMPT 11 — Frontend: BioCard Component

```
Create frontend/src/features/profile/components/BioCard.tsx

Props:
  bio: string | null
  onEdit: () => void

Render (below PersonalInfoCard, same left column):
  White card, heading "Bio"
  
  If bio is present:
    <p className="text-slate-700 text-sm leading-relaxed">{bio}</p>
  Else:
    <p className="text-slate-400 text-sm italic">
      No bio added yet. Tell organisations about yourself.
    </p>
  
  "Edit Bio" link button (no border, just text-blue-600 underline text-sm)
  onClick: onEdit()
```

---

### PROMPT 12 — Frontend: EditPersonalInfoDrawer

```
Create frontend/src/features/profile/components/EditPersonalInfoDrawer.tsx

Props:
  profile: User
  open: boolean
  onClose: () => void
  onSaved: (updated: User) => void

Structure:
  Fixed overlay (inset-0 z-50, bg-black/40) when open.
  Slide-in panel from right:
    width: w-full sm:w-[480px]
    height: h-full
    bg-white, shadow-2xl
    overflow-y-auto

Panel layout:
  HEADER (sticky top):
    "Edit Personal Information" title
    X close button (top-right)
  
  FORM BODY (scrollable, space-y-6):

    SECTION "Basic Info":
      Title (Radio group: Mr / Mrs / Miss / Dr / Prof — horizontal pills)
      First Name (text input, required)
      Last Name (text input, required)
      Gender (Radio: Male / Female / Prefer not to say)
      Date of Birth (date input, max = today - 21 years, required)
      Role (Radio: SME - Subject Matter Expert / Professional Service Provider)

    SECTION "Contact":
      Email (text input, DISABLED — grey, note below: "Change email via Account Settings")
      Mobile (text input, prefix "+91 ", 10 digits, required)
      Website (text input, optional, URL format)
      LinkedIn (text input, optional, URL format)

    SECTION "Professional":
      Designation (select dropdown: Professor / Asst. Professor / Trainer / Guest Faculty)
      Company / Academy (text input, required)
      Short Bio (textarea, max 500 chars, char counter "{n}/500" bottom-right)

    SECTION "Address":
      Flat / House / Building (text input)
      Area (text input)
      City + State (grid-cols-2)
      Country (text input)
      Pincode (text input, max 6 chars, digits only)

  FOOTER (sticky bottom, border-t):
    [Cancel] button (outlined, grey) → onClose()
    [Save Changes] button (filled blue) → handleSave()

State:
  Local form state mirroring all editable fields, initialised from profile prop.
  errors: Record<string, string>
  loading: boolean

handleSave:
  Run all validations locally.
  If valid: call profileApi.updateProfile(changedFields).
  On success: onSaved(updatedProfile), show success toast.
  On error: show error toast with server message.

Validation rules (inline, red text-xs below each field):
  first_name: non-blank
  last_name: non-blank
  mobile_number: exactly 10 digits
  date_of_birth: age >= 21
  website: starts with http:// or https:// if not empty
  pincode: max 6 digits if not empty

Animation:
  Enter: translate-x-full → translate-x-0 (duration-300)
  Exit: translate-x-0 → translate-x-full (duration-250)
  Use CSS transition or Tailwind transition classes.
```

---

### PROMPT 13 — Frontend: MyProfilePage (Page Container)

```
Create frontend/src/features/profile/MyProfilePage.tsx

This is the top-level page component mounted at /profile.

State:
  profile: User | null
  completion: ProfileCompletion | null
  activeTab: string  (default: 'overview')
  editPersonalInfoOpen: boolean
  loading: boolean
  error: string | null
  toast: { message: string; type: 'success' | 'error' } | null

On mount (useEffect, []):
  Set loading true.
  Parallel: await Promise.all([profileApi.getProfile(), profileApi.getCompletion()])
  Set profile, completion.
  Set loading false.
  On any error: set error message.

showToast(message, type):
  Set toast state.
  After 3000ms: clear toast.

Render:

  if loading:
    Skeleton: 3 animated pulse blocks (header + tabs + content)

  if error:
    Error card with retry button

  if profile:
    <div className="space-y-4">
      
      <ProfileHeader
        profile={profile}
        completion={completion}
        onEditProfile={() => setEditPersonalInfoOpen(true)}
        onCompleteProfile={() => setActiveTab('overview')}
        onPhotoSaved={(updated) => setProfile(updated)}
      />

      <ProfileTabBar
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      TAB CONTENT (conditional render):

        activeTab === 'overview':
          <div className="grid grid-cols-10 gap-4">
            <div className="col-span-10 lg:col-span-3 space-y-4">
              <PersonalInfoCard
                profile={profile}
                onEdit={() => setEditPersonalInfoOpen(true)}
              />
              <BioCard
                bio={profile.short_bio}
                onEdit={() => setEditPersonalInfoOpen(true)}
              />
            </div>
            <div className="col-span-10 lg:col-span-4 space-y-4">
              <PlaceholderCard title="Expertise & Skills" />
              <PlaceholderCard title="Experience Summary" />
              <PlaceholderCard title="Training Topics" />
            </div>
            <div className="col-span-10 lg:col-span-3 space-y-4">
              <PlaceholderCard title="Documents" />
              <PlaceholderCard title="Availability & Preferences" />
            </div>
          </div>

        activeTab === 'academic':
          <PlaceholderPage title="Academic Details"
            description="Academic details section coming soon." icon={GraduationCap} />

        activeTab === 'experience':
          <PlaceholderPage title="Experience"
            description="Experience section coming soon." icon={Briefcase} />

        (... similar for expertise, documents, availability, reviews)

    </div>

    <EditPersonalInfoDrawer
      profile={profile}
      open={editPersonalInfoOpen}
      onClose={() => setEditPersonalInfoOpen(false)}
      onSaved={(updated) => {
        setProfile(updated)
        setEditPersonalInfoOpen(false)
        showToast('Profile updated successfully', 'success')
        profileApi.getCompletion().then(setCompletion)
      }}
    />

    Toast notification (fixed bottom-right, z-50):
      if toast:
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm
                          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
```

---

### PROMPT 14 — Frontend: Wire up Route

```
In frontend/src/routes/index.tsx:
  Replace the /profile PlaceholderPage entry with:
    import { MyProfilePage } from '@/features/profile/MyProfilePage'
    ...
    { path: '/profile', element: <MyProfilePage /> }

Run TypeScript check: npx tsc -b --noEmit
Fix any type errors before proceeding.

Also verify that:
1. The /api/v1/users/me/profile endpoint returns 200 with a valid User payload
   when called with a valid JWT token.
2. The /api/v1/users/me/completion endpoint returns { percentage, missing_fields }.
3. Profile photo upload returns an updated User object.
```

---

---

## 10b. Academic Details — Development Prompts (Prompts 15–21)

Each prompt is self-contained. Complete them in order. Run `npx tsc --noEmit` and restart the backend after every backend change.

---

### PROMPT 15 — Database: Migration 005 (academic_details table)

```
Create backend/alembic/versions/005_add_academic_details.py

Revision ID: 005
Revises: 004

In upgrade():
  op.create_table(
    "academic_details",
    sa.Column("id",             postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
    sa.Column("user_id",        postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    sa.Column("school",         sa.String(200), nullable=False),
    sa.Column("degree",         sa.String(200), nullable=False),
    sa.Column("field_of_study", sa.String(200), nullable=True),
    sa.Column("end_month",      sa.Integer,     nullable=True),
    sa.Column("end_year",       sa.Integer,     nullable=True),
    sa.Column("grade",          sa.String(50),  nullable=True),
    sa.Column("description",    sa.Text,        nullable=True),
    sa.Column("created_at",     sa.DateTime(timezone=True), server_default=sa.func.now()),
    sa.Column("updated_at",     sa.DateTime(timezone=True), server_default=sa.func.now()),
  )
  op.create_index("ix_academic_details_user_id", "academic_details", ["user_id"])

In downgrade():
  op.drop_index("ix_academic_details_user_id", "academic_details")
  op.drop_table("academic_details")

Run: alembic upgrade head
Verify: psql → \d academic_details shows all columns.
```

---

### PROMPT 16 — Backend: AcademicDetail Model + Schema + CRUD API

```
1. Create backend/app/models/academic.py:

   from datetime import datetime
   from uuid import UUID, uuid4
   from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, func
   from sqlalchemy.orm import Mapped, mapped_column
   from sqlalchemy.dialects.postgresql import UUID as PG_UUID
   from app.core.database import Base

   class AcademicDetail(Base):
       __tablename__ = "academic_details"
       id             : Mapped[UUID]       = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
       user_id        : Mapped[UUID]       = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
       school         : Mapped[str]        = mapped_column(String(200), nullable=False)
       degree         : Mapped[str]        = mapped_column(String(200), nullable=False)
       field_of_study : Mapped[str | None] = mapped_column(String(200), nullable=True)
       end_month      : Mapped[int | None] = mapped_column(Integer, nullable=True)
       end_year       : Mapped[int | None] = mapped_column(Integer, nullable=True)
       grade          : Mapped[str | None] = mapped_column(String(50), nullable=True)
       description    : Mapped[str | None] = mapped_column(Text, nullable=True)
       created_at     : Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now())
       updated_at     : Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

2. Create backend/app/schemas/academic.py:

   from datetime import date, datetime
   from typing import Optional
   from uuid import UUID
   from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

   class AcademicDetailCreate(BaseModel):
       school:         str            = Field(..., min_length=1, max_length=200)
       degree:         str            = Field(..., min_length=1, max_length=200)
       field_of_study: Optional[str]  = Field(None, max_length=200)
       end_month:      Optional[int]  = Field(None, ge=1, le=12)
       end_year:       Optional[int]  = Field(None, ge=1950)
       grade:          Optional[str]  = Field(None, max_length=50)
       description:    Optional[str]  = None

       @field_validator("school", "degree")
       @classmethod
       def non_blank(cls, v: str) -> str:
           if not v.strip():
               raise ValueError("This field cannot be blank")
           return v.strip()

       @field_validator("end_year")
       @classmethod
       def year_not_future(cls, v):
           if v and v > date.today().year:
               raise ValueError("End year cannot be in the future")
           return v

       @model_validator(mode="after")
       def both_or_neither(self):
           if bool(self.end_month) != bool(self.end_year):
               raise ValueError("Provide both end month and end year, or neither")
           return self

   class AcademicDetailUpdate(BaseModel):
       school:         Optional[str] = Field(None, min_length=1, max_length=200)
       degree:         Optional[str] = Field(None, min_length=1, max_length=200)
       field_of_study: Optional[str] = Field(None, max_length=200)
       end_month:      Optional[int] = Field(None, ge=1, le=12)
       end_year:       Optional[int] = Field(None, ge=1950)
       grade:          Optional[str] = Field(None, max_length=50)
       description:    Optional[str] = None

   class AcademicDetailResponse(BaseModel):
       id:             UUID
       user_id:        UUID
       school:         str
       degree:         str
       field_of_study: Optional[str]
       end_month:      Optional[int]
       end_year:       Optional[int]
       grade:          Optional[str]
       description:    Optional[str]
       created_at:     datetime
       updated_at:     datetime
       model_config = ConfigDict(from_attributes=True)

3. Create backend/app/api/v1/academic.py:

   from typing import Annotated
   from uuid import UUID
   from fastapi import APIRouter, Depends, HTTPException, status
   from sqlalchemy.orm import Session

   from app.core.database import get_db
   from app.dependencies.auth import get_current_user
   from app.models.academic import AcademicDetail
   from app.models.user import User
   from app.schemas.academic import AcademicDetailCreate, AcademicDetailResponse, AcademicDetailUpdate

   router = APIRouter()

   @router.get("", response_model=list[AcademicDetailResponse])
   def list_academic(
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       return (
           db.query(AcademicDetail)
           .filter(AcademicDetail.user_id == current_user.id)
           .order_by(AcademicDetail.end_year.desc().nullslast(), AcademicDetail.created_at.desc())
           .all()
       )

   @router.post("", response_model=AcademicDetailResponse, status_code=status.HTTP_201_CREATED)
   def create_academic(
       data: AcademicDetailCreate,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       entry = AcademicDetail(**data.model_dump(), user_id=current_user.id)
       db.add(entry)
       db.commit()
       db.refresh(entry)
       return entry

   @router.put("/{entry_id}", response_model=AcademicDetailResponse)
   def update_academic(
       entry_id: UUID,
       data: AcademicDetailUpdate,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       entry = db.query(AcademicDetail).filter(
           AcademicDetail.id == entry_id,
           AcademicDetail.user_id == current_user.id,
       ).first()
       if not entry:
           raise HTTPException(status_code=404, detail="Academic entry not found")
       for field, value in data.model_dump(exclude_unset=True).items():
           setattr(entry, field, value)
       db.commit()
       db.refresh(entry)
       return entry

   @router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
   def delete_academic(
       entry_id: UUID,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       entry = db.query(AcademicDetail).filter(
           AcademicDetail.id == entry_id,
           AcademicDetail.user_id == current_user.id,
       ).first()
       if not entry:
           raise HTTPException(status_code=404, detail="Academic entry not found")
       db.delete(entry)
       db.commit()

4. Register router in backend/app/main.py:
   from app.api.v1 import academic
   app.include_router(academic.router, prefix="/api/v1/users/me/academic", tags=["Academic"])

Restart backend.
Verify: GET /api/v1/users/me/academic with valid JWT → 200 []
```

---

### PROMPT 17 — Frontend: Types + academicApi.ts

```
1. Add to frontend/src/types/index.ts (after existing interfaces):

   export interface AcademicDetail {
     id: string
     user_id: string
     school: string
     degree: string
     field_of_study: string | null
     end_month: number | null   // 1–12
     end_year: number | null
     grade: string | null
     description: string | null
     created_at: string
     updated_at: string
   }

   export interface AcademicDetailPayload {
     school: string
     degree: string
     field_of_study?: string
     end_month?: number
     end_year?: number
     grade?: string
     description?: string
   }

2. Create frontend/src/api/academicApi.ts:

   import apiClient from './client'
   import type { AcademicDetail, AcademicDetailPayload } from '@/types'

   export const academicApi = {
     list: async (): Promise<AcademicDetail[]> => {
       const { data } = await apiClient.get<AcademicDetail[]>('/users/me/academic')
       return data
     },
     create: async (payload: AcademicDetailPayload): Promise<AcademicDetail> => {
       const { data } = await apiClient.post<AcademicDetail>('/users/me/academic', payload)
       return data
     },
     update: async (id: string, payload: Partial<AcademicDetailPayload>): Promise<AcademicDetail> => {
       const { data } = await apiClient.put<AcademicDetail>(`/users/me/academic/${id}`, payload)
       return data
     },
     remove: async (id: string): Promise<void> => {
       await apiClient.delete(`/users/me/academic/${id}`)
     },
   }

Run: npx tsc --noEmit  (zero errors expected)
```

---

### PROMPT 18 — Frontend: AcademicDetailCard Component

```
Create frontend/src/features/profile/components/AcademicDetailCard.tsx

Props:
  entry: AcademicDetail
  onEdit: () => void
  onDelete: () => void

Helper (module-level):
  const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  function formatEndDate(month: number | null, year: number | null): string {
    if (month && year) return `${MONTH_SHORT[month - 1]} ${year}`
    if (year)          return `${year}`
    return ''
  }

Render (bg-white rounded-xl shadow-sm p-5):

  HEADER ROW — flex justify-between items-start gap-3:
    LEFT:
      School: text-base font-semibold text-slate-800
      Degree + field: text-sm text-slate-600 mt-0.5
        `{entry.degree}{entry.field_of_study ? ` · ${entry.field_of_study}` : ''}`
    RIGHT — flex gap-1 shrink-0:
      Edit button (p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50):
        <Pencil size={15} />  onClick: onEdit
      Delete button (p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50):
        <Trash2 size={15} />  onClick: onDelete

  DATE + GRADE ROW — mt-2 flex items-center gap-3 text-sm text-slate-500:
    if formatEndDate result is not empty:
      <GraduationCap size={14} className="flex-shrink-0" />
      <span>{formatEndDate(entry.end_month, entry.end_year)}</span>
    if entry.grade:
      <span className="text-slate-300">·</span>
      <span>Grade: {entry.grade}</span>

  DESCRIPTION — if entry.description:
    <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
      {entry.description}
    </p>

Icons: Pencil, Trash2, GraduationCap from lucide-react
```

---

### PROMPT 19 — Frontend: AddEditAcademicModal

```
Create frontend/src/features/profile/components/AddEditAcademicModal.tsx

Props:
  entry: AcademicDetail | null   (null = add mode, non-null = edit mode)
  open: boolean
  onClose: () => void
  onSaved: (saved: AcademicDetail) => void

Module-level constants:
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']
  const CURRENT_YEAR = new Date().getFullYear()
  const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i)
  // produces [2026, 2025, ..., 1950]

State:
  form: {
    school: string, degree: string, field_of_study: string,
    end_month: string,   // '' | '1'–'12'
    end_year: string,    // '' | '2024'
    grade: string, description: string
  }
  errors: Record<string, string>
  loading: boolean
  toast: { type: 'success'|'error'; message: string } | null

useEffect([open]):
  if open:
    setForm(entry ? {
      school:         entry.school,
      degree:         entry.degree,
      field_of_study: entry.field_of_study ?? '',
      end_month:      entry.end_month ? String(entry.end_month) : '',
      end_year:       entry.end_year  ? String(entry.end_year)  : '',
      grade:          entry.grade ?? '',
      description:    entry.description ?? '',
    } : { school:'', degree:'', field_of_study:'', end_month:'', end_year:'', grade:'', description:'' })
    setErrors({}); setToast(null)

setField(key, value): update form, clear that error key.

validate(): Errors
  school:   blank → error
  degree:   blank → error
  end date: (!!end_month) !== (!!end_year) → error on end_month: "Select both month and year"

handleSave():
  Run validate(); if errors → setErrors; return.
  setLoading(true)
  Build payload:
    { school: form.school.trim(),
      degree: form.degree.trim(),
      field_of_study: form.field_of_study.trim() || undefined,
      end_month:  form.end_month  ? parseInt(form.end_month)  : undefined,
      end_year:   form.end_year   ? parseInt(form.end_year)   : undefined,
      grade:       form.grade.trim()       || undefined,
      description: form.description.trim() || undefined }
  if entry === null: result = await academicApi.create(payload)
  else:              result = await academicApi.update(entry.id, payload)
  onSaved(result)
  catch: setToast({ type: 'error', message: server detail or 'Failed to save.' })
  finally: setLoading(false)

Toast: auto-dismiss 3.5 s (same pattern as EditPersonalInfoDrawer)

Modal structure (matches EditPersonalInfoDrawer popup pattern):
  Fixed overlay (inset-0 z-50 bg-black/40 flex items-center justify-center p-4)
    onClick overlay → onClose
  Modal box (w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh])
    onClick e.stopPropagation()
    Animation: transition-all duration-200, open→scale-100 opacity-100 / closed→scale-95 opacity-0

  HEADER (px-5 py-4 border-b border-slate-100 flex justify-between items-center):
    <h2>{entry ? "Edit Education" : "Add Education"}</h2>
    <X /> close button

  BODY (flex-1 overflow-y-auto px-5 py-5 space-y-4):

    Toast banner (absolute top-4 left-4 right-4) if toast

    Field "School *":       <input required />
    Field "Degree *":       <input required />
    Field "Field of Study": <input optional />

    Field "End Date" (error on end_month key):
      <div className="grid grid-cols-2 gap-3">
        Month select: <option value="">Month</option> + MONTHS.map((m,i) => <option value={i+1}>)
        Year select:  <option value="">Year</option>  + YEARS.map(y => <option value={y}>)
      </div>

    Field "Grade": <input placeholder="e.g. 8.5 CGPA, First Class" />

    Field "Description":
      <div className="relative">
        <textarea rows={4} maxLength={500} />
        <span className="absolute bottom-2 right-3 text-xs text-slate-400">
          {form.description.length}/500
        </span>
      </div>

  FOOTER (px-5 py-4 border-t border-slate-100 flex gap-3):
    Cancel button (outlined grey, flex-1) → onClose
    Save button   (blue filled, flex-1, shows spinner when loading)

inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
```

---

### PROMPT 20 — Frontend: AcademicDetailsTab Container

```
Create frontend/src/features/profile/components/AcademicDetailsTab.tsx

State:
  entries: AcademicDetail[]
  loading: boolean
  error: string | null
  modal: { open: boolean; entry: AcademicDetail | null }
  deleteTarget: AcademicDetail | null
  deleteLoading: boolean

On mount (useEffect []):
  setLoading(true)
  academicApi.list()
    .then(setEntries)
    .catch(() => setError('Failed to load academic details.'))
    .finally(() => setLoading(false))

Render:

  TOP BAR (flex items-center justify-between mb-5):
    <h2 className="text-lg font-semibold text-slate-800">Academic Details</h2>
    <button onClick={() => setModal({ open: true, entry: null })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                       border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
      <Plus size={15} /> Add Education
    </button>

  CONTENT:

    if loading:
      <div className="space-y-4">
        {[0, 1].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm h-28 animate-pulse" />
        ))}
      </div>

    if error:
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">{error}</p>
        <button onClick={retry} className="mt-3 text-blue-600 text-sm underline">Retry</button>
      </div>

    if !loading && !error && entries.length === 0:
      <div className="bg-white rounded-xl shadow-sm p-10 text-center">
        <GraduationCap size={40} className="text-slate-300 mx-auto" />
        <p className="text-slate-600 font-medium mt-3">No education added yet</p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
          Add your academic background to help organisations understand your qualifications.
        </p>
        <button onClick={() => setModal({ open: true, entry: null })}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium
                           rounded-lg hover:bg-blue-500 transition-colors">
          Add Education
        </button>
      </div>

    if entries.length > 0:
      <div className="space-y-4">
        {entries.map(entry => (
          <AcademicDetailCard
            key={entry.id}
            entry={entry}
            onEdit={() => setModal({ open: true, entry })}
            onDelete={() => setDeleteTarget(entry)}
          />
        ))}
      </div>

  ADD / EDIT MODAL:
    <AddEditAcademicModal
      entry={modal.entry}
      open={modal.open}
      onClose={() => setModal({ open: false, entry: null })}
      onSaved={(saved) => {
        setEntries(prev =>
          modal.entry
            ? prev.map(e => e.id === saved.id ? saved : e)
            : [saved, ...prev]
        )
        setModal({ open: false, entry: null })
      }}
    />

  DELETE CONFIRMATION MODAL (when deleteTarget !== null):
    Fixed overlay (inset-0 z-50 bg-black/40 flex items-center justify-center p-4)
    White card (max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl):
      <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
      <p className="font-semibold text-slate-800">Delete this entry?</p>
      <p className="text-sm text-slate-500 mt-1">
        "{deleteTarget.school}" will be permanently removed from your profile.
      </p>
      <div className="flex gap-3 mt-5">
        Cancel (flex-1 outlined grey, disabled while deleteLoading) → setDeleteTarget(null)
        Delete (flex-1 bg-red-600 text-white, shows spinner when deleteLoading):
          onClick:
            setDeleteLoading(true)
            academicApi.remove(deleteTarget.id)
              .then(() => {
                setEntries(prev => prev.filter(e => e.id !== deleteTarget!.id))
                setDeleteTarget(null)
              })
              .catch(() => { /* entry stays; user can retry */ })
              .finally(() => setDeleteLoading(false))

Icons needed: GraduationCap, Plus, Trash2 from lucide-react
```

---

### PROMPT 21 — Frontend: Wire Academic Tab into MyProfilePage

```
In frontend/src/features/profile/MyProfilePage.tsx:

1. Add import at top:
   import { AcademicDetailsTab } from './components/AcademicDetailsTab'

2. In the tabContent object, replace the 'academic' entry:
   BEFORE:
     academic: (
       <PlaceholderPage title="Academic Details" description="..." icon={GraduationCap} />
     ),
   AFTER:
     academic: <AcademicDetailsTab />,

3. Run: npx tsc --noEmit  (zero errors expected)

4. Restart backend service via services.bat.

5. End-to-end verification:
   a. Navigate to /profile → click "Academic Details" tab
   b. Empty state shows with "Add Education" button
   c. Click "Add Education": modal opens
   d. Fill in School + Degree (required) + optional fields → Save
      → entry appears in list with correct formatting
   e. Click Edit pencil: modal pre-fills with existing data → update → list refreshes
   f. Click Delete trash: confirm dialog shows school name → confirm → entry removed
   g. Add multiple entries: they appear ordered by end_year descending
   h. Check backend: GET /api/v1/users/me/academic returns all entries as JSON array
```

---

## 10c. Experience — Development Prompts (Prompts 22–28)

Each prompt is self-contained. Complete them in order. Run `npx tsc --noEmit` and restart the backend after every backend change.

---

### PROMPT 22 — Database: Migration 006 (experience_entries table)

```
Create backend/alembic/versions/006_add_experience_entries.py

Revision ID: 006
Revises: 005

In upgrade():
  Create two new ENUM types using sa.Enum() directly in op.create_table():

  op.create_table(
    "experience_entries",
    sa.Column("id",              postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
    sa.Column("user_id",         postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    sa.Column("job_title",       sa.String(200),  nullable=False),
    sa.Column("organization",    sa.String(200),  nullable=False),
    sa.Column("location",        sa.String(200),  nullable=True),
    sa.Column("location_type",
              sa.Enum("ON_SITE", "HYBRID", "REMOTE", name="locationtype"),
              nullable=True),
    sa.Column("employment_type",
              sa.Enum("FULL_TIME", "PART_TIME", "FREELANCE", "SELF_EMPLOYED",
                      "INTERNSHIP", "APPRENTICESHIP", name="employmenttype"),
              nullable=True),
    sa.Column("is_current",      sa.Boolean, nullable=False, server_default=sa.text("false")),
    sa.Column("start_month",     sa.Integer, nullable=False),
    sa.Column("start_year",      sa.Integer, nullable=False),
    sa.Column("end_month",       sa.Integer, nullable=True),
    sa.Column("end_year",        sa.Integer, nullable=True),
    sa.Column("highlights",      sa.Text,    nullable=True),
    sa.Column("skills",          postgresql.ARRAY(sa.String(100)), nullable=True),
    sa.Column("created_at",      sa.DateTime(timezone=True), server_default=sa.func.now()),
    sa.Column("updated_at",      sa.DateTime(timezone=True), server_default=sa.func.now()),
  )
  op.create_index("ix_experience_entries_user_id", "experience_entries", ["user_id"])

In downgrade():
  op.drop_index("ix_experience_entries_user_id", table_name="experience_entries")
  op.drop_table("experience_entries")
  sa.Enum(name="locationtype").drop(op.get_bind(), checkfirst=True)
  sa.Enum(name="employmenttype").drop(op.get_bind(), checkfirst=True)

Imports needed: from sqlalchemy.dialects import postgresql

Run: alembic upgrade head
Verify: psql → \d experience_entries shows all 16 columns including skills text[].
```

---

### PROMPT 23 — Backend: ExperienceEntry Model + Schema + CRUD API

```
1. Create backend/app/models/experience.py:

   from datetime import datetime
   from enum import Enum as PyEnum
   from typing import Optional
   from uuid import UUID, uuid4
   from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
   from sqlalchemy.orm import Mapped, mapped_column
   from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY
   from app.core.database import Base

   class LocationType(str, PyEnum):
       ON_SITE        = "ON_SITE"
       HYBRID         = "HYBRID"
       REMOTE         = "REMOTE"

   class EmploymentType(str, PyEnum):
       FULL_TIME      = "FULL_TIME"
       PART_TIME      = "PART_TIME"
       FREELANCE      = "FREELANCE"
       SELF_EMPLOYED  = "SELF_EMPLOYED"
       INTERNSHIP     = "INTERNSHIP"
       APPRENTICESHIP = "APPRENTICESHIP"

   class ExperienceEntry(Base):
       __tablename__ = "experience_entries"
       id              : Mapped[UUID]                    = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
       user_id         : Mapped[UUID]                    = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
       job_title       : Mapped[str]                     = mapped_column(String(200), nullable=False)
       organization    : Mapped[str]                     = mapped_column(String(200), nullable=False)
       location        : Mapped[Optional[str]]           = mapped_column(String(200), nullable=True)
       location_type   : Mapped[Optional[LocationType]]  = mapped_column(Enum(LocationType, name="locationtype"), nullable=True)
       employment_type : Mapped[Optional[EmploymentType]]= mapped_column(Enum(EmploymentType, name="employmenttype"), nullable=True)
       is_current      : Mapped[bool]                    = mapped_column(Boolean, nullable=False, default=False)
       start_month     : Mapped[int]                     = mapped_column(Integer, nullable=False)
       start_year      : Mapped[int]                     = mapped_column(Integer, nullable=False)
       end_month       : Mapped[Optional[int]]           = mapped_column(Integer, nullable=True)
       end_year        : Mapped[Optional[int]]           = mapped_column(Integer, nullable=True)
       highlights      : Mapped[Optional[str]]           = mapped_column(Text, nullable=True)
       skills          : Mapped[Optional[list[str]]]     = mapped_column(ARRAY(String(100)), nullable=True)
       created_at      : Mapped[datetime]                = mapped_column(DateTime(timezone=True), server_default=func.now())
       updated_at      : Mapped[datetime]                = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

2. Create backend/app/schemas/experience.py:

   from datetime import date, datetime
   from typing import Optional
   from uuid import UUID
   from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
   from app.models.experience import LocationType, EmploymentType

   class ExperienceEntryCreate(BaseModel):
       job_title       : str                       = Field(..., min_length=1, max_length=200)
       organization    : str                       = Field(..., min_length=1, max_length=200)
       location        : Optional[str]             = Field(None, max_length=200)
       location_type   : Optional[LocationType]    = None
       employment_type : Optional[EmploymentType]  = None
       is_current      : bool                      = False
       start_month     : int                       = Field(..., ge=1, le=12)
       start_year      : int                       = Field(..., ge=1900)
       end_month       : Optional[int]             = Field(None, ge=1, le=12)
       end_year        : Optional[int]             = Field(None, ge=1900)
       highlights      : Optional[str]             = Field(None, max_length=1000)
       skills          : Optional[list[str]]       = None

       @field_validator("job_title", "organization")
       @classmethod
       def non_blank(cls, v: str) -> str:
           if not v.strip():
               raise ValueError("This field cannot be blank")
           return v.strip()

       @field_validator("skills")
       @classmethod
       def validate_skills(cls, v: Optional[list[str]]) -> Optional[list[str]]:
           if v is None:
               return v
           v = [s.strip() for s in v if s.strip()]
           if len(v) > 20:
               raise ValueError("Maximum 20 skills allowed")
           if any(len(s) > 100 for s in v):
               raise ValueError("Each skill must be 100 characters or less")
           return v

       @model_validator(mode="after")
       def validate_end_date(self):
           if self.is_current:
               if self.end_month is not None or self.end_year is not None:
                   raise ValueError("End date must be empty when 'currently working here' is checked")
           else:
               if bool(self.end_month) != bool(self.end_year):
                   raise ValueError("Provide both end month and end year, or neither")
           return self

   class ExperienceEntryUpdate(BaseModel):
       job_title       : Optional[str]             = Field(None, min_length=1, max_length=200)
       organization    : Optional[str]             = Field(None, min_length=1, max_length=200)
       location        : Optional[str]             = Field(None, max_length=200)
       location_type   : Optional[LocationType]    = None
       employment_type : Optional[EmploymentType]  = None
       is_current      : Optional[bool]            = None
       start_month     : Optional[int]             = Field(None, ge=1, le=12)
       start_year      : Optional[int]             = Field(None, ge=1900)
       end_month       : Optional[int]             = Field(None, ge=1, le=12)
       end_year        : Optional[int]             = Field(None, ge=1900)
       highlights      : Optional[str]             = Field(None, max_length=1000)
       skills          : Optional[list[str]]       = None

   class ExperienceEntryResponse(BaseModel):
       id              : UUID
       user_id         : UUID
       job_title       : str
       organization    : str
       location        : Optional[str]
       location_type   : Optional[LocationType]
       employment_type : Optional[EmploymentType]
       is_current      : bool
       start_month     : int
       start_year      : int
       end_month       : Optional[int]
       end_year        : Optional[int]
       highlights      : Optional[str]
       skills          : Optional[list[str]]
       created_at      : datetime
       updated_at      : datetime
       model_config = ConfigDict(from_attributes=True)

3. Create backend/app/api/v1/experience.py:

   from typing import Annotated
   from uuid import UUID
   from fastapi import APIRouter, Depends, HTTPException, status
   from sqlalchemy import nullslast
   from sqlalchemy.orm import Session
   from app.core.database import get_db
   from app.dependencies.auth import get_current_user
   from app.models.experience import ExperienceEntry
   from app.models.user import User
   from app.schemas.experience import (
       ExperienceEntryCreate, ExperienceEntryResponse, ExperienceEntryUpdate
   )

   router = APIRouter()

   @router.get("", response_model=list[ExperienceEntryResponse])
   def list_experience(
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       return (
           db.query(ExperienceEntry)
           .filter(ExperienceEntry.user_id == current_user.id)
           .order_by(
               ExperienceEntry.is_current.desc(),
               nullslast(ExperienceEntry.start_year.desc()),
               nullslast(ExperienceEntry.start_month.desc()),
           )
           .all()
       )

   @router.post("", response_model=ExperienceEntryResponse, status_code=status.HTTP_201_CREATED)
   def create_experience(
       data: ExperienceEntryCreate,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       entry = ExperienceEntry(**data.model_dump(), user_id=current_user.id)
       db.add(entry)
       db.commit()
       db.refresh(entry)
       return entry

   @router.put("/{entry_id}", response_model=ExperienceEntryResponse)
   def update_experience(
       entry_id: UUID,
       data: ExperienceEntryUpdate,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       entry = db.query(ExperienceEntry).filter(
           ExperienceEntry.id == entry_id,
           ExperienceEntry.user_id == current_user.id,
       ).first()
       if not entry:
           raise HTTPException(status_code=404, detail="Experience entry not found")
       for field, value in data.model_dump(exclude_unset=True).items():
           setattr(entry, field, value)
       db.commit()
       db.refresh(entry)
       return entry

   @router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
   def delete_experience(
       entry_id: UUID,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       entry = db.query(ExperienceEntry).filter(
           ExperienceEntry.id == entry_id,
           ExperienceEntry.user_id == current_user.id,
       ).first()
       if not entry:
           raise HTTPException(status_code=404, detail="Experience entry not found")
       db.delete(entry)
       db.commit()

4. Register router in backend/app/main.py:
   from app.api.v1 import experience
   app.include_router(experience.router, prefix="/api/v1/users/me/experience", tags=["Experience"])

Restart backend.
Verify: GET /api/v1/users/me/experience with valid JWT → 200 []
```

---

### PROMPT 24 — Frontend: Types + experienceApi.ts

```
1. Add to frontend/src/types/index.ts (after AcademicDetailPayload):

   export type LocationType   = 'ON_SITE' | 'HYBRID' | 'REMOTE'
   export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | 'SELF_EMPLOYED' | 'INTERNSHIP' | 'APPRENTICESHIP'

   export interface ExperienceEntry {
     id              : string
     user_id         : string
     job_title       : string
     organization    : string
     location        : string | null
     location_type   : LocationType | null
     employment_type : EmploymentType | null
     is_current      : boolean
     start_month     : number
     start_year      : number
     end_month       : number | null
     end_year        : number | null
     highlights      : string | null
     skills          : string[] | null
     created_at      : string
     updated_at      : string
   }

   export interface ExperienceEntryPayload {
     job_title        : string
     organization     : string
     location?        : string
     location_type?   : LocationType
     employment_type? : EmploymentType
     is_current?      : boolean
     start_month      : number
     start_year       : number
     end_month?       : number
     end_year?        : number
     highlights?      : string
     skills?          : string[]
   }

2. Create frontend/src/api/experienceApi.ts:

   import apiClient from './client'
   import type { ExperienceEntry, ExperienceEntryPayload } from '@/types'

   export const experienceApi = {
     list: async (): Promise<ExperienceEntry[]> => {
       const { data } = await apiClient.get<ExperienceEntry[]>('/users/me/experience')
       return data
     },
     create: async (payload: ExperienceEntryPayload): Promise<ExperienceEntry> => {
       const { data } = await apiClient.post<ExperienceEntry>('/users/me/experience', payload)
       return data
     },
     update: async (id: string, payload: Partial<ExperienceEntryPayload>): Promise<ExperienceEntry> => {
       const { data } = await apiClient.put<ExperienceEntry>(`/users/me/experience/${id}`, payload)
       return data
     },
     remove: async (id: string): Promise<void> => {
       await apiClient.delete(`/users/me/experience/${id}`)
     },
   }

Run: npx tsc --noEmit  (zero errors expected)
```

---

### PROMPT 25 — Frontend: ExperienceCard Component

```
Create frontend/src/features/profile/components/ExperienceCard.tsx

Props:
  entry: ExperienceEntry
  onEdit: () => void
  onDelete: () => void

Module-level constants and helpers:

  const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const EMPLOYMENT_LABELS: Record<string, string> = {
    FULL_TIME: 'Full-time', PART_TIME: 'Part-time', FREELANCE: 'Freelance',
    SELF_EMPLOYED: 'Self-employed', INTERNSHIP: 'Internship', APPRENTICESHIP: 'Apprenticeship',
  }

  const LOCATION_TYPE_LABELS: Record<string, string> = {
    ON_SITE: 'On-Site', HYBRID: 'Hybrid', REMOTE: 'Remote',
  }

  function formatDateRange(
    startMonth: number, startYear: number,
    endMonth: number | null, endYear: number | null,
    isCurrent: boolean
  ): { range: string; duration: string } {
    const start = `${MONTH_SHORT[startMonth - 1]} ${startYear}`
    const endLabel = isCurrent ? 'Present'
      : endYear ? `${MONTH_SHORT[(endMonth ?? 1) - 1]} ${endYear}`
      : ''

    const range = endLabel ? `${start} – ${endLabel}` : start

    const endDate = isCurrent
      ? new Date()
      : endYear ? new Date(endYear, (endMonth ?? 1) - 1) : null
    const startDate = new Date(startYear, startMonth - 1)

    if (!endDate) return { range, duration: '' }

    const totalMonths = Math.max(
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()),
      0
    )
    const yrs = Math.floor(totalMonths / 12)
    const mos = totalMonths % 12
    const parts = [
      yrs > 0 ? `${yrs} yr${yrs > 1 ? 's' : ''}` : '',
      mos > 0 ? `${mos} mo${mos > 1 ? 's' : ''}` : '',
    ].filter(Boolean)
    return { range, duration: parts.join(' ') }
  }

Render (bg-white rounded-xl shadow-sm p-5):

  HEADER ROW — flex justify-between items-start gap-3:
    LEFT (min-w-0 flex-1):
      Job title: text-base font-semibold text-slate-800 leading-snug
      Organization line (text-sm text-slate-600 mt-0.5):
        {entry.organization}
        {entry.employment_type ? ` · ${EMPLOYMENT_LABELS[entry.employment_type]}` : ''}
    RIGHT — flex gap-1 shrink-0:
      Edit button (p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50):
        <Pencil size={15} /> — onClick: onEdit
      Delete button (p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50):
        <Trash2 size={15} /> — onClick: onDelete

  META ROW — mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500:
    if entry.location or entry.location_type:
      <MapPin size={13} className="flex-shrink-0" />
      <span>
        {[entry.location, entry.location_type ? LOCATION_TYPE_LABELS[entry.location_type] : null]
          .filter(Boolean).join(' · ')}
      </span>
    const { range, duration } = formatDateRange(...)
    <Briefcase size={13} className="flex-shrink-0 ml-1" />   (or CalendarDays)
    <span>
      {range}
      {duration ? <span className="text-slate-400"> · {duration}</span> : null}
    </span>

  HIGHLIGHTS — if entry.highlights:
    <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-4">
      {entry.highlights}
    </p>

  SKILLS — if entry.skills && entry.skills.length > 0:
    <div className="mt-3 flex flex-wrap gap-1.5">
      {entry.skills.map(skill => (
        <span key={skill}
          className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">
          {skill}
        </span>
      ))}
    </div>

Icons: Pencil, Trash2, MapPin, Briefcase from lucide-react
```

---

### PROMPT 26 — Frontend: AddEditExperienceModal

```
Create frontend/src/features/profile/components/AddEditExperienceModal.tsx

Props:
  entry: ExperienceEntry | null   (null = add mode)
  open: boolean
  onClose: () => void
  onSaved: (saved: ExperienceEntry) => void

Module-level constants:
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']
  const CURRENT_YEAR = new Date().getFullYear()
  const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => CURRENT_YEAR - i)

  const LOCATION_TYPE_OPTIONS = [
    { value: 'ON_SITE',  label: 'On-Site'  },
    { value: 'HYBRID',   label: 'Hybrid'   },
    { value: 'REMOTE',   label: 'Remote'   },
  ]

  const EMPLOYMENT_TYPE_OPTIONS = [
    { value: 'FULL_TIME',      label: 'Full-time'      },
    { value: 'PART_TIME',      label: 'Part-time'      },
    { value: 'FREELANCE',      label: 'Freelance'      },
    { value: 'SELF_EMPLOYED',  label: 'Self-employed'  },
    { value: 'INTERNSHIP',     label: 'Internship'     },
    { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
  ]

Form state interface:
  interface FormState {
    job_title       : string
    organization    : string
    location        : string
    location_type   : string   // '' | 'ON_SITE' | 'HYBRID' | 'REMOTE'
    employment_type : string   // '' | enum values
    is_current      : boolean
    start_month     : string   // '' | '1'–'12'
    start_year      : string   // '' | '2024'
    end_month       : string
    end_year        : string
    highlights      : string
    skills          : string[] // array of tag strings
  }

  const BLANK: FormState = {
    job_title:'', organization:'', location:'', location_type:'',
    employment_type:'', is_current:false,
    start_month:'', start_year:'', end_month:'', end_year:'',
    highlights:'', skills:[],
  }

Skill tag input state (separate from form):
  const [skillInput, setSkillInput] = useState('')

  function addSkill() {
    const t = skillInput.trim()
    if (!t || form.skills.includes(t) || form.skills.length >= 20) return
    setField('skills', [...form.skills, t])
    setSkillInput('')
  }
  function removeSkill(s: string) {
    setField('skills', form.skills.filter(x => x !== s))
  }

useEffect([open]):
  if open: setForm from entry or BLANK; setErrors({}); setToast(null); setSkillInput('')

Validation (validate(): Errors):
  job_title:    blank → error
  organization: blank → error
  start_month:  empty → "Start month is required"
  start_year:   empty → "Start year is required"
  if !is_current: (!!end_month) !== (!!end_year) → error on end_month: "Select both month and year"

handleSave():
  Run validate(); if errors → return.
  Build payload:
    {
      job_title:       form.job_title.trim(),
      organization:    form.organization.trim(),
      location:        form.location.trim()        || undefined,
      location_type:   form.location_type          || undefined,
      employment_type: form.employment_type        || undefined,
      is_current:      form.is_current,
      start_month:     parseInt(form.start_month),
      start_year:      parseInt(form.start_year),
      end_month:  (!form.is_current && form.end_month)  ? parseInt(form.end_month)  : undefined,
      end_year:   (!form.is_current && form.end_year)   ? parseInt(form.end_year)   : undefined,
      highlights:      form.highlights.trim()      || undefined,
      skills:          form.skills.length > 0 ? form.skills : undefined,
    }
  entry === null ? experienceApi.create(payload) : experienceApi.update(entry.id, payload)
  onSaved(result)
  catch: setToast({ type: 'error', message: server detail or 'Failed to save.' })

Modal structure (identical pattern to AddEditAcademicModal):
  Fixed overlay → modal box (max-w-lg max-h-[90vh])
  Animation: scale-95/scale-100 opacity-0/opacity-100

  HEADER:
    {entry ? 'Edit Experience' : 'Add Experience'}
    X close button

  BODY (overflow-y-auto space-y-4):

    Field "Job Title *":       <input required />
    Field "Organization *":    <input required placeholder="Company or institution name" />

    Row (grid grid-cols-2 gap-3):
      Field "Employment Type":
        <select> with empty option + EMPLOYMENT_TYPE_OPTIONS
      Field "Location Type":
        <select> with empty option + LOCATION_TYPE_OPTIONS

    Field "Location":
      <input placeholder="e.g. Mumbai, India" />

    Field "Start Date *" (error on start_month):
      <div className="grid grid-cols-2 gap-3">
        Start Month select (MONTHS)
        Start Year select (YEARS)
      </div>

    "I currently work here" row:
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_current}
               onChange={e => { setField('is_current', e.target.checked); if (e.target.checked) { setField('end_month',''); setField('end_year','') } }}
               className="h-4 w-4 rounded border-slate-300 text-blue-600" />
        <span className="text-sm text-slate-700">I currently work here</span>
      </label>

    if !form.is_current:
      Field "End Date" (error on end_month):
        <div className="grid grid-cols-2 gap-3">
          End Month select (MONTHS)
          End Year select (YEARS)
        </div>

    Field "Highlights":
      <div className="relative">
        <textarea rows={4} maxLength={1000} placeholder="Key responsibilities and achievements…" />
        <span className="absolute bottom-2 right-3 text-xs text-slate-400">
          {form.highlights.length}/1000
        </span>
      </div>

    Field "Skills":
      Tag pills display (flex flex-wrap gap-1.5 mb-2) — if form.skills.length > 0:
        {form.skills.map(s => (
          <span key={s} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
            {s}
            <button type="button" onClick={() => removeSkill(s)}>
              <X size={11} />
            </button>
          </span>
        ))}
      Tag input:
        <input
          value={skillInput}
          onChange={e => setSkillInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() } }}
          onBlur={addSkill}
          placeholder="Type a skill and press Enter"
          disabled={form.skills.length >= 20}
        />
        <p className="mt-1 text-xs text-slate-400">{form.skills.length}/20 skills added</p>

  FOOTER: Cancel + Save (same pattern as AddEditAcademicModal)

Icons: X from lucide-react
```

---

### PROMPT 27 — Frontend: ExperienceTab Container

```
Create frontend/src/features/profile/components/ExperienceTab.tsx

State:
  entries:       ExperienceEntry[]
  loading:       boolean
  error:         string | null
  modal:         { open: boolean; entry: ExperienceEntry | null }
  deleteTarget:  ExperienceEntry | null
  deleteLoading: boolean

On mount (useCallback fetchEntries, called via useEffect []):
  setLoading(true)
  experienceApi.list()
    .then(setEntries)
    .catch(() => setError('Failed to load experience.'))
    .finally(() => setLoading(false))

handleDelete():
  setDeleteLoading(true)
  experienceApi.remove(deleteTarget.id)
    .then(() => { setEntries(prev => prev.filter(e => e.id !== deleteTarget.id)); setDeleteTarget(null) })
    .catch(() => { /* entry stays; user can retry */ })
    .finally(() => setDeleteLoading(false))

Render:

  TOP BAR (flex items-center justify-between mb-5):
    <h2 className="text-lg font-semibold text-slate-800">Experience</h2>
    <button onClick={() => setModal({ open: true, entry: null })} ...>
      <Plus size={15} /> Add Experience
    </button>

  CONTENT (same 4-state pattern as AcademicDetailsTab):

    if loading:  2× pulse skeleton cards

    if error:    error text + Retry button

    if !loading && !error && entries.length === 0:
      Empty state card (bg-white rounded-xl shadow-sm p-10 text-center):
        <Briefcase size={40} className="text-slate-300 mx-auto" />
        <p className="text-slate-600 font-medium mt-3">No experience added yet</p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
          Add your work history to showcase your professional background.
        </p>
        "Add Experience" button → opens modal in add mode

    if entries.length > 0:
      <div className="space-y-4">
        {entries.map(entry => (
          <ExperienceCard
            key={entry.id}
            entry={entry}
            onEdit={() => setModal({ open: true, entry })}
            onDelete={() => setDeleteTarget(entry)}
          />
        ))}
      </div>

  ADD / EDIT MODAL:
    <AddEditExperienceModal
      entry={modal.entry}
      open={modal.open}
      onClose={() => setModal({ open: false, entry: null })}
      onSaved={(saved) => {
        setEntries(prev =>
          modal.entry
            ? prev.map(e => e.id === saved.id ? saved : e)
            : [saved, ...prev]
        )
        setModal({ open: false, entry: null })
      }}
    />

  DELETE CONFIRMATION MODAL (identical structure to AcademicDetailsTab's delete confirm):
    Confirmation text:
      "{deleteTarget.job_title} at {deleteTarget.organization}"
      will be permanently removed from your profile.

Icons: Briefcase, Plus, Trash2 from lucide-react
```

---

### PROMPT 28 — Frontend: Wire Experience Tab into MyProfilePage

```
In frontend/src/features/profile/MyProfilePage.tsx:

1. Add import at top:
   import { ExperienceTab } from './components/ExperienceTab'

2. In the tabContent object, replace the 'experience' entry:
   BEFORE:
     experience: (
       <PlaceholderPage title="Experience" description="Experience section coming soon." icon={Briefcase} />
     ),
   AFTER:
     experience: <ExperienceTab />,

3. Run: npx tsc --noEmit  (zero errors expected)

4. Restart backend service: services.bat restart backend

5. End-to-end verification:
   a. Navigate to /profile → click "Experience" tab
   b. Empty state shows with Briefcase icon and "Add Experience" button
   c. Click "Add Experience": modal opens
   d. Fill in Job Title + Organization (required); Start Month + Start Year (required)
      → Save → entry appears with formatted date range and duration
   e. Check "I currently work here" → End Date fields disappear → Save
      → card shows "Jan 2023 – Present · X yrs Y mos"
   f. Click Edit pencil: modal pre-fills all fields → change a value → Save → card updates
   g. Add a skill via tag input → press Enter → pill appears → Save → card shows skill pill
   h. Click Delete trash: confirm dialog shows job_title + organization → confirm → entry removed
   i. Add multiple entries: current job appears first; others sorted newest start_year first
   j. Verify: GET /api/v1/users/me/experience returns all entries ordered correctly
```

---

## 10d. Expertise — Development Prompts (Prompts 29–35)

Each prompt is self-contained. Complete them in order. Run `npx tsc --noEmit` and restart the backend after every backend change.

---

### PROMPT 29 — Database: Migration 007 (user_expertise table)

```
Create backend/alembic/versions/007_add_user_expertise.py

Revision ID: 007
Revises: 006

In upgrade():
  op.create_table(
    "user_expertise",
    sa.Column("id",                  postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
    sa.Column("user_id",             postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
    sa.Column("total_experience",    sa.String(100), nullable=False),
    sa.Column("teaching_experience", sa.String(100), nullable=False),
    sa.Column("corporate_training",  sa.String(100), nullable=False),
    sa.Column("online_training",     sa.String(100), nullable=False),
    sa.Column("classroom_training",  sa.String(100), nullable=False),
    sa.Column("primary_expertise",   sa.String(200), nullable=False),
    sa.Column("secondary_expertise", sa.String(200), nullable=True),
    sa.Column("audience_levels",     postgresql.ARRAY(sa.String(50)), nullable=False, server_default="{}"),
    sa.Column("created_at",          sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    sa.Column("updated_at",          sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
  )
  op.create_index("ix_user_expertise_user_id", "user_expertise", ["user_id"])

In downgrade():
  op.drop_index("ix_user_expertise_user_id", table_name="user_expertise")
  op.drop_table("user_expertise")

Imports needed: from sqlalchemy.dialects import postgresql

Run: alembic upgrade head
Verify: psql → \d user_expertise shows all 11 columns.
```

---

### PROMPT 30 — Backend: UserExpertise Model + Schema + API

```
1. Create backend/app/models/expertise.py:

   from datetime import datetime
   from typing import Optional
   from uuid import UUID, uuid4
   from sqlalchemy import DateTime, ForeignKey, String, func
   from sqlalchemy.orm import Mapped, mapped_column
   from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY
   from app.core.database import Base

   VALID_AUDIENCE_LEVELS = {
       "SCHOOL", "COLLEGE_UNIVERSITY", "FRESHERS",
       "WORKING_PROFESSIONALS", "MANAGERS", "SENIOR_MANAGEMENT",
       "TECHNICAL_TEAMS", "NON_TECHNICAL_TEAMS",
   }

   class UserExpertise(Base):
       __tablename__ = "user_expertise"
       id                   : Mapped[UUID]            = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
       user_id              : Mapped[UUID]            = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
       total_experience     : Mapped[str]             = mapped_column(String(100), nullable=False)
       teaching_experience  : Mapped[str]             = mapped_column(String(100), nullable=False)
       corporate_training   : Mapped[str]             = mapped_column(String(100), nullable=False)
       online_training      : Mapped[str]             = mapped_column(String(100), nullable=False)
       classroom_training   : Mapped[str]             = mapped_column(String(100), nullable=False)
       primary_expertise    : Mapped[str]             = mapped_column(String(200), nullable=False)
       secondary_expertise  : Mapped[Optional[str]]   = mapped_column(String(200), nullable=True)
       audience_levels      : Mapped[list[str]]       = mapped_column(ARRAY(String(50)), nullable=False, default=list)
       created_at           : Mapped[datetime]        = mapped_column(DateTime(timezone=True), server_default=func.now())
       updated_at           : Mapped[datetime]        = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

2. Create backend/app/schemas/expertise.py:

   from datetime import datetime
   from typing import Optional
   from uuid import UUID
   from pydantic import BaseModel, Field, ConfigDict, field_validator
   from app.models.expertise import VALID_AUDIENCE_LEVELS

   class UserExpertisePayload(BaseModel):
       total_experience     : str             = Field(..., min_length=1, max_length=100)
       teaching_experience  : str             = Field(..., min_length=1, max_length=100)
       corporate_training   : str             = Field(..., min_length=1, max_length=100)
       online_training      : str             = Field(..., min_length=1, max_length=100)
       classroom_training   : str             = Field(..., min_length=1, max_length=100)
       primary_expertise    : str             = Field(..., min_length=1, max_length=200)
       secondary_expertise  : Optional[str]   = Field(None, max_length=200)
       audience_levels      : list[str]       = Field(..., min_length=1)

       @field_validator("total_experience", "teaching_experience", "corporate_training",
                        "online_training", "classroom_training", "primary_expertise")
       @classmethod
       def non_blank(cls, v: str) -> str:
           if not v.strip():
               raise ValueError("This field cannot be blank")
           return v.strip()

       @field_validator("audience_levels")
       @classmethod
       def validate_audience(cls, v: list[str]) -> list[str]:
           if not v:
               raise ValueError("Select at least one audience level")
           invalid = [x for x in v if x not in VALID_AUDIENCE_LEVELS]
           if invalid:
               raise ValueError(f"Invalid audience level(s): {invalid}")
           return v

   class UserExpertiseResponse(BaseModel):
       id                   : UUID
       user_id              : UUID
       total_experience     : str
       teaching_experience  : str
       corporate_training   : str
       online_training      : str
       classroom_training   : str
       primary_expertise    : str
       secondary_expertise  : Optional[str]
       audience_levels      : list[str]
       created_at           : datetime
       updated_at           : datetime
       model_config = ConfigDict(from_attributes=True)

3. Create backend/app/api/v1/expertise.py:

   from typing import Annotated
   from fastapi import APIRouter, Depends, HTTPException, status
   from sqlalchemy.dialects.postgresql import insert as pg_insert
   from sqlalchemy.orm import Session
   from app.core.database import get_db
   from app.dependencies.auth import get_current_user
   from app.models.expertise import UserExpertise
   from app.models.user import User
   from app.schemas.expertise import UserExpertisePayload, UserExpertiseResponse

   router = APIRouter()

   @router.get("", response_model=UserExpertiseResponse)
   def get_expertise(
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       record = db.query(UserExpertise).filter(UserExpertise.user_id == current_user.id).first()
       if not record:
           raise HTTPException(status_code=404, detail="Expertise not found")
       return record

   @router.put("", response_model=UserExpertiseResponse)
   def upsert_expertise(
       data: UserExpertisePayload,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       values = {**data.model_dump(), "user_id": current_user.id}
       stmt = (
           pg_insert(UserExpertise)
           .values(**values)
           .on_conflict_do_update(
               index_elements=["user_id"],
               set_={k: v for k, v in values.items() if k != "user_id"},
           )
       )
       db.execute(stmt)
       db.commit()
       record = db.query(UserExpertise).filter(UserExpertise.user_id == current_user.id).first()
       return record

4. Register router in backend/app/main.py:
   from app.api.v1 import expertise
   app.include_router(expertise.router, prefix="/api/v1/users/me/expertise", tags=["Expertise"])

Restart backend.
Verify: GET /api/v1/users/me/expertise with valid JWT → 404 (no record yet — expected)
        PUT /api/v1/users/me/expertise with full payload → 200 with created record
        GET again → 200 with the record
```

---

### PROMPT 31 — Frontend: Types + expertiseApi.ts

```
1. Add to frontend/src/types/index.ts (after ExperienceEntryPayload):

   export interface UserExpertise {
     id                   : string
     user_id              : string
     total_experience     : string
     teaching_experience  : string
     corporate_training   : string
     online_training      : string
     classroom_training   : string
     primary_expertise    : string
     secondary_expertise  : string | null
     audience_levels      : string[]
     created_at           : string
     updated_at           : string
   }

   export interface UserExpertisePayload {
     total_experience     : string
     teaching_experience  : string
     corporate_training   : string
     online_training      : string
     classroom_training   : string
     primary_expertise    : string
     secondary_expertise? : string
     audience_levels      : string[]
   }

2. Create frontend/src/api/expertiseApi.ts:

   import apiClient from './client'
   import type { UserExpertise, UserExpertisePayload } from '@/types'

   export const expertiseApi = {
     get: async (): Promise<UserExpertise | null> => {
       try {
         const { data } = await apiClient.get<UserExpertise>('/users/me/expertise')
         return data
       } catch (err: unknown) {
         if ((err as { response?: { status?: number } })?.response?.status === 404) return null
         throw err
       }
     },

     upsert: async (payload: UserExpertisePayload): Promise<UserExpertise> => {
       const { data } = await apiClient.put<UserExpertise>('/users/me/expertise', payload)
       return data
     },
   }

Run: npx tsc --noEmit  (zero errors expected)
```

---

### PROMPT 32 — Frontend: ExpertiseCard Component

```
Create frontend/src/features/profile/components/ExpertiseCard.tsx

Props:
  expertise: UserExpertise
  onEdit: () => void

Module-level constants:

  const AUDIENCE_LABELS: Record<string, string> = {
    SCHOOL:                 'School',
    COLLEGE_UNIVERSITY:     'College / University',
    FRESHERS:               'Freshers',
    WORKING_PROFESSIONALS:  'Working Professionals',
    MANAGERS:               'Managers',
    SENIOR_MANAGEMENT:      'Senior Management',
    TECHNICAL_TEAMS:        'Technical Teams',
    NON_TECHNICAL_TEAMS:    'Non-Technical Teams',
  }

  const EXPERIENCE_ROWS = [
    { key: 'total_experience',    label: 'Total Academic / Professional Experience' },
    { key: 'teaching_experience', label: 'Total Teaching Experience' },
    { key: 'corporate_training',  label: 'Corporate Training Experience' },
    { key: 'online_training',     label: 'Online Training Experience' },
    { key: 'classroom_training',  label: 'Classroom Training Experience' },
  ] as const

Render (space-y-4):

  SECTION 1 — Experience Stats (bg-white rounded-xl shadow-sm p-5):
    Header row (flex justify-between items-center mb-4):
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience</h3>
      Edit button (Pencil icon, onClick: onEdit)
    
    Table (divide-y divide-slate-100):
      For each row in EXPERIENCE_ROWS:
        <div className="flex py-2.5 gap-3">
          <span className="w-64 text-sm text-slate-500 shrink-0">{row.label}</span>
          <span className="text-sm font-medium text-slate-800">
            {expertise[row.key]}
          </span>
        </div>

  SECTION 2 — Expertise Focus (bg-white rounded-xl shadow-sm p-5):
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Expertise</h3>
    Row: label "Primary Expertise" + value (text-sm font-medium text-slate-800)
    If secondary_expertise:
      Row: label "Secondary Expertise" + value

  SECTION 3 — Audience (bg-white rounded-xl shadow-sm p-5):
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
      Audience / Training Level Delivered
    </h3>
    <div className="flex flex-wrap gap-2">
      {expertise.audience_levels.map(level => (
        <span key={level}
          className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
          {AUDIENCE_LABELS[level] ?? level}
        </span>
      ))}
    </div>

Icons: Pencil from lucide-react
```

---

### PROMPT 33 — Frontend: AddEditExpertiseModal

```
Create frontend/src/features/profile/components/AddEditExpertiseModal.tsx

Props:
  expertise: UserExpertise | null   (null = create mode)
  open: boolean
  onClose: () => void
  onSaved: (saved: UserExpertise) => void

Module-level constants:

  const AUDIENCE_OPTIONS = [
    { value: 'SCHOOL',                label: 'School' },
    { value: 'COLLEGE_UNIVERSITY',    label: 'College / University' },
    { value: 'FRESHERS',              label: 'Freshers' },
    { value: 'WORKING_PROFESSIONALS', label: 'Working Professionals' },
    { value: 'MANAGERS',              label: 'Managers' },
    { value: 'SENIOR_MANAGEMENT',     label: 'Senior Management' },
    { value: 'TECHNICAL_TEAMS',       label: 'Technical Teams' },
    { value: 'NON_TECHNICAL_TEAMS',   label: 'Non-Technical Teams' },
  ]

Form state interface:
  interface FormState {
    total_experience     : string
    teaching_experience  : string
    corporate_training   : string
    online_training      : string
    classroom_training   : string
    primary_expertise    : string
    secondary_expertise  : string
    audience_levels      : string[]
  }

  const BLANK: FormState = {
    total_experience:'', teaching_experience:'', corporate_training:'',
    online_training:'', classroom_training:'', primary_expertise:'',
    secondary_expertise:'', audience_levels:[],
  }

useEffect([open]):
  if open: setForm(expertise ? {
    total_experience:     expertise.total_experience,
    teaching_experience:  expertise.teaching_experience,
    corporate_training:   expertise.corporate_training,
    online_training:      expertise.online_training,
    classroom_training:   expertise.classroom_training,
    primary_expertise:    expertise.primary_expertise,
    secondary_expertise:  expertise.secondary_expertise ?? '',
    audience_levels:      expertise.audience_levels,
  } : BLANK)
  setErrors({}); setToast(null)

Audience toggle helper:
  function toggleAudience(value: string) {
    setField('audience_levels',
      form.audience_levels.includes(value)
        ? form.audience_levels.filter(v => v !== value)
        : [...form.audience_levels, value]
    )
  }

Validation (validate(): Errors):
  total_experience, teaching_experience, corporate_training,
  online_training, classroom_training, primary_expertise:
    → blank → "This field is required"
  audience_levels: length === 0 → error on 'audience_levels': "Select at least one audience level"

handleSave():
  Run validate(); if errors → return.
  Build payload:
    {
      total_experience:    form.total_experience.trim(),
      teaching_experience: form.teaching_experience.trim(),
      corporate_training:  form.corporate_training.trim(),
      online_training:     form.online_training.trim(),
      classroom_training:  form.classroom_training.trim(),
      primary_expertise:   form.primary_expertise.trim(),
      secondary_expertise: form.secondary_expertise.trim() || undefined,
      audience_levels:     form.audience_levels,
    }
  result = await expertiseApi.upsert(payload)
  onSaved(result)
  catch: setToast({ type: 'error', message: server detail or 'Failed to save.' })

Modal structure (same pattern as AddEditAcademicModal — max-w-lg, max-h-[90vh]):

  HEADER: {expertise ? 'Edit Expertise' : 'Add Expertise'} + X

  BODY (overflow-y-auto space-y-5):

    SECTION heading "Experience" (text-xs font-semibold uppercase tracking-wide text-slate-400):

    Field "Total Academic / Professional Experience *":
      <input placeholder='e.g. "10 years", "5+ years"' />
    Field "Total Teaching Experience *":
      <input placeholder='e.g. "3 years"' />
    Field "Corporate Training Experience *":
      <input placeholder='e.g. "2 years"' />
    Field "Online Training Experience *":
      <input placeholder='e.g. "1 year"' />
    Field "Classroom Training Experience *":
      <input placeholder='e.g. "4 years"' />

    SECTION heading "Expertise" (same style):

    Field "Primary Expertise *":
      <input placeholder='e.g. "Machine Learning, Data Science"' />
    Field "Secondary Expertise":
      <input placeholder='e.g. "Python, Statistics"' />

    SECTION heading "Audience / Training Level Delivered *":
      error message below heading if errors.audience_levels

    Checkbox grid (grid grid-cols-2 gap-2):
      For each option in AUDIENCE_OPTIONS:
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.audience_levels.includes(option.value)}
            onChange={() => toggleAudience(option.value)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          <span className="text-sm text-slate-700">{option.label}</span>
        </label>

  FOOTER: Cancel + Save (same pattern as other modals)

inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
```

---

### PROMPT 34 — Frontend: ExpertiseTab Container

```
Create frontend/src/features/profile/components/ExpertiseTab.tsx

State:
  expertise:   UserExpertise | null
  loading:     boolean
  error:       string | null
  modalOpen:   boolean

On mount (useCallback fetchExpertise, useEffect []):
  setLoading(true)
  expertiseApi.get()
    .then(data => setExpertise(data))
    .catch(() => setError('Failed to load expertise.'))
    .finally(() => setLoading(false))

Render:

  TOP BAR (flex items-center justify-between mb-5):
    <h2 className="text-lg font-semibold text-slate-800">Expertise</h2>
    if expertise:
      <button onClick={() => setModalOpen(true)} ...>
        <Pencil size={15} /> Edit Expertise
      </button>

  CONTENT:

    if loading:
      Skeleton: 3 animated pulse blocks (h-40 each, space-y-4)

    if error:
      Error text + Retry button

    if !loading && !error && expertise === null:
      Empty state card (bg-white rounded-xl shadow-sm p-10 text-center):
        <Zap size={40} className="text-slate-300 mx-auto" />
        <p className="text-slate-600 font-medium mt-3">No expertise added yet</p>
        <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
          Add your expertise profile to let organisations know your training background and delivery experience.
        </p>
        <button onClick={() => setModalOpen(true)} ...>
          Add Expertise
        </button>

    if expertise:
      <ExpertiseCard expertise={expertise} onEdit={() => setModalOpen(true)} />

  ADD / EDIT MODAL:
    <AddEditExpertiseModal
      expertise={expertise}
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      onSaved={(saved) => {
        setExpertise(saved)
        setModalOpen(false)
      }}
    />

Icons: Pencil, Zap from lucide-react
```

---

### PROMPT 35 — Frontend: Wire Expertise Tab into MyProfilePage

```
In frontend/src/features/profile/MyProfilePage.tsx:

1. Add import at top:
   import { ExpertiseTab } from './components/ExpertiseTab'

2. In the tabContent object, replace the 'expertise' entry:
   BEFORE:
     expertise: (
       <PlaceholderPage title="Expertise" description="Expertise section coming soon." icon={Zap} />
     ),
   AFTER:
     expertise: <ExpertiseTab />,

3. Zap icon is now only used in the 'expertise' placeholder — if it was the only use, remove it from the lucide-react import.
   Run: npx tsc --noEmit  (zero errors expected)

4. Restart backend: services.bat restart backend

5. End-to-end verification:
   a. Navigate to /profile → click "Expertise" tab
   b. Empty state shows with Zap icon and "Add Expertise" button
   c. Click "Add Expertise": modal opens with three sections
   d. Fill in all required text fields + select at least one audience level → Save
      → ExpertiseCard renders with all three sections (Experience stats, Expertise, Audience pills)
   e. Click "Edit Expertise": modal pre-fills all values → change a value → Save → card updates
   f. Try saving with empty required field → inline error appears, save blocked
   g. Try saving with no audience selected → error on audience section, save blocked
   h. Verify: PUT /api/v1/users/me/expertise is idempotent — calling twice with same data → no error
   i. Verify: GET /api/v1/users/me/expertise returns the record after save
```

---

## 10e. Preferences — Development Prompts (Prompts 36–41)

Each prompt is self-contained. Complete them in order. Run `npx tsc --noEmit` and restart the backend after every backend change.

---

### PROMPT 36 — Database: Migration 008 (user_preferences table)

```
Create backend/alembic/versions/008_add_user_preferences.py

Revision ID: 008
Revises: 007

In upgrade():
  op.create_table(
    "user_preferences",
    sa.Column("id",                   postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
    sa.Column("user_id",              postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
    sa.Column("delivery_modes",       postgresql.ARRAY(sa.String(50)),  nullable=False, server_default="{}"),
    sa.Column("geographic_preference",postgresql.ARRAY(sa.String(50)),  nullable=False, server_default="{}"),
    sa.Column("willing_to_travel",    sa.Boolean, nullable=False, server_default=sa.text("false")),
    sa.Column("max_travel_distance",  sa.String(20), nullable=True),
    sa.Column("travel_reimbursement", sa.Boolean, nullable=False, server_default=sa.text("false")),
    sa.Column("preferred_audience",   postgresql.ARRAY(sa.String(50)),  nullable=False, server_default="{}"),
    sa.Column("services",             postgresql.ARRAY(sa.String(50)),  nullable=False, server_default="{}"),
    sa.Column("training_topics",      postgresql.ARRAY(sa.String(200)), nullable=False, server_default="{}"),
    sa.Column("created_at",           sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    sa.Column("updated_at",           sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
  )
  op.create_index("ix_user_preferences_user_id", "user_preferences", ["user_id"])

In downgrade():
  op.drop_index("ix_user_preferences_user_id", table_name="user_preferences")
  op.drop_table("user_preferences")

No new ENUMs — all multi-select fields use TEXT[].

Run: alembic upgrade head
Verify: psql → \d user_preferences shows all 12 columns.
```

---

### PROMPT 37 — Backend: UserPreferences Model + Schema + API

```
1. Create backend/app/models/preferences.py:

   from datetime import datetime
   from typing import Optional
   from uuid import UUID, uuid4
   from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
   from sqlalchemy.orm import Mapped, mapped_column
   from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY
   from app.core.database import Base

   VALID_DELIVERY_MODES = {"CLASSROOM", "ONLINE", "HYBRID", "OFFLINE_RECORDING"}
   VALID_GEO_PREFS      = {"MY_CITY", "NEARBY_CITIES", "ENTIRE_STATE", "NEIGHBOURING_STATES", "PAN_INDIA", "REMOTE_ONLINE"}
   VALID_AUDIENCES      = {"WORKING_PROFESSIONALS", "COLLEGE_UNIVERSITY_INSTITUTES", "MANAGEMENT", "SENIOR_MANAGEMENT"}
   VALID_SERVICES       = {"LECTURE_TRAINING", "WORKSHOP", "TRANSLATION", "PROOFREADING", "CONTENT_REVIEW"}
   VALID_DISTANCES      = {"25 km", "50 km", "100 km", "200 km", "500 km", "Any distance"}

   class UserPreferences(Base):
       __tablename__ = "user_preferences"
       id                    : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
       user_id               : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
       delivery_modes        : Mapped[list[str]]      = mapped_column(ARRAY(String(50)),  nullable=False, default=list)
       geographic_preference : Mapped[list[str]]      = mapped_column(ARRAY(String(50)),  nullable=False, default=list)
       willing_to_travel     : Mapped[bool]           = mapped_column(Boolean, nullable=False, default=False)
       max_travel_distance   : Mapped[Optional[str]]  = mapped_column(String(20), nullable=True)
       travel_reimbursement  : Mapped[bool]           = mapped_column(Boolean, nullable=False, default=False)
       preferred_audience    : Mapped[list[str]]      = mapped_column(ARRAY(String(50)),  nullable=False, default=list)
       services              : Mapped[list[str]]      = mapped_column(ARRAY(String(50)),  nullable=False, default=list)
       training_topics       : Mapped[list[str]]      = mapped_column(ARRAY(String(200)), nullable=False, default=list)
       created_at            : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now())
       updated_at            : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

2. Create backend/app/schemas/preferences.py:

   from datetime import datetime
   from typing import Optional
   from uuid import UUID
   from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
   from app.models.preferences import (
       VALID_DELIVERY_MODES, VALID_GEO_PREFS, VALID_AUDIENCES, VALID_SERVICES, VALID_DISTANCES
   )

   class UserPreferencesPayload(BaseModel):
       delivery_modes        : list[str]      = Field(..., min_length=1)
       geographic_preference : list[str]      = Field(..., min_length=1)
       willing_to_travel     : bool
       max_travel_distance   : Optional[str]  = None
       travel_reimbursement  : bool
       preferred_audience    : list[str]      = Field(..., min_length=1)
       services              : list[str]      = Field(..., min_length=1)
       training_topics       : list[str]      = Field(..., min_length=1)

       @field_validator("delivery_modes")
       @classmethod
       def validate_delivery(cls, v: list[str]) -> list[str]:
           invalid = [x for x in v if x not in VALID_DELIVERY_MODES]
           if invalid: raise ValueError(f"Invalid delivery mode(s): {invalid}")
           return v

       @field_validator("geographic_preference")
       @classmethod
       def validate_geo(cls, v: list[str]) -> list[str]:
           invalid = [x for x in v if x not in VALID_GEO_PREFS]
           if invalid: raise ValueError(f"Invalid geographic preference(s): {invalid}")
           return v

       @field_validator("preferred_audience")
       @classmethod
       def validate_audience(cls, v: list[str]) -> list[str]:
           invalid = [x for x in v if x not in VALID_AUDIENCES]
           if invalid: raise ValueError(f"Invalid audience(s): {invalid}")
           return v

       @field_validator("services")
       @classmethod
       def validate_services(cls, v: list[str]) -> list[str]:
           invalid = [x for x in v if x not in VALID_SERVICES]
           if invalid: raise ValueError(f"Invalid service(s): {invalid}")
           return v

       @field_validator("training_topics")
       @classmethod
       def validate_topics(cls, v: list[str]) -> list[str]:
           if not v: raise ValueError("At least one training topic is required")
           cleaned = [t.strip() for t in v if t.strip()]
           if not cleaned: raise ValueError("At least one non-blank training topic is required")
           return cleaned

       @model_validator(mode="after")
       def check_travel_distance(self) -> "UserPreferencesPayload":
           if self.willing_to_travel:
               if not self.max_travel_distance:
                   raise ValueError("Maximum travel distance is required when willing to travel")
               if self.max_travel_distance not in VALID_DISTANCES:
                   raise ValueError(f"Invalid travel distance: {self.max_travel_distance}")
           else:
               self.max_travel_distance = None
           return self

   class UserPreferencesResponse(BaseModel):
       id                    : UUID
       user_id               : UUID
       delivery_modes        : list[str]
       geographic_preference : list[str]
       willing_to_travel     : bool
       max_travel_distance   : Optional[str]
       travel_reimbursement  : bool
       preferred_audience    : list[str]
       services              : list[str]
       training_topics       : list[str]
       created_at            : datetime
       updated_at            : datetime
       model_config = ConfigDict(from_attributes=True)

3. Create backend/app/api/v1/preferences.py:

   from typing import Annotated
   from fastapi import APIRouter, Depends, HTTPException
   from sqlalchemy.dialects.postgresql import insert as pg_insert
   from sqlalchemy.orm import Session
   from app.core.database import get_db
   from app.dependencies.auth import get_current_user
   from app.models.preferences import UserPreferences
   from app.models.user import User
   from app.schemas.preferences import UserPreferencesPayload, UserPreferencesResponse

   router = APIRouter()

   @router.get("", response_model=UserPreferencesResponse)
   def get_preferences(
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       record = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
       if not record:
           raise HTTPException(status_code=404, detail="Preferences not found")
       return record

   @router.put("", response_model=UserPreferencesResponse)
   def upsert_preferences(
       data: UserPreferencesPayload,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       values = {**data.model_dump(), "user_id": current_user.id}
       stmt = (
           pg_insert(UserPreferences)
           .values(**values)
           .on_conflict_do_update(
               index_elements=["user_id"],
               set_={k: v for k, v in values.items() if k != "user_id"},
           )
       )
       db.execute(stmt)
       db.commit()
       record = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
       return record

4. Register router in backend/app/main.py:
   from app.api.v1 import preferences
   app.include_router(preferences.router, prefix="/api/v1/users/me/preferences", tags=["Preferences"])

Restart backend.
Verify: GET /api/v1/users/me/preferences → 404 (no record yet — expected)
        PUT with full payload → 200 with created record
        GET again → 200 with record
```

---

### PROMPT 38 — Frontend: Types + preferencesApi.ts

```
1. Add to frontend/src/types/index.ts (after UserExpertisePayload):

   export interface UserPreferences {
     id                    : string
     user_id               : string
     delivery_modes        : string[]
     geographic_preference : string[]
     willing_to_travel     : boolean
     max_travel_distance   : string | null
     travel_reimbursement  : boolean
     preferred_audience    : string[]
     services              : string[]
     training_topics       : string[]
     created_at            : string
     updated_at            : string
   }

   export interface UserPreferencesPayload {
     delivery_modes        : string[]
     geographic_preference : string[]
     willing_to_travel     : boolean
     max_travel_distance?  : string
     travel_reimbursement  : boolean
     preferred_audience    : string[]
     services              : string[]
     training_topics       : string[]
   }

2. Create frontend/src/api/preferencesApi.ts:

   import apiClient from './client'
   import type { UserPreferences, UserPreferencesPayload } from '@/types'

   export const preferencesApi = {
     get: async (): Promise<UserPreferences | null> => {
       try {
         const { data } = await apiClient.get<UserPreferences>('/users/me/preferences')
         return data
       } catch (err: unknown) {
         if ((err as { response?: { status?: number } })?.response?.status === 404) return null
         throw err
       }
     },

     upsert: async (payload: UserPreferencesPayload): Promise<UserPreferences> => {
       const { data } = await apiClient.put<UserPreferences>('/users/me/preferences', payload)
       return data
     },
   }

Run: npx tsc --noEmit  (zero errors expected)
```

---

### PROMPT 39 — Frontend: PreferencesCard Component

```
Create frontend/src/features/profile/components/PreferencesCard.tsx

Props:
  preferences: UserPreferences
  onEdit: () => void

Module-level label maps (Record<string, string>):

  DELIVERY_LABELS: CLASSROOM→'Classroom', ONLINE→'Online', HYBRID→'Hybrid',
    OFFLINE_RECORDING→'Offline Session Recording'

  GEO_LABELS: MY_CITY→'My City', NEARBY_CITIES→'Nearby Cities', ENTIRE_STATE→'Entire State',
    NEIGHBOURING_STATES→'Neighbouring States', PAN_INDIA→'Pan India', REMOTE_ONLINE→'Remote / Online'

  AUDIENCE_LABELS: WORKING_PROFESSIONALS→'Working Professionals',
    COLLEGE_UNIVERSITY_INSTITUTES→'College / University / Institutes',
    MANAGEMENT→'Management', SENIOR_MANAGEMENT→'Sr. Management'

  SERVICE_LABELS: LECTURE_TRAINING→'Lecture / Training Session', WORKSHOP→'Workshop',
    TRANSLATION→'Translation', PROOFREADING→'Proofreading', CONTENT_REVIEW→'Content Review'

Helper: function Pills({ values, labelMap }: { values: string[]; labelMap: Record<string, string> })
  renders <div className="flex flex-wrap gap-2">
    each value as <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
      {labelMap[value] ?? value}
    </span>

Render (space-y-4):

  SECTION 1 — Delivery (bg-white rounded-xl shadow-sm p-5):
    Header: "Delivery" heading + Edit button (Pencil icon, onClick: onEdit)
    divide-y divide-slate-100 rows:
      Row "Delivery Mode":        <Pills values={preferences.delivery_modes} labelMap={DELIVERY_LABELS} />
      Row "Geographic Preference": <Pills values={preferences.geographic_preference} labelMap={GEO_LABELS} />
    Each row: flex py-2.5 gap-3 | label w-52 text-sm text-slate-500 shrink-0 | value flex-1

  SECTION 2 — Travel (bg-white rounded-xl shadow-sm p-5):
    Heading "Travel"
    divide-y divide-slate-100 rows:
      Row "Willing to Travel":         {preferences.willing_to_travel ? 'Yes' : 'No'}
      Row "Max. Travel Distance":
        if preferences.willing_to_travel:
          {preferences.max_travel_distance ?? '—'}
        else:
          <span className="text-slate-400 text-sm italic">N/A</span>
      Row "Travel Reimbursement":      {preferences.travel_reimbursement ? 'Yes' : 'No'}

  SECTION 3 — Audience & Services (bg-white rounded-xl shadow-sm p-5):
    Heading "Audience & Services"
    divide-y rows:
      Row "Preferred Audience":        <Pills values={...} labelMap={AUDIENCE_LABELS} />
      Row "Services I Can Deliver":    <Pills values={...} labelMap={SERVICE_LABELS} />

  SECTION 4 — Training Topics (bg-white rounded-xl shadow-sm p-5):
    Heading "Training Topics I Can Deliver"
    <div className="flex flex-wrap gap-2 mt-1">
      {preferences.training_topics.map(topic => (
        <span key={topic} className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
          {topic}
        </span>
      ))}
    </div>

Icons: Pencil from lucide-react
```

---

### PROMPT 40 — Frontend: PreferencesTab (inline form + card)

```
Create frontend/src/features/profile/components/PreferencesTab.tsx

Same inline-form pattern as ExpertiseTab — no modal.

Module-level form constants:

  DELIVERY_OPTIONS  = [{value:'CLASSROOM',label:'Classroom'},{value:'ONLINE',label:'Online'},
    {value:'HYBRID',label:'Hybrid'},{value:'OFFLINE_RECORDING',label:'Offline Session Recording'}]

  GEO_OPTIONS = [{value:'MY_CITY',label:'My City'},{value:'NEARBY_CITIES',label:'Nearby Cities'},
    {value:'ENTIRE_STATE',label:'Entire State'},{value:'NEIGHBOURING_STATES',label:'Neighbouring States'},
    {value:'PAN_INDIA',label:'Pan India'},{value:'REMOTE_ONLINE',label:'Remote / Online'}]

  AUDIENCE_OPTIONS = [{value:'WORKING_PROFESSIONALS',label:'Working Professionals'},
    {value:'COLLEGE_UNIVERSITY_INSTITUTES',label:'College / University / Institutes'},
    {value:'MANAGEMENT',label:'Management'},{value:'SENIOR_MANAGEMENT',label:'Sr. Management'}]

  SERVICE_OPTIONS = [{value:'LECTURE_TRAINING',label:'Lecture / Training Session'},
    {value:'WORKSHOP',label:'Workshop'},{value:'TRANSLATION',label:'Translation'},
    {value:'PROOFREADING',label:'Proofreading'},{value:'CONTENT_REVIEW',label:'Content Review'}]

  DISTANCE_OPTIONS = ['25 km','50 km','100 km','200 km','500 km','Any distance']

FormState interface:
  delivery_modes        : string[]
  geographic_preference : string[]
  willing_to_travel     : boolean | null   (null = not yet selected)
  max_travel_distance   : string
  travel_reimbursement  : boolean | null   (null = not yet selected)
  preferred_audience    : string[]
  services              : string[]
  training_topics       : string[]

Also: topicInput: string (separate state for tag input)

BLANK state:
  { delivery_modes:[], geographic_preference:[], willing_to_travel:null,
    max_travel_distance:'', travel_reimbursement:null, preferred_audience:[],
    services:[], training_topics:[] }

fromPreferences(p: UserPreferences): FormState:
  { ...all arrays from p, willing_to_travel: p.willing_to_travel,
    max_travel_distance: p.max_travel_distance ?? '',
    travel_reimbursement: p.travel_reimbursement }

Checkbox toggle helper (generic):
  function toggle(field: keyof FormState, value: string):
    toggles value in the array field

Topic tag helpers (same pattern as skills in ExperienceTab):
  addTopic(): trim topicInput, if not blank and not duplicate and < 50 topics → append
  removeTopic(t): filter out

Validation:
  delivery_modes: empty → "Select at least one delivery mode"
  geographic_preference: empty → "Select at least one geographic preference"
  willing_to_travel: null → "Please select Yes or No"
  max_travel_distance: willing_to_travel===true && empty → "Select maximum travel distance"
  travel_reimbursement: null → "Please select Yes or No"
  preferred_audience: empty → "Select at least one audience"
  services: empty → "Select at least one service"
  training_topics: empty → "Add at least one training topic"

handleSave():
  build payload:
    {
      delivery_modes,
      geographic_preference,
      willing_to_travel: form.willing_to_travel as boolean,
      max_travel_distance: form.willing_to_travel && form.max_travel_distance ? form.max_travel_distance : undefined,
      travel_reimbursement: form.travel_reimbursement as boolean,
      preferred_audience,
      services,
      training_topics,
    }
  await preferencesApi.upsert(payload) → setPreferences(saved), setIsEditing(false)
  catch → setSaveError(...)

Render states (same pattern as ExpertiseTab):
  1. loading: skeleton (4 blocks h-40)
  2. fetch error: error + retry button
  3. isEditing: inline form card (bg-white rounded-xl shadow-sm p-6)
  4. preferences === null: empty state (Settings icon, "No preferences set yet", "Set Preferences" button)
  5. preferences set: <PreferencesCard preferences={preferences} onEdit={startEdit} />

Inline form layout (space-y-5 inside the card):
  Form header: "Set Preferences" or "Edit Preferences" + Cancel link

  SECTION "Delivery Mode *"  (CheckboxGrid of DELIVERY_OPTIONS, 2 columns)
  SECTION "Geographic Preference *" (CheckboxGrid of GEO_OPTIONS, 2 columns)

  SECTION "Travel":
    "Willing to Travel *" — two radio buttons (Yes / No)
    if form.willing_to_travel === true:
      "Maximum Travel Distance *" — <select> of DISTANCE_OPTIONS
    "Travel Reimbursement Required *" — two radio buttons (Yes / No)

  SECTION "Preferred Audience *" (CheckboxGrid of AUDIENCE_OPTIONS, 2 columns)
  SECTION "Services I Can Deliver *" (CheckboxGrid of SERVICE_OPTIONS, 2 columns)

  SECTION "Training Topics I Can Deliver *":
    Tag display (pills with X to remove)
    <input> — type + Enter/comma → addTopic(); onBlur → addTopic()
    Counter "N topics added"
    error if formErrors.training_topics

  Save / Cancel footer buttons (same pattern as ExpertiseTab)

Helper component CheckboxGrid:
  ({ options, selected, onToggle, cols=2 }):
    <div className={`grid grid-cols-${cols} gap-2.5`}>
      <label> per option with checked state and onChange

Icons: Settings from lucide-react (for empty state)
```

---

### PROMPT 41 — Frontend: Wire Preferences Tab into MyProfilePage

```
In frontend/src/features/profile/MyProfilePage.tsx:

1. Add import:
   import { PreferencesTab } from './components/PreferencesTab'

2. In tabContent, replace the 'documents' entry:
   BEFORE:
     documents: (
       <PlaceholderPage title="Preferences" description="Preferences section coming soon." icon={FileText} />
     ),
   AFTER:
     documents: <PreferencesTab />,

3. If FileText is now unused, remove it from the lucide-react import.
   Run: npx tsc --noEmit  (zero errors expected)

4. Restart backend: services.bat restart backend

5. End-to-end verification:
   a. Navigate to /profile → click "Preferences" tab
   b. Empty state shows with Settings icon and "Set Preferences" button
   c. Click "Set Preferences": inline form appears within the tab
   d. Fill all required fields:
      - Check ≥1 Delivery Mode
      - Check ≥1 Geographic Preference
      - Select "Yes" for Willing to Travel → Max Travel Distance dropdown appears → select one
      - Select Yes/No for Travel Reimbursement
      - Check ≥1 Preferred Audience
      - Check ≥1 Service
      - Add ≥1 Training Topic via tag input
   e. Click Save → PreferencesCard renders with all 4 sections
   f. Click "Edit" on card → form pre-fills all values → change a value → Save → card updates
   g. Test validation: submit with no delivery mode → error shown, save blocked
   h. Test conditional field: Willing to Travel = No → distance field hidden; = Yes → shown & required
   i. Test Willing to Travel = No → save → card shows "N/A" for Max. Travel Distance
   j. Verify PUT idempotent: save same data twice → no error
```

---

## 10f. Achievements — Development Prompts (Prompts 42–48)

Each prompt is self-contained. Complete in order. Run `npx tsc --noEmit` and restart backend after every backend change.

---

### PROMPT 42 — Database: Migration 009 (achievements table)

```
Create backend/alembic/versions/009_add_achievements.py

Revision ID: 009
Revises: 008

In upgrade():
  op.create_table(
    "achievements",
    sa.Column("id",          postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
    sa.Column("user_id",     postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    sa.Column("title",       sa.String(200), nullable=False),
    sa.Column("description", sa.Text,        nullable=False),
    sa.Column("file_path",   sa.String(500), nullable=True),
    sa.Column("file_name",   sa.String(200), nullable=True),
    sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
    sa.Column("updated_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
  )
  op.create_index("ix_achievements_user_id", "achievements", ["user_id"])

In downgrade():
  op.drop_index("ix_achievements_user_id", table_name="achievements")
  op.drop_table("achievements")

No new ENUMs needed.

Run: alembic upgrade head
Verify: psql → \d achievements shows all 8 columns.
```

---

### PROMPT 43 — Backend: Achievement Model + Schema + CRUD API (with file upload)

```
1. Create backend/app/models/achievement.py:

   from datetime import datetime
   from typing import Optional
   from uuid import UUID, uuid4
   from sqlalchemy import DateTime, ForeignKey, String, Text, func
   from sqlalchemy.orm import Mapped, mapped_column
   from sqlalchemy.dialects.postgresql import UUID as PG_UUID
   from app.core.database import Base

   class Achievement(Base):
       __tablename__ = "achievements"
       id          : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
       user_id     : Mapped[UUID]           = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
       title       : Mapped[str]            = mapped_column(String(200), nullable=False)
       description : Mapped[str]            = mapped_column(Text, nullable=False)
       file_path   : Mapped[Optional[str]]  = mapped_column(String(500), nullable=True)
       file_name   : Mapped[Optional[str]]  = mapped_column(String(200), nullable=True)
       created_at  : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now())
       updated_at  : Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

2. Create backend/app/schemas/achievement.py:

   from datetime import datetime
   from typing import Optional
   from uuid import UUID
   from pydantic import BaseModel, ConfigDict

   class AchievementResponse(BaseModel):
       id          : UUID
       user_id     : UUID
       title       : str
       description : str
       file_path   : Optional[str]
       file_name   : Optional[str]
       created_at  : datetime
       updated_at  : datetime
       model_config = ConfigDict(from_attributes=True)

   (No Create/Update Pydantic schemas — form fields come from FastAPI Form() directly.)

3. Create backend/app/api/v1/achievements.py:

   from pathlib import Path
   from typing import Annotated, Optional
   from uuid import UUID, uuid4

   from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
   from sqlalchemy.orm import Session

   from app.core.database import get_db
   from app.dependencies.auth import get_current_user
   from app.models.achievement import Achievement
   from app.models.user import User
   from app.schemas.achievement import AchievementResponse

   router = APIRouter()

   _ACHIEVEMENTS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads" / "achievements"
   _ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png",
                     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
   _ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".docx"}
   _MAX_BYTES = 10 * 1024 * 1024  # 10 MB

   async def _save_file(entry_id: UUID, user_id: UUID, upload: UploadFile) -> tuple[str, str]:
       """Save uploaded file; return (file_path, file_name). Raises 422 on invalid type/size."""
       content_type = upload.content_type or ""
       suffix = Path(upload.filename or "").suffix.lower()
       if content_type not in _ALLOWED_TYPES and suffix not in _ALLOWED_EXTENSIONS:
           raise HTTPException(
               status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
               detail="File must be PDF, JPG, PNG, or DOCX",
           )
       data = await upload.read()
       if len(data) > _MAX_BYTES:
           raise HTTPException(
               status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
               detail="File must be smaller than 10 MB",
           )
       user_dir = _ACHIEVEMENTS_DIR / str(user_id)
       user_dir.mkdir(parents=True, exist_ok=True)
       safe_name = Path(upload.filename or "file").name
       dest_name = f"{entry_id}_{safe_name}"
       dest = user_dir / dest_name
       dest.write_bytes(data)
       file_path = f"uploads/achievements/{user_id}/{dest_name}"
       return file_path, safe_name

   def _delete_file(file_path: Optional[str]) -> None:
       """Delete file from disk if it exists."""
       if file_path:
           p = _ACHIEVEMENTS_DIR.parent.parent / file_path
           p.unlink(missing_ok=True)

   @router.get("", response_model=list[AchievementResponse])
   def list_achievements(
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       return (
           db.query(Achievement)
           .filter(Achievement.user_id == current_user.id)
           .order_by(Achievement.created_at.desc())
           .all()
       )

   @router.post("", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
   async def create_achievement(
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
       title: str = Form(..., min_length=1, max_length=200),
       description: str = Form(..., min_length=1),
       file: Optional[UploadFile] = File(None),
   ):
       if title and not title.strip():
           raise HTTPException(status_code=422, detail="Title cannot be blank")
       if description and not description.strip():
           raise HTTPException(status_code=422, detail="Description cannot be blank")

       entry_id = uuid4()
       file_path, file_name = None, None
       if file and file.filename:
           file_path, file_name = await _save_file(entry_id, current_user.id, file)

       entry = Achievement(
           id=entry_id,
           user_id=current_user.id,
           title=title.strip(),
           description=description.strip(),
           file_path=file_path,
           file_name=file_name,
       )
       db.add(entry)
       db.commit()
       db.refresh(entry)
       return entry

   @router.put("/{entry_id}", response_model=AchievementResponse)
   async def update_achievement(
       entry_id: UUID,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
       title: Optional[str] = Form(None),
       description: Optional[str] = Form(None),
       file: Optional[UploadFile] = File(None),
       clear_file: Optional[str] = Form(None),   # "true" to remove existing file
   ):
       entry = db.query(Achievement).filter(
           Achievement.id == entry_id,
           Achievement.user_id == current_user.id,
       ).first()
       if not entry:
           raise HTTPException(status_code=404, detail="Achievement not found")

       if title is not None:
           if not title.strip():
               raise HTTPException(status_code=422, detail="Title cannot be blank")
           entry.title = title.strip()
       if description is not None:
           if not description.strip():
               raise HTTPException(status_code=422, detail="Description cannot be blank")
           entry.description = description.strip()

       if file and file.filename:
           _delete_file(entry.file_path)
           entry.file_path, entry.file_name = await _save_file(entry_id, current_user.id, file)
       elif clear_file == "true":
           _delete_file(entry.file_path)
           entry.file_path = None
           entry.file_name = None

       db.commit()
       db.refresh(entry)
       return entry

   @router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
   def delete_achievement(
       entry_id: UUID,
       current_user: Annotated[User, Depends(get_current_user)],
       db: Annotated[Session, Depends(get_db)],
   ):
       entry = db.query(Achievement).filter(
           Achievement.id == entry_id,
           Achievement.user_id == current_user.id,
       ).first()
       if not entry:
           raise HTTPException(status_code=404, detail="Achievement not found")
       _delete_file(entry.file_path)
       db.delete(entry)
       db.commit()

   NOTE on _delete_file path:
     _ACHIEVEMENTS_DIR = backend/uploads/achievements/
     _ACHIEVEMENTS_DIR.parent.parent = backend/
     backend/ / "uploads/achievements/{user_id}/{name}" resolves correctly.
     Simpler alternative: just build the path from _ACHIEVEMENTS_DIR:
       parts = file_path.split("/")  # ["uploads","achievements",user_id,filename]
       dest = _ACHIEVEMENTS_DIR / parts[-2] / parts[-1]
       dest.unlink(missing_ok=True)
     Use this simpler approach in _delete_file.

4. Register router in backend/app/main.py:
   from app.api.v1 import achievements
   app.include_router(achievements.router, prefix="/api/v1/users/me/achievements", tags=["Achievements"])

Restart backend.
Verify: GET /api/v1/users/me/achievements → 200 []
        POST with multipart (title, description) → 201 with entry
        POST with multipart (title, description, file=<PDF>) → 201, file_path populated
        DELETE → 204
```

---

### PROMPT 44 — Frontend: Types + achievementsApi.ts

```
1. Add to frontend/src/types/index.ts (after UserPreferencesPayload):

   export interface Achievement {
     id          : string
     user_id     : string
     title       : string
     description : string
     file_path   : string | null
     file_name   : string | null
     created_at  : string
     updated_at  : string
   }

   export interface AchievementPayload {
     title       : string
     description : string
     file?       : File | null      // File = new upload; null = clear; undefined = keep
   }

2. Create frontend/src/api/achievementsApi.ts:

   import apiClient from './client'
   import type { Achievement, AchievementPayload } from '@/types'

   function buildForm(payload: AchievementPayload, forUpdate = false): FormData {
     const fd = new FormData()
     fd.append('title', payload.title)
     fd.append('description', payload.description)
     if (payload.file instanceof File) {
       fd.append('file', payload.file)
     } else if (forUpdate && payload.file === null) {
       fd.append('clear_file', 'true')
     }
     return fd
   }

   export const achievementsApi = {
     list: async (): Promise<Achievement[]> => {
       const { data } = await apiClient.get<Achievement[]>('/users/me/achievements')
       return data
     },

     create: async (payload: AchievementPayload): Promise<Achievement> => {
       const { data } = await apiClient.post<Achievement>(
         '/users/me/achievements',
         buildForm(payload),
         { headers: { 'Content-Type': 'multipart/form-data' } },
       )
       return data
     },

     update: async (id: string, payload: AchievementPayload): Promise<Achievement> => {
       const { data } = await apiClient.put<Achievement>(
         `/users/me/achievements/${id}`,
         buildForm(payload, true),
         { headers: { 'Content-Type': 'multipart/form-data' } },
       )
       return data
     },

     remove: async (id: string): Promise<void> => {
       await apiClient.delete(`/users/me/achievements/${id}`)
     },
   }

Run: npx tsc --noEmit  (zero errors expected)
```

---

### PROMPT 45 — Frontend: AchievementCard Component

```
Create frontend/src/features/profile/components/AchievementCard.tsx

Props:
  entry: Achievement
  onEdit: () => void
  onDelete: () => void

Render (bg-white rounded-xl shadow-sm p-5):

  ROW 1 — Header (flex items-start justify-between gap-3):
    LEFT: Title (text-base font-semibold text-slate-800)
    RIGHT: action buttons (flex gap-2 flex-shrink-0):
      Edit button (Pencil icon, size 15, onClick: onEdit)
        className: "p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      Delete button (Trash2 icon, size 15, onClick: onDelete)
        className: "p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"

  ROW 2 — Description (mt-2 text-sm text-slate-600 whitespace-pre-wrap line-clamp-4)

  ROW 3 — File attachment (if entry.file_path, mt-3):
    <a
      href={`/${entry.file_path}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
    >
      <Paperclip size={13} />
      {entry.file_name ?? 'Attachment'}
    </a>

Icons: Pencil, Trash2, Paperclip from lucide-react
```

---

### PROMPT 46 — Frontend: AddEditAchievementModal

```
Create frontend/src/features/profile/components/AddEditAchievementModal.tsx

Props:
  entry: Achievement | null   (null = create mode)
  open: boolean
  onClose: () => void
  onSaved: (saved: Achievement) => void

Form state:
  title       : string
  description : string
  fileAction  : 'keep' | 'new' | 'clear'    (for edit mode)
  newFile     : File | null

Computed payload.file:
  fileAction === 'new'   → newFile (File object)
  fileAction === 'clear' → null
  fileAction === 'keep'  → undefined

useEffect([open]): reset form to entry values or BLANK; clear errors and toast.

Validation:
  title: blank → "Title is required"
  description: blank → "Description is required"

handleSave():
  payload = { title: form.title.trim(), description: form.description.trim(), file: computedFile }
  result = entry
    ? await achievementsApi.update(entry.id, payload)
    : await achievementsApi.create(payload)
  onSaved(result)
  catch → setToast({ type:'error', message: detail or 'Failed to save.' })

Modal structure (max-w-lg, max-h-[90vh] — same pattern as other modals):

  HEADER: {entry ? 'Edit Achievement' : 'Add Achievement'} + X button

  BODY (overflow-y-auto px-5 py-5 space-y-4):

    Field "Title *":
      <input placeholder="e.g. Best Trainer Award 2023" />

    Field "Description *":
      <textarea rows={5} maxLength={2000} placeholder="Describe the achievement, publication, certification, or document…" />
      char counter bottom-right: "{description.length}/2000"

    Field "Attachment" (optional):

      --- CREATE MODE (entry === null) ---
      <label> with hidden <input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" />
      Browse button (Paperclip icon):
        className: "flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 rounded-lg
                    text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
      If newFile selected: show filename pill (gray chip + X to clear)
      Helper text: "PDF, JPG, PNG or DOCX · Max 10 MB"

      --- EDIT MODE (entry !== null) ---
      if entry.file_path and fileAction === 'keep':
        Current file row:
          <Paperclip size={13} /> {entry.file_name ?? 'Attachment'}
          Two buttons: "Replace" (sets fileAction='new') | "Remove" (sets fileAction='clear')
      if fileAction === 'new':
        File input (same as create mode, with "Cancel" link to reset to 'keep')
      if fileAction === 'clear':
        <span className="text-sm text-slate-400 italic">File will be removed on save</span>
        <button onClick={() => setFileAction('keep')}>Undo</button>

      if entry.file_path is null in edit mode: show same file browse as create mode

  FOOTER: Cancel + Save (same pattern as other modals)

inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
```

---

### PROMPT 47 — Frontend: AchievementsTab Container

```
Create frontend/src/features/profile/components/AchievementsTab.tsx

State:
  entries:       Achievement[]
  loading:       boolean
  error:         string | null
  modalOpen:     boolean
  editTarget:    Achievement | null
  deleteTarget:  Achievement | null
  deleteLoading: boolean

On mount (useCallback fetchEntries, useEffect []):
  setLoading(true)
  achievementsApi.list()
    .then(data => setEntries(data))
    .catch(() => setError('Failed to load achievements.'))
    .finally(() => setLoading(false))

onSaved(saved: Achievement):
  if editTarget: map existing entries replacing matched id
  else: prepend to entries list
  setModalOpen(false); setEditTarget(null)

onDeleteConfirm():
  setDeleteLoading(true)
  achievementsApi.remove(deleteTarget.id)
    .then(() => setEntries(e => e.filter(x => x.id !== deleteTarget.id)))
    .catch(() => {/* ignore, user can retry */})
    .finally(() => { setDeleteLoading(false); setDeleteTarget(null) })

Render:

  TOP BAR (flex items-center justify-between mb-4):
    <h2 className="text-lg font-semibold text-slate-800">Achievements</h2>
    <button onClick={() => { setEditTarget(null); setModalOpen(true) }}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
      <Plus size={15} /> Add Achievement
    </button>

  INFO BANNER (mb-5):
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-2">
        What can you add here?
      </p>
      <div className="flex flex-wrap gap-1.5">
        {["Awards", "Highlights", "Publications", "Professional Certification",
          "Research Areas", "Conferences", "CV / Resume", "Profile / Bio",
          "Certifications", "Academic Certificates", "Training Credentials", "Portfolio"
        ].map(cat => (
          <span key={cat}
            className="px-2.5 py-1 text-xs bg-white border border-blue-200 text-blue-600 rounded-full">
            {cat}
          </span>
        ))}
      </div>
    </div>

  CONTENT:

    if loading:
      Skeleton: 3 animated pulse blocks (h-32 each, space-y-4)

    if error:
      Error text + Retry button

    if !loading && !error && entries.length === 0:
      Empty state (bg-white rounded-xl shadow-sm p-10 text-center):
        <Trophy size={40} className="text-slate-300 mx-auto" />
        <p className="text-slate-600 font-medium mt-3">No achievements added yet</p>
        <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
          Upload your awards, certifications, publications, CV, and more.
        </p>
        <button onClick={() => { setEditTarget(null); setModalOpen(true) }}
          className="mt-5 px-5 py-2 bg-blue-600 text-white text-sm font-medium
                     rounded-lg hover:bg-blue-500 transition-colors">
          Add Achievement
        </button>

    if entries.length > 0:
      <div className="space-y-4">
        {entries.map(entry => (
          <AchievementCard
            key={entry.id}
            entry={entry}
            onEdit={() => { setEditTarget(entry); setModalOpen(true) }}
            onDelete={() => setDeleteTarget(entry)}
          />
        ))}
      </div>

  ADD / EDIT MODAL:
    <AddEditAchievementModal
      entry={editTarget}
      open={modalOpen}
      onClose={() => { setModalOpen(false); setEditTarget(null) }}
      onSaved={onSaved}
    />

  DELETE CONFIRM MODAL (fixed inset-0 z-50 — same backdrop pattern):
    Shown when deleteTarget !== null.
    Message: 'Delete "{deleteTarget.title}"? This cannot be undone.'
    If deleteTarget.file_path: add note 'The attached file will also be deleted.'
    Buttons: Cancel | Delete (red, shows spinner when deleteLoading)

Icons: Plus, Trophy from lucide-react
```

---

### PROMPT 48 — Frontend: Wire Achievements Tab into MyProfilePage

```
In frontend/src/features/profile/MyProfilePage.tsx:

1. Add import:
   import { AchievementsTab } from './components/AchievementsTab'

2. In tabContent, replace the 'reviews' entry:
   BEFORE:
     reviews: (
       <PlaceholderPage title="Achievements" description="Achievements section coming soon." icon={Star} />
     ),
   AFTER:
     reviews: <AchievementsTab />,

3. If Star is now unused, remove it from the lucide-react import.
   Run: npx tsc --noEmit  (zero errors expected)

4. Restart backend: services.bat restart backend

5. End-to-end verification:
   a. Navigate to /profile → click "Achievements" tab
   b. Info banner displays category chips; empty state shows Trophy icon + "Add Achievement"
   c. Click "Add Achievement": modal opens with Title, Description, Attachment fields
   d. Fill Title + Description only (no file) → Save → card appears without file row
   e. Click "Add Achievement" again → fill Title + Description + attach a PDF → Save
      → card shows Paperclip + filename link; clicking link downloads/opens the file
   f. Edit the card with no file → "Replace" / "Remove" buttons not shown (entry.file_path is null)
   g. Edit a card that HAS a file:
      → "Replace" → file input appears → select new file → Save → new file served
      → "Remove" → "File will be removed on save" text appears → Save → file_path = null
   h. Delete a card → confirm dialog shows entry title → confirm → card removed, file deleted from disk
   i. Verify: GET /api/v1/users/me/achievements returns list ordered newest first
   j. Verify: uploaded files accessible at /{file_path} in browser
```

---

## 10g. Service Delivery — Development Prompts (Prompts 49–54)

Each prompt is self-contained. Complete in order. Run `npx tsc --noEmit` and restart backend after every backend change.

---

### PROMPT 49 — Migration 013: user_service_delivery table

```
Create backend/alembic/versions/013_add_user_service_delivery.py

Adds the user_service_delivery table (1:1 per user, all 33 boolean columns
default FALSE). See §6g for the full SQL.

Requirements:
- down_revision = '012'  (categories migration)
- upgrade():
    op.create_table(
      'user_service_delivery',
      sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, ...),
      sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, unique=True),
      sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
      # 33 boolean columns — all nullable=False, server_default='false'
      sa.Column('can_take_lecture', sa.Boolean(), nullable=False, server_default='false'),
      ... (all fields from §6g in order) ...
      sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
      sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    op.create_index('ix_user_service_delivery_user_id',
                    'user_service_delivery', ['user_id'])
- downgrade(): op.drop_table('user_service_delivery')

Run after creation: alembic upgrade head
Verify: \d user_service_delivery in psql shows all 33 boolean columns.
```

---

### PROMPT 50 — Backend: model + schema + upsert API

```
1. Create backend/app/models/service_delivery.py

   SQLAlchemy ORM model UserServiceDelivery mapped to 'user_service_delivery'.
   Map all 33 boolean columns from §6g plus id, user_id, created_at, updated_at.
   No back-reference to User is required.

2. Create backend/app/schemas/service_delivery.py

   Two Pydantic v2 models:

   class UserServiceDeliveryPayload(BaseModel):
       # All 33 boolean fields, each: field_name: bool = False
       can_take_lecture: bool = False
       lecture_classroom: bool = False
       ... (all fields from §6g)

   class UserServiceDeliveryResponse(BaseModel):
       model_config = ConfigDict(from_attributes=True)
       id: uuid.UUID
       user_id: uuid.UUID
       # All 33 boolean fields
       can_take_lecture: bool
       ...
       created_at: datetime
       updated_at: datetime

3. Create backend/app/api/v1/profile/service_delivery.py

   router = APIRouter()

   GET ""
   - Query: SELECT * FROM user_service_delivery WHERE user_id = current_user.id
   - If no row found: return an all-false UserServiceDeliveryResponse with
     id=uuid4(), user_id=current_user.id, created_at/updated_at=now()
     (do NOT raise 404 — simplifies frontend)

   PUT ""
   - Body: UserServiceDeliveryPayload
   - Use SQLAlchemy core insert(UserServiceDelivery).values(user_id=..., **payload.model_dump())
     .on_conflict_do_update(index_elements=['user_id'],
                            set_={**payload.model_dump(), 'updated_at': func.now()})
   - db.execute(stmt); db.commit()
   - Refetch and return UserServiceDeliveryResponse

4. Register in backend/app/api/v1/profile/__init__.py (or wherever the profile
   sub-routers are aggregated) with:
     router.include_router(service_delivery_router,
                           prefix="/service-delivery",
                           tags=["Service Delivery"])
   Ensure the parent mount in main.py is /api/v1/users/me so the full path
   becomes /api/v1/users/me/service-delivery.

Restart backend.
Test: GET /api/v1/users/me/service-delivery → 200 with all-false booleans.
Test: PUT /api/v1/users/me/service-delivery {"can_take_lecture": true, ...}
      → 200, refetch GET → values persisted.
```

---

### PROMPT 51 — Frontend: types + serviceDeliveryApi.ts

```
1. Add interfaces to frontend/src/types/profile.ts
   (or create frontend/src/types/serviceDelivery.ts):

   export interface UserServiceDelivery {
     id: string
     user_id: string
     // Section 1
     can_take_lecture: boolean
     lecture_classroom: boolean
     lecture_online: boolean
     lecture_offline_recording: boolean
     lecture_blended_flipped: boolean
     lecture_hybrid_hyflex: boolean
     lecture_hands_on_workshop: boolean
     lecture_mentoring: boolean
     // Section 2
     can_create_content: boolean
     content_creation: boolean
     content_explainer: boolean
     content_presentation: boolean
     content_course_design: boolean
     content_syllabus_design: boolean
     content_reference_material: boolean
     // Section 3
     lang_translation: boolean
     lang_transcription: boolean
     lang_transcript_review: boolean
     lang_proofreading: boolean
     lang_voiceover: boolean
     lang_localization: boolean
     lang_subtitling: boolean
     // Section 4
     eval_case_study_creation: boolean
     eval_case_study_review: boolean
     eval_case_study_mentoring: boolean
     eval_assignment_creation: boolean
     eval_assignment_review: boolean
     eval_assignment_mentoring: boolean
     eval_qbank_creation: boolean
     eval_qbank_review: boolean
     eval_qpaper_creation: boolean
     eval_qpaper_review: boolean
     eval_qpaper_grading: boolean
     created_at: string
     updated_at: string
   }

   export type UserServiceDeliveryPayload = Omit<
     UserServiceDelivery, 'id' | 'user_id' | 'created_at' | 'updated_at'
   >

2. Create a constant:
   export const EMPTY_SERVICE_DELIVERY: UserServiceDelivery = {
     id: '', user_id: '',
     can_take_lecture: false, lecture_classroom: false, ...  // all 33 false
     created_at: '', updated_at: '',
   }

3. Create frontend/src/api/serviceDeliveryApi.ts:

   import axiosInstance from '@/lib/axios'
   import type { UserServiceDelivery, UserServiceDeliveryPayload } from '@/types/...'

   const BASE = '/api/v1/users/me/service-delivery'

   export const getServiceDelivery = (): Promise<UserServiceDelivery> =>
     axiosInstance.get(BASE).then(r => r.data)

   export const updateServiceDelivery = (
     payload: UserServiceDeliveryPayload
   ): Promise<UserServiceDelivery> =>
     axiosInstance.put(BASE, payload).then(r => r.data)

Run: npx tsc --noEmit — no type errors.
```

---

### PROMPT 52 — Frontend: ServiceDeliveryCard display component

```
Create frontend/src/features/profile/components/ServiceDeliveryCard.tsx

Props: { data: UserServiceDelivery; onEdit: () => void }

Overall structure:
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    Header row: title "Service Delivery" + <Edit> button (pencil icon, top-right)
    Body: 4 section panels separated by <hr /> dividers

SECTION 1 — Lecture Delivery
  If can_take_lecture: show badge <span className="bg-teal-100 text-teal-800 ...">
    ✓ Can Deliver Lectures
  </span>
  Sub-fields to check (lecture_classroom, lecture_online, lecture_offline_recording,
    lecture_blended_flipped, lecture_hybrid_hyflex, lecture_hands_on_workshop,
    lecture_mentoring): render true ones as small teal pills in a flex-wrap row
  Display labels: use the "Display Label" column from §6g
  If no sub-fields true AND can_take_lecture false: <p className="text-slate-400 text-sm">
    Not specified</p>

SECTION 2 — Content & Course Development
  Same pattern with can_create_content parent badge "✓ Can Create Content"
  Sub-fields: content_creation, content_explainer, content_presentation,
    content_course_design, content_syllabus_design, content_reference_material

SECTION 3 — Language & Media
  No parent badge. Pills for true fields among:
    lang_translation, lang_transcription, lang_transcript_review,
    lang_proofreading, lang_voiceover, lang_localization, lang_subtitling
  Empty → "Not specified"

SECTION 4 — Learning Support & Evaluation
  Three sub-group rows inside the section:
  "Case Study & Projects":
    eval_case_study_creation, eval_case_study_review, eval_case_study_mentoring
  "Assignments":
    eval_assignment_creation, eval_assignment_review, eval_assignment_mentoring
  "Assessments":
    eval_qbank_creation, eval_qbank_review,
    eval_qpaper_creation, eval_qpaper_review, eval_qpaper_grading
  Render sub-group row only if ≥1 field in it is true
  If ALL fields in section 4 are false → "Not specified"

OVERALL EMPTY STATE (all 33 fields false):
  Replace the four section panels with a centred empty block:
  <div className="text-center py-10">
    <p className="text-slate-500 mb-4">No service delivery capabilities specified yet.</p>
    <button onClick={onEdit} className="...">Edit Profile</button>
  </div>

Run: npx tsc --noEmit — no errors.
```

---

### PROMPT 53 — Frontend: ServiceDeliveryTab inline form

```
Create frontend/src/features/profile/components/ServiceDeliveryTab.tsx

State:
  const [data, setData] = useState<UserServiceDelivery>(EMPTY_SERVICE_DELIVERY)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<UserServiceDeliveryPayload>(...)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

On mount:
  getServiceDelivery().then(setData).finally(() => setLoading(false))

READ MODE: <ServiceDeliveryCard data={data} onEdit={() => {
  setForm({ ...data }); setIsEditing(true)
}} />

EDIT MODE:
  Helper: const toggle = (field: keyof UserServiceDeliveryPayload) =>
    setForm(f => ({ ...f, [field]: !f[field] }))

  Helper: const CheckRow = ({ label, field }: { label: string;
    field: keyof UserServiceDeliveryPayload }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={form[field]} onChange={() => toggle(field)} />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  )

  FIELDSET 1 — "Lecture Delivery"
  <fieldset className="space-y-2">
    <legend className="text-sm font-semibold text-slate-700 mb-2">
      Lecture Delivery
    </legend>
    <CheckRow label="I can deliver lectures" field="can_take_lecture" />
    <div className="pl-6 space-y-2">
      <CheckRow label="Classroom / In-Person"              field="lecture_classroom" />
      <CheckRow label="Online"                             field="lecture_online" />
      <CheckRow label="Offline Recording / Screen Casting" field="lecture_offline_recording" />
      <CheckRow label="Blended / Flipped"                  field="lecture_blended_flipped" />
      <CheckRow label="Hybrid / HyFlex"                    field="lecture_hybrid_hyflex" />
      <CheckRow label="Hands-On / Workshop"                field="lecture_hands_on_workshop" />
      <CheckRow label="Mentoring / Doubt-Clearing Sessions" field="lecture_mentoring" />
    </div>
  </fieldset>

  FIELDSET 2 — "Content & Course Development"
  <fieldset ...>
    <CheckRow label="I can create content & courses" field="can_create_content" />
    <div className="pl-6 space-y-2">
      <CheckRow label="Content Creation"        field="content_creation" />
      <CheckRow label="Explainer Creation"       field="content_explainer" />
      <CheckRow label="Content Presentation"     field="content_presentation" />
      <CheckRow label="Course Design"            field="content_course_design" />
      <CheckRow label="Syllabus Design"          field="content_syllabus_design" />
      <CheckRow label="Reference Material / PDCC" field="content_reference_material" />
    </div>
  </fieldset>

  FIELDSET 3 — "Language & Media" (2-column grid on md+)
  <fieldset ...>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <CheckRow label="Translation"       field="lang_translation" />
      <CheckRow label="Transcription"     field="lang_transcription" />
      <CheckRow label="Transcript Review" field="lang_transcript_review" />
      <CheckRow label="Proofreading"      field="lang_proofreading" />
      <CheckRow label="Voice-over / Narration" field="lang_voiceover" />
      <CheckRow label="Localization"      field="lang_localization" />
      <CheckRow label="Subtitling"        field="lang_subtitling" />
    </div>
  </fieldset>

  FIELDSET 4 — "Learning Support & Evaluation"
  <fieldset ...>
    Sub-group "Case Study & Projects" (small grey label, not a checkbox):
      <CheckRow label="Creation"  field="eval_case_study_creation" />
      <CheckRow label="Review"    field="eval_case_study_review" />
      <CheckRow label="Mentoring" field="eval_case_study_mentoring" />
    Sub-group "Assignments":
      <CheckRow label="Creation"  field="eval_assignment_creation" />
      <CheckRow label="Review"    field="eval_assignment_review" />
      <CheckRow label="Mentoring" field="eval_assignment_mentoring" />
    Sub-group "Assessments":
      <CheckRow label="Question Bank — Creation"         field="eval_qbank_creation" />
      <CheckRow label="Question Bank — Review"           field="eval_qbank_review" />
      <CheckRow label="Question Paper — Creation"        field="eval_qpaper_creation" />
      <CheckRow label="Question Paper — Review"          field="eval_qpaper_review" />
      <CheckRow label="Question Paper — Grading / Evaluation" field="eval_qpaper_grading" />
  </fieldset>

  Action bar (sticky bottom or inline):
    <button onClick={handleSave} disabled={saving}>
      {saving ? 'Saving…' : 'Save'}
    </button>
    <button onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>

  handleSave:
    setSaving(true); setError(null)
    try {
      const updated = await updateServiceDelivery(form)
      setData(updated); setIsEditing(false)
    } catch (e) {
      setError('Failed to save. Please try again.')
    } finally { setSaving(false) }

Run: npx tsc --noEmit — no errors.
```

---

### PROMPT 54 — Frontend: Wire ServiceDeliveryTab into MyProfilePage

```
In frontend/src/features/profile/MyProfilePage.tsx:

1. Import:
   import { ServiceDeliveryTab } from
     '@/features/profile/components/ServiceDeliveryTab'

2. In the ProfileTabBar tab list, find the entry with id: 'availability'.
   Change its label from 'Availability' to 'Service Delivery'.
   (Tab id may stay as 'availability' OR be renamed to 'services' —
   rename only if no existing deep links depend on the id string.)

3. In the tab content render section, replace the PlaceholderPage block
   for the 'availability' tab with:
     case 'availability':
       return <ServiceDeliveryTab />

4. Remove any now-unused PlaceholderPage import for this tab.

Run: npx tsc --noEmit, restart frontend.

End-to-end test:
  a. Navigate to /profile → click "Service Delivery" tab
  b. Empty state shown (no capabilities specified yet)
  c. Click Edit → 4 fieldsets, all 33 checkboxes unchecked
  d. Check several boxes across all sections → Save
  e. Card view shows checked items as pills under the correct section
  f. Edit again → checked state matches saved values
  g. Network tab: PUT /api/v1/users/me/service-delivery sent with correct JSON payload
  h. Reload page → selections persist (GET returns saved values)
  i. Check only parent (can_take_lecture=true, all children false) → card shows
     "✓ Can Deliver Lectures" badge but no sub-capability pills
```

---

## 11. Delivery Sequence Summary

```
PHASE 1 — Backend Foundation
  Step 01  →  Prompt 1   Migration 004 (new DB columns + enums)
  Step 02  →  Prompt 2   User model update
  Step 03  →  Prompt 3   Schemas update (UserResponse + UpdateRequest)
  Step 04  →  Prompt 4   Profile API router + register in main.py

PHASE 2 — Frontend Foundation
  Step 05  →  Prompt 5   Types update (User interface + new types)
  Step 06  →  Prompt 6   profileApi.ts client

PHASE 3 — Display Components
  Step 07  →  Prompt 7   ProfileCompletionCard
  Step 08  →  Prompt 8   ProfileHeader
  Step 09  →  Prompt 9   ProfileTabBar
  Step 10  →  Prompt 10  PersonalInfoCard
  Step 11  →  Prompt 11  BioCard

PHASE 4 — Edit Components
  Step 12  →  Prompt 12  EditPersonalInfoDrawer

PHASE 5 — Page Assembly
  Step 13  →  Prompt 13  MyProfilePage (container)
  Step 14  →  Prompt 14  Route wiring + end-to-end test

── REPEAT for each new section when attribute PDF is provided ──

  SECTION CYCLE (per tab):
    A. Receive attribute PDF → update this document
    B. Migration (if new columns/tables needed)
    C. Backend schema + endpoint update
    D. Frontend types + API client update
    E. Display component
    F. Edit drawer/modal
    G. Wire into MyProfilePage tab content

SECTION 2 — Academic Details (Prompts 15–21)
  Step 15  →  Prompt 15  Migration 005 (academic_details table)
  Step 16  →  Prompt 16  AcademicDetail model + schema + CRUD API
  Step 17  →  Prompt 17  Frontend types + academicApi.ts
  Step 18  →  Prompt 18  AcademicDetailCard (display single entry)
  Step 19  →  Prompt 19  AddEditAcademicModal (add / edit popup)
  Step 20  →  Prompt 20  AcademicDetailsTab (tab container + delete confirm)
  Step 21  →  Prompt 21  Wire into MyProfilePage + end-to-end test

SECTION 3 — Experience (Prompts 22–28)
  Step 22  →  Prompt 22  Migration 006 (experience_entries table + 2 new ENUMs)
  Step 23  →  Prompt 23  ExperienceEntry model + schema + CRUD API
  Step 24  →  Prompt 24  Frontend types + experienceApi.ts
  Step 25  →  Prompt 25  ExperienceCard (display single entry with duration calc)
  Step 26  →  Prompt 26  AddEditExperienceModal (add / edit popup + skill tags)
  Step 27  →  Prompt 27  ExperienceTab (tab container + delete confirm)
  Step 28  →  Prompt 28  Wire into MyProfilePage + end-to-end test

SECTION 4 — Expertise (Prompts 29–35)
  Step 29  →  Prompt 29  Migration 007 (user_expertise table, no new ENUMs)
  Step 30  →  Prompt 30  UserExpertise model + schema + GET/PUT upsert API
  Step 31  →  Prompt 31  Frontend types (UserExpertise, UserExpertisePayload) + expertiseApi.ts
  Step 32  →  Prompt 32  ExpertiseCard (3-section display: stats, focus, audience pills)
  Step 33  →  Prompt 33  AddEditExpertiseModal (text fields + audience checkbox grid)
  Step 34  →  Prompt 34  ExpertiseTab (inline form: empty state / card + edit — no modal)
  Step 35  →  Prompt 35  Wire into MyProfilePage + end-to-end test

SECTION 5 — Preferences (Prompts 36–41)
  Step 36  →  Prompt 36  Migration 008 (user_preferences table, no new ENUMs, all TEXT[])
  Step 37  →  Prompt 37  UserPreferences model + schema + GET/PUT upsert API
  Step 38  →  Prompt 38  Frontend types (UserPreferences, UserPreferencesPayload) + preferencesApi.ts
  Step 39  →  Prompt 39  PreferencesCard (4-section display: delivery, travel, audience+services, topics)
  Step 40  →  Prompt 40  PreferencesTab (inline form: checkboxes, radios, travel conditional, tag input)
  Step 41  →  Prompt 41  Wire into MyProfilePage + end-to-end test

SECTION 6 — Achievements (Prompts 42–48)
  Step 42  →  Prompt 42  Migration 009 (achievements table, no ENUMs, file_path VARCHAR)
  Step 43  →  Prompt 43  Achievement model + schema + CRUD API with multipart file upload/delete
  Step 44  →  Prompt 44  Frontend types (Achievement, AchievementPayload) + achievementsApi.ts (FormData)
  Step 45  →  Prompt 45  AchievementCard (title, description, file download link, edit/delete buttons)
  Step 46  →  Prompt 46  AddEditAchievementModal (file upload UI: browse, replace, clear)
  Step 47  →  Prompt 47  AchievementsTab (info banner with category chips, list, delete confirm)
  Step 48  →  Prompt 48  Wire into MyProfilePage + end-to-end test

SECTION 7 — Service Delivery (Prompts 49–54)
  Step 49  →  Prompt 49  Migration 013 (user_service_delivery table, 33 boolean columns, no ENUMs)
  Step 50  →  Prompt 50  UserServiceDelivery model + schema + GET (all-false default) / PUT upsert API
  Step 51  →  Prompt 51  Frontend types (UserServiceDelivery, UserServiceDeliveryPayload, EMPTY const) + serviceDeliveryApi.ts
  Step 52  →  Prompt 52  ServiceDeliveryCard (4-section display: parent badges + capability pills, overall empty state)
  Step 53  →  Prompt 53  ServiceDeliveryTab (inline form: 4 fieldsets, parent + indented children, sub-group labels)
  Step 54  →  Prompt 54  Wire into MyProfilePage + rename tab label "Availability" → "Service Delivery" + end-to-end test
```

---

## 12. Decisions & Open Questions

| # | Question | Decision | Owner |
|---|---|---|---|
| 1 | Should profile page show other users' profiles (public view)? | Not in scope for now; only own profile | To confirm |
| 2 | Email change flow — OTP or password confirmation? | OTP preferred; separate flow outside this page | To design |
| 3 | Where to store profile photo — local `uploads/` or cloud storage? | Local `uploads/photos/` for now; migrate to S3 later | Backend |
| 4 | Should `designation` be a free-text field or strict enum? | Enum for Phase 1 per attribute PDF; may extend | Confirmed by PDF |
| 5 | Profile completion weight per section? | Equal weight per field for Phase 1 | To refine |
| 6 | Skill tags — JSON column or separate junction table? | Pending Expertise & Skills attribute PDF | Pending |
| 7 | Review tab — can the user respond to reviews? | Pending Reviews attribute PDF | Pending |
| 8 | Is `consent` a one-time T&C acceptance or per-feature? | Pending clarification | To confirm |

---

*Document maintained by the K-CONNECT development team.*  
*Update this file when new attribute PDFs are received for each tab section.*
