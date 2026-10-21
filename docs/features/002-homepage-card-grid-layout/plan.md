# Plan: Homepage Card Grid Layout

## Context

After the GitHub OAuth callback, `src/backend/server.ts` redirects to `/home`. The SPA (`src/frontend/components/AppRouter.tsx`) serves the `Login` page at `/` and a `HomePage` at `/home` that is not protected and renders a `GraphList` of link cards. Real authentication lives on the server (session `accessToken`, exposed through `GET /api/user/me`, which returns 401 without a session); the Zustand `userStore` token belongs to the older client-side flow used by `PrivateRoute`. This plan moves the homepage to `/`, gates it on the server session, and replaces its content with a 2x2 responsive grid of MUI cards, each holding an isolated D3 placeholder chart. See `docs/features/002-homepage-card-grid-layout/requirements.md`.

Note: `ARCHITECTURE.md` does not exist in this repository. The architecture check used the "Architecture" section of `AGENTS.md` (features by domain, MUI + D3, Zustand, Vitest co-located tests). The plan does not conflict with it.

---

## Options Considered

### Option A: Gate on the existing `userStore` token with `PrivateRoute`
Reuse `PrivateRoute`, which redirects to GitHub using `process.env.APPLICATION_ID` and a client-generated state.
**Pros**: No new code for gating.
**Cons**: It bypasses the backend PKCE flow (`/login`, cookie-validated state), so a user who just completed the backend callback has an empty `userStore.token` and would be bounced back to login. It contradicts AC 1.1/1.3.

### Option B: Gate on the server session via `GET /api/user/me`
A new `RequireAuth` component calls `/api/user/me` with `fetch`. 200 renders children, 401 does `window.location.replace('/login')` (the backend OAuth start route), and the homepage content is never rendered while status is pending or unauthenticated.
**Pros**: Matches the real session established by the callback; no token in JS; works on direct navigation (AC 1.3); testable with MSW.
**Cons**: One extra request on page load (the homepage itself makes none).

**Chosen**: Option B. It is the only option consistent with the backend callback that actually sets the session.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/frontend/features/user/RequireAuth.tsx` | Session gate: checks `/api/user/me`, redirects to `/login` on 401, renders children on success. |
| `src/frontend/components/DashboardCard.tsx` | Reusable card: title plus chart slot (children). |
| `src/frontend/components/PlaceholderChart.tsx` | D3 placeholder bar chart with static data, `aria-label`, `ResizeObserver` resize and cleanup. |
| `src/frontend/components/ChartErrorBoundary.tsx` | Class error boundary rendering a fallback message inside a card. |
| `src/frontend/pages/homeCards.ts` | Single array of card configs (`id`, `title`). |
| `src/frontend/components/__tests__/DashboardCard.test.tsx` | Unit tests. |
| `src/frontend/components/__tests__/PlaceholderChart.test.tsx` | Unit tests. |
| `src/frontend/components/__tests__/ChartErrorBoundary.test.tsx` | Unit tests. |
| `src/frontend/pages/__tests__/HomePage.test.tsx` | Page unit/integration tests. |
| `src/frontend/features/user/__tests__/RequireAuth.test.tsx` | Gate tests with MSW. |
| `src/frontend/components/__tests__/AppRouter.test.tsx` | Router integration tests. |
| `e2e/homepage.spec.ts`, `playwright.config.ts` | E2E tests (new dev dependency, see decisions). |

## Files to Modify

| File | Change |
|---|---|
| `src/backend/server.ts` | OAuth callback success redirect `'/home'` becomes `'/'`. |
| `src/frontend/pages/HomePage.tsx` | Replace link-card list with the 2x2 card grid driven by `homeCards`. |
| `src/frontend/components/AppRouter.tsx` | `/` renders `<RequireAuth><HomePage/></RequireAuth>`; remove `/home`; move `Login` to `/welcome`. |
| `src/frontend/components/App.tsx` | Remove the menu `IconButton`, its `handleDrawer`/`menuOpen` state, the `AppDrawer` element, and the now-unused imports and `menuButton` class. The app bar keeps only the "Git Charts" home link. |
| `package.json` | Add `@playwright/test` dev dependency and `test:e2e` script. |

## Files to Delete

| File | Reason |
|---|---|
| `src/frontend/components/AppDrawer.tsx` | Navigation drawer removed from the application; it was the only in-app link to the graph pages. |

`GraphList.tsx` and `Card.tsx` become unused by the homepage but are left in place; removing them is out of scope.

---

## Implementation

### 1. Backend redirect (`src/backend/server.ts`)

```ts
// before
res.redirect('/home')
// after
res.redirect('/')
```

Failure paths already return 4xx/5xx JSON and never redirect, which satisfies AC 1.4 unchanged. The SPA fallback serves `index.html` for `/`.

### 2. `RequireAuth` (`features/user/RequireAuth.tsx`)

```tsx
type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated'

