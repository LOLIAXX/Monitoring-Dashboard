"""Read-only monitoring API skeleton tests."""
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.company import Company, Device, Site
from app.models.measurement import EnergyMeasurement
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
def seed_monitoring_api_data():
    db = _Session()

    permission = db.query(Permission).filter_by(name="energy:read").first()
    if permission is None:
        permission = Permission(name="energy:read", description="View energy data")
        db.add(permission)
        db.flush()

    role = db.query(Role).filter_by(name="monitoring_reader").first()
    if role is None:
        role = Role(name="monitoring_reader", is_system=False)
        db.add(role)
        db.flush()

    if db.query(RolePermission).filter_by(role_id=role.id, permission_id=permission.id).first() is None:
        db.add(RolePermission(role_id=role.id, permission_id=permission.id))
        db.flush()

    for email, assigned_role in [
        ("monitoring_reader@monitoring.test", role),
        ("monitoring_none@monitoring.test", None),
    ]:
        user = db.query(User).filter_by(email=email).first()
        if user is None:
            user = User(
                email=email,
                hashed_password=get_password_hash("pw"),
                is_active=True,
                is_superuser=False,
            )
            db.add(user)
            db.flush()
        if assigned_role is not None:
            exists = db.query(UserRole).filter_by(user_id=user.id, role_id=assigned_role.id).first()
            if exists is None:
                db.add(UserRole(user_id=user.id, role_id=assigned_role.id))
                db.flush()

    company = _get_or_create(db, Company, name="monitoring_api_co", is_active=True)
    site = _get_or_create(
        db,
        Site,
        company_id=company.id,
        name="monitoring_api_site",
        is_active=True,
    )
    measured_device = _get_or_create(
        db,
        Device,
        site_id=site.id,
        name="monitoring_api_measured_target",
        is_active=True,
    )
    empty_device = _get_or_create(
        db,
        Device,
        site_id=site.id,
        name="monitoring_api_empty_target",
        is_active=True,
    )

    if db.query(EnergyMeasurement).filter_by(device_id=measured_device.id, measurement_type="active_power").first() is None:
        db.add_all(
            [
                EnergyMeasurement(
                    device_id=measured_device.id,
                    timestamp=datetime(2026, 1, 15, 8, 0, tzinfo=timezone.utc),
                    value=12.5,
                    unit="kW",
                    measurement_type="active_power",
                    quality="good",
                    source="monitoring_api_test",
                ),
                EnergyMeasurement(
                    device_id=measured_device.id,
                    timestamp=datetime(2026, 1, 15, 9, 0, tzinfo=timezone.utc),
                    value=14.0,
                    unit="kW",
                    measurement_type="active_power",
                    quality="good",
                    source="monitoring_api_test",
                ),
                EnergyMeasurement(
                    device_id=measured_device.id,
                    timestamp=datetime(2026, 1, 15, 10, 0, tzinfo=timezone.utc),
                    value=30.0,
                    unit="kWh",
                    measurement_type="energy",
                    quality="good",
                    source="monitoring_api_test",
                ),
            ]
        )

    db.commit()
    db.close()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def monitoring_target_ids():
    db = _Session()
    measured = db.query(Device).filter_by(name="monitoring_api_measured_target").first()
    empty = db.query(Device).filter_by(name="monitoring_api_empty_target").first()
    ids = {"measured": measured.id, "empty": empty.id}
    db.close()
    return ids


def _auth(email: str = "monitoring_reader@monitoring.test") -> dict:
    return {"Authorization": f"Bearer {create_access_token(subject=email)}"}


def test_monitoring_sites_requires_auth(client):
    r = client.get("/monitoring/sites")
    assert r.status_code == 401


def test_monitoring_sites_requires_energy_read(client):
    r = client.get("/monitoring/sites", headers=_auth("monitoring_none@monitoring.test"))
    assert r.status_code == 403


@pytest.mark.parametrize(
    "path",
    [
        "/monitoring/sites",
        "/monitoring/targets",
        "/monitoring/latest",
        "/monitoring/trends",
        "/monitoring/overview",
        "/monitoring/reports/summary",
        "/monitoring/kpis",
    ],
)
def test_monitoring_endpoints_return_expected_shape(client, path):
    r = client.get(path, headers=_auth())
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)

    if path in {"/monitoring/sites", "/monitoring/targets", "/monitoring/latest", "/monitoring/kpis"}:
        assert "items" in data
        assert isinstance(data["items"], list)
    elif path == "/monitoring/trends":
        assert data["resolution"] == "raw"
        assert isinstance(data["points"], list)
    elif path == "/monitoring/overview":
        assert "data_available" in data
        assert set(data["summary"]) == {"total_energy_kwh", "peak_demand_kw", "power_factor", "active_alerts"}
    else:
        assert "data_available" in data
        assert "summary" in data


def test_monitoring_latest_supports_optional_target_id(client, monitoring_target_ids):
    r = client.get(
        "/monitoring/latest",
        params={"target_id": monitoring_target_ids["measured"]},
        headers=_auth(),
    )
    assert r.status_code == 200
    data = r.json()
    assert data["data_available"] is True
    assert len(data["items"]) == 1
    assert data["items"][0]["target_id"] == monitoring_target_ids["measured"]
    assert data["items"][0]["parameter"] in {"active_power", "energy"}


def test_monitoring_latest_empty_target_does_not_crash(client, monitoring_target_ids):
    r = client.get(
        "/monitoring/latest",
        params={"target_id": monitoring_target_ids["empty"]},
        headers=_auth(),
    )
    assert r.status_code == 200
    assert r.json() == {"data_available": False, "items": []}


def test_monitoring_trends_supports_query_params(client, monitoring_target_ids):
    r = client.get(
        "/monitoring/trends",
        params={
            "target_id": monitoring_target_ids["measured"],
            "parameter": "active_power",
            "from": "2026-01-15T08:00:00+00:00",
            "to": "2026-01-15T10:00:00+00:00",
            "resolution": "raw",
            "limit": 2,
        },
        headers=_auth(),
    )
    assert r.status_code == 200
    data = r.json()
    assert data["target_id"] == monitoring_target_ids["measured"]
    assert data["parameter"] == "active_power"
    assert data["resolution"] == "raw"
    assert len(data["points"]) <= 2
    assert all(p["parameter"] == "active_power" for p in data["points"])


def test_monitoring_health_requires_auth(client):
    r = client.get("/monitoring/health")
    assert r.status_code == 401


def test_monitoring_health_requires_energy_read(client):
    r = client.get("/monitoring/health", headers=_auth("monitoring_none@monitoring.test"))
    assert r.status_code == 403


def test_monitoring_health_returns_status(client):
    r = client.get("/monitoring/health", headers=_auth())
    assert r.status_code == 200
    data = r.json()
    assert "connected" in data
    assert "schema_detected" in data
    assert "fallback_active" in data
    assert isinstance(data["connected"], bool)
    assert isinstance(data["schema_detected"], bool)
    assert isinstance(data["fallback_active"], bool)
    assert data["fallback_active"] == (not data["schema_detected"])
