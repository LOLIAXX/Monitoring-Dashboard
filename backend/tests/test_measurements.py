"""Energy measurement CRUD and query tests."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.company import Company, Device, Site
from app.models.permission import Permission, RolePermission
from app.models.role import Role, UserRole
from app.models.user import User
from tests.conftest import _Session

_TS1 = "2026-01-15T08:00:00+00:00"
_TS2 = "2026-01-15T09:00:00+00:00"
_TS3 = "2026-01-15T10:00:00+00:00"


def _get_or_create(db, model, **kwargs):
    obj = db.query(model).filter_by(**kwargs).first()
    if obj is None:
        obj = model(**kwargs)
        db.add(obj)
        db.flush()
    return obj


@pytest.fixture(scope="module", autouse=True)
def seed_measurement_rbac():
    db = _Session()

    for pname, pdesc in [
        ("energy:read", "View energy data"),
        ("energy:write", "Modify energy data"),
    ]:
        if db.query(Permission).filter_by(name=pname).first() is None:
            db.add(Permission(name=pname, description=pdesc))
            db.flush()

    p_read = db.query(Permission).filter_by(name="energy:read").first()
    p_write = db.query(Permission).filter_by(name="energy:write").first()

    for rname in ("meas_writer", "meas_reader"):
        if db.query(Role).filter_by(name=rname).first() is None:
            db.add(Role(name=rname, is_system=False))
            db.flush()

    r_writer = db.query(Role).filter_by(name="meas_writer").first()
    r_reader = db.query(Role).filter_by(name="meas_reader").first()

    for role, perms in [
        (r_writer, [p_read, p_write]),
        (r_reader, [p_read]),
    ]:
        for p in perms:
            if db.query(RolePermission).filter_by(role_id=role.id, permission_id=p.id).first() is None:
                db.add(RolePermission(role_id=role.id, permission_id=p.id))
    db.flush()

    for email, role in [
        ("meas_writer@meas.test", r_writer),
        ("meas_reader@meas.test", r_reader),
        ("meas_none@meas.test", None),
    ]:
        u = db.query(User).filter_by(email=email).first()
        if u is None:
            u = User(email=email, hashed_password=get_password_hash("pw"), is_active=True, is_superuser=False)
            db.add(u)
            db.flush()
            if role is not None:
                db.add(UserRole(user_id=u.id, role_id=role.id))
                db.flush()

    co = _get_or_create(db, Company, name="meas_test_co", is_active=True)
    si = _get_or_create(db, Site, company_id=co.id, name="meas_test_site", is_active=True)
    _get_or_create(db, Device, site_id=si.id, name="meas_test_device", is_active=True)
    db.commit()
    db.close()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def test_device_id():
    db = _Session()
    dev = db.query(Device).filter_by(name="meas_test_device").first()
    did = dev.id
    db.close()
    return did


def _tok(email: str) -> str:
    return create_access_token(subject=email)


def _auth(email: str) -> dict:
    return {"Authorization": f"Bearer {_tok(email)}"}


# --- Permission enforcement ---

def test_list_measurements_unauthenticated(client, test_device_id):
    r = client.get(f"/devices/{test_device_id}/measurements")
    assert r.status_code == 401


def test_list_measurements_no_permission(client, test_device_id):
    r = client.get(f"/devices/{test_device_id}/measurements", headers=_auth("meas_none@meas.test"))
    assert r.status_code == 403


def test_create_measurement_no_permission(client, test_device_id):
    r = client.post(
        f"/devices/{test_device_id}/measurements",
        json={"timestamp": _TS1, "value": 10.0, "unit": "kW", "measurement_type": "active_power"},
        headers=_auth("meas_reader@meas.test"),
    )
    assert r.status_code == 403


# --- Create ---

def test_create_measurement(client, test_device_id):
    r = client.post(
        f"/devices/{test_device_id}/measurements",
        json={"timestamp": _TS1, "value": 42.5, "unit": "kW", "measurement_type": "active_power"},
        headers=_auth("meas_writer@meas.test"),
    )
    assert r.status_code == 201
    d = r.json()
    assert d["device_id"] == test_device_id
    assert d["value"] == 42.5
    assert d["unit"] == "kW"
    assert d["measurement_type"] == "active_power"
    assert "id" in d
    assert "created_at" in d


def test_create_measurement_device_not_found(client):
    r = client.post(
        "/devices/99999/measurements",
        json={"timestamp": _TS1, "value": 1.0, "unit": "kW", "measurement_type": "active_power"},
        headers=_auth("meas_writer@meas.test"),
    )
    assert r.status_code == 404


def test_create_measurement_with_optional_fields(client, test_device_id):
    r = client.post(
        f"/devices/{test_device_id}/measurements",
        json={
            "timestamp": _TS2,
            "value": 55.0,
            "unit": "kWh",
            "measurement_type": "energy",
            "quality": "good",
            "source": "meter_001",
        },
        headers=_auth("meas_writer@meas.test"),
    )
    assert r.status_code == 201
    d = r.json()
    assert d["quality"] == "good"
    assert d["source"] == "meter_001"


# --- List ---

def test_list_measurements(client, test_device_id):
    r = client.get(f"/devices/{test_device_id}/measurements", headers=_auth("meas_reader@meas.test"))
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_list_measurements_device_not_found(client):
    r = client.get("/devices/99999/measurements", headers=_auth("meas_reader@meas.test"))
    assert r.status_code == 404


def test_list_measurements_filter_by_type(client, test_device_id):
    r = client.get(
        f"/devices/{test_device_id}/measurements",
        params={"measurement_type": "energy"},
        headers=_auth("meas_reader@meas.test"),
    )
    assert r.status_code == 200
    data = r.json()
    assert all(m["measurement_type"] == "energy" for m in data)


def test_list_measurements_time_range(client, test_device_id):
    r = client.post(
        f"/devices/{test_device_id}/measurements",
        json={"timestamp": _TS3, "value": 77.0, "unit": "kW", "measurement_type": "active_power"},
        headers=_auth("meas_writer@meas.test"),
    )
    assert r.status_code == 201

    r = client.get(
        f"/devices/{test_device_id}/measurements",
        params={"from_dt": _TS2, "to_dt": _TS3},
        headers=_auth("meas_reader@meas.test"),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


def test_list_measurements_pagination(client, test_device_id):
    r = client.get(
        f"/devices/{test_device_id}/measurements",
        params={"skip": 0, "limit": 1},
        headers=_auth("meas_reader@meas.test"),
    )
    assert r.status_code == 200
    data = r.json()
    assert len(data) <= 1


# --- Get by ID ---

def test_get_measurement_by_id(client, test_device_id):
    create_r = client.post(
        f"/devices/{test_device_id}/measurements",
        json={"timestamp": "2026-02-01T00:00:00+00:00", "value": 10.0, "unit": "V", "measurement_type": "voltage"},
        headers=_auth("meas_writer@meas.test"),
    )
    mid = create_r.json()["id"]
    r = client.get(f"/measurements/{mid}", headers=_auth("meas_reader@meas.test"))
    assert r.status_code == 200
    assert r.json()["id"] == mid
    assert r.json()["measurement_type"] == "voltage"


def test_get_measurement_not_found(client):
    r = client.get("/measurements/99999", headers=_auth("meas_reader@meas.test"))
    assert r.status_code == 404


# --- Latest ---

def test_get_latest_measurement(client, test_device_id):
    r = client.get(
        f"/devices/{test_device_id}/measurements/latest",
        headers=_auth("meas_reader@meas.test"),
    )
    assert r.status_code == 200


def test_get_latest_measurement_by_type(client, test_device_id):
    r = client.get(
        f"/devices/{test_device_id}/measurements/latest",
        params={"measurement_type": "active_power"},
        headers=_auth("meas_reader@meas.test"),
    )
    assert r.status_code == 200
    if r.json() is not None:
        assert r.json()["measurement_type"] == "active_power"


def test_get_latest_measurement_device_not_found(client):
    r = client.get("/devices/99999/measurements/latest", headers=_auth("meas_reader@meas.test"))
    assert r.status_code == 404


# --- Bulk create ---

def test_bulk_create_measurements(client, test_device_id):
    r = client.post(
        f"/devices/{test_device_id}/measurements/bulk",
        json={
            "measurements": [
                {"timestamp": "2026-03-01T00:00:00+00:00", "value": 1.0, "unit": "kW", "measurement_type": "active_power"},
                {"timestamp": "2026-03-01T01:00:00+00:00", "value": 2.0, "unit": "kW", "measurement_type": "active_power"},
                {"timestamp": "2026-03-01T02:00:00+00:00", "value": 3.0, "unit": "kW", "measurement_type": "active_power"},
            ]
        },
        headers=_auth("meas_writer@meas.test"),
    )
    assert r.status_code == 201
    data = r.json()
    assert len(data) == 3
    assert all(m["device_id"] == test_device_id for m in data)


def test_bulk_create_empty(client, test_device_id):
    r = client.post(
        f"/devices/{test_device_id}/measurements/bulk",
        json={"measurements": []},
        headers=_auth("meas_writer@meas.test"),
    )
    assert r.status_code == 201
    assert r.json() == []


def test_bulk_create_device_not_found(client):
    r = client.post(
        "/devices/99999/measurements/bulk",
        json={"measurements": [
            {"timestamp": _TS1, "value": 1.0, "unit": "kW", "measurement_type": "active_power"}
        ]},
        headers=_auth("meas_writer@meas.test"),
    )
    assert r.status_code == 404


# --- Delete ---

def test_delete_measurement(client, test_device_id):
    create_r = client.post(
        f"/devices/{test_device_id}/measurements",
        json={"timestamp": "2026-04-01T00:00:00+00:00", "value": 5.0, "unit": "kW", "measurement_type": "active_power"},
        headers=_auth("meas_writer@meas.test"),
    )
    mid = create_r.json()["id"]
    r = client.delete(f"/measurements/{mid}", headers=_auth("meas_writer@meas.test"))
    assert r.status_code == 204
    r2 = client.get(f"/measurements/{mid}", headers=_auth("meas_reader@meas.test"))
    assert r2.status_code == 404


def test_delete_measurement_not_found(client):
    r = client.delete("/measurements/99999", headers=_auth("meas_writer@meas.test"))
    assert r.status_code == 404


def test_delete_measurement_no_permission(client, test_device_id):
    create_r = client.post(
        f"/devices/{test_device_id}/measurements",
        json={"timestamp": "2026-05-01T00:00:00+00:00", "value": 9.0, "unit": "kW", "measurement_type": "active_power"},
        headers=_auth("meas_writer@meas.test"),
    )
    mid = create_r.json()["id"]
    r = client.delete(f"/measurements/{mid}", headers=_auth("meas_reader@meas.test"))
    assert r.status_code == 403
