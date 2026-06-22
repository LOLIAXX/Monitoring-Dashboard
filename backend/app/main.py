from fastapi import FastAPI

from app.api.routes.admin import router as admin_router
from app.api.routes.auth import router as auth_router
from app.api.routes.companies import router as companies_router
from app.api.routes.devices import router as devices_router
from app.api.routes.factories import router as factories_router
from app.api.routes.measurements import router as measurements_router
from app.api.routes.monitoring import router as monitoring_router
from app.api.routes.permissions import router as permissions_router
from app.api.routes.roles import router as roles_router
from app.api.routes.sites import router as sites_router
from app.api.routes.users import router as users_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="Real Project API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(users_router)
app.include_router(factories_router)
app.include_router(roles_router)
app.include_router(permissions_router)
app.include_router(companies_router)
app.include_router(sites_router)
app.include_router(devices_router)
app.include_router(measurements_router)
app.include_router(monitoring_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
