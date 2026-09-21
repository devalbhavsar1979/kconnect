# K-CONNECT

A Progressive Web Application marketplace connecting Vendors and Organizations with Trainers, Subject Matter Experts (SMEs), Freelancers, Consultants, and Industry Professionals.

---

## Project Structure

```
kconnect/
├── frontend/          React + TypeScript + Vite PWA
├── backend/           Python FastAPI + SQLAlchemy
├── iis/               IIS web.config and rewrite rules
├── deployment/        PowerShell deployment scripts
├── docs/              Architecture and compatibility documentation
├── .gitignore
└── README.md
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| PWA | vite-plugin-pwa, Workbox |
| State | Zustand |
| HTTP | Axios |
| Backend | Python 3.12, FastAPI, Uvicorn |
| ORM | SQLAlchemy 2.x, Alembic |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Database | PostgreSQL 15.x |
| Web Server | IIS 8.5 |
| Reverse Proxy | IIS ARR 3.0 + URL Rewrite 2.1 |
| Process Manager | NSSM 2.24 |

---

## Deployment Target

Windows Server 2012 R2 — single VM, no Docker.

See [docs/WINDOWS_SERVER_COMPATIBILITY.md](docs/WINDOWS_SERVER_COMPATIBILITY.md) for version requirements.

---

## Quick Start (Development)

### Frontend

```cmd
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

### Backend

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### Database

PostgreSQL 15.x running locally on port 5432.  
Configure connection string in `backend/.env`.

---

## Documentation

- [Project Architecture](docs/PROJECT_ARCHITECTURE.md)
- [Windows Server Compatibility](docs/WINDOWS_SERVER_COMPATIBILITY.md)

---

## Platform Features (Roadmap)

- [x] Architecture foundation
- [ ] Authentication (JWT)
- [ ] User profiles
- [ ] Organization management
- [ ] Opportunity posting
- [ ] Application tracking
- [ ] Role-based dashboards
- [ ] PWA install + offline support
- [ ] IIS production deployment
