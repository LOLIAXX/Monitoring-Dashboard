"""Auth service tests using an in-memory SQLite database."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.models.user import User
from app.core.security import get_password_hash
from app.services.auth_service import (
    authenticate_user,
    create_user_password_hash,
    get_user_by_email,
)


@pytest.fixture(scope="module")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # seed one user
    session.add(
        User(
            email="alice@example.com",
            hashed_password=get_password_hash("secret123"),
            full_name="Alice",
            is_active=True,
            is_superuser=False,
        )
    )
    session.commit()
    yield session
    session.close()
    engine.dispose()


def test_get_user_by_email_found(db_session):
    user = get_user_by_email(db_session, "alice@example.com")
    assert user is not None
    assert user.email == "alice@example.com"


def test_get_user_by_email_not_found(db_session):
    user = get_user_by_email(db_session, "nobody@example.com")
    assert user is None


def test_authenticate_user_correct_password(db_session):
    user = authenticate_user(db_session, "alice@example.com", "secret123")
    assert user is not None
    assert user.email == "alice@example.com"


def test_authenticate_user_wrong_password(db_session):
    user = authenticate_user(db_session, "alice@example.com", "wrongpass")
    assert user is None


def test_authenticate_user_missing_user(db_session):
    user = authenticate_user(db_session, "ghost@example.com", "any")
    assert user is None


def test_create_user_password_hash():
    hashed = create_user_password_hash("mypass")
    assert hashed != "mypass"
    assert len(hashed) > 20
