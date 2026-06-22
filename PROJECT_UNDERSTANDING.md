# PROJECT_UNDERSTANDING.md
_AI-readable reference. Last updated: 2026-06-16. No secrets or credentials stored here._

---

## 1. Project Purpose

**Sonergy** — Industrial energy monitoring web application.
Covers factory/site monitoring, trends, KPI reports, alerts, admin/RBAC management,
and future integration of real OPC-tag telemetry from `Kalleh_Amol_DB`.

---

## 2. Frontend Structure

**Root**: `D:\Solico\WebApp\AI-Coding-Lab\real-project\frontend`
**Framework**: Next.js 15, React 19, TypeScript, Tailwind CSS 3

### App Router Layout

```
app/
├── page.tsx                        # Root redirect: /monitoring if token, else /login
├── layout.tsx                      # Root layout (global CSS, fonts)
├── globals.css                     # Global CSS + utility classes
├── login/page.tsx                  # Two-panel login UI, posts to /auth/login
│
├── (monitoring)/                   # Route group — monitoring shell
│   ├── layout.tsx                  # MonitoringLayout: SiteFactorySelector + MonitoringFeatureSidebar + header
│   └── monitoring/
│       ├── page.tsx                # Factory Overview (default post-login) — fallback/sample UI, not live overview data yet
│       ├── factory/page.tsx        # Factory/Plant View — stub "Coming in Batch 3"
│       ├── trends/page.tsx         # Monitoring & Trends
│       ├── reports/page.tsx        # Analysis and Reports
│       ├── reports/builder/page.tsx
│       ├── reports/kpis/page.tsx
│       ├── comparison/page.tsx
│       └── kpi/page.tsx
│
├── (dashboard)/                    # Route group — admin console
│   ├── layout.tsx                  # DashboardLayout: checks admin.access; shows Access Denied if not authorized
│   ├── dashboard/page.tsx          # Admin overview
│   ├── users/page.tsx              # User CRUD
│   ├── roles/page.tsx              # Role CRUD
│   ├── permissions/page.tsx        # Permission CRUD
│   ├── factories/page.tsx          # Factory CRUD + user assignment
│   ├── companies/page.tsx
│   ├── sites/page.tsx              # App-DB sites (NOT monitoring sites)
│   └── devices/page.tsx
│
└── (stitch)/                       # Legacy design-reference route group (separate shell)
    └── stitch/...                  # alerts, analytics, devices, reports, sites, substation, users
```

### Login Flow

1. User visits `/` → `page.tsx` calls `/auth/me`; redirects to `/monitoring` (success) or `/login` (fail)
2. `login/page.tsx` POSTs `application/x-www-form-urlencoded` to `/auth/login`
3. On success: `setToken()` stores JWT in `localStorage` AND sets cookie `em_token` (for middleware)
4. After login: always redirects to `/monitoring`
5. Middleware (`middleware.ts`) checks `em_token` cookie on all non-static routes
6. **Known Issue**: middleware line 8 redirects logged-in users visiting `/login` to `/dashboard` — should be `/monitoring`

### Monitoring Layout (`(monitoring)/layout.tsx`)

Three-column shell:
1. **`SiteFactorySelector`** (left, collapsible) — fetches from `/sites/` (app DB); has "All Sites" option; user initial shown at footer
2. **`MonitoringFeatureSidebar`** (center, collapsible) — shown only after a site is selected; has scrollable nav + pinned user panel
3. **Main content area** — header + page content; shows "Select a Site" prompt until site is selected

`selectedKey` persisted in `localStorage` (`em_monitoring_site`, `em_monitoring_site_name`).

### Monitoring Feature Sidebar (`components/monitoring/MonitoringFeatureSidebar.tsx`)

- Nav groups from `monitoringNav.ts`: Factory Overview, Trends & Reports, Analysis, Data Analysis (AI — disabled)
- **User panel is pinned** (`flexShrink: 0`, sidebar has `height: 100vh`, `position: sticky`)
- **Admin Console button** appears only when `hasAdminAccess = permissions.includes('admin.access') || is_superuser`
- Admin Console opens `/dashboard` in a **new tab** (`target="_blank"`)
- Small UI polish completed on 2026-06-16: clearer active item treatment and cleaner pinned user panel. Behavior preserved: first sidebar item remains Factory Overview / factory icon, nav scrolls independently, user panel stays visible, and admin access gating/new-tab behavior is unchanged.

