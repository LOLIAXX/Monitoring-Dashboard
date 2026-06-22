"""Tests for Alembic migration correctness."""
import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

BACKEND_DIR = Path(__file__).resolve().parent.parent
EXPECTED_TABLES = {
    "users", "roles", "permissions", "role_permissions", "user_roles",
    "companies", "sites", "devices",
    "user_company_access", "user_site_access", "user_device_access",
    "energy_measurements",
}


@pytest.fixture
def alembic_cfg(tmp_path):
    db_url = f"sqlite:///{tmp_path / 'migration_test.db'}"
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("sqlalchemy.url", db_url)
    return cfg, db_url


def test_upgrade_creates_all_tables(alembic_cfg):
    cfg, db_url = alembic_cfg
    command.upgrade(cfg, "head")
    engine = create_engine(db_url)
    tables = set(inspect(engine).get_table_names())
    engine.dispose()
    assert EXPECTED_TABLES.issubset(tables)
    assert "alembic_version" in tables


def test_upgrade_is_idempotent(alembic_cfg):
    cfg, db_url = alembic_cfg
    command.upgrade(cfg, "head")
    command.upgrade(cfg, "head")  # second run should be a no-op
    engine = create_engine(db_url)
    tables = set(inspect(engine).get_table_names())
    engine.dispose()
    assert EXPECTED_TABLES.issubset(tables)


def test_downgrade_removes_tables(alembic_cfg):
    cfg, db_url = alembic_cfg
    command.upgrade(cfg, "head")
    command.downgrade(cfg, "base")
    engine = create_engine(db_url)
    tables = set(inspect(engine).get_table_names())
    engine.dispose()
    # After downgrade to base, all app tables should be gone
    assert EXPECTED_TABLES.isdisjoint(tables)


def test_upgrade_after_downgrade(alembic_cfg):
    cfg, db_url = alembic_cfg
    command.upgrade(cfg, "head")
    command.downgrade(cfg, "base")
    command.upgrade(cfg, "head")
    engine = create_engine(db_url)
    tables = set(inspect(engine).get_table_names())
    engine.dispose()
    assert EXPECTED_TABLES.issubset(tables)


@pytest.mark.skipif(
    not os.getenv("MONITORING_DATABASE_URL"),
    reason="MONITORING_DATABASE_URL not set — monitoring DB not available in this environment",
)
def test_monitoring_db_has_no_alembic_version():
    """Alembic must never have been run against the monitoring DB."""
    url = os.getenv("MONITORING_DATABASE_URL")
    engine = create_engine(url)
    try:
        tables = set(inspect(engine).get_table_names())
        assert "alembic_version" not in tables, (
            "alembic_version found in monitoring DB — Alembic was incorrectly run against it"
        )
    finally:
        engine.dispose()
