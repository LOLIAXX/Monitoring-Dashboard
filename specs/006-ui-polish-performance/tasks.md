# Tasks 006 — UI Polish & Performance

## 2026-06-16 Small Polish Completion Note

- Completed a narrow frontend polish slice in commit `e3bcb87`: Factory Overview visual clarity, fallback/sample labeling, KPI spacing/readability, sidebar active state, and pinned user panel polish.
- Preserved required behavior: Factory Overview remains the post-login/default monitoring destination, sidebar user panel stays visible, nav scrolls independently, and Admin Console remains permission-gated and opens in a new tab.
- Factory Overview still uses `overviewMockData.ts`; live `/monitoring/overview` integration, loading skeletons, and inline API error states remain future data-integration work.
- Validation: `npm run build` passed. `npm run lint` is blocked by missing ESLint config because `next lint` prompts interactively.

## Pre-flight Checks

- [ ] Read `frontend/middleware.ts` — confirm line 8 redirects to `/dashboard` (not part of the small polish pass)
- [x] Read `frontend/app/(monitoring)/layout.tsx` — confirmed layout/user/sidebar behavior before polishing
- [x] Read `frontend/app/(monitoring)/monitoring/trends/page.tsx` — has API calls with fallback messaging
- [x] Read `frontend/app/(monitoring)/monitoring/reports/page.tsx` — static/report workspace, no fetch path to skeletonize
- [x] Read `frontend/app/globals.css` — existing visual primitives used; no new skeleton keyframe added

## Bug Fix

- [ ] **`middleware.ts` line 8**: Change `'/dashboard'` to `'/monitoring'` in the logged-in `/login` redirect
- [ ] Manual verify: log in → navigate to `/login` URL → confirm redirect lands on `/monitoring`

## New Components

- [ ] Create `frontend/components/monitoring/SkeletonBlock.tsx` — animated skeleton pulse component
- [ ] Create `frontend/components/monitoring/InlineError.tsx` — inline error message + optional retry button
- [ ] Add `@keyframes skeleton-sweep` to `frontend/app/globals.css`
- [ ] Confirm no duplicate keyframe name in `globals.css`

## KPI Card Loading States (Overview Page)

- [ ] In `frontend/app/(monitoring)/monitoring/page.tsx`: add `fetchError` state (`string | null`)
- [ ] Set `fetchError` in the overview API catch block (with a human-readable message)
- [ ] Show `<SkeletonBlock width={80} height={36} />` in `GridDemandCard` headline when `overviewLoading`
- [ ] Show `<SkeletonBlock>` in Renewables card headline when `overviewLoading`
- [ ] Show `<SkeletonBlock>` in Alerts card headline when `overviewLoading`
- [ ] Render `<InlineError>` near top of page when `fetchError` is set
- [ ] `InlineError` retry button triggers a re-fetch of `/monitoring/overview`

## Fetch Frequency Verification

- [ ] Add temporary `console.log('auth/me called')` inside the `/auth/me` effect in `layout.tsx`
- [ ] Start dev server, navigate: `/monitoring` → `/monitoring/trends` → `/monitoring/reports`
- [ ] Confirm log appears only once (on layout mount), not on every navigation
- [ ] Remove the temporary log before committing
- [ ] If extra calls found: change `useEffect` dependency from `[router]` to `[]`

## Trend and Report Pages

- [ ] `trends/page.tsx`: if it makes API calls, add `<SkeletonBlock>` rows while loading and `<InlineError>` on failure
- [x] `trends/page.tsx`: inspected; it already has API calls and fallback messaging, deeper skeleton/error work deferred
- [x] `reports/page.tsx`: inspected; static/report workspace, no fetch path to skeletonize in the small polish pass

## Safety Checks

- [x] No Tailwind utility classes added to monitoring components (inline styles only)
- [x] `(dashboard)/layout.tsx` unchanged — admin access logic untouched
- [x] `MonitoringFeatureSidebar.tsx`: user panel still has `flexShrink: 0`
- [x] Sidebar `height: 100vh` + `position: sticky` preserved
- [x] `overviewMockData.ts` present and unmodified
- [x] `(stitch)` route group untouched

## Validation Commands

```powershell
cd D:\Solico\WebApp\AI-Coding-Lab\real-project\frontend

# TypeScript build check
npm run build

# Lint
npm run lint

# Dev server
npm run dev
```

Manual test sequence:
1. Log in → navigate to `http://localhost:3000/login` → must land on `/monitoring`
2. Hard-reload `/monitoring` → skeleton visible → resolves to data or N/A
3. Stop backend → reload `/monitoring` → `InlineError` shown, no white screen
4. Navigate monitoring pages → sidebar user panel always pinned at bottom
5. Admin user: confirm Admin Console button visible in sidebar user panel
6. Non-admin user: confirm Admin Console button NOT visible

## Done When

- [ ] All tasks above checked
- [x] `npm run build` — zero TypeScript errors
- [ ] `npm run lint` — blocked by missing ESLint config; `next lint` opens interactive setup prompt
- [ ] `/login` redirect fixed: lands on `/monitoring` when logged in
- [ ] Skeleton loading visible on overview page
- [ ] Error state visible when backend is down (no white screen)
- [x] Sidebar user panel remains pinned in code (`height: 100vh`, `position: sticky`, `flexShrink: 0`)
- [x] No admin access regressions in the polished sidebar code path
