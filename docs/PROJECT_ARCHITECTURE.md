# K-CONNECT — Project Architecture

## Architecture Overview

K-CONNECT is a job and opportunity marketplace Progressive Web Application (PWA) that connects Vendors/Organizations with Trainers, SMEs, Freelancers, Consultants, and Industry Professionals.

The application runs entirely on a single Windows Server 2012 R2 VM with no containerization. IIS acts as the unified entry point, serving the React frontend and proxying API traffic to the FastAPI backend.

```
Internet
    │
    ▼
IIS 8.5  (Port 80 / 443)
    │
    ├── Static Files  →  React Production Build  (dist/)
    │       └── SPA fallback rewrite rule
    │
    └── /api/*  →  ARR Reverse Proxy
                        │
                        ▼
                  Uvicorn (Port 8000)
                  FastAPI Application
                        │
                        ▼
                  PostgreSQL (Port 5432)
```

---

## Technology Decisions

| Layer | Technology | Version | Reason |
|-------|-----------|---------|--------|
| Frontend | React + TypeScript | 18.x | Type safety, component reuse |
| Build tool | Vite | 5.x | Fast HMR, optimized builds |
| Styling | Tailwind CSS | 3.x | Utility-first, zero dead CSS |
| State | Zustand | 4.x | Minimal boilerplate, no context hell |
| HTTP | Axios | 1.x | Interceptors for JWT refresh |
| PWA | vite-plugin-pwa | Latest | Service worker + manifest |
| Backend | FastAPI + Python | 3.12.x | Async, auto OpenAPI docs |
| ORM | SQLAlchemy | 2.x | Mature, migrations via Alembic |
| Migrations | Alembic | Latest | Schema version control |
| Auth | python-jose + passlib | Latest | JWT + bcrypt |
| Database | PostgreSQL | 15.x | Relational, ACID, JSON support |
| Process mgr | Uvicorn + NSSM | Latest | Windows Service for FastAPI |
| Web server | IIS 8.5 | Built-in | Already on Windows Server |
| Proxy | ARR + URL Rewrite | 3.0 / 2.1 | IIS-native reverse proxy |

---

## Frontend Architecture

```
frontend/
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512, etc.)
│   └── robots.txt
├── src/
│   ├── assets/             # Static images, fonts
│   ├── components/         # Shared/reusable UI components
│   │   ├── ui/             # Primitive components (Button, Input, Card)
│   │   └── layout/         # Header, Footer, Sidebar, Layout wrappers
│   ├── features/           # Feature-sliced modules
│   │   ├── auth/           # Login, Register, AuthGuard
│   │   ├── dashboard/      # Role-specific dashboards
│   │   ├── opportunities/  # Browse, detail, apply
│   │   ├── profile/        # User profile management
│   │   └── organizations/  # Organization pages
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Axios instance, utilities
│   ├── pages/              # Route-level page components
│   ├── router/             # React Router configuration
│   ├── store/              # Zustand stores
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/              # Shared TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

### PWA Configuration

- **Manifest**: standalone display mode, themed to K-CONNECT brand
- **Service Worker**: Workbox-generated via vite-plugin-pwa
- **Caching strategy**: Network-first for API, Cache-first for static assets
- **Offline support**: Cached shell, graceful degradation for data

### Routing Strategy

React Router v6 with nested routes. All routes fall back to `index.html` via IIS URL Rewrite (SPA support).

### Authentication Flow

1. Login → JWT access token + refresh token stored in memory / httpOnly cookie
2. Axios request interceptor attaches `Authorization: Bearer <token>`
3. Axios response interceptor catches 401, calls `/auth/refresh`, retries
4. Protected routes wrapped in `AuthGuard` component checking Zustand auth store

---

## Backend Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory, middleware, router registration
│   ├── core/
│   │   ├── config.py        # Settings via pydantic-settings (.env)
│   │   ├── database.py      # SQLAlchemy engine, session factory
│   │   └── security.py      # JWT encode/decode, password hashing
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py          # /auth endpoints
│   │       ├── users.py         # /users endpoints
│   │       ├── organizations.py # /organizations endpoints
│   │       ├── opportunities.py # /opportunities endpoints
│   │       ├── applications.py  # /applications endpoints
│   │       └── dashboard.py     # /dashboard endpoints
│   ├── models/              # SQLAlchemy ORM models (one file per domain)
│   ├── schemas/             # Pydantic request/response schemas
│   ├── services/            # Business logic layer (between API and DB)
│   └── dependencies/        # FastAPI dependency injection (get_db, get_current_user)
├── alembic/
│   ├── versions/            # Migration scripts
│   └── env.py
├── alembic.ini
├── requirements.txt
└── .env.example
```

