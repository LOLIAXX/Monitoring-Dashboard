from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_user_permissions
from app.core.security import create_access_token
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse
from app.schemas.factory import FactoryRead
from app.schemas.user import UserMeRead, UserRead
from app.services.auth_service import authenticate_user
from app.services.factory_service import get_factories_for_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(
        subject=user.email,
        additional_claims={"user_id": user.id, "email": user.email},
    )
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserMeRead)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserMeRead:
    """Return current user profile enriched with roles, permissions, and accessible factories."""
    roles = [ur.role.name for ur in current_user.user_roles]
    permissions = sorted(get_user_permissions(current_user))
    factories = [
        FactoryRead.model_validate(f)
        for f in get_factories_for_user(db, current_user)
    ]
    return UserMeRead(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        company_id=current_user.company_id,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        roles=roles,
        permissions=permissions,
        factories=factories,
    )
