# Plan 006 — UI Polish & Performance

## 2026-06-16 Status Note

Small UI polish slice completed in commit `e3bcb87`: Factory Overview fallback/sample state is now visually explicit, KPI spacing/readability was tightened, and the monitoring sidebar active state/user panel were polished while preserving sticky/user-panel/admin-gating behavior. This did **not** wire Factory Overview to live `/monitoring/overview` data and did not implement new skeleton/error components. Next major work remains database/backend/data-model and real-data integration.

## Architecture Context

### Known Issues to Fix

1. **Middleware bug** (`frontend/middleware.ts:8`): Logged-in users visiting `/login` get redirected to `/dashboard`. Must redirect to `/monitoring`.

2. **No loading states**: After spec 005 adds real API calls, there will be a visible loading gap before data arrives. Cards need skeleton UI.

3. **No error handling in pages**: If `/monitoring/overview` returns 5xx, the page silently shows null/zero values or throws an unhandled error.

4. **`/auth/me` re-fetch frequency**: `MonitoringLayout` uses `useEffect([router])`. Next.js route group layouts stay mounted across in-group navigation — this should fire only once. Verify this is the case.

---

## Implementation Steps

### Step 1 — Fix Middleware Redirect Bug

**File**: `frontend/middleware.ts`

Change line 8 only:
```typescript
// Before:
if (token) return NextResponse.redirect(new URL('/dashboard', request.url))
// After:
if (token) return NextResponse.redirect(new URL('/monitoring', request.url))
```

**Verify**: After fix, log in, then manually visit `http://localhost:3000/login` — must land on `/monitoring`.

### Step 2 — Skeleton Loading Component

**File**: `frontend/components/monitoring/SkeletonBlock.tsx` (new)

```typescript
'use client'
import { C } from './monitoringColors'

export function SkeletonBlock({ width = '100%', height = 20, radius = 6 }: {
  width?: string | number
  height?: number
  radius?: number
}) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: `linear-gradient(90deg, ${C.sidebarBorder} 25%, rgba(255,255,255,0.06) 50%, ${C.sidebarBorder} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'skeleton-sweep 1.4s ease-in-out infinite',
    }} />
  )
}
```

Add keyframe to `frontend/app/globals.css`:
```css
@keyframes skeleton-sweep {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Step 3 — Use Skeleton in KPI Cards

**File**: `frontend/app/(monitoring)/monitoring/page.tsx`

When `overviewLoading` is true, replace the headline metric with `<SkeletonBlock>`:

```typescript
{overviewLoading
  ? <SkeletonBlock width={80} height={36} radius={8} />
  : <span className="metric-value" style={{ fontFamily: L.headFont }}>{peakDisplay}</span>
}
```

Apply same pattern to energy and alerts headline values.

### Step 4 — Inline Error Component

**File**: `frontend/components/monitoring/InlineError.tsx` (new)

```typescript
'use client'

export function InlineError({ message, onRetry }: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div role="alert" style={{
      padding: '10px 14px', borderRadius: 10,
      background: 'rgba(220,38,38,0.08)',
      border: '1px solid rgba(220,38,38,0.22)',
      color: '#DC2626', fontSize: 12.5, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: 'transparent', border: '1px solid rgba(220,38,38,0.35)',
          borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
          color: '#DC2626', fontSize: 11, fontWeight: 600,
        }}>Retry</button>
      )}
    </div>
  )
}
```

Use in overview page:
```typescript
const [fetchError, setFetchError] = useState<string | null>(null)
// In catch block: setFetchError('Monitoring data unavailable. Check connection.')
// In JSX: {fetchError && <InlineError message={fetchError} onRetry={refetch} />}
```

### Step 5 — Verify `/auth/me` Fetch Frequency

**File**: `frontend/app/(monitoring)/layout.tsx`

Current: `useEffect(() => { ... }, [router])`

The `router` object from `useRouter()` is stable across in-layout navigation in Next.js App Router — the layout component is not remounted when navigating between sibling pages. So this should be fine.

**Confirm** during dev: add a temporary `console.log('auth/me called')` inside the effect and navigate between `/monitoring`, `/monitoring/trends`, `/monitoring/reports`. Should log once, not on every navigation.

If extra calls are detected: change `[router]` to `[]` (run once on mount).

### Step 6 — Trend and Report Page Loading States

**Files**: `frontend/app/(monitoring)/monitoring/trends/page.tsx`, `frontend/app/(monitoring)/monitoring/reports/page.tsx`

Read these files first to understand their current state. Then add:
- `loading` state initialized `true`
- Show skeleton rows while loading
- Show `InlineError` on fetch failure

If these pages currently have no API calls and only show mock/placeholder content, note this in the task and skip skeleton (nothing to load yet).

---

## Files to Inspect and Change

| File | Change |
|------|--------|
| `frontend/middleware.ts` | Line 8: `/dashboard` → `/monitoring` |
| `frontend/app/globals.css` | Add `@keyframes skeleton-sweep` |
| `frontend/components/monitoring/SkeletonBlock.tsx` | New component |
| `frontend/components/monitoring/InlineError.tsx` | New component |
| `frontend/app/(monitoring)/monitoring/page.tsx` | Use `SkeletonBlock` in KPI cards; `InlineError` on fetch failure |
| `frontend/app/(monitoring)/monitoring/trends/page.tsx` | Add skeleton if it has API calls |
| `frontend/app/(monitoring)/monitoring/reports/page.tsx` | Add skeleton if it has API calls |
| `frontend/app/(monitoring)/layout.tsx` | Verify `useEffect` dependency; confirm no extra `/auth/me` calls |

## Files NOT to Change

| File | Reason |
|------|--------|
| `frontend/components/monitoring/MonitoringFeatureSidebar.tsx` | Sidebar already correct |
| `frontend/app/(dashboard)/**` | Admin Console out of scope |
| Any backend file | Out of scope |
| `frontend/components/monitoring/overviewMockData.ts` | Preserved |
| `frontend/app/(stitch)/**` | Isolated — do not touch |

---

## Validation Commands

```powershell
cd D:\Solico\WebApp\AI-Coding-Lab\real-project\frontend

# Build
npm run build

# Lint
npm run lint

# Dev server
npm run dev
```

Manual checks:
1. Log in → visit `http://localhost:3000/login` → must redirect to `/monitoring`
2. Hard-reload `/monitoring` → skeleton appears → resolves to data or N/A
3. Stop backend → reload `/monitoring` → `InlineError` shown, no white screen
4. Navigate monitoring pages → sidebar user panel always visible at bottom
5. Admin Console button only for admin user (no regression)

---

## Risk Notes

- The middleware fix is a one-line change but affects all authenticated users — test login flow thoroughly.
- `SkeletonBlock` animation uses CSS `animation` in inline style. This is compatible with the codebase's inline-style pattern.
- New components go in `components/monitoring/` to match the existing structure.
- Do not add `'use client'` to new components unless they use hooks or browser APIs (both new components are client-safe by nature due to inline styles).
