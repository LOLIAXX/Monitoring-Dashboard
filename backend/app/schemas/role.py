from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.permission import PermissionRead


class RoleCreate(BaseModel):
    name: str
    description: str | None = None


class RoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class RolePermissionAssign(BaseModel):
    permission_id: int


class RoleRead(BaseModel):
    id: int
    name: str
    description: str | None = None
    is_system: bool
    created_at: datetime
    permissions: list[PermissionRead] = []

    model_config = ConfigDict(from_attributes=True)