### Admin Dashboard Layout (`(dashboard)/layout.tsx`)

- Checks `is_superuser || permissions.includes('admin.access')`
- Shows "Access Denied" page (with link back to `/monitoring`) if not authorized
- Nav: Overview, Users, Roles, Permissions, Factories + back-link to Monitoring Portal

### Key Frontend Files

| File | Purpose |
|------|---------|
| `lib/api.ts` | `apiFetch<T>()` + `apiLogin()` — base URL from `NEXT_PUBLIC_API_BASE_URL` (default: `http://127.0.0.1:8000`) |
| `lib/auth.ts` | `setToken / getToken / removeToken` — localStorage + cookie `em_token` |
| `lib/monitoringApi.ts` | Typed wrappers for `/monitoring/sites`, `/monitoring/targets`, `/monitoring/latest`, `/monitoring/trends` |
| `middleware.ts` | Route protection; checks `em_token` cookie |
| `components/monitoring/SiteFactorySelector.tsx` | Left site-picker panel |
| `components/monitoring/MonitoringFeatureSidebar.tsx` | Feature nav sidebar + admin button + user panel |
| `components/monitoring/monitoringNav.ts` | `NAV_GROUPS` constant |
| `components/monitoring/monitoringColors.ts` | Design tokens (`C`) |
| `components/ListPage.tsx` | Shared admin CRUD list component |
| `components/Modal.tsx` | Shared modal wrapper |

---

## 3. Backend Structure

**Root**: `D:\Solico\WebApp\AI-Coding-Lab\real-project\backend`
**Framework**: FastAPI, SQLAlchemy 2.x, Python 3.12, Alembic

### Entrypoint

`app/main.py` — Registers all routers; CORS allows `http://localhost:3000` and `http://127.0.0.1:3000`

### API Routes (`app/api/routes/`)

| File | Prefix | Notes |
|------|--------|-------|
| `auth.py` | `/auth` | POST `/login`, GET `/me` (returns roles, permissions, factories) |
| `admin.py` | `/admin` | Minimal test endpoint (`admin:users` permission) |
| `users.py` | `/users` | Full CRUD |
| `roles.py` | `/roles` | Full CRUD |
| `permissions.py` | `/permissions` | Full CRUD |
| `factories.py` | `/factories` | CRUD + user access management; writes require `factories.assign_users` |
| `companies.py` | `/companies` | CRUD |
| `sites.py` | `/sites` | App-DB sites (consumed by SiteFactorySelector) |
| `devices.py` | `/devices` | CRUD |
| `measurements.py` | `/measurements` | CRUD |
| `monitoring.py` | `/monitoring` | sites, targets, latest, trends, overview, reports/summary, kpis — requires `energy:read` |

### Database Layer (`app/db/`)

| File | Purpose |
|------|---------|
| `database.py` | App DB engine + `SessionLocal` + `get_db` dependency |
| `monitoring_database.py` | Optional monitoring DB engine; `monitoring_db_session()` returns `None` if `MONITORING_DATABASE_URL` not set |
| `seed.py` | Seed helpers; called by `scripts/seed_dev.py` |

### Models (`app/models/`)

| File | Models |
|------|--------|
| `user.py` | `User` |
| `role.py` | `Role`, `UserRole`, `RolePermission` |
| `permission.py` | `Permission` |
| `factory.py` | `Factory`, `UserFactoryAccess` |
| `company.py` | `Company`, `Site` (app-level telemetry grouping), `Device` |
| `measurement.py` | `EnergyMeasurement` |
| `base.py` | `Base`, `TimestampMixin` |

### Services (`app/services/`)

`monitoring.py` — **dual-mode**: auto-detects real monitoring schema (PostgreSQL with `sites`, `circuits`, `opc_tags`, `readings`); falls back to app DB `Device/EnergyMeasurement` models if real schema absent.

### Auth / RBAC (`app/api/deps.py`)

- `get_current_user()` — JWT decode → User lookup
- `get_user_permissions(user)` → `set[str]` via `user.user_roles → role.role_permissions → permission.name`
- `require_permission(name)` — Superusers bypass; others need the named permission

### Migrations (`migrations/`)

Alembic; `env.py` uses `settings.DATABASE_URL` exclusively.
**Never pointed at `MONITORING_DATABASE_URL`.**

### Seed Script

`scripts/seed_dev.py` → calls `app/db/seed.py:run_seed()`