### API Versioning

All routes live under `/api/v1/`. When v2 is needed, add `api/v2/` alongside without breaking existing clients.

### Dependency Injection Pattern

```python
# Common dependencies injected into route handlers:
get_db()            → yields SQLAlchemy Session
get_current_user()  → returns authenticated User model
require_role(role)  → role-based access guard
```

### Security Model

- Passwords hashed with **bcrypt** (passlib)
- **Access tokens**: short-lived JWT (15–60 min)
- **Refresh tokens**: long-lived JWT (7–30 days), stored server-side hash in DB for revocation
- CORS configured for known frontend origins only

---

## Database Architecture

```
users
├── id (UUID PK)
├── email (unique)
├── hashed_password
├── full_name
├── role (ENUM: ADMIN, VENDOR, TRAINER, SME, FREELANCER, CONSULTANT)
├── is_active
├── is_verified
├── created_at / updated_at

organizations
├── id (UUID PK)
├── owner_id (FK → users)
├── name
├── description
├── industry
├── website
├── is_verified
├── created_at / updated_at

opportunities
├── id (UUID PK)
├── organization_id (FK → organizations)
├── posted_by (FK → users)
├── title
├── description
├── opportunity_type (ENUM: TRAINING, SME, FREELANCE, CONSULTING, WORKSHOP, LECTURE, SHORT_TERM, LONG_TERM)
├── required_roles (ARRAY or JSON)
├── status (ENUM: DRAFT, ACTIVE, CLOSED, FILLED)
├── location / remote_ok
├── budget_min / budget_max
├── deadline
├── created_at / updated_at

applications
├── id (UUID PK)
├── opportunity_id (FK → opportunities)
├── applicant_id (FK → users)
├── status (ENUM: PENDING, REVIEWED, SHORTLISTED, REJECTED, ACCEPTED)
├── cover_note
├── created_at / updated_at
```

### Migration Workflow

```
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Windows Deployment Architecture

```
C:\kconnect\
├── frontend\          ← React production build (dist/)
├── backend\           ← FastAPI application source
│   └── venv\          ← Python virtual environment
├── logs\              ← Application logs
└── uploads\           ← User-uploaded files (future)
```

### IIS Site Configuration

| Site | Path | Binding |
|------|------|---------|
| kconnect | C:\kconnect\frontend | *:80, *:443 |

**URL Rewrite Rules (web.config):**

1. Route `/api/*` → ARR proxy → `http://localhost:8000/api/*`
2. All other requests → `index.html` (SPA fallback)

### NSSM Service Configuration

NSSM registers Uvicorn as a Windows Service named `kconnect-api`:

```
Service: kconnect-api
Executable: C:\kconnect\backend\venv\Scripts\uvicorn.exe
Arguments: app.main:app --host 127.0.0.1 --port 8000
Working dir: C:\kconnect\backend
Startup: Automatic
```

---

## Development Workflow

```
# Frontend development
cd frontend
npm install
npm run dev          # Vite dev server on :5173

# Backend development
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Database migrations
cd backend
alembic revision --autogenerate -m "add_new_table"
alembic upgrade head
```

### Environment Variables

| Env | Frontend | Backend |
|-----|----------|---------|
| Dev | `.env` (VITE_API_BASE_URL=http://localhost:8000/api/v1) | `.env` (DATABASE_URL, SECRET_KEY) |
| Prod | Build-time VITE_API_BASE_URL=/api/v1 | System env vars or `.env` |

---

## Scalability Considerations

- **Database**: UUID primary keys avoid shard conflicts if migrating to distributed DB later
- **Roles**: ENUM stored as string — add roles without schema changes
- **API versioning**: `/api/v1/` prefix from day one
- **Frontend**: Feature-sliced structure prevents cross-feature coupling
- **Auth**: Refresh token rotation pattern supports future device management
