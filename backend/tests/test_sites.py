"""Site CRUD + device listing + access assignment tests."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.company import Company, Site
from app.models.permission import Permission, RolePermission
from app.models.role import Role, UserRole
from app.models.user import User
from tests.conftest import _Session


def _get_or_create_company(db, name: str) -> Company:
    co = db.query(Company).filter_by(name=name).first()
    if co is None:
        co = Company(name=name, is_active=True)
        db.add(co)
        db.flush()
    return co


@pytest.fixture(scope="module", autouse=True)
def seed_site_rbac():
    db = _Session()

    for pname, pdesc in [
        ("sites:read", "View sites"),
        ("sites:write", "Manage sites"),
        ("devices:read", "View devices"),
        ("access:read", "View access"),
        ("access:assign", "Assign access"),
    ]:
        if db.query(Permission).filter_by(name=pname).first() is None:
            db.add(Permission(name=pname, description=pdesc))
            db.flush()

    p_read = db.query(Permission).filter_by(name="sites:read").first()
    p_write = db.query(Permission).filter_by(name="sites:write").first()
    p_dev_read = db.query(Permission).filter_by(name="devices:read").first()
    p_acc_read = db.query(Permission).filter_by(name="access:read").first()
    p_acc_assign = db.query(Permission).filter_by(name="access:assign").first()

    for rname in ("site_manager", "site_viewer"):
        if db.query(Role).filter_by(name=rname).first() is None:
            db.add(Role(name=rname, is_system=False))
            db.flush()

    r_mgr = db.query(Role).filter_by(name="site_manager").first()
    r_viewer = db.query(Role).filter_by(name="site_viewer").first()

    for role, perms in [
        (r_mgr, [p_read, p_write, p_dev_read, p_acc_read, p_acc_assign]),
        (r_viewer, [p_read, p_dev_read, p_acc_read]),
    ]:
        for p in perms:
            if db.query(RolePermission).filter_by(role_id=role.id, permission_id=p.id).first() is None:
                db.add(RolePermission(role_id=role.id, permission_id=p.id))
    db.flush()

    for email, role in [
        ("sitemgr@site.test", r_mgr),
        ("siteviewer@site.test", r_viewer),
        ("sitenone@site.test", None),
    ]:
        u = db.query(User).filter_by(email=email).first()
        if u is None:
            u = User(email=email, hashed_password=get_password_hash("pw"), is_active=True, is_superuser=False)
            db.add(u)
            db.flush()
            if role is not None:
                db.add(UserRole(user_id=u.id, role_id=role.id))
                db.flush()

    _get_or_create_company(db, "site_test_parent_co")
    db.commit()
    db.close()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def parent_company_id():
    db = _Session()
    co = db.query(Company).filter_by(name="site_test_parent_co").first()
    cid = co.id
    db.close()
    return cid


def _tok(email: str) -> str:
    return create_access_token(subject=email)


# --- Permission enforcement ---

def test_sites_list_unauthenticated(client):
    assert client.get("/sites/").status_code == 401


def test_sites_list_no_permission(client):
    r = client.get("/sites/", headers={"Authorization": f"Bearer {_tok('sitenone@site.test')}"})
    assert r.status_code == 403


def test_sites_create_no_permission(client):
    r = client.post("/sites/", json={"company_id": 1, "name": "X"},
                    headers={"Authorization": f"Bearer {_tok('siteviewer@site.test')}"})
    assert r.status_code == 403


# --- List ---

def test_list_sites(client):
    r = client.get("/sites/", headers={"Authorization": f"Bearer {_tok('siteviewer@site.test')}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# --- Create ---

def test_create_site(client, parent_company_id):
    r = client.post("/sites/",
                    json={"company_id": parent_company_id, "name": "Factory A", "location": "Tehran"},
                    headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    assert r.status_code == 201
    d = r.json()
    assert d["name"] == "Factory A"
    assert d["location"] == "Tehran"
    assert d["company_id"] == parent_company_id
    assert d["is_active"] is True
    assert "id" in d


# --- Read ---

def test_get_site(client, parent_company_id):
    create_r = client.post("/sites/",
                           json={"company_id": parent_company_id, "name": "site_get_test"},
                           headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    site_id = create_r.json()["id"]
    r = client.get(f"/sites/{site_id}", headers={"Authorization": f"Bearer {_tok('siteviewer@site.test')}"})
    assert r.status_code == 200
    assert r.json()["name"] == "site_get_test"


def test_get_site_not_found(client):
    r = client.get("/sites/99999", headers={"Authorization": f"Bearer {_tok('siteviewer@site.test')}"})
    assert r.status_code == 404


# --- Update ---

def test_update_site(client, parent_company_id):
    create_r = client.post("/sites/",
                           json={"company_id": parent_company_id, "name": "site_upd_test"},
                           headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    site_id = create_r.json()["id"]
    r = client.put(f"/sites/{site_id}",
                   json={"description": "Updated site", "is_active": False},
                   headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    assert r.status_code == 200
    assert r.json()["description"] == "Updated site"
    assert r.json()["is_active"] is False


def test_update_site_not_found(client):
    r = client.put("/sites/99999", json={"description": "ghost"},
                   headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    assert r.status_code == 404


# --- Delete ---

def test_delete_site(client, parent_company_id):
    create_r = client.post("/sites/",
                           json={"company_id": parent_company_id, "name": "site_del_test"},
                           headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    site_id = create_r.json()["id"]
    r = client.delete(f"/sites/{site_id}", headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    assert r.status_code == 204
    r2 = client.get(f"/sites/{site_id}", headers={"Authorization": f"Bearer {_tok('siteviewer@site.test')}"})
    assert r2.status_code == 404


def test_delete_site_not_found(client):
    r = client.delete("/sites/99999", headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    assert r.status_code == 404


# --- Devices under site ---

def test_list_site_devices_empty(client, parent_company_id):
    create_r = client.post("/sites/",
                           json={"company_id": parent_company_id, "name": "site_devices_test"},
                           headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    site_id = create_r.json()["id"]
    r = client.get(f"/sites/{site_id}/devices",
                   headers={"Authorization": f"Bearer {_tok('siteviewer@site.test')}"})
    assert r.status_code == 200
    assert r.json() == []


def test_list_site_devices_not_found(client):
    r = client.get("/sites/99999/devices",
                   headers={"Authorization": f"Bearer {_tok('siteviewer@site.test')}"})
    assert r.status_code == 404


# --- Access assignment ---

def test_assign_site_access(client, parent_company_id):
    create_r = client.post("/sites/",
                           json={"company_id": parent_company_id, "name": "site_access_test"},
                           headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    site_id = create_r.json()["id"]

    db = _Session()
    target = db.query(User).filter_by(email="siteviewer@site.test").first()
    user_id = target.id
    db.close()

    r = client.post(f"/sites/{site_id}/access",
                    json={"user_id": user_id, "access_level": "viewer"},
                    headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    assert r.status_code == 200
    d = r.json()
    assert d["site_id"] == site_id
    assert d["user_id"] == user_id
    assert d["access_level"] == "viewer"


def test_list_site_access(client):
    db = _Session()
    site = db.query(Site).filter_by(name="site_access_test").first()
    site_id = site.id
    db.close()
    r = client.get(f"/sites/{site_id}/access",
                   headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_remove_site_access(client):
    db = _Session()
    site = db.query(Site).filter_by(name="site_access_test").first()
    site_id = site.id
    target = db.query(User).filter_by(email="siteviewer@site.test").first()
    user_id = target.id
    db.close()
    r = client.delete(f"/sites/{site_id}/access/{user_id}",
                      headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    assert r.status_code == 204


def test_remove_site_access_not_found(client):
    db = _Session()
    site = db.query(Site).filter_by(name="site_access_test").first()
    site_id = site.id
    db.close()
    r = client.delete(f"/sites/{site_id}/access/99999",
                      headers={"Authorization": f"Bearer {_tok('sitemgr@site.test')}"})
    assert r.status_code == 404
