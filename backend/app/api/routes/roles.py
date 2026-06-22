from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.database import get_db
from app.models.user import User
from app.schemas.permission import PermissionRead
from app.schemas.role import RoleCreate, RolePermissionAssign, RoleRead, RoleUpdate
from app.services.permission_service import get_permission_by_id
from app.services.role_service import (
    assign_permission,
    create_role,
    delete_role,
    get_role_by_id,
    get_role_by_name,
    list_roles,
    remove_permission,
    update_role,
)

router = APIRouter(prefix="/roles", tags=["roles"])


def _role_read(role) -> RoleRead:
    return RoleRead(
        id=role.id,
        name=role.name,
        description=role.description,
        is_system=role.is_system,
        created_at=role.created_at,
        permissions=[
            PermissionRead(
                id=rp.permission.id,
                name=rp.permission.name,
                description=rp.permission.description,
            )
            for rp in role.role_permissions
        ],
    )


@router.get("/", response_model=list[RoleRead])
def read_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles:read")),
) -> list[RoleRead]:
    return [_role_read(r) for r in list_roles(db, skip=skip, limit=limit)]


@router.post("/", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
def create_new_role(
    data: RoleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles:write")),
) -> RoleRead:
    if get_role_by_name(db, data.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Role name already exists")
    return _role_read(create_role(db, data))


@router.get("/{role_id}", response_model=RoleRead)
def read_role(
    role_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles:read")),
) -> RoleRead:
    role = get_role_by_id(db, role_id)
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return _role_read(role)


@router.put("/{role_id}", response_model=RoleRead)
def update_existing_role(
    role_id: int,
    data: RoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles:write")),
) -> RoleRead:
    role = get_role_by_id(db, role_id)
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    if role.is_system and data.name is not None and data.name != role.name:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot rename system role")
    if data.name and data.name != role.name and get_role_by_name(db, data.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Role name already exists")
    return _role_read(update_role(db, role, data))


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_role(
    role_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles:write")),
) -> None:
    role = get_role_by_id(db, role_id)
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    if role.is_system:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete system role")
    delete_role(db, role)


@router.post("/{role_id}/permissions", response_model=RoleRead)
def assign_permission_to_role(
    role_id: int,
    body: RolePermissionAssign,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles:write")),
) -> RoleRead:
    role = get_role_by_id(db, role_id)
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    perm = get_permission_by_id(db, body.permission_id)
    if perm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    assign_permission(db, role, perm)
    db.refresh(role)
    return _role_read(role)


@router.delete("/{role_id}/permissions/{perm_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_permission_from_role(
    role_id: int,
    perm_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles:write")),
) -> None:
    role = get_role_by_id(db, role_id)
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    removed = remove_permission(db, role, perm_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not assigned to role")
