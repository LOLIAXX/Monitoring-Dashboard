"""RBAC permission dependency tests."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.permission import Permission, RolePermission
from app.models.role import Role, UserRole
from app.models.user import User
from tests.conftest import _Session


@pytest.fixture(scope="module", autouse=True)
def seed_rbac():
    db = _Session()
    perm = Permission(name="admin:users", description="Manage users")
    role_admin = Role(name="admin", is_system=True)
    role_viewer = Role(name="viewer", is_system=False)
    db.add_all([perm, role_admin, role_viewer])
    db.flush()
    db.add(RolePermission(role_id=role_admin.id, permission_id=perm.id))
    admin = User(email="admin@example.com", hashed_password=get_password_hash("pw"),
                 is_active=True, is_superuser=False)
    regular = User(email="regular@example.com", hashed_password=get_password_hash("pw"),
                   is_active=True, is_superuser=False)
    inactive_rbac = User(email="inactive_rbac@example.com", hashed_password=get_password_hash("pw"),
                         is_active=False, is_superuser=False)
    superuser = User(email="super@example.com", hashed_password=get_password_hash("pw"),
                     is_active=True, is_superuser=True)
    db.add_all([admin, regular, inactive_rbac, superuser])
    db.flush()
    db.add(UserRole(user_id=admin.id, role_id=role_admin.id))
    db.add(UserRole(user_id=regular.id, role_id=role_viewer.id))
    db.commit()
    db.close()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def _tok(email: str) -> str:
    return create_access_token(subject=email)


def test_admin_user_gets_200(client):
    r = client.get("/admin/test", headers={"Authorization": f"Bearer {_tok('admin@example.com')}"})
    assert r.status_code == 200
    assert r.json() == {"message": "access granted"}


def test_regular_user_gets_403(client):
    r = client.get("/admin/test", headers={"Authorization": f"Bearer {_tok('regular@example.com')}"})
    assert r.status_code == 403


def test_inactive_user_gets_401(client):
    r = client.get("/admin/test", headers={"Authorization": f"Bearer {_tok('inactive_rbac@example.com')}"})
    assert r.status_code == 401


def test_superuser_gets_200(client):
    r = client.get("/admin/test", headers={"Authorization": f"Bearer {_tok('super@example.com')}"})
    assert r.status_code == 200


def test_unauthenticated_gets_401(client):
    r = client.get("/admin/test")
    assert r.status_code == 401


def test_invalid_token_gets_401(client):
    r = client.get("/admin/test", headers={"Authorization": "Bearer bad.token"})
    assert r.status_code == 401
