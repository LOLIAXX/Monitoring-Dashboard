from sqlalchemy.orm import Session

from app.models.factory import Factory, UserFactoryAccess
from app.models.user import User
from app.schemas.factory import FactoryCreate, FactoryUpdate, UserFactoryAccessCreate


def get_factories_for_user(db: Session, user: User) -> list[Factory]:
    """Return all active factories visible to this user.

    Superusers see every active factory.
    Regular users see only factories they have been explicitly granted access to.
    """
    if user.is_superuser:
        return db.query(Factory).filter(Factory.is_active == True).order_by(Factory.name).all()

    accesses = (
        db.query(UserFactoryAccess)
        .filter(UserFactoryAccess.user_id == user.id)
        .all()
    )
    if not accesses:
        return []

    factory_ids = [a.factory_id for a in accesses]
    return (
        db.query(Factory)
        .filter(Factory.id.in_(factory_ids), Factory.is_active == True)
        .order_by(Factory.name)
        .all()
    )


def get_all_factories(db: Session, include_inactive: bool = False) -> list[Factory]:
    q = db.query(Factory)
    if not include_inactive:
        q = q.filter(Factory.is_active == True)
    return q.order_by(Factory.name).all()


def get_factory_by_id(db: Session, factory_id: int) -> Factory | None:
    return db.query(Factory).filter(Factory.id == factory_id).first()


def get_factory_by_code(db: Session, code: str) -> Factory | None:
    return db.query(Factory).filter(Factory.code == code).first()


def create_factory(db: Session, data: FactoryCreate) -> Factory:
    factory = Factory(**data.model_dump())
    db.add(factory)
    db.commit()
    db.refresh(factory)
    return factory


def update_factory(db: Session, factory: Factory, data: FactoryUpdate) -> Factory:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(factory, field, value)
    db.commit()
    db.refresh(factory)
    return factory


def delete_factory(db: Session, factory: Factory) -> None:
    db.delete(factory)
    db.commit()


def get_factory_access(
    db: Session, factory_id: int, user_id: int
) -> UserFactoryAccess | None:
    return (
        db.query(UserFactoryAccess)
        .filter(
            UserFactoryAccess.factory_id == factory_id,
            UserFactoryAccess.user_id == user_id,
        )
        .first()
    )


def list_factory_access(db: Session, factory_id: int) -> list[UserFactoryAccess]:
    return (
        db.query(UserFactoryAccess)
        .filter(UserFactoryAccess.factory_id == factory_id)
        .all()
    )


def assign_user_to_factory(
    db: Session, factory_id: int, data: UserFactoryAccessCreate
) -> UserFactoryAccess:
    existing = get_factory_access(db, factory_id, data.user_id)
    if existing:
        existing.access_level = data.access_level
        existing.is_default = data.is_default
        db.commit()
        db.refresh(existing)
        return existing

    access = UserFactoryAccess(
        factory_id=factory_id,
        user_id=data.user_id,
        access_level=data.access_level,
        is_default=data.is_default,
    )
    db.add(access)
    db.commit()
    db.refresh(access)
    return access


def remove_user_from_factory(db: Session, factory_id: int, user_id: int) -> bool:
    access = get_factory_access(db, factory_id, user_id)
    if not access:
        return False
    db.delete(access)
    db.commit()
    return True
