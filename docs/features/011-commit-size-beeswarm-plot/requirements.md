# Requirements Document

## Introduction

Box plots and histograms summarise commit sizes but hide individual commits, especially the few very large outliers that dominate totals. A beeswarm (strip) plot places one dot per commit along a shared size axis, with dots nudged apart so none overlap. This feature adds a beeswarm chart of commit size to the repo page, letting users see the whole distribution and pick out and open individual outliers.

## Requirements

### Requirement 1

**User Story:** As a user, I want a beeswarm plot of commit sizes, so that I can see every commit and spot outliers.

#### Acceptance Criteria

1. WHEN commits are loaded THEN the system SHALL draw one dot per commit positioned on a horizontal axis by the selected size metric.
2. WHEN dots would overlap THEN the system SHALL offset them vertically using a collision-avoiding layout (`d3.forceSimulation` with `forceCollide`, run to completion before drawing) so no two dots overlap.
3. WHEN the user selects a metric (additions, deletions, changed files or additions plus deletions) THEN the system SHALL redraw the plot for that metric.
4. WHEN the user toggles a log x scale THEN the system SHALL redraw with a log axis, with zero values handled consistently with other charts.

### Requirement 2

**User Story:** As a user, I want to identify and open individual commits, so that I can investigate outliers.

#### Acceptance Criteria

1. WHEN the user hovers or focuses on a dot THEN the system SHALL show a tooltip with short oid, author (or "Unknown"), date (or "No date") and the metric value.
2. WHEN the user activates a dot THEN the system SHALL open the commit on GitHub in a new tab with `rel="noopener noreferrer"`.
3. WHEN the chart is drawn THEN the system SHALL draw labelled reference marks for the median and 90th percentile of the selected metric.
4. WHEN the largest commit is drawn THEN the system SHALL label it directly with its short oid.

### Requirement 3

**User Story:** As a user, I want sensible behavior for small or unusual data, so that the plot never looks broken.

#### Acceptance Criteria

1. IF no commits are loaded THEN the system SHALL show the standard empty state.
2. IF all values are equal THEN the system SHALL stack dots vertically at one x position without overlap.
3. IF there is a single commit THEN the system SHALL render one dot.
4. WHEN `hasNextPage` is true THEN the system SHALL state that the plot covers the latest N commits only.

## Non-Functional Requirements

### Code Architecture and Modularity
- Implement the layout (positions) as a pure function that takes values and a scale and returns dot coordinates, separate from the rendering component, so it can be tested without a DOM.
- Reuse the shared chart scaffolding and tooltip used by other repo charts.

### Performance
- The collision layout for 100 dots finishes in under 100 ms and is computed once per metric/scale change, not per animation frame. It must remain acceptable up to 1,000 dots.

### Security
- Commit links are built from the validated owner/repository and `oid`; tooltip text is rendered as text, never as HTML.

### Reliability
- The layout is deterministic for the same input (fixed simulation seed or a deterministic algorithm) so tests and re-renders are stable.
- Null authors, dates and non-numeric values never throw.

### Usability
- Dots are focusable and operable by keyboard. Axis is labelled with units. The plot remains legible at 360 px width.

### Unit Testing
- Test the layout function: no overlapping dots, deterministic output, all-equal values, single value, empty input, and log scale positions.

### Integration Testing
- Test the component renders one dot per mocked commit, switches metric, shows tooltip content on focus, builds the correct link and shows the empty state.

### E2E Testing
- N/A — no E2E framework is configured.
