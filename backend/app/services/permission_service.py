from sqlalchemy.orm import Session

from app.models.permission import Permission, RolePermission
from app.schemas.permission import PermissionCreate, PermissionUpdate


def get_permission_by_id(db: Session, perm_id: int) -> Permission | None:
    return db.query(Permission).filter(Permission.id == perm_id).first()


def get_permission_by_name(db: Session, name: str) -> Permission | None:
    return db.query(Permission).filter(Permission.name == name).first()


def list_permissions(db: Session, skip: int = 0, limit: int = 100) -> list[Permission]:
    return db.query(Permission).offset(skip).limit(limit).all()


def create_permission(db: Session, data: PermissionCreate) -> Permission:
    perm = Permission(name=data.name, description=data.description)
    db.add(perm)
    db.commit()
    db.refresh(perm)
    return perm


def update_permission(db: Session, perm: Permission, data: PermissionUpdate) -> Permission:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(perm, key, value)
    db.commit()
    db.refresh(perm)
    return perm


def delete_permission(db: Session, perm: Permission) -> None:
    db.delete(perm)
    db.commit()


def is_permission_in_use(db: Session, perm_id: int) -> bool:
    return (
        db.query(RolePermission).filter_by(permission_id=perm_id).first() is not None
    )
