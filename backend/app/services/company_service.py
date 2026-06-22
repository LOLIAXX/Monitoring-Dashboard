from sqlalchemy.orm import Session

from app.models.access import UserCompanyAccess
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate


def get_company_by_id(db: Session, company_id: int) -> Company | None:
    return db.query(Company).filter(Company.id == company_id).first()


def get_company_by_name(db: Session, name: str) -> Company | None:
    return db.query(Company).filter(Company.name == name).first()


def list_companies(db: Session, skip: int = 0, limit: int = 100) -> list[Company]:
    return db.query(Company).offset(skip).limit(limit).all()


def create_company(db: Session, data: CompanyCreate) -> Company:
    company = Company(name=data.name, description=data.description, is_active=data.is_active)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def update_company(db: Session, company: Company, data: CompanyUpdate) -> Company:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(company, key, value)
    db.commit()
    db.refresh(company)
    return company


def delete_company(db: Session, company: Company) -> None:
    db.delete(company)
    db.commit()


def list_company_access(db: Session, company_id: int) -> list[UserCompanyAccess]:
    return db.query(UserCompanyAccess).filter_by(company_id=company_id).all()


def get_company_access(db: Session, company_id: int, user_id: int) -> UserCompanyAccess | None:
    return db.query(UserCompanyAccess).filter_by(company_id=company_id, user_id=user_id).first()


def assign_company_access(
    db: Session, company_id: int, user_id: int, access_level: str, granted_by_id: int | None = None
) -> UserCompanyAccess:
    entry = get_company_access(db, company_id, user_id)
    if entry:
        entry.access_level = access_level
        db.commit()
        db.refresh(entry)
        return entry
    entry = UserCompanyAccess(
        company_id=company_id,
        user_id=user_id,
        access_level=access_level,
        granted_by_id=granted_by_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def remove_company_access(db: Session, company_id: int, user_id: int) -> bool:
    entry = get_company_access(db, company_id, user_id)
    if entry is None:
        return False
    db.delete(entry)
    db.commit()
    return True
