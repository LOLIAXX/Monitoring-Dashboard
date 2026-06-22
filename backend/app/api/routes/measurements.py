from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.database import get_db
from app.models.company import Device
from app.models.user import User
from app.schemas.measurement import MeasurementBulkCreate, MeasurementCreate, MeasurementRead
from app.services.device_service import get_device_by_id
from app.services.measurement_service import (
    create_measurement,
    create_measurements_bulk,
    delete_measurement,
    get_latest_measurement,
    get_measurement_by_id,
    list_measurements,
)

router = APIRouter(tags=["measurements"])


def _get_device_or_404(db: Session, device_id: int) -> Device:
    device = get_device_by_id(db, device_id)
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return device


def _get_measurement_or_404(db: Session, measurement_id: int):
    m = get_measurement_by_id(db, measurement_id)
    if m is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Measurement not found")
    return m


# --- Device-scoped endpoints ---

@router.get("/devices/{device_id}/measurements", response_model=list[MeasurementRead])
def read_device_measurements(
    device_id: int,
    from_dt: datetime | None = Query(default=None),
    to_dt: datetime | None = Query(default=None),
    measurement_type: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
) -> list:
    _get_device_or_404(db, device_id)
    return list_measurements(
        db,
        device_id=device_id,
        from_dt=from_dt,
        to_dt=to_dt,
        measurement_type=measurement_type,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/devices/{device_id}/measurements",
    response_model=MeasurementRead,
    status_code=status.HTTP_201_CREATED,
)
def create_device_measurement(
    device_id: int,
    data: MeasurementCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:write")),
):
    _get_device_or_404(db, device_id)
    return create_measurement(db, device_id, data)


@router.post(
    "/devices/{device_id}/measurements/bulk",
    response_model=list[MeasurementRead],
    status_code=status.HTTP_201_CREATED,
)
def bulk_create_device_measurements(
    device_id: int,
    body: MeasurementBulkCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:write")),
) -> list:
    _get_device_or_404(db, device_id)
    return create_measurements_bulk(db, device_id, body.measurements)


@router.get("/devices/{device_id}/measurements/latest", response_model=MeasurementRead | None)
def read_latest_device_measurement(
    device_id: int,
    measurement_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
):
    _get_device_or_404(db, device_id)
    return get_latest_measurement(db, device_id, measurement_type=measurement_type)


# --- Direct lookup by ID ---

@router.get("/measurements/{measurement_id}", response_model=MeasurementRead)
def read_measurement(
    measurement_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
):
    return _get_measurement_or_404(db, measurement_id)


@router.delete("/measurements/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_measurement_by_id(
    measurement_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:write")),
) -> None:
    m = _get_measurement_or_404(db, measurement_id)
    delete_measurement(db, m)