const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('pending')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${process.env.API_URL ?? ''}/api/user/me`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) setStatus('authenticated')
        else { setStatus('unauthenticated'); window.location.replace('/login') }
      })
      .catch((e) => {
        if (e.name !== 'AbortError') { setStatus('unauthenticated'); window.location.replace('/login') }
      })
    return () => controller.abort()
  }, [])

  return status === 'authenticated' ? <>{children}</> : <CircularProgress />
}
```

Children render only when authenticated (AC 1.2). Pending and unauthenticated states show only a spinner.

### 3. `homeCards.ts`

```ts
export interface HomeCardConfig { id: string; title: string }
export const homeCards: HomeCardConfig[] = [
  { id: 'adds-deletes', title: 'Adds / Deletes' },
  { id: 'changed-files', title: 'Changed Files' },
  { id: 'section-3', title: 'Section 3' },
  { id: 'section-4', title: 'Section 4' },
]
```

### 4. `DashboardCard`

MUI `Card` (`variant="elevation"`, theme defaults) with `CardHeader`/`Typography variant="h6" component="h2"` for the title and `CardContent` for `children`. Props: `title: string`, `children: ReactNode`. Card is `height: '100%'` so grid rows are even. Title uses theme `text.primary` for AA contrast.

### 5. `PlaceholderChart`

Props: `data?: number[]` (default static `[30, 80, 45, 60, 20, 90]`), `title: string`.

- Render `<div ref={containerRef}><svg ref={svgRef} role="img" aria-label={`Placeholder chart for ${title}`} /></div>`.
- In a `useEffect`, create `new ResizeObserver(entries => draw(width))`. `draw` clears the svg (`selectAll('*').remove()`), sets `viewBox`/`width = 100%`, and draws bars with `d3.scaleBand` / `d3.scaleLinear` using the container width and a fixed height (200). Bars are `rect` elements so tests can count marks. Fill uses theme primary color via `useTheme()`.
- Cleanup: `observer.disconnect()` and `d3.select(svg).selectAll('*').remove()`.
- Observing the container (not window) updates on breakpoint changes and card width changes; ResizeObserver callbacks are batched per frame, which avoids layout thrashing. The svg is `max-width: 100%`, so no horizontal scroll.
- No fetch; no user content (only the static array and the configured title).

### 6. `ChartErrorBoundary`

Class component with `getDerivedStateFromError`; renders `<Typography role="alert">Chart unavailable</Typography>` when it catches. Wraps each card's chart inside `HomePage`, so a throw is contained within one card (AC 3.4).

### 7. `HomePage`

```tsx
<Box sx={{ pt: 10, px: { xs: 2, md: 0 } }}>
  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
    {homeCards.map(({ id, title }) => (
      <DashboardCard key={id} title={title}>
        <ChartErrorBoundary><PlaceholderChart title={title} /></ChartErrorBoundary>
      </DashboardCard>
    ))}
  </Box>
</Box>
```

CSS grid with MUI's `md` breakpoint (900px) gives equal columns, consistent gap, single column below 900px, and no reload on resize. `minWidth: 0` on grid children prevents overflow at 320px.

### 8. `AppRouter`

```tsx
<Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
<Route path="/welcome" element={<Login />} />
```

The `/home` route is removed. Unauthenticated users are sent straight to the backend `/login` (by `RequireAuth`), so `Login` is no longer on the primary path; it is kept at `/welcome` rather than deleted.

The `/graphs/*` routes stay registered, but nothing in the UI links to them after the drawer removal. They are reachable by direct URL only.

### 9. Remove the navigation drawer (`App.tsx`, `AppDrawer.tsx`)

- Delete `src/frontend/components/AppDrawer.tsx`.
- In `src/frontend/components/App.tsx`, remove the `MenuIcon` menu button, the `useState`-based `menuOpen`/`handleDrawer` logic, the `<AppDrawer>` element, and the unused imports and `menuButton` class. The `AppBar` keeps the "Git Charts" link to `/`.
- Verify with `git grep -i drawer` returning no matches in `src/`.

No test covers the drawer or menu button, so no test changes are needed. The E2E and AppRouter tests do not click the menu.

---

## Key Technical Decisions

