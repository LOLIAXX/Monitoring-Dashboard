# Spec 006 — UI Polish & Performance

## Summary

Polish the monitoring frontend after data integration (specs 004 and 005). Fix known bugs, improve loading and error states, optimize re-fetching, and ensure the sidebar and user panel behave consistently across all monitoring pages. This spec refines what exists — it does not redesign the app.

---

## Goal

- Fix the middleware redirect bug: logged-in users visiting `/login` must go to `/monitoring`, not `/dashboard`.
- Add skeleton/loading states to cards and data so the UI never looks broken while fetching.
- Add graceful error UI so a failed API call does not white-screen the page.
- Avoid unnecessary re-fetching when navigating between monitoring pages.
- Keep charts, tables, and KPI cards readable and visually consistent.
- Ensure the sidebar user panel is always visible.

---

## User Stories

| As... | I want... | So that... |
|-------|-----------|------------|
| Logged-in user navigating to `/login` | To be redirected to `/monitoring` (not `/dashboard`) | I land on the right page |
| User loading any monitoring page | To see a skeleton/loading state immediately | The page never looks broken while fetching |
| User encountering a failed API call | To see a useful inline error message, not a white screen | I understand what happened |
| User navigating between monitoring pages | Not to see a flash of empty content while data loads | Navigation feels smooth |
| User on any monitoring page | To always see the user panel at the bottom of the feature sidebar | I can always sign out or access Admin Console |
| Admin user | Admin Console button to remain permission-gated and always visible in the user panel | No regression from spec 003 |

---

## In Scope

- Fix `frontend/middleware.ts` line 8: change redirect target from `/dashboard` to `/monitoring`
- Loading skeleton for KPI cards (while data is fetching)
- Loading skeleton or spinner for trends and report tables
- Inline error state for failed fetches (message + optional retry button)
- Confirm `height: 100vh` + `position: sticky` + `flexShrink: 0` on user panel across screen sizes
- Review `/auth/me` re-fetch frequency — should happen once per layout mount, not on every page navigation within monitoring
- Minor readability improvements: font sizes, spacing, color contrast — using existing `C` token palette only

## Out of Scope

- Full page redesigns
- Replacing mock data with real data (spec 005)
- Backend changes
- Admin Console changes
- Adding new monitoring pages or features
- Replacing inline styles with Tailwind (keep the existing pattern)
- Stitch section (`(stitch)/`)

---

## Acceptance Criteria

- [ ] Logged-in user visiting `/login` is redirected to `/monitoring` (not `/dashboard`)
- [ ] All monitoring pages show a loading state while data is fetching
- [ ] Failed API calls show an inline error (not white screen or unhandled exception)
- [ ] Sidebar user panel is always visible — confirmed on multiple monitoring pages
- [ ] Admin Console button remains gated on `hasAdminAccess` — no regression
- [ ] Navigating within monitoring does not trigger extra `/auth/me` calls
- [ ] `npm run build` passes — zero TypeScript errors
- [ ] `npm run lint` passes

---

## Safety Rules

- Do not add Tailwind utility classes to monitoring components — preserve inline style pattern.
- Do not change admin access logic (`hasAdminAccess`, `(dashboard)/layout.tsx`).
- Do not change login flow or token handling.
- Do not remove `overviewMockData.ts`.
- Do not touch the `(stitch)` route group.
- Sidebar `height: 100vh` / `position: sticky` must be preserved exactly — do not change this.
