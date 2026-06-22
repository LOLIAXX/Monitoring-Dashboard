import logging
from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

_log = logging.getLogger(__name__)


def _build_monitoring_session_factory() -> sessionmaker[Session] | None:
    if not settings.MONITORING_DATABASE_URL:
        return None
    try:
        connect_args = {}
        if settings.MONITORING_DATABASE_URL.startswith("sqlite"):
            connect_args = {"check_same_thread": False}
        engine = create_engine(settings.MONITORING_DATABASE_URL, connect_args=connect_args)
        return sessionmaker(autocommit=False, autoflush=False, bind=engine)
    except Exception:
        _log.warning(
            "Could not build monitoring session factory — monitoring DB will be unavailable",
            exc_info=True,
        )
        return None


MonitoringSessionLocal = _build_monitoring_session_factory()


@contextmanager
def monitoring_db_session() -> Iterator[Session | None]:
    if MonitoringSessionLocal is None:
        yield None
        return

    db = MonitoringSessionLocal()
    try:
        yield db
    finally:
        db.close()
