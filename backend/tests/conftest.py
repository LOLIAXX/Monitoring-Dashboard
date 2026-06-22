"""Shared test database and dependency override for all test modules."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import get_db
from app.main import app
from app.models import Base

_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_Session = sessionmaker(bind=_engine)
Base.metadata.create_all(_engine)


def _override_get_db():
    db = _Session()
    try:
        yield db
    finally:
        db.close()


# Set once at import time — all test modules share this override and DB
app.dependency_overrides[get_db] = _override_get_db
