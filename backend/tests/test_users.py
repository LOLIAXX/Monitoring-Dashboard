"""User CRUD API tests — permission enforcement and CRUD correctness."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.permission import Permission, RolePermission
from app.models.role import Role, UserRole
from app.models.user import User
from tests.conftest import _Session


@pytest.fixture(scope="module", autouse=True)
def seed_user_crud_rbac():
    db = _Session()

    # Idempotent: create permissions only if absent
    perm_read = db.query(Permission).filter_by(name="users:read").first()
    if perm_read is None:
        perm_read = Permission(name="users:read", description="View users")
        db.add(perm_read)
        db.flush()

    perm_write = db.query(Permission).filter_by(name="users:write").first()
    if perm_write is None:
        perm_write = Permission(name="users:write", description="Manage users")
        db.add(perm_write)
        db.flush()

    # Roles
    role_mgr = db.query(Role).filter_by(name="user_manager").first()
    if role_mgr is None:
        role_mgr = Role(name="user_manager", is_system=False)
        db.add(role_mgr)
        db.flush()
        db.add(RolePermission(role_id=role_mgr.id, permission_id=perm_read.id))
        db.add(RolePermission(role_id=role_mgr.id, permission_id=perm_write.id))
        db.flush()

    role_reader = db.query(Role).filter_by(name="user_reader").first()
    if role_reader is None:
        role_reader = Role(name="user_reader", is_system=False)
        db.add(role_reader)
        db.flush()
        db.add(RolePermission(role_id=role_reader.id, permission_id=perm_read.id))
        db.flush()

    # Auth users for this test module
    for email, role in [
        ("mgr@users.test", role_mgr),
        ("reader@users.test", role_reader),
        ("noperm@users.test", None),
    ]:
        u = db.query(User).filter_by(email=email).first()
        if u is None:
            u = User(email=email, hashed_password=get_password_hash("pw"), is_active=True, is_superuser=False)
            db.add(u)
            db.flush()
            if role is not None:
                db.add(UserRole(user_id=u.id, role_id=role.id))
                db.flush()

    db.commit()
    db.close()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def _tok(email: str) -> str:
    return create_access_token(subject=email)


# --- Permission enforcement ---

def test_list_unauthenticated(client):
    assert client.get("/users/").status_code == 401


def test_list_no_permission(client):
    r = client.get("/users/", headers={"Authorization": f"Bearer {_tok('noperm@users.test')}"})
    assert r.status_code == 403


def test_create_no_permission(client):
    r = client.post("/users/", json={"email": "x@x.com", "password": "pw"},
                    headers={"Authorization": f"Bearer {_tok('reader@users.test')}"})
    assert r.status_code == 403


def test_delete_no_permission(client):
    r = client.delete("/users/1", headers={"Authorization": f"Bearer {_tok('reader@users.test')}"})
    assert r.status_code == 403


# --- List ---

def test_list_users(client):
    r = client.get("/users/", headers={"Authorization": f"Bearer {_tok('reader@users.test')}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_list_pagination(client):
    r = client.get("/users/?skip=0&limit=2",
                   headers={"Authorization": f"Bearer {_tok('reader@users.test')}"})
    assert r.status_code == 200
    assert len(r.json()) <= 2


# --- Create ---

def test_create_user(client):
    r = client.post("/users/",
                    json={"email": "new@users.test", "password": "testpass", "full_name": "New User"},
                    headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})
    assert r.status_code == 201
    data = r.json()
    assert data["email"] == "new@users.test"
    assert data["full_name"] == "New User"
    assert "hashed_password" not in data
    assert "id" in data


def test_create_duplicate_email(client):
    r = client.post("/users/", json={"email": "new@users.test", "password": "pw"},
                    headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})
    assert r.status_code == 409


# --- Read by ID ---

def test_get_user_by_id(client):
    create_r = client.post("/users/",
                           json={"email": "getme@users.test", "password": "pw"},
                           headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})
    assert create_r.status_code == 201
    user_id = create_r.json()["id"]

    r = client.get(f"/users/{user_id}",
                   headers={"Authorization": f"Bearer {_tok('reader@users.test')}"})
    assert r.status_code == 200
    assert r.json()["email"] == "getme@users.test"


def test_get_user_not_found(client):
    r = client.get("/users/99999",
                   headers={"Authorization": f"Bearer {_tok('reader@users.test')}"})
    assert r.status_code == 404


# --- Update ---

def test_update_user(client):
    create_r = client.post("/users/",
                           json={"email": "upd@users.test", "password": "pw"},
                           headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})
    user_id = create_r.json()["id"]

    r = client.put(f"/users/{user_id}",
                   json={"full_name": "Updated", "is_active": False},
                   headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})
    assert r.status_code == 200
    data = r.json()
    assert data["full_name"] == "Updated"
    assert data["is_active"] is False


def test_update_user_not_found(client):
    r = client.put("/users/99999", json={"full_name": "Ghost"},
                   headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})
    assert r.status_code == 404


# --- Delete ---

def test_delete_user(client):
    create_r = client.post("/users/",
                           json={"email": "del@users.test", "password": "pw"},
                           headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})
    user_id = create_r.json()["id"]

    r = client.delete(f"/users/{user_id}",
                      headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})
    assert r.status_code == 204

    r2 = client.get(f"/users/{user_id}",
                    headers={"Authorization": f"Bearer {_tok('reader@users.test')}"})
    assert r2.status_code == 404


def test_delete_not_found(client):
    r = client.delete("/users/99999",
                      headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})
    assert r.status_code == 404


# --- Active filter ---

def test_list_active_filter(client):
    client.post("/users/",
                json={"email": "inactive_filter@users.test", "password": "pw", "is_active": False},
                headers={"Authorization": f"Bearer {_tok('mgr@users.test')}"})

    r_active = client.get("/users/?is_active=true",
                          headers={"Authorization": f"Bearer {_tok('reader@users.test')}"})
    r_inactive = client.get("/users/?is_active=false",
                            headers={"Authorization": f"Bearer {_tok('reader@users.test')}"})

    assert r_active.status_code == 200
    assert r_inactive.status_code == 200
    assert all(u["is_active"] is True for u in r_active.json())
    assert all(u["is_active"] is False for u in r_inactive.json())
