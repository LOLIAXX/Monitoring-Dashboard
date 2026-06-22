"""Minimal smoke tests for models, schemas, and config imports."""
import pytest


def test_config_import():
    from app.core.config import settings
    assert settings.APP_NAME == "Energy Monitoring API"
    assert settings.ENVIRONMENT == "development"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30


def test_database_import():
    from app.db.database import engine, SessionLocal, get_db
    assert engine is not None
    assert SessionLocal is not None


def test_models_import():
    from app.models import Base, User, Role, UserRole, Permission, RolePermission
    assert User.__tablename__ == "users"
    assert Role.__tablename__ == "roles"
    assert UserRole.__tablename__ == "user_roles"
    assert Permission.__tablename__ == "permissions"
    assert RolePermission.__tablename__ == "role_permissions"


def test_user_model_columns():
    from app.models.user import User
    cols = {c.name for c in User.__table__.columns}
    assert "id" in cols
    assert "email" in cols
    assert "hashed_password" in cols
    assert "is_active" in cols
    assert "is_superuser" in cols
    assert "company_id" in cols


def test_schemas_import():
    from app.schemas.auth import LoginRequest, TokenResponse
    from app.schemas.user import UserBase, UserCreate, UserRead
    assert LoginRequest is not None
    assert TokenResponse is not None
    assert UserRead is not None
