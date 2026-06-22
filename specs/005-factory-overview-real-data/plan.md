# Plan 005 — Factory Overview Real Data

## Architecture Context

### Current State

- `SiteFactorySelector` fetches `SiteRow[]` from `GET /sites/` — app DB `Site` model, NOT `Factory`
- `SiteRow` interface: `{ id, name, location, is_active }`
- `FactoryRead` backend schema: `{ id, code, name, legal_name, company_id, city, is_active, ... }`
- Factory Overview page imports all values from `overviewMockData.ts` — zero API calls
- `lib/monitoringApi.ts` has typed wrappers but they are unused in the overview page
- `MonitoringLayout` already fetches `/auth/me` which returns `factories: FactoryRead[]` on the `user` object

### Key Design Decision

The user's permitted factories are **already available** in `MonitoringLayout` via the `/auth/me` response (`user.factories`). Pass them down as props to `SiteFactorySelector` — avoid a second API call.

---

## Implementation Steps

### Step 1 — Update `SiteFactorySelector` Props

**File**: `frontend/components/monitoring/SiteFactorySelector.tsx`

Define a lean interface for the factory rows:
```typescript
interface FactoryRow {
  id: number
  name: string
  city?: string | null
  is_active: boolean
}

interface Props {
  factories: FactoryRow[]     // passed from layout (was: fetched internally from /sites/)
  loading: boolean            // true while /auth/me is in flight
  selectedKey: string | null
  onSelect: (key: string, name: string) => void
  userInitial: string
}
```

Remove the `useEffect` + `useState` that fetched `/sites/`. Replace `sites` state usage with `props.factories`.

Update the subtitle line: `factory.city` instead of `site.location`.

Keep "All Sites" option label (or "All Factories" — keep existing label for minimal churn).

### Step 2 — Update `MonitoringLayout` to Pass Factories

**File**: `frontend/app/(monitoring)/layout.tsx`

Update the `UserInfo` interface to include factories:
```typescript
interface UserInfo {
  id: number
  email: string
  full_name?: string | null
  is_superuser: boolean
  permissions: string[]
  factories: Array<{ id: number; name: string; city?: string | null; is_active: boolean }>
}
```

Pass factories and loading state to `SiteFactorySelector`:
```typescript
<SiteFactorySelector
  factories={user?.factories ?? []}
  loading={user === null}
  selectedKey={selectedKey}
  onSelect={handleSiteSelect}
  userInitial={user?.email?.[0]?.toUpperCase() ?? '?'}
/>
```

Also: after factories load, validate `selectedKey` against the returned list. If the persisted `selectedKey` is no longer in the user's factory list, clear it:
```typescript
useEffect(() => {
  if (user && selectedKey && selectedKey !== 'all') {
    const valid = user.factories.some(f => String(f.id) === selectedKey)
    if (!valid) { setSelectedKey(null); localStorage.removeItem(LS_KEY) }
  }
}, [user, selectedKey])
```

### Step 3 — Add Overview API Call to Factory Overview Page

**File**: `frontend/app/(monitoring)/monitoring/page.tsx`

Add imports at top:
```typescript
import { apiFetch } from '@/lib/api'
import { getToken } from '@/lib/auth'
```

Add interfaces:
```typescript
interface OverviewSummary {
  total_energy_kwh: number
  peak_demand_kw: number
  power_factor: number | null
  active_alerts: number
}
interface OverviewResponse {
  data_available: boolean
  summary: OverviewSummary
}
```

Add state and fetch in the main component:
```typescript
const [overview, setOverview] = useState<OverviewResponse | null>(null)
const [overviewLoading, setOverviewLoading] = useState(true)

useEffect(() => {
  const token = getToken()
  if (!token) { setOverviewLoading(false); return }
  apiFetch<OverviewResponse>('/monitoring/overview', {}, token)
    .then(setOverview)
    .catch(() => setOverview({ data_available: false, summary: { total_energy_kwh: 0, peak_demand_kw: 0, power_factor: null, active_alerts: 0 } }))
    .finally(() => setOverviewLoading(false))
}, [])
```

### Step 4 — Update KPI Card Values

**File**: `frontend/app/(monitoring)/monitoring/page.tsx`

`GridDemandCard` currently hardcodes `1,245 kW`. Update headline value only:

```typescript
// In GridDemandCard (or pass as prop):
const peakDisplay = overviewLoading
  ? '—'
  : overview?.data_available
    ? `${overview.summary.peak_demand_kw.toLocaleString('en-US', { maximumFractionDigits: 0 })} kW`
    : 'N/A'
```

Preserve all chart bars, sub-rows, gauge, and alerts from `overviewMockData.ts`. Only the headline number changes to real data.

When `data_available: false` or loading: headline shows `—` or `N/A` with muted styling.

### Step 5 — Confirm `lib/monitoringApi.ts` Has Overview Wrapper

**File**: `frontend/lib/monitoringApi.ts`

Add if not present:
```typescript
export async function fetchMonitoringOverview(token: string | null): Promise<OverviewResponse> {
  return apiFetch<OverviewResponse>('/monitoring/overview', {}, token)
}
```

(Or use `apiFetch` directly in the page — either is fine.)

---

## Files to Inspect and Change

| File | Change |
|------|--------|
| `frontend/components/monitoring/SiteFactorySelector.tsx` | Remove internal `/sites/` fetch; accept factories as prop |
| `frontend/app/(monitoring)/layout.tsx` | Update `UserInfo`; pass `factories` + `loading` to selector; validate stale `selectedKey` |
| `frontend/app/(monitoring)/monitoring/page.tsx` | Add `/monitoring/overview` fetch; update headline KPI value |
| `frontend/lib/monitoringApi.ts` | Add/confirm `fetchMonitoringOverview` wrapper |

## Files NOT to Change

| File | Reason |
|------|--------|
| `frontend/components/monitoring/overviewMockData.ts` | Preserved as fallback — do not delete |
| `frontend/app/(dashboard)/**` | Admin Console out of scope |
| Any backend file | Spec 004 scope |
| `frontend/components/monitoring/MonitoringFeatureSidebar.tsx` | Only user panel + admin button — out of scope here |

---

## Validation Commands

```powershell
cd D:\Solico\WebApp\AI-Coding-Lab\real-project\frontend

# TypeScript check
npm run build

# Lint
npm run lint

# Manual end-to-end test
npm run dev
# 1. Open http://localhost:3000
# 2. Log in as admin (admin@example.com / admin1234)
# 3. Verify "Amol Dairy Kalleh Factory" appears in left selector
# 4. Select it — verify KPI cards attempt to load
# 5. If monitoring DB available: verify real numbers appear
# 6. If monitoring DB absent: verify N/A / placeholder shown, no crash
```

---

## Risk Notes

- `UserInfo.factories` may not currently exist in the layout's interface — check before assuming.
- If `user.factories` is empty, selector must show "No factories assigned" gracefully, not an error.
- `selectedKey` in `localStorage` may be stale after factory access changes — validate and clear on load.
- Inline styles must be preserved (no Tailwind utility classes in monitoring components).
- The `SiteFactorySelector` component is rendered by `MonitoringLayout` which runs on every monitoring page — factory validation logic must be idempotent and not cause a re-render loop.
