# Requirements Document

## Introduction

After GitHub OAuth login, users have no dedicated landing page that organizes the application's visualizations. This feature redirects authenticated users to a homepage that presents four sections in a 2x2 grid of Material UI cards. Each card initially renders a placeholder chart, establishing the layout that later features will fill with real repository data visualizations.

## Requirements

### Requirement 1

**User Story:** As an authenticated user, I want to be redirected to the homepage after logging in, so that I land on a central view of the application.

#### Acceptance Criteria

1. WHEN the GitHub OAuth callback completes successfully THEN the system SHALL redirect the user to the homepage route (`/`).
2. IF an unauthenticated user navigates to the homepage route THEN the system SHALL redirect the user to the login flow and SHALL NOT render the homepage content.
3. WHEN an authenticated user navigates directly to the homepage route THEN the system SHALL render the homepage without requiring another login.
4. WHEN the OAuth callback fails THEN the system SHALL NOT redirect to the homepage and SHALL display the existing login error behavior.

### Requirement 2

**User Story:** As an authenticated user, I want the homepage to show four sections in a 2x2 grid of cards, so that I can see multiple areas of the application at a glance.

#### Acceptance Criteria

1. WHEN the homepage renders THEN the system SHALL display exactly four Material UI `Card` components.
2. WHEN the viewport width is 900px (MUI `md` breakpoint) or wider THEN the system SHALL arrange the cards in two rows of two columns, with equal card widths and consistent spacing.
3. WHEN the viewport width is below 900px THEN the system SHALL stack the cards in a single column.
4. WHEN a card renders THEN the system SHALL display a title identifying its section.
5. WHEN the viewport is resized across the breakpoint THEN the system SHALL update the layout without a page reload.

### Requirement 3

**User Story:** As an authenticated user, I want each card to contain a placeholder chart, so that I can see where future visualizations will appear.

#### Acceptance Criteria

1. WHEN a card renders THEN the system SHALL display a placeholder D3 chart inside the card content area.
2. WHEN the placeholder chart renders THEN the system SHALL use static, hard-coded sample data and SHALL NOT make any network request.
3. WHEN the card width changes THEN the system SHALL resize the chart to fit the card without overflow or horizontal scrolling.
4. IF a chart fails to render THEN the system SHALL display a fallback message within that card and SHALL keep the other three cards rendered.
5. WHEN a placeholder chart renders THEN the system SHALL provide an accessible name (`aria-label`) describing the chart and indicating it is placeholder content.

## Non-Functional Requirements

### Code Architecture and Modularity
- Implement the homepage as a page component under `src/frontend/pages/`, registered in the React Router configuration.
- Implement a reusable card component (title plus chart slot) and a reusable placeholder chart component so each card can later swap in a real chart without changing the grid.
- Define the four card configurations (id, title) in a single data array and render the grid from it, rather than duplicating markup.
- Use Material UI layout components (`Grid` or `Box` with CSS grid) and the existing theme; do not add new styling libraries.

### Performance
- The homepage SHALL reach first render of all four cards within 1 second of route activation on a development machine, as no data fetching occurs.
- Chart resize handling SHALL be debounced or use `ResizeObserver` and SHALL NOT cause layout thrashing.

### Security
- The homepage route SHALL be protected by the existing authentication state; no repository or user data is exposed to unauthenticated users.
- Placeholder charts SHALL NOT render user-supplied content.

### Reliability
- A failure in one card's chart SHALL be isolated (for example via an error boundary) and SHALL NOT unmount the other cards.
- D3 charts SHALL clean up their DOM nodes and observers on unmount to prevent leaks.

### Usability
- Cards SHALL use consistent padding, elevation, and typography from the MUI theme.
- The layout SHALL remain usable from 320px to 1920px viewport width.
- Card titles SHALL meet WCAG 2.1 AA contrast requirements.

### Unit Testing
- Test the homepage renders exactly four cards with the expected titles.
- Test the placeholder chart component renders an SVG with the expected `aria-label` and sample data marks.
- Test the card component renders its title and children.
- Test the error fallback renders when a chart throws.
- Follow the existing Vitest frontend configuration (`src/vitest.config.frontend.ts`) with tests co-located in `__tests__/` directories.

### Integration Testing
- Test the router redirects an authenticated user to the homepage and an unauthenticated user to login.
- Test the post-login redirect lands on the homepage using the mocked auth state (MSW where API calls are involved).
- Test that a failing chart does not affect the other cards within the full page.

### E2E Testing
- Test the full flow: complete login, land on the homepage, and see four cards each containing a chart.
- Test that at a desktop viewport (1280px wide) the cards form a 2x2 grid, and at a mobile viewport (375px wide) they stack in one column.
