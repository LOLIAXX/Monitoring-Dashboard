from sqlalchemy.orm import Session

from app.models.permission import Permission, RolePermission
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate


def get_role_by_id(db: Session, role_id: int) -> Role | None:
    return db.query(Role).filter(Role.id == role_id).first()


def get_role_by_name(db: Session, name: str) -> Role | None:
    return db.query(Role).filter(Role.name == name).first()


def list_roles(db: Session, skip: int = 0, limit: int = 100) -> list[Role]:
    return db.query(Role).offset(skip).limit(limit).all()


def create_role(db: Session, data: RoleCreate) -> Role:
    role = Role(name=data.name, description=data.description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def update_role(db: Session, role: Role, data: RoleUpdate) -> Role:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(role, key, value)
    db.commit()
    db.refresh(role)
    return role


def delete_role(db: Session, role: Role) -> None:
    db.delete(role)
    db.commit()


def assign_permission(db: Session, role: Role, permission: Permission) -> bool:
    """Ensures permission is assigned to role. Returns True if newly added."""
    exists = (
        db.query(RolePermission)
        .filter_by(role_id=role.id, permission_id=permission.id)
        .first()
    )
    if exists:
        return False
    db.add(RolePermission(role_id=role.id, permission_id=permission.id))
    db.commit()
    return True


def remove_permission(db: Session, role: Role, permission_id: int) -> bool:
    """Removes permission from role. Returns True if found and removed."""
    rp = (
        db.query(RolePermission)
        .filter_by(role_id=role.id, permission_id=permission_id)
        .first()
    )
    if rp is None:
        return False
    db.delete(rp)
    db.commit()
    return True
