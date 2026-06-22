"""Device CRUD + access assignment tests."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.company import Company, Device, Site
from app.models.permission import Permission, RolePermission
from app.models.role import Role, UserRole
from app.models.user import User
from tests.conftest import _Session


def _get_or_create(db, model, **kwargs):
    obj = db.query(model).filter_by(**kwargs).first()
    if obj is None:
        obj = model(**kwargs)
        db.add(obj)
        db.flush()
    return obj


@pytest.fixture(scope="module", autouse=True)
def seed_device_rbac():
    db = _Session()

    for pname, pdesc in [
        ("devices:read", "View devices"),
        ("devices:write", "Manage devices"),
        ("access:read", "View access"),
        ("access:assign", "Assign access"),
    ]:
        if db.query(Permission).filter_by(name=pname).first() is None:
            db.add(Permission(name=pname, description=pdesc))
            db.flush()

    p_read = db.query(Permission).filter_by(name="devices:read").first()
    p_write = db.query(Permission).filter_by(name="devices:write").first()
    p_acc_read = db.query(Permission).filter_by(name="access:read").first()
    p_acc_assign = db.query(Permission).filter_by(name="access:assign").first()

    for rname in ("dev_manager", "dev_viewer"):
        if db.query(Role).filter_by(name=rname).first() is None:
            db.add(Role(name=rname, is_system=False))
            db.flush()

    r_mgr = db.query(Role).filter_by(name="dev_manager").first()
    r_viewer = db.query(Role).filter_by(name="dev_viewer").first()

    for role, perms in [
        (r_mgr, [p_read, p_write, p_acc_read, p_acc_assign]),
        (r_viewer, [p_read, p_acc_read]),
    ]:
        for p in perms:
            if db.query(RolePermission).filter_by(role_id=role.id, permission_id=p.id).first() is None:
                db.add(RolePermission(role_id=role.id, permission_id=p.id))
    db.flush()

    for email, role in [
        ("devmgr@dev.test", r_mgr),
        ("devviewer@dev.test", r_viewer),
        ("devnone@dev.test", None),
    ]:
        u = db.query(User).filter_by(email=email).first()
        if u is None:
            u = User(email=email, hashed_password=get_password_hash("pw"), is_active=True, is_superuser=False)
            db.add(u)
            db.flush()
            if role is not None:
                db.add(UserRole(user_id=u.id, role_id=role.id))
                db.flush()

    co = _get_or_create(db, Company, name="dev_test_parent_co", is_active=True)
    _get_or_create(db, Site, company_id=co.id, name="dev_test_parent_site", is_active=True)
    db.commit()
    db.close()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def parent_site_id():
    db = _Session()
    site = db.query(Site).filter_by(name="dev_test_parent_site").first()
    sid = site.id
    db.close()
    return sid


def _tok(email: str) -> str:
    return create_access_token(subject=email)


# --- Permission enforcement ---

def test_devices_list_unauthenticated(client):
    assert client.get("/devices/").status_code == 401


def test_devices_list_no_permission(client):
    r = client.get("/devices/", headers={"Authorization": f"Bearer {_tok('devnone@dev.test')}"})
    assert r.status_code == 403


def test_devices_create_no_permission(client):
    r = client.post("/devices/", json={"site_id": 1, "name": "X"},
                    headers={"Authorization": f"Bearer {_tok('devviewer@dev.test')}"})
    assert r.status_code == 403


# --- List ---

def test_list_devices(client):
    r = client.get("/devices/", headers={"Authorization": f"Bearer {_tok('devviewer@dev.test')}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# --- Create ---

def test_create_device(client, parent_site_id):
    r = client.post("/devices/",
                    json={
                        "site_id": parent_site_id,
                        "name": "Meter-001",
                        "device_type": "energy_meter",
                        "serial_number": "SN-001",
                    },
                    headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    assert r.status_code == 201
    d = r.json()
    assert d["name"] == "Meter-001"
    assert d["device_type"] == "energy_meter"
    assert d["serial_number"] == "SN-001"
    assert d["site_id"] == parent_site_id
    assert d["is_active"] is True
    assert "id" in d


# --- Read ---

def test_get_device(client, parent_site_id):
    create_r = client.post("/devices/",
                           json={"site_id": parent_site_id, "name": "dev_get_test"},
                           headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    dev_id = create_r.json()["id"]
    r = client.get(f"/devices/{dev_id}", headers={"Authorization": f"Bearer {_tok('devviewer@dev.test')}"})
    assert r.status_code == 200
    assert r.json()["name"] == "dev_get_test"


def test_get_device_not_found(client):
    r = client.get("/devices/99999", headers={"Authorization": f"Bearer {_tok('devviewer@dev.test')}"})
    assert r.status_code == 404


# --- Update ---

def test_update_device(client, parent_site_id):
    create_r = client.post("/devices/",
                           json={"site_id": parent_site_id, "name": "dev_upd_test"},
                           headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    dev_id = create_r.json()["id"]
    r = client.put(f"/devices/{dev_id}",
                   json={"description": "Updated device", "is_active": False},
                   headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    assert r.status_code == 200
    assert r.json()["description"] == "Updated device"
    assert r.json()["is_active"] is False


def test_update_device_not_found(client):
    r = client.put("/devices/99999", json={"description": "ghost"},
                   headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    assert r.status_code == 404


# --- Delete ---

def test_delete_device(client, parent_site_id):
    create_r = client.post("/devices/",
                           json={"site_id": parent_site_id, "name": "dev_del_test"},
                           headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    dev_id = create_r.json()["id"]
    r = client.delete(f"/devices/{dev_id}", headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    assert r.status_code == 204
    r2 = client.get(f"/devices/{dev_id}", headers={"Authorization": f"Bearer {_tok('devviewer@dev.test')}"})
    assert r2.status_code == 404


def test_delete_device_not_found(client):
    r = client.delete("/devices/99999", headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    assert r.status_code == 404


# --- Access assignment ---

def test_assign_device_access(client, parent_site_id):
    create_r = client.post("/devices/",
                           json={"site_id": parent_site_id, "name": "dev_access_test"},
                           headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    dev_id = create_r.json()["id"]

    db = _Session()
    target = db.query(User).filter_by(email="devviewer@dev.test").first()
    user_id = target.id
    db.close()

    r = client.post(f"/devices/{dev_id}/access",
                    json={"user_id": user_id, "access_level": "viewer"},
                    headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    assert r.status_code == 200
    d = r.json()
    assert d["device_id"] == dev_id
    assert d["user_id"] == user_id
    assert d["access_level"] == "viewer"


def test_list_device_access(client):
    db = _Session()
    dev = db.query(Device).filter_by(name="dev_access_test").first()
    dev_id = dev.id
    db.close()
    r = client.get(f"/devices/{dev_id}/access",
                   headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_remove_device_access(client):
    db = _Session()
    dev = db.query(Device).filter_by(name="dev_access_test").first()
    dev_id = dev.id
    target = db.query(User).filter_by(email="devviewer@dev.test").first()
    user_id = target.id
    db.close()
    r = client.delete(f"/devices/{dev_id}/access/{user_id}",
                      headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    assert r.status_code == 204


def test_remove_device_access_not_found(client):
    db = _Session()
    dev = db.query(Device).filter_by(name="dev_access_test").first()
    dev_id = dev.id
    db.close()
    r = client.delete(f"/devices/{dev_id}/access/99999",
                      headers={"Authorization": f"Bearer {_tok('devmgr@dev.test')}"})
    assert r.status_code == 404
