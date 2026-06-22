"""Permission CRUD API tests — permission enforcement and CRUD correctness."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.permission import Permission, RolePermission
from app.models.role import Role, UserRole
from app.models.user import User
from tests.conftest import _Session


@pytest.fixture(scope="module", autouse=True)
def seed_perms_rbac():
    db = _Session()

    # Gate permissions for this test module
    for pname, pdesc in [
        ("permissions:read", "View permissions"),
        ("permissions:write", "Manage permissions"),
    ]:
        if db.query(Permission).filter_by(name=pname).first() is None:
            db.add(Permission(name=pname, description=pdesc))
            db.flush()

    perm_read = db.query(Permission).filter_by(name="permissions:read").first()
    perm_write = db.query(Permission).filter_by(name="permissions:write").first()

    # Actor roles
    for rname in ("perms_mgr", "perms_reader"):
        if db.query(Role).filter_by(name=rname).first() is None:
            db.add(Role(name=rname, is_system=False))
            db.flush()

    role_mgr = db.query(Role).filter_by(name="perms_mgr").first()
    role_reader = db.query(Role).filter_by(name="perms_reader").first()

    for role, perms in [(role_mgr, [perm_read, perm_write]), (role_reader, [perm_read])]:
        for p in perms:
            if db.query(RolePermission).filter_by(role_id=role.id, permission_id=p.id).first() is None:
                db.add(RolePermission(role_id=role.id, permission_id=p.id))
    db.flush()

    # Test users
    for email, role in [
        ("permsmgr@perms.test", role_mgr),
        ("permsreader@perms.test", role_reader),
        ("permsnone@perms.test", None),
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

def test_perms_list_unauthenticated(client):
    assert client.get("/permissions/").status_code == 401


def test_perms_list_no_permission(client):
    r = client.get("/permissions/", headers={"Authorization": f"Bearer {_tok('permsnone@perms.test')}"})
    assert r.status_code == 403


def test_perms_create_no_permission(client):
    r = client.post(
        "/permissions/",
        json={"name": "blocked:perm"},
        headers={"Authorization": f"Bearer {_tok('permsreader@perms.test')}"},
    )
    assert r.status_code == 403


def test_perms_delete_no_permission(client):
    r = client.delete("/permissions/1", headers={"Authorization": f"Bearer {_tok('permsreader@perms.test')}"})
    assert r.status_code == 403


# --- List ---

def test_list_permissions(client):
    r = client.get("/permissions/", headers={"Authorization": f"Bearer {_tok('permsreader@perms.test')}"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for perm in data:
        assert "id" in perm
        assert "name" in perm


def test_list_permissions_pagination(client):
    r = client.get(
        "/permissions/?skip=0&limit=2",
        headers={"Authorization": f"Bearer {_tok('permsreader@perms.test')}"},
    )
    assert r.status_code == 200
    assert len(r.json()) <= 2


# --- Create ---

def test_create_permission(client):
    r = client.post(
        "/permissions/",
        json={"name": "batch8:test_perm", "description": "Batch 8 test permission"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "batch8:test_perm"
    assert data["description"] == "Batch 8 test permission"
    assert "id" in data


def test_create_permission_duplicate_name(client):
    r = client.post(
        "/permissions/",
        json={"name": "batch8:test_perm"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    assert r.status_code == 409


# --- Read by ID ---

def test_get_permission_by_id(client):
    create_r = client.post(
        "/permissions/",
        json={"name": "batch8:get_perm"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    assert create_r.status_code == 201
    perm_id = create_r.json()["id"]

    r = client.get(
        f"/permissions/{perm_id}",
        headers={"Authorization": f"Bearer {_tok('permsreader@perms.test')}"},
    )
    assert r.status_code == 200
    assert r.json()["name"] == "batch8:get_perm"


def test_get_permission_not_found(client):
    r = client.get(
        "/permissions/99999",
        headers={"Authorization": f"Bearer {_tok('permsreader@perms.test')}"},
    )
    assert r.status_code == 404


# --- Update ---

def test_update_permission(client):
    create_r = client.post(
        "/permissions/",
        json={"name": "batch8:upd_perm"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    perm_id = create_r.json()["id"]

    r = client.put(
        f"/permissions/{perm_id}",
        json={"description": "Updated description"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    assert r.status_code == 200
    assert r.json()["description"] == "Updated description"


def test_update_permission_name_conflict(client):
    r1 = client.post(
        "/permissions/",
        json={"name": "batch8:conflict_a"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    r2 = client.post(
        "/permissions/",
        json={"name": "batch8:conflict_b"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    perm_id = r2.json()["id"]

    r = client.put(
        f"/permissions/{perm_id}",
        json={"name": "batch8:conflict_a"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    assert r.status_code == 409


def test_update_permission_not_found(client):
    r = client.put(
        "/permissions/99999",
        json={"description": "Ghost"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    assert r.status_code == 404


# --- Delete ---

def test_delete_permission_not_in_use(client):
    create_r = client.post(
        "/permissions/",
        json={"name": "batch8:del_perm"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    perm_id = create_r.json()["id"]

    r = client.delete(
        f"/permissions/{perm_id}",
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    assert r.status_code == 204

    r2 = client.get(
        f"/permissions/{perm_id}",
        headers={"Authorization": f"Bearer {_tok('permsreader@perms.test')}"},
    )
    assert r2.status_code == 404


def test_delete_permission_in_use_blocked(client):
    create_r = client.post(
        "/permissions/",
        json={"name": "batch8:inuse_perm"},
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    perm_id = create_r.json()["id"]

    db = _Session()
    role = db.query(Role).filter_by(name="perms_reader").first()
    db.add(RolePermission(role_id=role.id, permission_id=perm_id))
    db.commit()
    db.close()

    r = client.delete(
        f"/permissions/{perm_id}",
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    assert r.status_code == 409


def test_delete_permission_not_found(client):
    r = client.delete(
        "/permissions/99999",
        headers={"Authorization": f"Bearer {_tok('permsmgr@perms.test')}"},
    )
    assert r.status_code == 404