Default dev credentials (override with env vars): `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
Factory seeded: `Amol Dairy Kalleh Factory` (code: `AMOL_DAIRY_KALLEH`)
Demo users created per role (password configurable via env).

---

## 4. Database Separation Rules

| Variable | DB | Purpose |
|----------|----|---------|
| `DATABASE_URL` | `energy_app_db` (PostgreSQL) or SQLite for dev | App/auth/RBAC + business entities |
| `MONITORING_DATABASE_URL` | `Kalleh_Amol_DB` (PostgreSQL/TimescaleDB) | Industrial telemetry — **read-only** |

**Hard rules:**
- Alembic migrations → `DATABASE_URL` only. **Never** run against `MONITORING_DATABASE_URL`.
- Never modify or drop monitoring DB tables unless explicitly requested.
- App DB `factories` = business-level access control (legal/operational metadata, user assignments).
- Monitoring DB `sites` = industrial telemetry structure (OPC, circuits, readings).
- Do NOT merge these two. Future mapping must be explicit and safe.
- `SiteFactorySelector` currently uses app DB `sites` (via `/sites/` endpoint), not `/factories/`.

### Monitoring DB Schema (read-only reference)

Tables: `sites`, `circuits`, `opc_tags`, `readings`
Continuous aggregates: `readings_1min_view`, `readings_1hour_view`, `readings_1day`, `readings_1day_view`
Detection: `services/monitoring.py:_has_real_monitoring_schema()` checks for PostgreSQL + all four core tables.

---

## 5. Current Completed Work

### ✅ 001 — Factory-First Navigation
- After login: `login/page.tsx` redirects to `/monitoring`
- Root `page.tsx` also redirects to `/monitoring` (not `/dashboard`)
- Admin Dashboard is a secondary access path, not the landing page
- **Files**: `frontend/app/login/page.tsx:27`, `frontend/app/page.tsx:15`

### ✅ 002 — RBAC + Factories Backend
- `GET /factories/` returns only user-accessible factories (superusers get all)
- `UserFactoryAccess` model + `factory_service.get_factories_for_user()`
- `/auth/me` includes `factories: list[FactoryRead]` in response
- Admin CRUD on factories requires `factories.assign_users` permission
- **Files**: `backend/app/api/routes/factories.py`, `backend/app/services/factory_service.py`, `backend/app/models/factory.py`

### ✅ 003 — Admin Dashboard RBAC Management
- `DashboardLayout` enforces `admin.access` or `is_superuser`; shows Access Denied otherwise
- Admin Console button in `MonitoringFeatureSidebar` gated on `hasAdminAccess`
- Admin Console opens `/dashboard` in new tab
- Sidebar user panel always pinned (`flexShrink: 0`)
- **Files**: `frontend/app/(dashboard)/layout.tsx`, `frontend/components/monitoring/MonitoringFeatureSidebar.tsx`

### ⚠ Known Bug (no spec yet)
- Middleware line 8: logged-in users visiting `/login` are redirected to `/dashboard` instead of `/monitoring`
- **File**: `frontend/middleware.ts:8`

### ℹ Factory Overview Page Status
- `/monitoring` page is built with rich UI and has completed a small UI polish pass (`e3bcb87`, 2026-06-16).
- The page still uses fallback/sample data from `overviewMockData.ts`; KPI labels and page copy now explicitly mark fallback/sample values so mock values are not presented as live telemetry.
- Shows: KPI cards (Grid Demand, Renewables, Alerts), interactive site visualizer (static image + pulsing hotspot dots), Manager Dashboard section.
- `/monitoring/overview` exists as a backend/API direction, but Factory Overview is **not yet wired to live `/monitoring/overview` data** in the current frontend page.
- Sidebar/user panel behavior remains preserved: user panel pinned, nav scroll independent, Factory Overview first item/factory icon retained.
- Admin Dashboard behavior remains preserved: gated by `admin.access` or `is_superuser`, opens `/dashboard` in a new tab, and is not the default landing page.
- Latest frontend validation: `npm run build` passed after the polish pass on 2026-06-16. `npm run lint` is currently blocked by missing ESLint configuration and prompts interactively.
- Next major work is database/backend/data-model and real-data integration work before replacing overview fallback values with live telemetry.

---

## 6. RBAC Rules

| Permission | Enforced Where |
|-----------|---------------|
| `admin.access` | `DashboardLayout` (frontend) + `MonitoringFeatureSidebar` Admin Console button visibility |
| `energy:read` | All `/monitoring/*` backend endpoints |
| `factories.assign_users` | Factory CRUD + user-factory access management endpoints |
| `admin:users` | `/admin/test` (minimal usage) |

**Behavioral rules:**
- Normal users (no `admin.access`, not superuser): no Admin Console button; 403 at `/dashboard`
- Users see only their assigned factories via `user_factory_access` (superusers see all)
- `/auth/me` returns permitted factories list — frontend uses this for display/gating
- Admin Console manages: users, roles, permissions, factories (business access control)
- Admin Console must **NOT** manage: industrial sites, OPC tags, circuits, devices, telemetry infrastructure

---

## 7. Local Development Commands

### Backend
```powershell
cd D:\Solico\WebApp\AI-Coding-Lab\real-project\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Seed the DB (first time only):
```powershell
python scripts/seed_dev.py
```

Run migrations:
```powershell
alembic upgrade head
```

Run tests:
```powershell
pytest
```

### Frontend
```powershell
cd D:\Solico\WebApp\AI-Coding-Lab\real-project\frontend
npm run dev        # Next.js dev server on port 3000
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # ESLint
```

### Environment Variables (no secrets — see .env.example for structure)

**Backend** (`.env`):
```
DATABASE_URL=postgresql+psycopg2://user:pass@127.0.0.1:5432/energy_app_db
MONITORING_DATABASE_URL=postgresql+psycopg2://user:pass@127.0.0.1:5432/Kalleh_Amol_DB  # optional
SECRET_KEY=...
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_DEV_AUTH_BYPASS=false   # set true to enable dev bypass button on login page
```

---

## 8. Spec-Driven Roadmap

### Completed
- ✅ `001-factory-first-navigation` — After login → `/monitoring`; Admin Console via new tab only
- ✅ `002-rbac-factories-backend` — User-scoped factory access; RBAC middleware
- ✅ `003-admin-dashboard-rbac-management` — Admin Console gated; Access Denied for non-admins
- ✅ `006-ui-polish-performance` small polish slice — Factory Overview clarity and sidebar/user-panel polish completed; full real-data loading/error work remains tied to data integration.

### Next Specs

| ID | Title | Description |
|----|-------|-------------|
| `004-monitoring-db-read-integration` | Monitoring DB Read Integration | Wire `MONITORING_DATABASE_URL` to real `Kalleh_Amol_DB`; verify dual-mode fallback; add `/health/monitoring-db` endpoint |
| `005-factory-overview-real-data` | Factory Overview Real Data | Replace mock data in `/monitoring` page with real API calls to `/monitoring/overview` and `/monitoring/kpis`; handle `data_available=false` gracefully |
| `006-ui-polish-performance` | UI Polish & Performance | Small Factory Overview/sidebar polish slice completed; remaining loading/error work depends on real overview data integration |

---

## 9. Architecture Notes / Watch-outs

1. **`/sites/` vs `/factories/`**: `SiteFactorySelector` calls `/sites/` (app DB `Site` model in `company.py`), not `/factories/`. These are different entities. `Site` = monitoring-grouped location in app DB; `Factory` = business access control entity. Future work may need to map or reconcile.

2. **Monitoring service dual-mode**: `services/monitoring.py` detects real schema via `_has_real_monitoring_schema()` — checks for PostgreSQL + tables `{sites, circuits, opc_tags, readings}`. If absent, uses `Device/EnergyMeasurement` fallback (empty in dev unless seeded).

3. **Factory Overview uses fallback/sample data**: `app/(monitoring)/monitoring/page.tsx` imports all data from `overviewMockData.ts`. No API calls on this page yet. The UI now labels fallback values clearly after the 2026-06-16 polish pass.

4. **Stitch section**: `app/(stitch)/` is a legacy design reference with its own shell/sidebar/components. Not integrated with main auth/RBAC flow. Keep isolated.

5. **DB in dev**: Default `DATABASE_URL` is SQLite (`sqlite:///./energy_monitoring_dev.db` in `config.py`). Production should use PostgreSQL for both DBs.

6. **Token dual-storage**: JWT stored in `localStorage` (for JS reads) AND `em_token` cookie (for middleware). Both cleared on logout via `removeToken()`.

7. **Inline styles**: Frontend uses React inline styles throughout (no Tailwind utility classes in monitoring components). Design tokens live in `monitoringColors.ts` (`C` object). Do not add Tailwind classes to monitoring components — use the `C` token pattern.
