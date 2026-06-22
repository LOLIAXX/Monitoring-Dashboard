from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_permission
from app.db.database import get_db
from app.models.user import User
from app.schemas.factory import (
    FactoryCreate,
    FactoryRead,
    FactoryUpdate,
    UserFactoryAccessCreate,
    UserFactoryAccessRead,
)
from app.services import factory_service

router = APIRouter(prefix="/factories", tags=["factories"])


# ── User-scoped ───────────────────────────────────────────────────────────────

@router.get("/", response_model=list[FactoryRead])
def list_my_factories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[FactoryRead]:
    """Return only the factories the current user has access to.

    Superusers receive all active factories.
    """
    return factory_service.get_factories_for_user(db, current_user)


@router.get("/{factory_id}", response_model=FactoryRead)
def get_factory(
    factory_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FactoryRead:
    factory = factory_service.get_factory_by_id(db, factory_id)
    if factory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factory not found")

    # Superusers see any factory; others only see their assigned ones
    if not current_user.is_superuser:
        accessible_ids = {
            f.id for f in factory_service.get_factories_for_user(db, current_user)
        }
        if factory_id not in accessible_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return factory


# ── Admin CRUD ────────────────────────────────────────────────────────────────

@router.post("/", response_model=FactoryRead, status_code=status.HTTP_201_CREATED)
def create_factory(
    data: FactoryCreate,
    current_user: User = Depends(require_permission("factories.assign_users")),
    db: Session = Depends(get_db),
) -> FactoryRead:
    if factory_service.get_factory_by_code(db, data.code):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Factory with code '{data.code}' already exists",
        )
    return factory_service.create_factory(db, data)


@router.put("/{factory_id}", response_model=FactoryRead)
def update_factory(
    factory_id: int,
    data: FactoryUpdate,
    current_user: User = Depends(require_permission("factories.assign_users")),
    db: Session = Depends(get_db),
) -> FactoryRead:
    factory = factory_service.get_factory_by_id(db, factory_id)
    if factory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factory not found")
    return factory_service.update_factory(db, factory, data)


@router.delete("/{factory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_factory(
    factory_id: int,
    current_user: User = Depends(require_permission("factories.assign_users")),
    db: Session = Depends(get_db),
) -> None:
    factory = factory_service.get_factory_by_id(db, factory_id)
    if factory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factory not found")
    factory_service.delete_factory(db, factory)


# ── User access management ────────────────────────────────────────────────────

@router.get("/{factory_id}/access", response_model=list[UserFactoryAccessRead])
def list_access(
    factory_id: int,
    current_user: User = Depends(require_permission("factories.assign_users")),
    db: Session = Depends(get_db),
) -> list[UserFactoryAccessRead]:
    if factory_service.get_factory_by_id(db, factory_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factory not found")
    return factory_service.list_factory_access(db, factory_id)


@router.post(
    "/{factory_id}/access",
    response_model=UserFactoryAccessRead,
    status_code=status.HTTP_201_CREATED,
)
def assign_user(
    factory_id: int,
    data: UserFactoryAccessCreate,
    current_user: User = Depends(require_permission("factories.assign_users")),
    db: Session = Depends(get_db),
) -> UserFactoryAccessRead:
    if factory_service.get_factory_by_id(db, factory_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factory not found")
    return factory_service.assign_user_to_factory(db, factory_id, data)


@router.delete("/{factory_id}/access/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user(
    factory_id: int,
    user_id: int,
    current_user: User = Depends(require_permission("factories.assign_users")),
    db: Session = Depends(get_db),
) -> None:
    if not factory_service.remove_user_from_factory(db, factory_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access record not found",
        )
