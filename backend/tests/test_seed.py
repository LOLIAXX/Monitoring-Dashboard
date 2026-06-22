"""Tests for idempotent seed foundation."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.seed import (
    PERMISSIONS,
    ROLE_PERMISSIONS,
    ROLES,
    run_seed,
    seed_admin_user,
    seed_permissions,
    seed_role_permissions,
    seed_roles,
)
from app.models import Base
from app.models.permission import Permission, RolePermission
from app.models.role import Role
from app.models.user import User


@pytest.fixture(scope="module")
def _engine():
    eng = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(eng)
    yield eng


@pytest.fixture
def db(_engine):
    """Rolled-back session per test — seed functions only flush, never commit."""
    session = sessionmaker(bind=_engine)()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def fresh_db():
    """Fully isolated DB for run_seed integration tests (which commit)."""
    eng = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(eng)
    session = sessionmaker(bind=eng)()
    yield session
    session.close()


# --- seed_roles ---

def test_seed_roles_creates_all(db):
    roles = seed_roles(db)
    assert set(roles.keys()) == {r["name"] for r in ROLES}
    for name, role in roles.items():
        assert role.id is not None
        assert role.name == name


def test_seed_roles_is_idempotent(db):
    seed_roles(db)
    seed_roles(db)
    assert db.query(Role).count() == len(ROLES)


def test_seed_roles_system_flag(db):
    roles = seed_roles(db)
    assert roles["admin"].is_system is True
    assert roles["operator"].is_system is True
    assert roles["viewer"].is_system is True


# --- seed_permissions ---

def test_seed_permissions_creates_all(db):
    permissions = seed_permissions(db)
    assert set(permissions.keys()) == {p["name"] for p in PERMISSIONS}
    for name, perm in permissions.items():
        assert perm.id is not None
        assert perm.name == name


def test_seed_permissions_is_idempotent(db):
    seed_permissions(db)
    seed_permissions(db)
    assert db.query(Permission).count() == len(PERMISSIONS)


# --- seed_role_permissions ---

def test_seed_role_permissions_assigns_all(db):
    roles = seed_roles(db)
    permissions = seed_permissions(db)
    seed_role_permissions(db, roles, permissions)
    for role_name, perm_names in ROLE_PERMISSIONS.items():
        role = roles[role_name]
        for perm_name in perm_names:
            perm = permissions[perm_name]
            rp = db.query(RolePermission).filter_by(
                role_id=role.id, permission_id=perm.id
            ).first()
            assert rp is not None, f"Missing assignment: {role_name} -> {perm_name}"


def test_seed_role_permissions_is_idempotent(db):
    roles = seed_roles(db)
    permissions = seed_permissions(db)
    seed_role_permissions(db, roles, permissions)
    seed_role_permissions(db, roles, permissions)
    expected = sum(len(v) for v in ROLE_PERMISSIONS.values())
    assert db.query(RolePermission).count() == expected


def test_admin_has_all_permissions(db):
    roles = seed_roles(db)
    permissions = seed_permissions(db)
    seed_role_permissions(db, roles, permissions)
    assigned = {
        rp.permission.name
        for rp in db.query(RolePermission).filter_by(role_id=roles["admin"].id).all()
    }
    assert assigned == set(ROLE_PERMISSIONS["admin"])


def test_viewer_has_read_only_permissions(db):
    roles = seed_roles(db)
    permissions = seed_permissions(db)
    seed_role_permissions(db, roles, permissions)
    assigned = {
        rp.permission.name
        for rp in db.query(RolePermission).filter_by(role_id=roles["viewer"].id).all()
    }
    assert assigned == set(ROLE_PERMISSIONS["viewer"])
    assert "energy:write" not in assigned
    assert "admin:users" not in assigned


# --- seed_admin_user ---

def test_seed_admin_user_creates_user(db):
    user = seed_admin_user(db, "admin@example.com", "adminpassword")
    assert user.id is not None
    assert user.email == "admin@example.com"
    assert user.is_superuser is True
    assert user.is_active is True


def test_seed_admin_user_is_idempotent(db):
    seed_admin_user(db, "admin@example.com", "adminpassword")
    seed_admin_user(db, "admin@example.com", "adminpassword")
    assert db.query(User).filter_by(email="admin@example.com").count() == 1


# --- run_seed integration ---

def test_run_seed_full(fresh_db):
    run_seed(fresh_db, admin_email="admin@seed.com", admin_password="securepassword")
    assert fresh_db.query(Role).count() == len(ROLES)
    assert fresh_db.query(Permission).count() == len(PERMISSIONS)
    assert fresh_db.query(User).count() == 1
    admin = fresh_db.query(User).filter_by(email="admin@seed.com").first()
    assert admin is not None
    assert admin.is_superuser is True


def test_run_seed_without_admin(fresh_db):
    run_seed(fresh_db)
    assert fresh_db.query(Role).count() == len(ROLES)
    assert fresh_db.query(Permission).count() == len(PERMISSIONS)
    assert fresh_db.query(User).count() == 0


def test_run_seed_is_idempotent(fresh_db):
    run_seed(fresh_db, admin_email="admin@seed.com", admin_password="securepassword")
    run_seed(fresh_db, admin_email="admin@seed.com", admin_password="securepassword")
    assert fresh_db.query(Role).count() == len(ROLES)
    assert fresh_db.query(Permission).count() == len(PERMISSIONS)
    assert fresh_db.query(User).count() == 1
