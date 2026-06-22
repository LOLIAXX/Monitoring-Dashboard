from sqlalchemy.orm import Session

from app.models.access import UserSiteAccess
from app.models.company import Site
from app.schemas.site import SiteCreate, SiteUpdate


def get_site_by_id(db: Session, site_id: int) -> Site | None:
    return db.query(Site).filter(Site.id == site_id).first()


def list_sites(db: Session, skip: int = 0, limit: int = 100) -> list[Site]:
    return db.query(Site).offset(skip).limit(limit).all()


def list_sites_for_company(db: Session, company_id: int) -> list[Site]:
    return db.query(Site).filter_by(company_id=company_id).all()


def create_site(db: Session, data: SiteCreate) -> Site:
    site = Site(
        company_id=data.company_id,
        name=data.name,
        description=data.description,
        location=data.location,
        is_active=data.is_active,
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


def update_site(db: Session, site: Site, data: SiteUpdate) -> Site:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(site, key, value)
    db.commit()
    db.refresh(site)
    return site


def delete_site(db: Session, site: Site) -> None:
    db.delete(site)
    db.commit()


def list_site_access(db: Session, site_id: int) -> list[UserSiteAccess]:
    return db.query(UserSiteAccess).filter_by(site_id=site_id).all()


def get_site_access(db: Session, site_id: int, user_id: int) -> UserSiteAccess | None:
    return db.query(UserSiteAccess).filter_by(site_id=site_id, user_id=user_id).first()


def assign_site_access(
    db: Session, site_id: int, user_id: int, access_level: str, granted_by_id: int | None = None
) -> UserSiteAccess:
    entry = get_site_access(db, site_id, user_id)
    if entry:
        entry.access_level = access_level
        db.commit()
        db.refresh(entry)
        return entry
    entry = UserSiteAccess(
        site_id=site_id,
        user_id=user_id,
        access_level=access_level,
        granted_by_id=granted_by_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def remove_site_access(db: Session, site_id: int, user_id: int) -> bool:
    entry = get_site_access(db, site_id, user_id)
    if entry is None:
        return False
    db.delete(entry)
    db.commit()
    return True
