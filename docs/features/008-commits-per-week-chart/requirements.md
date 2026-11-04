# Requirements Document

## Introduction

The repo page currently shows no information about when commits happen. Each commit row carries a date, so the frontend can group commits by week and show activity over time. This feature adds a commits-per-week bar chart to the repo page. It shows how active a repository is and reveals bursts and quiet periods in the loaded commit window.

## Requirements

### Requirement 1

**User Story:** As a user, I want a chart of commits per week, so that I can see how active the repository has been over time.

#### Acceptance Criteria

1. WHEN commits are loaded THEN the system SHALL group commits with a valid date into calendar weeks (weeks starting Monday, using UTC) and draw one bar per week with height equal to the commit count.
2. WHEN a week inside the covered range has no commits THEN the system SHALL draw it as a zero-height bar so the time axis is continuous.
3. WHEN the chart is drawn THEN the system SHALL use a time-scale x axis labelled with week start dates and a y axis starting at zero.
4. WHEN the user hovers or focuses on a bar THEN the system SHALL show a tooltip with the week start date and the commit count.

### Requirement 2

**User Story:** As a user, I want commits without a usable date handled transparently, so that the chart is not silently misleading.

#### Acceptance Criteria

1. IF a commit's `date` is null or cannot be parsed THEN the system SHALL exclude it from the bars.
2. WHEN one or more commits are excluded THEN the system SHALL show a note with the number of commits excluded.
3. IF no commit has a valid date THEN the system SHALL show an empty state explaining that no dated commits are available.

### Requirement 3

**User Story:** As a user, I want to understand the time window covered, so that I do not mistake a recent window for the repository's entire history.

#### Acceptance Criteria

1. WHEN the chart is shown THEN the system SHALL display the first and last dates covered.
2. WHEN `hasNextPage` is true THEN the system SHALL state that only the latest commits are included.
3. IF all commits fall in one week THEN the system SHALL render a single bar without error.

## Non-Functional Requirements

### Code Architecture and Modularity
- Put the weekly grouping in a pure function in `src/frontend/utils/` using `d3.timeWeek`/`d3.utcMonday` and `d3.rollup`, tested apart from rendering.
- Reuse the shared chart scaffolding used by the other repo charts.

### Performance
- Grouping and drawing 100 commits must take under 50 ms.

### Security
- N/A — no new external input.

### Reliability
- Invalid dates never throw; they are counted and excluded.
- Grouping uses UTC consistently so results do not depend on the viewer's time zone.

### Usability
- Axis labels thin out to avoid overlap on narrow widths; chart remains readable at 360 px.
- Bars have sufficient contrast and a text alternative summarising total commits and range.

### Unit Testing
- Test weekly grouping for: commits in the same week, gap weeks filled with zero, null and invalid dates excluded and counted, week boundary at Sunday/Monday UTC, single week, empty input.

### Integration Testing
- Test the component renders the expected bars for mocked rows and shows the exclusion note and empty state.

### E2E Testing
- N/A — no E2E framework is configured.
