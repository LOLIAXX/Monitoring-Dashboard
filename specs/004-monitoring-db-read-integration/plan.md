# Plan 004 — Monitoring DB Read Integration

## Architecture Context

The dual-mode pattern is already implemented:
- `app/db/monitoring_database.py` — builds a separate SQLAlchemy engine from `MONITORING_DATABASE_URL`; returns `None` session if URL not set
- `app/services/monitoring.py` — `_has_real_monitoring_schema(db)` checks for PostgreSQL + `{sites, circuits, opc_tags, readings}` tables; falls back to app DB `Device/EnergyMeasurement` models
- `app/api/routes/monitoring.py` — all endpoints already registered, require `energy:read` permission

This plan verifies correctness, adds missing pieces, and hardens error paths.

---

## Implementation Steps

### Step 1 — Audit `monitoring_database.py`

**File**: `backend/app/db/monitoring_database.py`

Verify:
- Engine is created lazily only if `MONITORING_DATABASE_URL` is set
- `monitoring_db_session()` yields `None` when engine is absent
- No `create_all()`, no `metadata.bind`, no DDL anywhere in this file
- Connection errors during factory build are caught or deferred

Fix if needed:
- Wrap `_build_monitoring_session_factory()` in try/except; log warning and return `None` on invalid connection params

### Step 2 — Audit `services/monitoring.py`

**File**: `backend/app/services/monitoring.py`

Verify:
- `_has_real_monitoring_schema(db)` handles `db is None` → returns `False`
- `_monitoring_query_db(db)` yields `monitoring_db or db` safely
- All service functions handle empty result sets without raising
- All raw SQL queries are SELECT-only (no INSERT/UPDATE/DELETE/DDL)
- `get_report_summary()` handles `readings_1day` view missing gracefully

Fix if needed — harden schema detection:
```python
def _has_real_monitoring_schema(db: Session) -> bool:
    if db is None:
        return False
    try:
        if db.bind is None or db.bind.dialect.name != "postgresql":
            return False
        table_names = set(inspect(db.bind).get_table_names(schema="public"))
        return {"sites", "circuits", "opc_tags", "readings"}.issubset(table_names)
    except Exception:
        return False
```

### Step 3 — Add `/monitoring/health` Endpoint

**File**: `backend/app/api/routes/monitoring.py`

Add at the end of the router:

```python
@router.get("/health")
def monitoring_health(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
) -> dict:
    from app.db.monitoring_database import monitoring_db_session
    from app.services.monitoring import _has_real_monitoring_schema
    connected = False
    schema_detected = False
    try:
        with monitoring_db_session() as mdb:
            if mdb is not None:
                connected = True
                schema_detected = _has_real_monitoring_schema(mdb)
    except Exception:
        connected = False
    return {
        "connected": connected,
        "schema_detected": schema_detected,
        "fallback_active": not schema_detected,
    }
```

### Step 4 — Confirm Alembic Safety

**File**: `backend/migrations/env.py`

Confirm line resolves to `DATABASE_URL` only:
```python
_url = config.get_main_option("sqlalchemy.url") or settings.DATABASE_URL
```
This line must **never** reference `settings.MONITORING_DATABASE_URL`.

**File**: `backend/alembic.ini`

Confirm `sqlalchemy.url` placeholder does not reference `MONITORING_DATABASE_URL`.

### Step 5 — Test Verification

**File**: `backend/tests/test_monitoring_api.py` (existing)
**File**: `backend/tests/test_migrations.py` (existing)

Add or confirm:
```python
def test_monitoring_db_has_no_alembic_version(monitoring_session_or_skip):
    """Monitoring DB must never have alembic_version table."""
    tables = inspect(monitoring_session_or_skip.bind).get_table_names()
    assert "alembic_version" not in tables
```

---

## Files to Inspect and Possibly Change

| File | Action |
|------|--------|
| `backend/app/db/monitoring_database.py` | Audit; add try/except around engine build if missing |
| `backend/app/services/monitoring.py` | Harden `_has_real_monitoring_schema`; add None guards |
| `backend/app/api/routes/monitoring.py` | Add `/health` endpoint |
| `backend/migrations/env.py` | Confirm no `MONITORING_DATABASE_URL` reference |
| `backend/alembic.ini` | Confirm URL resolves to app DB only |
| `backend/tests/test_monitoring_api.py` | Verify/add endpoint coverage |
| `backend/tests/test_migrations.py` | Add no-alembic-version assertion |

## Files NOT to Change

| File | Reason |
|------|--------|
| Monitoring DB schema | Read-only; no DDL allowed |
| `backend/app/models/*.py` | No new ORM models for monitoring DB |
| Any frontend file | Scope of spec 005 |

---

## Validation Commands

```powershell
# Start backend and confirm no crash
cd D:\Solico\WebApp\AI-Coding-Lab\real-project\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Confirm health endpoint (get token first via /auth/login)
# curl http://127.0.0.1:8000/monitoring/health -H "Authorization: Bearer <token>"

# Confirm monitoring DB has no alembic_version (if DB is accessible)
# psql -d Kalleh_Amol_DB -c "SELECT tablename FROM pg_tables WHERE tablename='alembic_version';"

# Run all tests
pytest -v

# Run specific test files
pytest tests/test_monitoring_api.py -v
pytest tests/test_migrations.py -v
```

---

## Risk Notes

- `inspect(db.bind)` can raise if the DB connection drops mid-session — always wrap in try/except.
- `readings_1day_view` may not exist if TimescaleDB continuous aggregates are not configured; `get_report_summary()` must handle this gracefully with a try/except around that query.
- The monitoring DB engine must never be passed to `Base.metadata.create_all()` or any DDL method.
