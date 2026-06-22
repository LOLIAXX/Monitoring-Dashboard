# Spec 005 — Factory Overview Real Data

## Summary

Replace the mock-only data in the Factory Overview page (`/monitoring`) with real backend data where available. The site selector must show factories the current user is assigned to. KPI cards must reflect real API values. The plant map visualization and manager dashboard section may remain mock until real spatial/analytics data is available.

---

## Goal

- The site selector (left panel) shows only factories the logged-in user has access to, loaded from the app DB via `/factories/`.
- The admin user sees "Amol Dairy Kalleh Factory" (the seeded factory).
- Selecting a factory triggers a fetch of overview KPIs from `/monitoring/overview` and `/monitoring/kpis`.
- If real monitoring data is unavailable (`data_available: false`), the UI shows a clean placeholder state — no crash, no stale mock numbers presented as real.
- Mock data is preserved as a design reference fallback; it is not removed until explicitly replaced.

---

## User Stories

| As... | I want... | So that... |
|-------|-----------|------------|
| Logged-in user | To see only my assigned factories in the site selector | I am not confused by sites I cannot access |
| Logged-in admin | To see "Amol Dairy Kalleh Factory" in the selector | My seeded access works end-to-end |
| User selecting a factory | To see real KPI values load (total energy, peak demand) | The dashboard reflects actual plant state |
| User with no monitoring data | To see an empty/placeholder state, not broken UI | The app feels stable even without telemetry |
| Developer | To preserve mock fallback and switch to real data per environment | Testing both paths is possible locally |

---

## In Scope

- Changing `SiteFactorySelector` to fetch from `GET /factories/` instead of `GET /sites/`
- Updating `SiteFactorySelector` TypeScript interface to match `FactoryRead` schema
- Adding API calls in the Factory Overview page (`/monitoring`) for `/monitoring/overview` and `/monitoring/kpis`
- Showing real KPI values in the KPI cards when data is available
- Showing a graceful empty state in KPI cards when `data_available: false`
- Loading skeleton or spinner while data is fetching
- Preserving mock visualization (plant map image, hotspot dots, manager dashboard section) — these remain as-is

## Out of Scope

- Replacing the plant map image or hotspot dots with real data
- Replacing the manager dashboard section with real analytics
- Per-factory monitoring-site mapping (global overview fetch for now; per-site filtering is future work)
- Admin Console changes
- Monitoring DB schema changes
- Backend endpoint changes (spec 004 scope)

---

## Acceptance Criteria

- [ ] `SiteFactorySelector` calls `GET /factories/` and shows user-assigned factories
- [ ] Admin user sees "Amol Dairy Kalleh Factory" in the selector after running seed
- [ ] Selecting a factory triggers `GET /monitoring/overview` and `GET /monitoring/kpis`
- [ ] When `data_available: true`, real values appear in at least the energy KPI card
- [ ] When `data_available: false`, KPI cards show a graceful placeholder (not stale mock numbers)
- [ ] A loading state is visible while fetching
- [ ] No hard crash when backend is unavailable
- [ ] `overviewMockData.ts` is preserved (not deleted)
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run lint` passes

---

## Safety Rules

- Do not delete `overviewMockData.ts` — preserve as fallback.
- Do not change Admin Console behavior or admin button visibility.
- Frontend must never query monitoring DB directly — only via backend API.
- Factory selector uses `/factories/` (app DB, user-scoped), never `/sites/` or direct monitoring DB.
- User panel must remain pinned at bottom of sidebar at all times.
- No changes to `(dashboard)` layout or admin routes.
