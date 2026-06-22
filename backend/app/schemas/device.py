from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.company import AccessAssign, AccessLevel  # noqa: F401 — re-exported for route imports


class DeviceCreate(BaseModel):
    site_id: int
    name: str
    description: str | None = None
    device_type: str | None = None
    serial_number: str | None = None
    is_active: bool = True


class DeviceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    device_type: str | None = None
    serial_number: str | None = None
    is_active: bool | None = None


class DeviceRead(BaseModel):
    id: int
    site_id: int
    name: str
    description: str | None = None
    device_type: str | None = None
    serial_number: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeviceAccessRead(BaseModel):
    user_id: int
    device_id: int
    access_level: str
    granted_at: datetime

    model_config = ConfigDict(from_attributes=True)
