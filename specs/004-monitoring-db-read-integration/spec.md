# Spec 004 — Monitoring DB Read Integration

## Summary

Safely connect the backend monitoring endpoints to `MONITORING_DATABASE_URL` (`Kalleh_Amol_DB`) for read-only telemetry access. The dual-mode architecture already exists in code; this spec verifies, hardens, and validates it end-to-end.

---

## Goal

- Backend monitoring endpoints return real telemetry when `MONITORING_DATABASE_URL` is configured.
- When the monitoring DB is unavailable or not configured, endpoints return clean empty/fallback responses — no crashes.
- App DB and monitoring DB sessions remain fully isolated.
- A health check endpoint exposes monitoring DB availability status.

---

## User Stories

| As... | I want... | So that... |
|-------|-----------|------------|
| Authenticated user with `energy:read` | `GET /monitoring/overview` to return data | I can see live energy summary |
| Authenticated user | `GET /monitoring/sites` to return monitoring sites | I see available data sources |
| Authenticated user | `GET /monitoring/targets` and `/monitoring/latest` to work | I can drill into specific circuits |
| The system | App DB and monitoring DB sessions to never share connections | A monitoring DB failure does not affect login or RBAC |
| Developer/ops | `GET /monitoring/health` to return connection status | I can diagnose integration issues without reading logs |
| Developer | Backend to start cleanly when `MONITORING_DATABASE_URL` is not set | Local dev without `Kalleh_Amol_DB` is unblocked |

---

## In Scope

- Auditing and hardening `backend/app/db/monitoring_database.py`
- Auditing `backend/app/services/monitoring.py` dual-mode logic
- All monitoring endpoints: `/monitoring/sites`, `/monitoring/targets`, `/monitoring/latest`, `/monitoring/trends`, `/monitoring/overview`, `/monitoring/reports/summary`, `/monitoring/kpis`
- Adding `GET /monitoring/health` endpoint
- Auth enforcement (`energy:read` permission) on all monitoring endpoints
- Clean error handling when monitoring DB is down or schema is unexpected

## Out of Scope

- Any write operations on monitoring DB
- Alembic migrations against monitoring DB (strictly forbidden)
- Modifying monitoring DB schema (`sites`, `circuits`, `opc_tags`, `readings`)
- Frontend changes (spec 005)
- Factory-to-monitoring-site mapping logic (spec 005)

---

## Acceptance Criteria

- [ ] Backend starts with `MONITORING_DATABASE_URL` unset — no error, no crash
- [ ] Backend starts with `MONITORING_DATABASE_URL` set — connects successfully
- [ ] `/auth/login` and `/auth/me` work regardless of monitoring DB state
- [ ] `/monitoring/overview` returns `{ data_available: false, summary: {...} }` when no real data
- [ ] `/monitoring/overview` returns real aggregate data when `Kalleh_Amol_DB` is live
- [ ] `/monitoring/health` returns `{ connected: true/false, schema_detected: true/false }`
- [ ] Monitoring DB has **no** `alembic_version` table
- [ ] Monitoring DB schema is untouched — no CREATE, ALTER, or DROP ever executed
- [ ] All monitoring endpoints return 401 without a valid JWT
- [ ] All monitoring endpoints return 403 without `energy:read` permission
- [ ] `pytest` passes

---

## Safety Rules (Non-Negotiable)

- `MONITORING_DATABASE_URL` is **read-only**. No INSERT, UPDATE, DELETE, or DDL allowed.
- Alembic `env.py` uses only `DATABASE_URL`. Never change this.
- The monitoring DB engine must never be passed to `Base.metadata.create_all()`.
- If monitoring DB schema check fails, fall back silently — never raise a 500 to the client.
