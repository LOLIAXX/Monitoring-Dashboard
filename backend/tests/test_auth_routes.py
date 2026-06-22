"""API tests for /auth/login and /auth/me."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.user import User

# Import the shared session from conftest by importing its internals
from tests.conftest import _Session


@pytest.fixture(scope="module", autouse=True)
def seed_users():
    db = _Session()
    db.add(User(email="bob@example.com", hashed_password=get_password_hash("pass123"),
                full_name="Bob", is_active=True, is_superuser=False))
    db.add(User(email="inactive@example.com", hashed_password=get_password_hash("pass123"),
                full_name="Inactive", is_active=False, is_superuser=False))
    db.commit()
    db.close()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_login_valid(client):
    r = client.post("/auth/login", data={"username": "bob@example.com", "password": "pass123"})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password(client):
    r = client.post("/auth/login", data={"username": "bob@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_login_missing_user(client):
    r = client.post("/auth/login", data={"username": "nobody@example.com", "password": "x"})
    assert r.status_code == 401


def _get_token(client) -> str:
    r = client.post("/auth/login", data={"username": "bob@example.com", "password": "pass123"})
    return r.json()["access_token"]


def test_me_valid_token(client):
    token = _get_token(client)
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == "bob@example.com"
    assert "hashed_password" not in body


def test_me_no_token(client):
    r = client.get("/auth/me")
    assert r.status_code == 401


def test_me_invalid_token(client):
    r = client.get("/auth/me", headers={"Authorization": "Bearer not.a.token"})
    assert r.status_code == 401


def test_me_inactive_user(client):
    token = create_access_token(subject="inactive@example.com")
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401
