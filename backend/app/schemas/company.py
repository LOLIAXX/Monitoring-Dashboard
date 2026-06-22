from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class CompanyCreate(BaseModel):
    name: str
    description: str | None = None
    is_active: bool = True


class CompanyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None


class CompanyRead(BaseModel):
    id: int
    name: str
    description: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


AccessLevel = Literal["admin", "operator", "viewer"]


class AccessAssign(BaseModel):
    user_id: int
    access_level: AccessLevel = "viewer"


class CompanyAccessRead(BaseModel):
    user_id: int
    company_id: int
    access_level: str
    granted_at: datetime

    model_config = ConfigDict(from_attributes=True)
