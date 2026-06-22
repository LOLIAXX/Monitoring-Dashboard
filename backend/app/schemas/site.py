from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.company import AccessAssign, AccessLevel  # noqa: F401 — re-exported for route imports


class SiteCreate(BaseModel):
    company_id: int
    name: str
    description: str | None = None
    location: str | None = None
    is_active: bool = True


class SiteUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    location: str | None = None
    is_active: bool | None = None


class SiteRead(BaseModel):
    id: int
    company_id: int
    name: str
    description: str | None = None
    location: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SiteAccessRead(BaseModel):
    user_id: int
    site_id: int
    access_level: str
    granted_at: datetime

    model_config = ConfigDict(from_attributes=True)
