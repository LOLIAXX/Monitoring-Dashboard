# Tasks 005 — Factory Overview Real Data

## Pre-flight Checks

- [ ] Read `frontend/app/(monitoring)/layout.tsx` — confirm `UserInfo` interface and whether `factories` field is present
- [ ] Read `frontend/components/monitoring/SiteFactorySelector.tsx` — confirm it fetches `/sites/` internally
- [ ] Read `frontend/app/(monitoring)/monitoring/page.tsx` — confirm all data is from `overviewMockData.ts`
- [ ] Read `frontend/lib/monitoringApi.ts` — confirm available typed wrappers
- [ ] Verify `GET /auth/me` returns `factories` field (check `backend/app/schemas/user.py` and `backend/app/api/routes/auth.py`)

## Frontend: SiteFactorySelector Changes

- [ ] Define `FactoryRow` interface: `{ id: number; name: string; city?: string | null; is_active: boolean }`
- [ ] Add `factories: FactoryRow[]` and `loading: boolean` to `Props`
- [ ] Remove internal `useEffect` that called `GET /sites/`
- [ ] Remove `sites` local state and `loading` local state
- [ ] Replace all `sites` references with `factories` prop
- [ ] Replace `site.location` with `factory.city` in subtitle display
- [ ] Show "Loading factories…" when `loading` prop is `true`
- [ ] Show "No factories assigned" when `factories.length === 0` and not loading

## Frontend: MonitoringLayout Changes

- [ ] Add `factories: Array<{ id: number; name: string; city?: string | null; is_active: boolean }>` to `UserInfo` interface
- [ ] Pass `factories={user?.factories ?? []}` prop to `SiteFactorySelector`
- [ ] Pass `loading={user === null}` prop to `SiteFactorySelector`
- [ ] Add `useEffect` to validate `selectedKey` against loaded factories; clear localStorage if stale

## Frontend: Factory Overview Page Changes

- [ ] Add imports: `apiFetch` from `@/lib/api`, `getToken` from `@/lib/auth`
- [ ] Add `OverviewSummary` and `OverviewResponse` TypeScript interfaces
- [ ] Add `overview` (`OverviewResponse | null`) and `overviewLoading` (`boolean`) state
- [ ] Add `useEffect` to call `GET /monitoring/overview` on mount
- [ ] Handle fetch error: set `{ data_available: false, summary: { total_energy_kwh: 0, peak_demand_kw: 0, power_factor: null, active_alerts: 0 } }`
- [ ] Update `GridDemandCard` headline to show `peak_demand_kw` when available, `—` while loading, `N/A` when unavailable
- [ ] Keep all mock chart data (`GRID_DEMAND_BARS`, gauge, alert rows, manager section) unchanged

## Frontend: monitoringApi.ts

- [ ] Confirm or add `fetchMonitoringOverview()` typed wrapper returning `OverviewResponse`

## Safety Checks

- [ ] `overviewMockData.ts` is NOT deleted or modified
- [ ] Admin Console button behavior unchanged (`hasAdminAccess` logic untouched)
- [ ] User panel remains pinned (`flexShrink: 0`) — no layout regression
- [ ] No Tailwind utility classes added to monitoring components (inline styles only)
- [ ] Frontend makes zero direct calls to `Kalleh_Amol_DB` — always through backend API

## Validation Commands

```powershell
cd D:\Solico\WebApp\AI-Coding-Lab\real-project\frontend

# TypeScript build check
npm run build

# Lint
npm run lint

# Dev server for manual test
npm run dev
```

Manual test sequence:
1. Log in as `admin@example.com`
2. Confirm "Amol Dairy Kalleh Factory" appears in left selector
3. Select the factory — confirm KPI cards attempt to load
4. Real monitoring DB available: confirm real numbers appear
5. Real monitoring DB absent: confirm `N/A` / placeholder shown, no crash
6. Refresh page — confirm `selectedKey` persists
7. Demo user with no factory — confirm "No factories assigned" shown cleanly

## Done When

- [ ] All tasks above checked
- [ ] `npm run build` — zero TypeScript errors
- [ ] `npm run lint` — passes
- [ ] Admin sees "Amol Dairy Kalleh Factory" in selector
- [ ] KPI headline shows real data or clean placeholder (no stale mock numbers)
- [ ] `overviewMockData.ts` unchanged and still present
- [ ] No regressions: sidebar, user panel, admin button all behave correctly
