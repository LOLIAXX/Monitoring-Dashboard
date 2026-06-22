"""Role CRUD API tests — permission enforcement, CRUD correctness, system-role protection."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.permission import Permission, RolePermission
from app.models.role import Role, UserRole
from app.models.user import User
from tests.conftest import _Session


@pytest.fixture(scope="module", autouse=True)
def seed_roles_rbac():
    db = _Session()

    # Permissions
    for pname, pdesc in [
        ("roles:read", "View roles"),
        ("roles:write", "Manage roles"),
    ]:
        if db.query(Permission).filter_by(name=pname).first() is None:
            p = Permission(name=pname, description=pdesc)
            db.add(p)
            db.flush()

    perm_read = db.query(Permission).filter_by(name="roles:read").first()
    perm_write = db.query(Permission).filter_by(name="roles:write").first()

    # Roles for test actors
    for rname in ("roles_mgr", "roles_reader"):
        if db.query(Role).filter_by(name=rname).first() is None:
            db.add(Role(name=rname, is_system=False))
            db.flush()

    role_mgr = db.query(Role).filter_by(name="roles_mgr").first()
    role_reader = db.query(Role).filter_by(name="roles_reader").first()

    for role, perms in [(role_mgr, [perm_read, perm_write]), (role_reader, [perm_read])]:
        for p in perms:
            if db.query(RolePermission).filter_by(role_id=role.id, permission_id=p.id).first() is None:
                db.add(RolePermission(role_id=role.id, permission_id=p.id))
    db.flush()

    # A system role for protection tests
    if db.query(Role).filter_by(name="sys_test_role").first() is None:
        db.add(Role(name="sys_test_role", is_system=True))
        db.flush()

    # Test users
    for email, role in [
        ("rolesmgr@roles.test", role_mgr),
        ("rolesreader@roles.test", role_reader),
        ("rolesnone@roles.test", None),
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

def test_roles_list_unauthenticated(client):
    assert client.get("/roles/").status_code == 401


def test_roles_list_no_permission(client):
    r = client.get("/roles/", headers={"Authorization": f"Bearer {_tok('rolesnone@roles.test')}"})
    assert r.status_code == 403


def test_roles_create_no_permission(client):
    r = client.post(
        "/roles/",
        json={"name": "blocked_role"},
        headers={"Authorization": f"Bearer {_tok('rolesreader@roles.test')}"},
    )
    assert r.status_code == 403


def test_roles_delete_no_permission(client):
    r = client.delete("/roles/1", headers={"Authorization": f"Bearer {_tok('rolesreader@roles.test')}"})
    assert r.status_code == 403


# --- List ---

def test_list_roles(client):
    r = client.get("/roles/", headers={"Authorization": f"Bearer {_tok('rolesreader@roles.test')}"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for role in data:
        assert "id" in role
        assert "name" in role
        assert "is_system" in role
        assert "permissions" in role


def test_list_roles_pagination(client):
    r = client.get(
        "/roles/?skip=0&limit=2",
        headers={"Authorization": f"Bearer {_tok('rolesreader@roles.test')}"},
    )
    assert r.status_code == 200
    assert len(r.json()) <= 2


# --- Create ---

def test_create_role(client):
    r = client.post(
        "/roles/",
        json={"name": "batch8_new_role", "description": "Created in batch 8"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "batch8_new_role"
    assert data["description"] == "Created in batch 8"
    assert data["is_system"] is False
    assert data["permissions"] == []
    assert "id" in data
    assert "created_at" in data


def test_create_role_duplicate_name(client):
    r = client.post(
        "/roles/",
        json={"name": "batch8_new_role"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 409


# --- Read by ID ---

def test_get_role_by_id(client):
    create_r = client.post(
        "/roles/",
        json={"name": "batch8_get_role"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert create_r.status_code == 201
    role_id = create_r.json()["id"]

    r = client.get(
        f"/roles/{role_id}",
        headers={"Authorization": f"Bearer {_tok('rolesreader@roles.test')}"},
    )
    assert r.status_code == 200
    assert r.json()["name"] == "batch8_get_role"


def test_get_role_not_found(client):
    r = client.get("/roles/99999", headers={"Authorization": f"Bearer {_tok('rolesreader@roles.test')}"})
    assert r.status_code == 404


# --- Update ---

def test_update_role(client):
    create_r = client.post(
        "/roles/",
        json={"name": "batch8_upd_role"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    role_id = create_r.json()["id"]

    r = client.put(
        f"/roles/{role_id}",
        json={"description": "Updated description"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 200
    assert r.json()["description"] == "Updated description"


def test_update_role_not_found(client):
    r = client.put(
        "/roles/99999",
        json={"description": "Ghost"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 404


def test_update_system_role_name_blocked(client):
    db = _Session()
    sys_role = db.query(Role).filter_by(name="sys_test_role").first()
    sys_id = sys_role.id
    db.close()

    r = client.put(
        f"/roles/{sys_id}",
        json={"name": "renamed_sys_role"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 403


def test_update_system_role_description_allowed(client):
    db = _Session()
    sys_role = db.query(Role).filter_by(name="sys_test_role").first()
    sys_id = sys_role.id
    db.close()

    r = client.put(
        f"/roles/{sys_id}",
        json={"description": "Updated system role description"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 200


def test_update_role_name_conflict(client):
    # Create two roles then try to rename one to the other's name
    r1 = client.post(
        "/roles/",
        json={"name": "batch8_conflict_a"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    r2 = client.post(
        "/roles/",
        json={"name": "batch8_conflict_b"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    role_id = r2.json()["id"]

    r = client.put(
        f"/roles/{role_id}",
        json={"name": "batch8_conflict_a"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 409


# --- Delete ---

def test_delete_role(client):
    create_r = client.post(
        "/roles/",
        json={"name": "batch8_del_role"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    role_id = create_r.json()["id"]

    r = client.delete(
        f"/roles/{role_id}",
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 204

    r2 = client.get(
        f"/roles/{role_id}",
        headers={"Authorization": f"Bearer {_tok('rolesreader@roles.test')}"},
    )
    assert r2.status_code == 404


def test_delete_system_role_blocked(client):
    db = _Session()
    sys_role = db.query(Role).filter_by(name="sys_test_role").first()
    sys_id = sys_role.id
    db.close()

    r = client.delete(
        f"/roles/{sys_id}",
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 403


def test_delete_role_not_found(client):
    r = client.delete(
        "/roles/99999",
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 404


# --- Permission assignment ---

def test_assign_permission_to_role(client):
    role_r = client.post(
        "/roles/",
        json={"name": "batch8_assign_role"},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    role_id = role_r.json()["id"]

    db = _Session()
    perm = db.query(Permission).filter_by(name="roles:read").first()
    perm_id = perm.id
    db.close()

    r = client.post(
        f"/roles/{role_id}/permissions",
        json={"permission_id": perm_id},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 200
    perm_names = [p["name"] for p in r.json()["permissions"]]
    assert "roles:read" in perm_names


def test_assign_permission_idempotent(client):
    db = _Session()
    role = db.query(Role).filter_by(name="batch8_assign_role").first()
    role_id = role.id
    perm = db.query(Permission).filter_by(name="roles:read").first()
    perm_id = perm.id
    db.close()

    r = client.post(
        f"/roles/{role_id}/permissions",
        json={"permission_id": perm_id},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 200


def test_assign_permission_role_not_found(client):
    db = _Session()
    perm = db.query(Permission).filter_by(name="roles:read").first()
    perm_id = perm.id
    db.close()

    r = client.post(
        "/roles/99999/permissions",
        json={"permission_id": perm_id},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 404


def test_assign_permission_not_found(client):
    db = _Session()
    role = db.query(Role).filter_by(name="batch8_assign_role").first()
    role_id = role.id
    db.close()

    r = client.post(
        f"/roles/{role_id}/permissions",
        json={"permission_id": 99999},
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 404


def test_remove_permission_from_role(client):
    db = _Session()
    role = db.query(Role).filter_by(name="batch8_assign_role").first()
    role_id = role.id
    perm = db.query(Permission).filter_by(name="roles:read").first()
    perm_id = perm.id
    db.close()

    r = client.delete(
        f"/roles/{role_id}/permissions/{perm_id}",
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 204

    r2 = client.get(
        f"/roles/{role_id}",
        headers={"Authorization": f"Bearer {_tok('rolesreader@roles.test')}"},
    )
    perm_names = [p["name"] for p in r2.json()["permissions"]]
    assert "roles:read" not in perm_names


def test_remove_permission_not_assigned(client):
    db = _Session()
    role = db.query(Role).filter_by(name="batch8_assign_role").first()
    role_id = role.id
    perm = db.query(Permission).filter_by(name="roles:read").first()
    perm_id = perm.id
    db.close()

    r = client.delete(
        f"/roles/{role_id}/permissions/{perm_id}",
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 404


def test_remove_permission_role_not_found(client):
    r = client.delete(
        "/roles/99999/permissions/1",
        headers={"Authorization": f"Bearer {_tok('rolesmgr@roles.test')}"},
    )
    assert r.status_code == 404
