from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FactoryRead(BaseModel):
    id: int
    code: str
    name: str
    legal_name: str | None = None
    company_id: int | None = None

    city: str | None = None
    province: str | None = None
    country: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None

    industry: str | None = None
    factory_type: str | None = None
    production_lines_count: int | None = None
    nominal_power_kw: float | None = None
    contract_demand_kw: float | None = None
    main_voltage_level: str | None = None

    is_active: bool
    description: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FactoryCreate(BaseModel):
    code: str
    name: str
    legal_name: str | None = None
    company_id: int | None = None

    city: str | None = None
    province: str | None = None
    country: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None

    industry: str | None = None
    factory_type: str | None = None
    production_lines_count: int | None = None
    nominal_power_kw: float | None = None
    contract_demand_kw: float | None = None
    main_voltage_level: str | None = None

    is_active: bool = True
    description: str | None = None


class FactoryUpdate(BaseModel):
    name: str | None = None
    legal_name: str | None = None
    company_id: int | None = None

    city: str | None = None
    province: str | None = None
    country: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None

    industry: str | None = None
    factory_type: str | None = None
    production_lines_count: int | None = None
    nominal_power_kw: float | None = None
    contract_demand_kw: float | None = None
    main_voltage_level: str | None = None

    is_active: bool | None = None
    description: str | None = None


class UserFactoryAccessCreate(BaseModel):
    user_id: int
    access_level: str = "viewer"
    is_default: bool = False


class UserFactoryAccessRead(BaseModel):
    user_id: int
    factory_id: int
    access_level: str
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
