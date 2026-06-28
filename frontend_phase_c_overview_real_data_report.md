# Frontend Phase C — Overview Real Data Integration

> Scope: **Frontend overview page only.** No backend, no database schema, no env, no packages, no staging, no commit. Wires the 12 Phase B dashboard endpoints into the Monitoring Overview page.

---

## 1. Files Changed

| File | Type | Notes |
|---|---|---|
| `frontend/lib/monitoringDashboardApi.ts` | **new** | 7 typed fetcher functions + 8 TS interfaces mirroring Phase B backend schemas |
| `frontend/app/(monitoring)/monitoring/page.tsx` | **modified** | Replaced 17 unused mock-data imports with API imports; added `DashState` type, `dash` state, data-fetch `useEffect`, `liveData` flag; updated banner, KPI grid, freshness strip, manager section |
| `frontend/components/monitoring/overview/GridDemandCard.tsx` | **modified** | Accepts optional `summary` + `powerTrend` props; shows real power/peak/energy; derives bar chart from trend points; shows Live pill when data_available |
| `frontend/components/monitoring/overview/ManagerDashboardSection.tsx` | **modified** | Accepts optional `energyShares` + `topConsumers` props; `ConsumptionShareDonutCard` uses real site share data; `FactoryConsumptionCard` uses real top-consumer data; description text adapts to data source |

No other files changed. `Start-Solico.ps1`, `Start-Solico-NoBrowser.ps1`, `frontend_review_report.md`, backend files, env files, and database files are untouched.

---

## 2. API Client Functions Added (`monitoringDashboardApi.ts`)

| Function | Endpoint | Response Type |
|---|---|---|
| `fetchOverviewSummary` | `GET /monitoring/dashboard/overview/summary` | `FactoryOverviewSummary` |
| `fetchOverviewPowerTrend` | `GET /monitoring/dashboard/overview/power-trend` | `DashboardTrendResponse` |
| `fetchOverviewEnergyTrend` | `GET /monitoring/dashboard/overview/energy-trend` | `DashboardTrendResponse` |
| `fetchOverviewEnergyShares` | `GET /monitoring/dashboard/overview/energy-shares` | `SiteEnergyShareListResponse` |
| `fetchOverviewTopConsumers` | `GET /monitoring/dashboard/overview/top-consumers` | `SiteEnergyShareListResponse` |
| `fetchOverviewSitePowerComparison` | `GET /monitoring/dashboard/overview/site-power-comparison` | `SitePowerListResponse` |
| `fetchOverviewDataFreshness` | `GET /monitoring/dashboard/overview/data-freshness` | `DataFreshnessResponse` |

Auth: each function passes the token from `getToken()` (localStorage `em_token`) via `apiFetch`. Follows the same pattern as `frontend/lib/monitoringApi.ts`.

---

## 3. Data Flow

```
page.tsx  (mounted useEffect -> getToken() -> Promise.allSettled([7 fetches]))
  dash state: { summary, powerTrend, energyTrend, energyShares, topConsumers, sitePower, freshness }
    liveData = summary?.data_available === true
    Banner: Live (green) | Fallback mode (amber)
    GridDemandCard(summary, powerTrend)
      live=true  -> real factory_active_power_kw, peak_demand_kw, daily_energy_kwh
                    trend bars from power-trend points (last 6, normalised to max)
      live=false -> mock 1,245 kW, GRID_DEMAND_BARS, KPI_GRID_SUB
    Data Freshness strip (only when freshness.data_available && items.length > 0)
      per-site pills: green (fresh) or red (stale) with age in s/m/h
    ManagerDashboardSection(energyShares, topConsumers)
      ConsumptionShareDonutCard
        real    -> site names, pct, MWh from energy-shares; SHARE_COLORS palette
        fallback-> MANAGER_CONSUMPTION_SHARE mock
      FactoryConsumptionCard
        real    -> top-consumer site names, energy_kwh->MWh, pct; cost/peak show dash
        fallback-> MANAGER_FACTORY_CONSUMPTION mock
```

All other cards (`RenewablesCard`, `SystemAlertsCard`, `FactoryEnergyMap`, `RiskSummaryCard`, `MonthlyTrendCard`, `EfficiencyRankingCard`, `AbnormalUsageCard`, `BestWorstAreasCard`) remain on mock data — no Phase B endpoint covers their content.

