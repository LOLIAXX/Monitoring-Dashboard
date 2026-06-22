from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MonitoringSiteRead(BaseModel):
    id: int
    company_id: int | None = None
    name: str
    description: str | None = None
    location: str | None = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class MonitoringTargetRead(BaseModel):
    id: int
    site_id: int
    name: str
    description: str | None = None
    target_type: str | None = None
    serial_number: str | None = None
    is_active: bool


class MonitoringSiteListResponse(BaseModel):
    items: list[MonitoringSiteRead]


class MonitoringTargetListResponse(BaseModel):
    items: list[MonitoringTargetRead]


class MonitoringLatestItem(BaseModel):
    target_id: int
    target_name: str
    parameter: str
    value: float
    unit: str | None = None
    timestamp: datetime
    quality: str | None = None


class MonitoringLatestResponse(BaseModel):
    data_available: bool
    items: list[MonitoringLatestItem]


class MonitoringTrendPoint(BaseModel):
    timestamp: datetime
    value: float
    unit: str | None = None
    parameter: str
    quality: str | None = None


class MonitoringTrendResponse(BaseModel):
    target_id: int | None = None
    parameter: str | None = None
    resolution: str
    points: list[MonitoringTrendPoint]


class MonitoringOverviewSummary(BaseModel):
    total_energy_kwh: float
    peak_demand_kw: float
    power_factor: float | None = None
    active_alerts: int


class MonitoringOverviewResponse(BaseModel):
    data_available: bool
    summary: MonitoringOverviewSummary


class MonitoringReportSummary(BaseModel):
    site_count: int
    target_count: int
    measurement_count: int
    active_alerts: int


class MonitoringReportSummaryResponse(BaseModel):
    data_available: bool
    summary: MonitoringReportSummary


class MonitoringKpiItem(BaseModel):
    key: str
    label: str
    value: float | int | None
    unit: str | None = None


class MonitoringKpiResponse(BaseModel):
    data_available: bool
    items: list[MonitoringKpiItem]
