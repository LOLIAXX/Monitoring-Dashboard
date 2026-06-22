from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MeasurementCreate(BaseModel):
    timestamp: datetime
    value: float
    unit: str = Field(max_length=20)
    measurement_type: str = Field(max_length=50)
    quality: str | None = Field(default=None, max_length=20)
    source: str | None = Field(default=None, max_length=100)


class MeasurementRead(BaseModel):
    id: int
    device_id: int
    timestamp: datetime
    value: float
    unit: str
    measurement_type: str
    quality: str | None = None
    source: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MeasurementBulkCreate(BaseModel):
    measurements: list[MeasurementCreate]
