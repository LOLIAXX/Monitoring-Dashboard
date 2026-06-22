from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.database import get_db
from app.models.user import User
from app.schemas.company import AccessAssign, CompanyAccessRead, CompanyCreate, CompanyRead, CompanyUpdate
from app.schemas.site import SiteRead
from app.services.company_service import (
    assign_company_access,
    create_company,
    delete_company,
    get_company_by_id,
    get_company_by_name,
    list_companies,
    list_company_access,
    remove_company_access,
    update_company,
)
from app.services.site_service import list_sites_for_company

router = APIRouter(prefix="/companies", tags=["companies"])


def _get_company_or_404(db: Session, company_id: int):
    company = get_company_by_id(db, company_id)
    if company is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company


# --- Company CRUD ---

@router.get("/", response_model=list[CompanyRead])
def read_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("companies:read")),
) -> list:
    return list_companies(db, skip=skip, limit=limit)


@router.post("/", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
def create_new_company(
    data: CompanyCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("companies:write")),
):
    if get_company_by_name(db, data.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Company name already exists")
    return create_company(db, data)


@router.get("/{company_id}", response_model=CompanyRead)
def read_company(
    company_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("companies:read")),
):
    return _get_company_or_404(db, company_id)


@router.put("/{company_id}", response_model=CompanyRead)
def update_existing_company(
    company_id: int,
    data: CompanyUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("companies:write")),
):
    company = _get_company_or_404(db, company_id)
    if data.name and data.name != company.name and get_company_by_name(db, data.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Company name already exists")
    return update_company(db, company, data)


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_company(
    company_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("companies:write")),
) -> None:
    company = _get_company_or_404(db, company_id)
    delete_company(db, company)


# --- Sites under company ---

@router.get("/{company_id}/sites", response_model=list[SiteRead])
def read_company_sites(
    company_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("sites:read")),
) -> list:
    _get_company_or_404(db, company_id)
    return list_sites_for_company(db, company_id)


# --- Access assignment ---

@router.get("/{company_id}/access", response_model=list[CompanyAccessRead])
def read_company_access(
    company_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("access:read")),
) -> list:
    _get_company_or_404(db, company_id)
    return list_company_access(db, company_id)


@router.post("/{company_id}/access", response_model=CompanyAccessRead, status_code=status.HTTP_200_OK)
def assign_user_company_access(
    company_id: int,
    body: AccessAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("access:assign")),
):
    _get_company_or_404(db, company_id)
    return assign_company_access(
        db, company_id, body.user_id, body.access_level, granted_by_id=current_user.id
    )


@router.delete("/{company_id}/access/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_company_access(
    company_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("access:assign")),
) -> None:
    _get_company_or_404(db, company_id)
    removed = remove_company_access(db, company_id, user_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access entry not found")
