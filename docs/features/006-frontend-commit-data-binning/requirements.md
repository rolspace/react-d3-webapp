# Requirements Document

## Introduction

The repo endpoint is changing from pre-bucketed histograms to raw commit rows (`{ oid, date, additions, deletions, changedFiles, author }`, wrapped as `{ commits, hasNextPage }`). The frontend store (`src/frontend/stores/repoStore.ts`) and `RepoCommits.tsx` currently consume the bucketed shape via `createHighRange` and `createLowRange`. This feature updates the store to hold raw commits and adds a reusable binning utility built on `d3.bin()`, so the existing additions, deletions and changed-files charts keep working from raw data. It is the foundation every new graph builds on.

## Requirements

### Requirement 1

**User Story:** As a frontend developer, I want the repo store to hold the raw commit rows returned by the API, so that every chart can derive its own view of the data.

#### Acceptance Criteria

1. WHEN `fetchRepo` succeeds THEN the system SHALL store the response's `commits` array and `hasNextPage` flag in the store.
2. WHEN `fetchRepo` starts, fails, or `setRepo`/`clearRepo` is called THEN the system SHALL reset `commits` to an empty array and `hasNextPage` to false.
3. WHEN `fetchRepo` fails THEN the system SHALL set status to Failure and keep the existing error behavior (error stored and rethrown).
4. WHEN the store exposes commit data THEN the system SHALL type each row to match the API contract, with `date` and `author` nullable.

### Requirement 2

**User Story:** As a frontend developer, I want a binning utility with shared thresholds, so that additions and deletions can be compared on the same scale.

#### Acceptance Criteria

1. WHEN the utility is called with the additions and deletions series and a bin count THEN the system SHALL compute one set of thresholds from the combined extent of both series and return bins for each series over those thresholds.
2. WHEN the utility is called with a single series (changed files) THEN the system SHALL compute thresholds from that series only.
3. WHEN all values are equal THEN the system SHALL return a single bin containing every value.
4. WHEN a series is empty THEN the system SHALL return an empty array and SHALL NOT throw.
5. WHEN the bin count is not provided THEN the system SHALL default to 20 bins to match current behavior.
6. WHEN the caller selects a log scale THEN the system SHALL compute thresholds on a log domain (values of zero handled with a documented offset) so skewed distributions remain readable.

### Requirement 3

**User Story:** As a user, I want the existing commit charts to look and behave as they do now, so that the migration causes no regression.

#### Acceptance Criteria

1. WHEN a repository is loaded THEN the system SHALL render the additions, deletions and changed-files charts from the raw rows through the binning utility.
2. WHEN additions and deletions are shown together THEN the system SHALL use shared thresholds so both bar sets align on one axis.
3. WHEN the page is in Pending, Failure or empty state THEN the system SHALL show the same loading, error and empty states as today.
4. WHEN this feature is complete THEN the system SHALL remove `createHighRange`/`createLowRange` and any bucketed-shape types that are no longer used.

### Requirement 4

**User Story:** As a user, I want to adjust how many bins the histograms use, so that I can see coarser or finer distributions.

#### Acceptance Criteria

1. WHEN the histogram view is shown THEN the system SHALL provide a control to set the bin count between 5 and 50.
2. WHEN the user changes the bin count THEN the system SHALL re-bin the stored commits and redraw without a new network request.
3. WHEN the user toggles between linear and log scale THEN the system SHALL redraw the histograms with the chosen scale.

## Non-Functional Requirements

### Code Architecture and Modularity
- Place the binning utility in `src/frontend/utils/` (or `services/`) as pure functions with no React or store imports.
- Keep data fetching in the store and presentation in components; charts receive binned data via props.
- Add `d3` modules via the existing `d3` dependency; do not add a second charting library.

### Performance
- Re-binning 100 rows on bin-count change must feel instant (under 50 ms); memoize derived bins per commits/bin-count/scale.

### Security
- N/A — no new external input; data is rendered through D3/React, not injected as HTML.

### Reliability
- Null `date` and `author` values must not break binning, since only numeric fields are binned.
- The store must never hold the previous repository's commits after a failed fetch.

### Usability
- Bin-count and scale controls are keyboard-accessible and have visible labels.
- Chart axis labels show the actual bin ranges.

### Unit Testing
- Test the binning utility for: shared thresholds across two series, independent thresholds for one series, all-equal values, empty input, default bin count, log scale with zero values.
- Test the store's `fetchRepo` success, failure and reset paths with the new shape.

### Integration Testing
- Test `RepoCommits` renders bars for mocked raw rows, reacts to bin-count changes, and shows loading and error states.

### E2E Testing
- N/A — no E2E framework is configured.
