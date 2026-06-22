from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.database import get_db
from app.models.user import User
from app.schemas.device import DeviceRead
from app.schemas.site import AccessAssign, SiteAccessRead, SiteCreate, SiteRead, SiteUpdate
from app.services.device_service import list_devices_for_site
from app.services.site_service import (
    assign_site_access,
    create_site,
    delete_site,
    get_site_by_id,
    list_site_access,
    list_sites,
    remove_site_access,
    update_site,
)

router = APIRouter(prefix="/sites", tags=["sites"])


def _get_site_or_404(db: Session, site_id: int):
    site = get_site_by_id(db, site_id)
    if site is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return site


# --- Site CRUD ---

@router.get("/", response_model=list[SiteRead])
def read_sites(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("sites:read")),
) -> list:
    return list_sites(db, skip=skip, limit=limit)


@router.post("/", response_model=SiteRead, status_code=status.HTTP_201_CREATED)
def create_new_site(
    data: SiteCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("sites:write")),
):
    return create_site(db, data)


@router.get("/{site_id}", response_model=SiteRead)
def read_site(
    site_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("sites:read")),
):
    return _get_site_or_404(db, site_id)


@router.put("/{site_id}", response_model=SiteRead)
def update_existing_site(
    site_id: int,
    data: SiteUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("sites:write")),
):
    site = _get_site_or_404(db, site_id)
    return update_site(db, site, data)


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_site(
    site_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("sites:write")),
) -> None:
    site = _get_site_or_404(db, site_id)
    delete_site(db, site)


# --- Devices under site ---

@router.get("/{site_id}/devices", response_model=list[DeviceRead])
def read_site_devices(
    site_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("devices:read")),
) -> list:
    _get_site_or_404(db, site_id)
    return list_devices_for_site(db, site_id)


# --- Access assignment ---

@router.get("/{site_id}/access", response_model=list[SiteAccessRead])
def read_site_access(
    site_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("access:read")),
) -> list:
    _get_site_or_404(db, site_id)
    return list_site_access(db, site_id)


@router.post("/{site_id}/access", response_model=SiteAccessRead, status_code=status.HTTP_200_OK)
def assign_user_site_access(
    site_id: int,
    body: AccessAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("access:assign")),
):
    _get_site_or_404(db, site_id)
    return assign_site_access(
        db, site_id, body.user_id, body.access_level, granted_by_id=current_user.id
    )


@router.delete("/{site_id}/access/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_site_access(
    site_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("access:assign")),
) -> None:
    _get_site_or_404(db, site_id)
    removed = remove_site_access(db, site_id, user_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access entry not found")