---

## 4. Fallback Behaviour

- `Promise.allSettled` ensures a failure on one endpoint never breaks the others.
- If `getToken()` returns null (user not logged in), the fetch is skipped entirely — all cards show mock data.
- Each component checks `data_available === true` before using real data; null or false falls through to mock.
- The Live / Fallback mode banner reflects `summary.data_available` directly.

---

## 5. What Was NOT Changed

| Item | Reason |
|---|---|
| `RenewablesCard` | No Phase B endpoint covers PV/wind/CO2 data |
| `SystemAlertsCard` | No Phase B endpoint covers alert data |
| `FactoryEnergyMap` | Hotspot dots are site-level physical layout; Phase B endpoints do not carry per-spot status |
| Manager monthly trend, efficiency ranking, risk, abnormal usage | No Phase B equivalent endpoints |
| `overviewMockData.ts` | Not deleted — still used by the above components as fallback |

---

## 6. Build Validation

```
npm run build  ->  compiled successfully
/monitoring  15.2 kB (118 kB first load JS)  -- no size regression
All 29 routes pass, zero TypeScript errors
```

---

## 7. Constraints Confirmed

- No backend files changed.
- No database schema changes or migrations.
- No `.env` files changed.
- No packages installed.
- Nothing staged or committed.
- `Start-Solico.ps1`, `Start-Solico-NoBrowser.ps1`, `frontend_review_report.md` untouched.

---

## 8. Phase C Correction — Mock Fallback Removed

**Problem identified:** Phase C initial implementation still fell back to mock data when `data_available=false`, showing fake KPI values, fake bar charts, fake energy shares, and fake top consumers.

### Removed mock fallbacks

| Component | What was removed | Replacement |
|---|---|---|
| `GridDemandCard.tsx` | `GRID_DEMAND_BARS`, `KPI_GRID_SUB` imports; `?? 1245`, `?? 1312` fake defaults; `'Sample plant import baseline'` subtitle; `'12% vs avg'` fake metric; `SourcePill` on non-live state | Empty bar placeholders when no trend; `"—"` when no KPI; loading skeleton when `loading=true` |
| `ManagerDashboardSection.tsx` | `MANAGER_CONSUMPTION_SHARE` import + mock fallback branch in `ConsumptionShareDonutCard`; `'38.6'` fake MWh total; `MANAGER_FACTORY_CONSUMPTION` import + mock fallback branch in `FactoryConsumptionCard` | Empty-state card with message when no data; `loading` prop toggles opacity + copy |
| `page.tsx` | No `error` field; no error banner; `loading` not passed to child cards | `error: boolean` in `DashState`; `hadError` detected from rejected `allSettled` results; non-blocking error banner rendered; `loading={dash.loading}` passed to both `GridDemandCard` and `ManagerDashboardSection` |

### Encoding fix

A prior PowerShell patch had introduced UTF-8 → Latin-1 corruption (`·` → `Â·`, `—` → `â€"`) in subtitle strings, and a subsequent Edit introduced curly quotes (U+201D) in JSX attribute values. Both were corrected: curly quotes replaced with ASCII `"` via byte-level replacement; middle dots and em dashes restored as proper UTF-8 in JS string literals.

### Behaviour after correction

| State | GridDemandCard | ConsumptionShareDonutCard | FactoryConsumptionCard |
|---|---|---|---|
| `loading=true` | Skeleton bars + skeleton KPI values | Dimmed empty ring + "Loading…" text | Dimmed "Loading…" text |
| `data_available=false` or empty | Flat empty bars, `"—"` KPIs | Empty ring + "No energy share data available" | "No site consumption data available" |
| `data_available=true` | Real bar chart + live KPIs | Real donut slices from API | Real site rows from API |
| Any fetch rejected | Error banner above Manager section | (no change) | (no change) |

No fake numbers, fake shares, fake consumers, or fake trend bars are shown at any point.

### Build validation

```
npm run build  ->  compiled successfully (zero TypeScript errors, zero webpack errors)
/monitoring  route: no size regression
```
