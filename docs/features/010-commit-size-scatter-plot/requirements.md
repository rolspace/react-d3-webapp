# Requirements Document

## Introduction

Histograms and distributions treat additions, deletions and files changed one at a time, hiding how they relate. A scatter plot of additions against deletions, with bubble size for files changed, separates growth commits, deletion-heavy cleanups, refactors and broad edits, and shows outliers as individual points. With raw commit rows in the frontend store this needs no backend change. This feature adds that scatter/bubble chart to the repo page.

## Requirements

### Requirement 1

**User Story:** As a user, I want a scatter plot of additions versus deletions per commit, so that I can see what kind of changes a repository makes.

#### Acceptance Criteria

1. WHEN commits are loaded THEN the system SHALL draw one point per commit with x = additions and y = deletions.
2. WHEN the chart is drawn THEN the system SHALL size each point by `changedFiles` using a square-root scale with a minimum and maximum radius.
3. WHEN the chart is drawn THEN the system SHALL draw a diagonal reference line where additions equal deletions, labelled as such.
4. WHEN the user toggles a log scale THEN the system SHALL apply it to both axes, with zero values handled by a documented offset consistent with other charts.

### Requirement 2

**User Story:** As a user, I want to inspect individual points, so that I can identify outliers and open the commit.

#### Acceptance Criteria

1. WHEN the user hovers or focuses on a point THEN the system SHALL show a tooltip with short oid, author (or "Unknown"), date (or "No date"), additions, deletions and changed files.
2. WHEN the user activates a point THEN the system SHALL open the commit on GitHub in a new tab with `rel="noopener noreferrer"`.
3. WHEN points overlap THEN the system SHALL draw them with partial opacity so density remains visible.

### Requirement 3

**User Story:** As a user, I want the chart to handle edge cases gracefully, so that it never appears broken.

#### Acceptance Criteria

1. IF no commits are loaded THEN the system SHALL show the standard empty state.
2. IF all commits have identical values THEN the system SHALL render the points at a padded, non-degenerate scale domain.
3. IF a commit has zero additions and zero deletions THEN the system SHALL still draw it at the origin (or log offset).
4. WHEN `hasNextPage` is true THEN the system SHALL state that the plot covers the latest N commits only.

## Non-Functional Requirements

### Code Architecture and Modularity
- Separate scale/domain computation (pure, testable) from the D3 rendering component.
- Reuse the shared chart scaffolding and tooltip used by other repo charts.

### Performance
- Rendering 100 points, including hover interaction, stays above 60 fps; the design must remain acceptable up to 1,000 points.

### Security
- Commit links are built from the validated owner/repository and `oid`; tooltip text is rendered as text, never as HTML.

### Reliability
- Null authors and dates never throw. Points with non-numeric values are skipped.

### Usability
- Axes are labelled with units and the size legend explains bubble area. Points are focusable and operable by keyboard. Chart remains legible at 360 px width.

### Unit Testing
- Test domain computation (including all-equal, zero and log cases), radius scale bounds, and tooltip content formatting.

### Integration Testing
- Test the component renders one point per mocked commit, shows tooltip content on focus, builds the correct link and shows the empty state.

### E2E Testing
- N/A — no E2E framework is configured.
