"""Company CRUD + site listing + access assignment tests."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.company import Company
from app.models.permission import Permission, RolePermission
from app.models.role import Role, UserRole
from app.models.user import User
from tests.conftest import _Session


@pytest.fixture(scope="module", autouse=True)
def seed_company_rbac():
    db = _Session()

    for pname, pdesc in [
        ("companies:read", "View companies"),
        ("companies:write", "Manage companies"),
        ("sites:read", "View sites"),
        ("access:read", "View access"),
        ("access:assign", "Assign access"),
    ]:
        if db.query(Permission).filter_by(name=pname).first() is None:
            db.add(Permission(name=pname, description=pdesc))
            db.flush()

    p_read = db.query(Permission).filter_by(name="companies:read").first()
    p_write = db.query(Permission).filter_by(name="companies:write").first()
    p_sites_read = db.query(Permission).filter_by(name="sites:read").first()
    p_access_read = db.query(Permission).filter_by(name="access:read").first()
    p_access_assign = db.query(Permission).filter_by(name="access:assign").first()

    for rname in ("co_manager", "co_viewer"):
        if db.query(Role).filter_by(name=rname).first() is None:
            db.add(Role(name=rname, is_system=False))
            db.flush()

    r_mgr = db.query(Role).filter_by(name="co_manager").first()
    r_viewer = db.query(Role).filter_by(name="co_viewer").first()

    for role, perms in [
        (r_mgr, [p_read, p_write, p_sites_read, p_access_read, p_access_assign]),
        (r_viewer, [p_read, p_sites_read, p_access_read]),
    ]:
        for p in perms:
            if db.query(RolePermission).filter_by(role_id=role.id, permission_id=p.id).first() is None:
                db.add(RolePermission(role_id=role.id, permission_id=p.id))
    db.flush()

    for email, role in [
        ("comgr@co.test", r_mgr),
        ("coviewer@co.test", r_viewer),
        ("conone@co.test", None),
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

def test_companies_list_unauthenticated(client):
    assert client.get("/companies/").status_code == 401


def test_companies_list_no_permission(client):
    r = client.get("/companies/", headers={"Authorization": f"Bearer {_tok('conone@co.test')}"})
    assert r.status_code == 403


def test_companies_create_no_permission(client):
    r = client.post("/companies/", json={"name": "X"},
                    headers={"Authorization": f"Bearer {_tok('coviewer@co.test')}"})
    assert r.status_code == 403


# --- List ---

def test_list_companies(client):
    r = client.get("/companies/", headers={"Authorization": f"Bearer {_tok('coviewer@co.test')}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_list_companies_pagination(client):
    r = client.get("/companies/?skip=0&limit=2",
                   headers={"Authorization": f"Bearer {_tok('coviewer@co.test')}"})
    assert r.status_code == 200
    assert len(r.json()) <= 2


# --- Create ---

def test_create_company(client):
    r = client.post("/companies/",
                    json={"name": "Solico Test Co", "description": "Test company"},
                    headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 201
    d = r.json()
    assert d["name"] == "Solico Test Co"
    assert d["description"] == "Test company"
    assert d["is_active"] is True
    assert "id" in d
    assert "created_at" in d


def test_create_company_duplicate(client):
    r = client.post("/companies/", json={"name": "Solico Test Co"},
                    headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 409


# --- Read ---

def test_get_company(client):
    create_r = client.post("/companies/", json={"name": "co_get_test"},
                           headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    co_id = create_r.json()["id"]
    r = client.get(f"/companies/{co_id}",
                   headers={"Authorization": f"Bearer {_tok('coviewer@co.test')}"})
    assert r.status_code == 200
    assert r.json()["name"] == "co_get_test"


def test_get_company_not_found(client):
    r = client.get("/companies/99999",
                   headers={"Authorization": f"Bearer {_tok('coviewer@co.test')}"})
    assert r.status_code == 404


# --- Update ---

def test_update_company(client):
    create_r = client.post("/companies/", json={"name": "co_upd_test"},
                           headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    co_id = create_r.json()["id"]
    r = client.put(f"/companies/{co_id}",
                   json={"description": "Updated", "is_active": False},
                   headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 200
    assert r.json()["description"] == "Updated"
    assert r.json()["is_active"] is False


def test_update_company_name_conflict(client):
    r1 = client.post("/companies/", json={"name": "co_conflict_a"},
                     headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    r2 = client.post("/companies/", json={"name": "co_conflict_b"},
                     headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    co_id = r2.json()["id"]
    r = client.put(f"/companies/{co_id}", json={"name": "co_conflict_a"},
                   headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 409


def test_update_company_not_found(client):
    r = client.put("/companies/99999", json={"description": "ghost"},
                   headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 404


# --- Delete ---

def test_delete_company(client):
    create_r = client.post("/companies/", json={"name": "co_del_test"},
                           headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    co_id = create_r.json()["id"]
    r = client.delete(f"/companies/{co_id}",
                      headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 204
    r2 = client.get(f"/companies/{co_id}",
                    headers={"Authorization": f"Bearer {_tok('coviewer@co.test')}"})
    assert r2.status_code == 404


def test_delete_company_not_found(client):
    r = client.delete("/companies/99999",
                      headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 404


# --- Sites under company ---

def test_list_company_sites_empty(client):
    create_r = client.post("/companies/", json={"name": "co_sites_test"},
                           headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    co_id = create_r.json()["id"]
    r = client.get(f"/companies/{co_id}/sites",
                   headers={"Authorization": f"Bearer {_tok('coviewer@co.test')}"})
    assert r.status_code == 200
    assert r.json() == []


def test_list_company_sites_not_found(client):
    r = client.get("/companies/99999/sites",
                   headers={"Authorization": f"Bearer {_tok('coviewer@co.test')}"})
    assert r.status_code == 404


# --- Access assignment ---

def test_assign_company_access(client):
    create_r = client.post("/companies/", json={"name": "co_access_test"},
                           headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    co_id = create_r.json()["id"]

    db = _Session()
    target_user = db.query(User).filter_by(email="coviewer@co.test").first()
    user_id = target_user.id
    db.close()

    r = client.post(f"/companies/{co_id}/access",
                    json={"user_id": user_id, "access_level": "operator"},
                    headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 200
    d = r.json()
    assert d["user_id"] == user_id
    assert d["company_id"] == co_id
    assert d["access_level"] == "operator"


def test_list_company_access(client):
    db = _Session()
    co = db.query(Company).filter_by(name="co_access_test").first()
    co_id = co.id
    db.close()
    r = client.get(f"/companies/{co_id}/access",
                   headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_assign_company_access_updates_level(client):
    db = _Session()
    co = db.query(Company).filter_by(name="co_access_test").first()
    co_id = co.id
    target_user = db.query(User).filter_by(email="coviewer@co.test").first()
    user_id = target_user.id
    db.close()
    r = client.post(f"/companies/{co_id}/access",
                    json={"user_id": user_id, "access_level": "admin"},
                    headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 200
    assert r.json()["access_level"] == "admin"


def test_remove_company_access(client):
    db = _Session()
    co = db.query(Company).filter_by(name="co_access_test").first()
    co_id = co.id
    target_user = db.query(User).filter_by(email="coviewer@co.test").first()
    user_id = target_user.id
    db.close()
    r = client.delete(f"/companies/{co_id}/access/{user_id}",
                      headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 204


def test_remove_company_access_not_found(client):
    db = _Session()
    co = db.query(Company).filter_by(name="co_access_test").first()
    co_id = co.id
    db.close()
    r = client.delete(f"/companies/{co_id}/access/99999",
                      headers={"Authorization": f"Bearer {_tok('comgr@co.test')}"})
    assert r.status_code == 404
