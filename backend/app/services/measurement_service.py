from datetime import datetime

from sqlalchemy.orm import Session

from app.models.measurement import EnergyMeasurement
from app.schemas.measurement import MeasurementCreate


def get_measurement_by_id(db: Session, measurement_id: int) -> EnergyMeasurement | None:
    return db.query(EnergyMeasurement).filter(EnergyMeasurement.id == measurement_id).first()


def list_measurements(
    db: Session,
    device_id: int,
    from_dt: datetime | None = None,
    to_dt: datetime | None = None,
    measurement_type: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[EnergyMeasurement]:
    q = db.query(EnergyMeasurement).filter(EnergyMeasurement.device_id == device_id)
    if from_dt is not None:
        q = q.filter(EnergyMeasurement.timestamp >= from_dt)
    if to_dt is not None:
        q = q.filter(EnergyMeasurement.timestamp <= to_dt)
    if measurement_type is not None:
        q = q.filter(EnergyMeasurement.measurement_type == measurement_type)
    return q.order_by(EnergyMeasurement.timestamp.asc()).offset(skip).limit(limit).all()


def get_latest_measurement(
    db: Session,
    device_id: int,
    measurement_type: str | None = None,
) -> EnergyMeasurement | None:
    q = db.query(EnergyMeasurement).filter(EnergyMeasurement.device_id == device_id)
    if measurement_type is not None:
        q = q.filter(EnergyMeasurement.measurement_type == measurement_type)
    return q.order_by(EnergyMeasurement.timestamp.desc()).first()


def create_measurement(db: Session, device_id: int, data: MeasurementCreate) -> EnergyMeasurement:
    measurement = EnergyMeasurement(
        device_id=device_id,
        timestamp=data.timestamp,
        value=data.value,
        unit=data.unit,
        measurement_type=data.measurement_type,
        quality=data.quality,
        source=data.source,
    )
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement


def create_measurements_bulk(
    db: Session, device_id: int, measurements: list[MeasurementCreate]
) -> list[EnergyMeasurement]:
    if not measurements:
        return []
    records = [
        EnergyMeasurement(
            device_id=device_id,
            timestamp=m.timestamp,
            value=m.value,
            unit=m.unit,
            measurement_type=m.measurement_type,
            quality=m.quality,
            source=m.source,
        )
        for m in measurements
    ]
    db.add_all(records)
    db.commit()
    for r in records:
        db.refresh(r)
    return records


def delete_measurement(db: Session, measurement: EnergyMeasurement) -> None:
    db.delete(measurement)
    db.commit()