- **Session gate over `userStore`**: the backend callback only sets a server session; the store token is never populated by it.
- **CSS grid via `Box`** instead of MUI `Grid`: the requirements permit either, and `repeat(2, 1fr)` guarantees equal widths and equal gaps.
- **`ResizeObserver` on the chart container**: satisfies the performance requirement and handles both viewport and card-width changes. jsdom lacks `ResizeObserver`, so tests stub it.
- **Error boundary per card**: isolates failures; D3 errors thrown inside `useEffect` are not caught by boundaries, so `PlaceholderChart` wraps `draw` in try/catch and rethrows through a `useState` setter (`setError(() => { throw e })`) so the boundary receives it.
- **Playwright for E2E**: no E2E tooling exists in the repo. The login step stubs GitHub by mocking `/api/user/me` with `page.route`, because real GitHub OAuth cannot run in CI.
- **Yarn `nodeLinker: node-modules` (decided)**: Yarn PnP is the default, and Playwright's TypeScript loader calls `require()` with conditions, which PnP rejects (`Some options passed to require() aren't supported by PnP yet (conditions)`). `.yarnrc.yml` now sets `nodeLinker: node-modules` repo-wide. This is a change to every contributor's install layout; `yarn install` regenerates `node_modules/` and no `.pnp.cjs` is produced.
- **E2E file names (decided)**: `playwright.config.ts` and `e2e/homepage.spec.ts` are TypeScript, as originally planned. They were briefly `.mjs` while PnP was in place; they were renamed once the linker changed.
- **Error rethrow in `PlaceholderChart` (implementation detail)**: the caught D3 error is stored with `useState` and rethrown during render (`if (error) throw error`), instead of the `setError(() => { throw e })` updater trick. Behaviour is the same: the error boundary receives it. The explicit form is clearer and is what the tests exercise.
- **Navigation drawer removed (decided)**: `AppDrawer` and its menu button were removed from the app bar. The homepage card grid is the only navigation entry point. Graph pages are not linked from the UI anymore; this removes the only in-app navigation to graph pages, as requested.
- **Frontend test glob is `*.test.{ts,tsx}`** (`src/vitest.config.frontend.ts`), so new tests must be `.tsx`; the existing `PrivateRoute.test.jsx` is not matched and is left alone.

---

## Tests to Add

### Test 1: `HomePage_Renders_FourCardsWithExpectedTitles`
- **Setup**: Render `HomePage` in a `ThemeProvider`; stub `ResizeObserver`.
- **Assert**: Four `.MuiCard-root` elements; each title from `homeCards` is present as a heading.

### Test 2: `PlaceholderChart_Renders_SvgWithAriaLabelAndBars`
- **Setup**: Render with `title="Adds / Deletes"` and default data.
- **Assert**: `getByRole('img', { name: /placeholder/i })` is an `svg`; `rect` count equals data length.

### Test 3: `PlaceholderChart_Unmount_DisconnectsObserver`
- **Setup**: Stub `ResizeObserver` with a spied `disconnect`.
- **Assert**: After `unmount()`, `disconnect` was called and the svg has no children.

### Test 4: `PlaceholderChart_Render_MakesNoNetworkRequest`
- **Setup**: `vi.spyOn(globalThis, 'fetch')`.
- **Assert**: `fetch` not called.

### Test 5: `DashboardCard_Render_ShowsTitleAndChildren`
- **Setup**: Render with title and `<span>child</span>`.
- **Assert**: Both visible.

### Test 6: `ChartErrorBoundary_ChildThrows_RendersFallback`
- **Setup**: Child that throws; silence `console.error`.
- **Assert**: `role="alert"` fallback text shown, sibling content outside the boundary still present.

### Test 7: `HomePage_OneChartThrows_OtherCardsStillRendered`
- **Setup**: `vi.mock` `PlaceholderChart` to throw for one title only.
- **Assert**: One fallback alert, three charts and four card titles present.

### Test 8: `RequireAuth_SessionValid_RendersChildren`
- **Setup**: MSW `GET /api/user/me` returns 200.
- **Assert**: Child rendered; `window.location.replace` not called.

### Test 9: `RequireAuth_Unauthorized_RedirectsToLoginWithoutChildren`
- **Setup**: MSW returns 401; spy on `window.location.replace`.
- **Assert**: Called with `/login`; child never in the document.

### Test 10: `AppRouter_RootPathAuthenticated_RendersHomePage`
- **Setup**: `MemoryRouter` at `/` (or `window.history.pushState`), MSW 200.
- **Assert**: Four cards visible.

### Test 11: `AppRouter_RootPathUnauthenticated_RedirectsToLogin`
- **Setup**: MSW 401.
- **Assert**: `window.location.replace('/login')`; no cards rendered.

### Test 12: `OAuthCallback_Success_RedirectsToRoot` (backend, only if a supertest-style harness is added; otherwise covered by E2E)
- **Setup**: Mock `handleOAuthCallback`; request with matching cookie and state.
- **Assert**: 302 with `Location: /`.

### E2E (`e2e/homepage.spec.ts`)
- `homepage_DesktopViewport_ShowsTwoByTwoGrid`: viewport 1280x800, mock `/api/user/me` as 200; assert four cards, each with an `svg[role=img]`, and the card bounding boxes form two distinct `y` rows and two distinct `x` columns.
- `homepage_MobileViewport_StacksCardsInOneColumn`: viewport 375x667; assert all cards share the same `x` and have increasing `y`, and `document.documentElement.scrollWidth <= clientWidth`.

---

## Verification

```bash
# 1. Build passes
yarn build

# 2. Relevant test files pass
yarn test src/frontend/pages src/frontend/components/__tests__ src/frontend/features/user

# 3. Full suite and lint
yarn test
yarn lint

# 4. E2E (after `yarn install` and `yarn playwright install --with-deps chromium`;
#    requires the node-modules linker, see Key Technical Decisions)
yarn test:e2e
```

Manual: with real GitHub credentials in `src/.env`, run `yarn dev`, open `https://localhost:3000/` signed out (expect redirect to GitHub), complete login (expect landing on `/` with four cards), then resize across 900px and down to 320px to confirm the layout switches without reload or horizontal scrolling.
