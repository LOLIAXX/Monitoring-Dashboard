# Tasks 004 — Monitoring DB Read Integration

## Pre-flight Checks

- [ ] Read `backend/app/db/monitoring_database.py` — confirm engine build logic
- [ ] Read `backend/app/services/monitoring.py` — confirm dual-mode logic and all SQL is SELECT-only
- [ ] Read `backend/app/api/routes/monitoring.py` — confirm all endpoints present
- [ ] Read `backend/migrations/env.py` — confirm uses `DATABASE_URL` only
- [ ] Read `backend/alembic.ini` — confirm `sqlalchemy.url` is app DB only
- [ ] Confirm `MONITORING_DATABASE_URL` is NOT referenced in `env.py`
- [ ] Confirm monitoring DB has no `alembic_version` table (manual check or via test)

## Backend Changes

- [ ] **`monitoring_database.py`**: Wrap `_build_monitoring_session_factory()` in try/except; return `None` on error, log a warning
- [ ] **`services/monitoring.py`**: Add `if db is None: return False` guard at top of `_has_real_monitoring_schema()`
- [ ] **`services/monitoring.py`**: Wrap `inspect(db.bind).get_table_names()` in try/except → return `False` on any exception
- [ ] **`services/monitoring.py`**: Verify `get_report_summary()` handles missing `readings_1day` view gracefully
- [ ] **`routes/monitoring.py`**: Add `GET /monitoring/health` endpoint returning `{ connected, schema_detected, fallback_active }`
- [ ] **`routes/monitoring.py`**: Health endpoint must require `energy:read` permission

## Safety Verification

- [ ] Confirm zero `CREATE`, `ALTER`, `DROP`, `INSERT`, `UPDATE`, `DELETE` statements in `services/monitoring.py`
- [ ] Confirm `Base.metadata.create_all()` does NOT use the monitoring DB engine anywhere
- [ ] Confirm `alembic upgrade head` only touches `DATABASE_URL` (not monitoring DB)
- [ ] Manually verify: monitoring DB (`Kalleh_Amol_DB`) has no `alembic_version` table

## Test Verification

- [ ] Run `pytest -v` — all existing tests pass
- [ ] `tests/test_monitoring_api.py`: covers at minimum `/monitoring/sites`, `/monitoring/overview`, and `/monitoring/health`
- [ ] `tests/test_migrations.py`: assert `alembic_version` not in monitoring DB tables
- [ ] Test: backend starts without `MONITORING_DATABASE_URL` set → no crash, no 500
- [ ] Test: monitoring endpoints return 401 without JWT
- [ ] Test: monitoring endpoints return 403 without `energy:read` permission

## Validation Commands

```powershell
cd D:\Solico\WebApp\AI-Coding-Lab\real-project\backend
.\.venv\Scripts\Activate.ps1

# Start backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# In another terminal — run tests
pytest -v
pytest tests/test_monitoring_api.py -v
pytest tests/test_migrations.py -v
```

## Done When

- [ ] All tasks above checked
- [ ] `pytest -v` passes with no failures
- [ ] Backend starts cleanly with and without `MONITORING_DATABASE_URL`
- [ ] `GET /monitoring/health` returns correct status JSON
- [ ] Monitoring DB schema confirmed untouched
- [ ] No `alembic_version` in monitoring DB
