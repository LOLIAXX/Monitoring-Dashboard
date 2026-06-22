from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.database import get_db
from app.models.user import User
from app.schemas.device import AccessAssign, DeviceAccessRead, DeviceCreate, DeviceRead, DeviceUpdate
from app.services.device_service import (
    assign_device_access,
    create_device,
    delete_device,
    get_device_by_id,
    list_device_access,
    list_devices,
    remove_device_access,
    update_device,
)

router = APIRouter(prefix="/devices", tags=["devices"])


def _get_device_or_404(db: Session, device_id: int):
    device = get_device_by_id(db, device_id)
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return device


# --- Device CRUD ---

@router.get("/", response_model=list[DeviceRead])
def read_devices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("devices:read")),
) -> list:
    return list_devices(db, skip=skip, limit=limit)


@router.post("/", response_model=DeviceRead, status_code=status.HTTP_201_CREATED)
def create_new_device(
    data: DeviceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("devices:write")),
):
    return create_device(db, data)


@router.get("/{device_id}", response_model=DeviceRead)
def read_device(
    device_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("devices:read")),
):
    return _get_device_or_404(db, device_id)


@router.put("/{device_id}", response_model=DeviceRead)
def update_existing_device(
    device_id: int,
    data: DeviceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("devices:write")),
):
    device = _get_device_or_404(db, device_id)
    return update_device(db, device, data)


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_device(
    device_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("devices:write")),
) -> None:
    device = _get_device_or_404(db, device_id)
    delete_device(db, device)


# --- Access assignment ---

@router.get("/{device_id}/access", response_model=list[DeviceAccessRead])
def read_device_access(
    device_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("access:read")),
) -> list:
    _get_device_or_404(db, device_id)
    return list_device_access(db, device_id)


@router.post("/{device_id}/access", response_model=DeviceAccessRead, status_code=status.HTTP_200_OK)
def assign_user_device_access(
    device_id: int,
    body: AccessAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("access:assign")),
):
    _get_device_or_404(db, device_id)
    return assign_device_access(
        db, device_id, body.user_id, body.access_level, granted_by_id=current_user.id
    )


@router.delete("/{device_id}/access/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_device_access(
    device_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("access:assign")),
) -> None:
    _get_device_or_404(db, device_id)
    removed = remove_device_access(db, device_id, user_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access entry not found")
