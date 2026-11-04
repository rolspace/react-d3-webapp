# Requirements Document

## Introduction

Histograms show how commits fall into ranges but cannot answer "what share of commits change fewer than N lines" exactly. With raw commit rows available in the frontend store, an empirical cumulative distribution function (ECDF) can be drawn with one step per commit and no bucketing error. This feature adds an ECDF chart for commit size (additions, deletions and changed files) to the repo page, giving users an exact view of how large typical commits are.

## Requirements

### Requirement 1

**User Story:** As a user, I want a cumulative distribution chart of commit sizes, so that I can see what share of commits are smaller than a given size.

#### Acceptance Criteria

1. WHEN commits are loaded THEN the system SHALL render a step line where x is the metric value and y is the fraction of commits with a value less than or equal to x, from 0 to 1.
2. WHEN the chart is drawn THEN the system SHALL use one step per distinct value computed from the raw rows, not from binned counts.
3. WHEN the user selects a metric (additions, deletions or changed files) THEN the system SHALL redraw the ECDF for that metric.
4. WHEN additions and deletions are both shown THEN the system SHALL draw both lines on one shared x axis with distinct, labelled colors.

### Requirement 2

**User Story:** As a user, I want to read exact percentages from the chart, so that I can answer questions like "how many commits are under 100 lines".

#### Acceptance Criteria

1. WHEN the user hovers or focuses on the chart THEN the system SHALL show a tooltip with the x value and the cumulative percentage at that point.
2. WHEN the chart is drawn THEN the system SHALL mark the median (50%) and 90th percentile with labelled reference lines.
3. WHEN the user toggles a log x scale THEN the system SHALL redraw with a log axis, with zero values handled consistently with the histogram scale option.

### Requirement 3

**User Story:** As a user, I want the chart to behave sensibly with little or unusual data, so that it never appears broken.

#### Acceptance Criteria

1. IF no commits are loaded THEN the system SHALL show the standard empty state and SHALL NOT render an empty axis.
2. IF all values are equal THEN the system SHALL render a single vertical step at that value.
3. IF there is a single commit THEN the system SHALL render without error.
4. WHEN the commit window is limited (`hasNextPage` is true) THEN the system SHALL state that the chart covers the latest N commits only.

## Non-Functional Requirements

### Code Architecture and Modularity
- Implement the ECDF computation as a pure function in `src/frontend/utils/`, separate from the D3 rendering component.
- Reuse the shared chart scaffolding (margins, axes, tooltip) used by the existing charts rather than duplicating it.

### Performance
- Computing and drawing the ECDF for 100 commits must complete in under 50 ms; redraws on metric change reuse the stored rows.

### Security
- N/A — no new external input.

### Reliability
- Null or non-numeric values are excluded from the computation without throwing.

### Usability
- Axes have labels and units; colors meet WCAG AA contrast and are not the only way to tell series apart (use direct labels or a legend).
- Tooltip is reachable by keyboard focus.

### Unit Testing
- Test the ECDF function: sorted output, cumulative fraction ends at 1, duplicate values collapse to one step, single value, empty input, percentile computation.

### Integration Testing
- Test the component renders the expected number of steps for mocked rows, switches metric, and shows the empty state.

### E2E Testing
- N/A — no E2E framework is configured.
