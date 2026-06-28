# Frontend Phase C — Overview Real Data Fix

> Scope: **Monitoring Overview page only.** No backend, no database schema, no env files, no packages, no staging, no commit.
> Fixes the Phase C real-data integration where the overview page showed empty data despite Phase B endpoints being live.

---

## 1. Root Causes Identified

| # | Root Cause | Symptom |
|---|---|---|
| 1 | `layout.tsx` gate: `featureVisible = selectedKey !== null` blocked all content on first visit because `localStorage` was empty | Blank page on `/monitoring` |
| 2 | `useEffect` dependency bug: effect had empty deps `[]` so auto-select for `pathname === '/monitoring'` never ran | Site never auto-selected |
| 3 | `energyTrend` and `sitePower` were fetched but no components rendered them | Data wasted |
| 4 | No time range controls — API always called with default params, no way to adjust window | No user control |
| 5 | Time ranges computed from wall-clock; backend uses `max(readings.ts)` as reference | Wrong time anchoring |
| 6 | `RenewablesCard` and `SystemAlertsCard` were mock-only — no real endpoint | Two of four KPI slots fake |
| 7 | Manager section 4 KPI tiles still used `MANAGER_SUMMARY_METRICS` mock data | Fake values shown when live data exists |

---

## 2. Files Changed

| File | Type | Change |
|---|---|---|
| `frontend/app/(monitoring)/layout.tsx` | **modified** | Added `pathname` to `useEffect` deps; added auto-select `'all'/'All Sites'` when on `/monitoring` with no stored key |
| `frontend/app/(monitoring)/monitoring/page.tsx` | **rewritten** | Full rewrite: DashboardControlBar, TrendChart, PeriodEnergyCard, PeakDemandCard; `buildTimeParams` anchored to `asOf`; `Promise.allSettled` with all 7 fetchers; error banner; data freshness strip |
| `frontend/components/monitoring/overview/ManagerDashboardSection.tsx` | **rewritten** | Replaced `MANAGER_SUMMARY_METRICS` mock tiles with `RealMetricTile` (live summary data); added `SitePowerComparisonCard` (live `sitePower`); added `EnergyTrendCard` (live `energyTrend`); updated `ManagerDashboardSectionProps` interface |
| `frontend/components/monitoring/monitoringColors.ts` | **modified** | Added additive `L` export (design tokens required by overview components) |

New files (existed in main repo as untracked, synced to worktree):
- `frontend/lib/monitoringDashboardApi.ts` — 7 typed fetchers
- `frontend/components/monitoring/Clock.tsx` — live clock display
- `frontend/components/monitoring/overview/OverviewShared.tsx` — shared tokens/components
- `frontend/components/monitoring/overview/GridDemandCard.tsx` — real KPI + bar chart
- `frontend/components/monitoring/overview/PulsingDot.tsx` — site map hotspot
- `frontend/components/monitoring/overview/FactoryEnergyMap.tsx` — factory visualizer

---

## 3. New Components Added to `page.tsx`

### `buildTimeParams(range, asOf)`
Computes `{start_ts?, end_ts?, bucket}` anchored to `asOf` (data's own `max(readings.ts)`):
- `'auto'` — no params, backend uses its own default 7-day window
- `'24h'` — `asOf - 24h .. asOf`, bucket `1h`
- `'7d'` — `asOf - 7d .. asOf`, bucket `1h`
- `'30d'` — `asOf - 30d .. asOf`, bucket `1d`

### `DashboardControlBar`
Four segmented button groups: **Period** (Default / Last 24h / 7 Days / 30 Days), **Top N** (5 / 10 / 15 / 20), **Refresh** (with spin animation). Shows last-updated timestamp and `asOf` date.

### `TrendChart`
SVG line chart with gradient area fill, Y-axis labels with auto-scaled values, X-axis time ticks. Loading skeleton via `gd-skel` animation. Empty state shows explanatory message and SVG icon.

### `PeriodEnergyCard`
Shows `summary.total_energy_kwh / 1000` MWh. Live pill when data available. Sub-row shows daily energy and source field.

### `PeakDemandCard`
Shows `summary.peak_demand_kw` kW. Sub-row shows estimated load % and `as_of` time.

---

## 4. New Components in `ManagerDashboardSection.tsx`

### `RealMetricTile` (replaces `ManagerMetricTile`)
4 tiles sourced from `summary`:
| Tile | Field | Unit |
|---|---|---|
| Active Power | `factory_active_power_kw` | kW |
| Daily Energy | `daily_energy_kwh / 1000` | MWh |
| Total Period | `total_energy_kwh / 1000` | MWh |
| Peak Demand | `peak_demand_kw` | kW |

Shows `"—"` when `data_available=false`. No mock fallback.

### `SitePowerComparisonCard`
Horizontal bar chart of `sitePower.items[]{site_name, value_kw}`. Bars normalized to max site. Empty state when no data.

### `EnergyTrendCard`
SVG sparkline from `energyTrend.points[]`. Time-axis ticks auto-format as `HH:mm` (48 or fewer points) or `MMM D` (daily). Empty state when no data.

---

## 5. No Fake Data — Ever

| State | Behavior |
|---|---|
| `loading=true` | Skeleton animations, "Connecting..." subtitles |
| `data_available=false` | `"—"` for all KPI values; empty state messages explain why |
| `data_available=true` | Real values from API, no mock fallback |
| Any fetch rejected | Error banner shown; other panels still render with available data |

No `MANAGER_SUMMARY_METRICS`, `MANAGER_CONSUMPTION_SHARE`, `MANAGER_FACTORY_CONSUMPTION`, `RENEWABLE_GAUGE`, or `SYSTEM_ALERTS` are shown as live values. Mock data cards (monthly trend, efficiency ranking, risk summary, abnormal usage, best/worst) are explicitly labeled as not having live API endpoints.

---

## 6. Build Validation

```
tsc --noEmit   ->  zero TypeScript errors
next build     ->  compiled successfully in 11.3s
               ->  linting and type checking: passed
               ->  generating static pages (31/31): all passed
/monitoring    ->  17.1 kB (119 kB first load JS)
zero webpack errors
```

---

## 7. Constraints Confirmed

- No backend files changed
- No database schema changes or migrations
- No `.env` files changed
- No packages installed (accidental partial `node_modules` from `next lint` removed; replaced with junction to existing main repo packages)
- Nothing staged or committed
- No Grafana work
- No fake KPI numbers / fake trend points / fake site rows / fake top consumers anywhere in the output
