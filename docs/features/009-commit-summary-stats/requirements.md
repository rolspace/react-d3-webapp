# Requirements Document

## Introduction

Charts show shape, but users also want a few exact numbers: how many lines the loaded commits added and removed, and what a typical and a large commit looks like. These values cannot be derived from bucketed counts but are trivial with raw commit rows. This feature adds a summary statistics panel to the repo page showing totals, net growth, median and 90th percentile commit size, and a ranked list of the largest commits.

## Requirements

### Requirement 1

**User Story:** As a user, I want headline totals for the loaded commits, so that I can understand the overall scale of recent changes at a glance.

#### Acceptance Criteria

1. WHEN commits are loaded THEN the system SHALL show the number of commits, total additions, total deletions and net lines (additions minus deletions).
2. WHEN numbers are shown THEN the system SHALL format them with thousands separators.
3. WHEN net lines is negative THEN the system SHALL show the minus sign and SHALL NOT rely on color alone to convey direction.

### Requirement 2

**User Story:** As a user, I want typical and large commit sizes, so that I can tell whether a repository favors small or large changes.

#### Acceptance Criteria

1. WHEN commits are loaded THEN the system SHALL show the median and 90th percentile (linear interpolation, `d3.quantile`) for additions, deletions and changed files.
2. WHEN a metric has no numeric values THEN the system SHALL show a placeholder dash for that metric.
3. IF there is only one commit THEN the system SHALL show that commit's values as the median and 90th percentile.

### Requirement 3

**User Story:** As a user, I want a list of the largest commits, so that I can find outliers and open them on GitHub.

#### Acceptance Criteria

1. WHEN commits are loaded THEN the system SHALL list the top 10 commits ranked by additions plus deletions, showing the short oid (7 characters), author, additions, deletions and changed files.
2. WHEN fewer than 10 commits exist THEN the system SHALL list all of them.
3. WHEN a commit row is activated THEN the system SHALL open the commit's GitHub page (`https://github.com/{owner}/{repo}/commit/{oid}`) in a new tab with `rel="noopener noreferrer"`.
4. IF a commit's author is null THEN the system SHALL display "Unknown".

### Requirement 4

**User Story:** As a user, I want the panel to state its coverage, so that totals are not mistaken for the whole history.

#### Acceptance Criteria

1. WHEN the panel is shown THEN the system SHALL label totals as covering the latest N commits.
2. WHEN `hasNextPage` is true THEN the system SHALL add a note that older commits are not included.
3. IF no commits are loaded THEN the system SHALL show the standard empty state.

## Non-Functional Requirements

### Code Architecture and Modularity
- Compute all statistics in pure functions in `src/frontend/utils/`, separate from the Material-UI presentation components.
- Build the panel from existing Material-UI components and theme tokens.

### Performance
- All statistics for 100 commits compute in under 10 ms and are memoized on the commits array.

### Security
- Build commit links only from the validated owner/repository in the store and the `oid` string; encode path segments. No author-supplied text is rendered as HTML.

### Reliability
- Null authors and missing numeric values never throw.
- Sorting for the top-10 list is stable and deterministic (ties broken by order in the response).

### Usability
- Panel is responsive and stacks to one column at 360 px; the list is a semantic table with column headers.

### Unit Testing
- Test totals, net lines, median/p90 (odd and even counts, single value, empty), top-10 ranking with ties and fewer than 10 rows, and short-oid formatting.

### Integration Testing
- Test the panel renders values for mocked rows, shows "Unknown" for null authors, builds the correct commit link and shows the coverage note.

### E2E Testing
- N/A — no E2E framework is configured.
