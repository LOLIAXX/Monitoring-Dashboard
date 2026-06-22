from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.database import get_db
from app.models.user import User
from app.schemas.permission import PermissionCreate, PermissionRead, PermissionUpdate
from app.services.permission_service import (
    create_permission,
    delete_permission,
    get_permission_by_id,
    get_permission_by_name,
    is_permission_in_use,
    list_permissions,
    update_permission,
)

router = APIRouter(prefix="/permissions", tags=["permissions"])


@router.get("/", response_model=list[PermissionRead])
def read_permissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("permissions:read")),
) -> list:
    return list_permissions(db, skip=skip, limit=limit)


@router.post("/", response_model=PermissionRead, status_code=status.HTTP_201_CREATED)
def create_new_permission(
    data: PermissionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("permissions:write")),
):
    if get_permission_by_name(db, data.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Permission name already exists")
    return create_permission(db, data)


@router.get("/{perm_id}", response_model=PermissionRead)
def read_permission(
    perm_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("permissions:read")),
):
    perm = get_permission_by_id(db, perm_id)
    if perm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    return perm


@router.put("/{perm_id}", response_model=PermissionRead)
def update_existing_permission(
    perm_id: int,
    data: PermissionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("permissions:write")),
):
    perm = get_permission_by_id(db, perm_id)
    if perm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    if data.name and data.name != perm.name and get_permission_by_name(db, data.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Permission name already exists")
    return update_permission(db, perm, data)


@router.delete("/{perm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_permission(
    perm_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("permissions:write")),
) -> None:
    perm = get_permission_by_id(db, perm_id)
    if perm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    if is_permission_in_use(db, perm_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Permission is assigned to one or more roles",
        )
    delete_permission(db, perm)
