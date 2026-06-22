from sqlalchemy.orm import Session

from app.models.access import UserDeviceAccess
from app.models.company import Device
from app.schemas.device import DeviceCreate, DeviceUpdate


def get_device_by_id(db: Session, device_id: int) -> Device | None:
    return db.query(Device).filter(Device.id == device_id).first()


def list_devices(db: Session, skip: int = 0, limit: int = 100) -> list[Device]:
    return db.query(Device).offset(skip).limit(limit).all()


def list_devices_for_site(db: Session, site_id: int) -> list[Device]:
    return db.query(Device).filter_by(site_id=site_id).all()


def create_device(db: Session, data: DeviceCreate) -> Device:
    device = Device(
        site_id=data.site_id,
        name=data.name,
        description=data.description,
        device_type=data.device_type,
        serial_number=data.serial_number,
        is_active=data.is_active,
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


def update_device(db: Session, device: Device, data: DeviceUpdate) -> Device:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(device, key, value)
    db.commit()
    db.refresh(device)
    return device


def delete_device(db: Session, device: Device) -> None:
    db.delete(device)
    db.commit()


def list_device_access(db: Session, device_id: int) -> list[UserDeviceAccess]:
    return db.query(UserDeviceAccess).filter_by(device_id=device_id).all()


def get_device_access(db: Session, device_id: int, user_id: int) -> UserDeviceAccess | None:
    return db.query(UserDeviceAccess).filter_by(device_id=device_id, user_id=user_id).first()


def assign_device_access(
    db: Session, device_id: int, user_id: int, access_level: str, granted_by_id: int | None = None
) -> UserDeviceAccess:
    entry = get_device_access(db, device_id, user_id)
    if entry:
        entry.access_level = access_level
        db.commit()
        db.refresh(entry)
        return entry
    entry = UserDeviceAccess(
        device_id=device_id,
        user_id=user_id,
        access_level=access_level,
        granted_by_id=granted_by_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def remove_device_access(db: Session, device_id: int, user_id: int) -> bool:
    entry = get_device_access(db, device_id, user_id)
    if entry is None:
        return False
    db.delete(entry)
    db.commit()
    return True
