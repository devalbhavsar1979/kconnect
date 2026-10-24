from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import academic, achievements, auth, experience, expertise, preferences, service_delivery, users, organizations, opportunities, applications, dashboard
from app.api.v1.admin import dashboard as admin_dashboard, users as admin_users, organisations as admin_organisations, categories as admin_categories, opportunities as admin_opportunities
from app.core.config import settings
from app.schemas.common import HealthResponse

_UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
_OPP_UPLOADS_DIR = _UPLOADS_DIR / "opportunities"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: place any initialization logic here (e.g., DB pool warm-up)
    yield
    # Shutdown: close external connections if needed


app = FastAPI(
    title=settings.APP_NAME,
    description="K-CONNECT API — Job and Opportunity Marketplace",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 routes
app.include_router(academic.router,       prefix="/api/v1/users/me/academic",    tags=["Academic"])
app.include_router(experience.router,     prefix="/api/v1/users/me/experience",  tags=["Experience"])
app.include_router(expertise.router,      prefix="/api/v1/users/me/expertise",    tags=["Expertise"])
app.include_router(preferences.router,    prefix="/api/v1/users/me/preferences",   tags=["Preferences"])
app.include_router(achievements.router,      prefix="/api/v1/users/me/achievements",       tags=["Achievements"])
app.include_router(service_delivery.router, prefix="/api/v1/users/me/service-delivery",  tags=["Service Delivery"])
app.include_router(auth.router,          prefix="/api/v1/auth",          tags=["Authentication"])
app.include_router(users.router,         prefix="/api/v1/users",         tags=["Users"])
app.include_router(organizations.router, prefix="/api/v1/organizations",  tags=["Organizations"])
app.include_router(opportunities.router, prefix="/api/v1/opportunities",  tags=["Opportunities"])
app.include_router(applications.router,  prefix="/api/v1/applications",   tags=["Applications"])
app.include_router(dashboard.router,         prefix="/api/v1/dashboard",              tags=["Dashboard"])
app.include_router(admin_dashboard.router,   prefix="/api/v1/admin/dashboard",        tags=["Admin"])
app.include_router(admin_users.router,       prefix="/api/v1/admin/users",            tags=["Admin"])
app.include_router(admin_organisations.router, prefix="/api/v1/admin/organisations",  tags=["Admin"])
app.include_router(admin_categories.router,    prefix="/api/v1/admin/categories",       tags=["Admin"])
app.include_router(admin_opportunities.router, prefix="/api/v1/admin/opportunities",    tags=["Admin"])


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return {"status": "healthy"}


# Serve uploaded files (profile photos, CVs, documents, opportunity attachments)
_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
_OPP_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_UPLOADS_DIR)), name="uploads")
