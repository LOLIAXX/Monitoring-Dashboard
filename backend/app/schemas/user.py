from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.factory import FactoryRead


class UserBase(BaseModel):
    email: str
    full_name: str | None = None
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    company_id: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserMeRead(UserRead):
    """Extended /auth/me response: includes roles, permissions, and accessible factories."""

    roles: list[str] = []
    permissions: list[str] = []
    factories: list[FactoryRead] = []


class UserUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None
    password: str | None = None
