# Requirements Document

## Introduction

`src/backend/lib/github/parser.ts` exposes `parseRepoEdges`, which converts raw commit edges into bucketed `SeriesItem[]` ranges for each requested `CommitNode` property (currently `additions`, `deletions`, and `changedFiles`, as called from `src/backend/routes/repo.ts`). Today, `createRanges` is invoked independently per property, so `additions` and `deletions` each get their own min/max and bucket boundaries derived only from their own values. Because these two metrics represent the same underlying unit (lines changed) and are typically compared side-by-side in the frontend's D3 visualizations, using different bucket boundaries for each makes cross-series comparison misleading. This feature changes `parseRepoEdges` so that `additions` and `deletions` share one set of computed range boundaries (min, max, bucket edges/labels), while each property's own commit values still populate its own per-bucket counts. `changedFiles` is a different unit (file count) and must continue to be ranged independently, exactly as it is today.

## Requirements

### Requirement 1

**User Story:** As a developer, I want `additions` and `deletions` to be bucketed using one shared set of range boundaries, so that the resulting series are directly comparable on the same scale.

#### Acceptance Criteria

1. WHEN `parseRepoEdges` is called with a `properties` array containing both `'additions'` and `'deletions'` THEN the system SHALL derive the range boundaries (min value, max value, number of buckets, bucket min/max/label for each of the 20 buckets) from the combined set of numeric `additions` and `deletions` values found across all edges.
2. WHEN the shared boundaries are computed THEN the system SHALL produce a `SeriesItem[]` for `'additions'` and a separate `SeriesItem[]` for `'deletions'`, both using identical `min`/`max`/`label` values per bucket index, differing only in each bucket's `count`.
3. WHEN counts are assigned THEN the system SHALL bucket each edge's `additions` value into the shared boundaries using only `additions` values (and likewise bucket each edge's `deletions` value using only `deletions` values), so counts reflect each property's own data distributed across the shared scale.
4. IF an `additions` or `deletions` value falls outside the shared min/max (possible when one property's individual extreme differs from the combined extreme) THEN the system SHALL clamp it into the nearest boundary bucket (first or last), consistent with the existing clamping behavior in `createRanges`.

### Requirement 2

**User Story:** As a developer, I want `changedFiles` to keep using its own independently computed range, so its distribution isn't distorted by the magnitude of line-change data.

#### Acceptance Criteria

1. WHEN `parseRepoEdges` is called with `'changedFiles'` in the `properties` array THEN the system SHALL compute its range boundaries and counts using only `changedFiles` values, unaffected by any `additions`/`deletions` values or boundaries.
2. WHEN `properties` includes `'changedFiles'` alongside `'additions'` and/or `'deletions'` THEN the system SHALL NOT alter the existing per-property independent-ranging behavior for `changedFiles`.

### Requirement 3

**User Story:** As a developer, I want the shared-range behavior to degrade sensibly when only one of `additions`/`deletions` is requested or when data is missing, so `parseRepoEdges` doesn't break existing callers or edge cases.

#### Acceptance Criteria

1. IF `properties` contains only one of `'additions'` or `'deletions'` (not both) THEN the system SHALL compute that property's range independently from its own values, matching current behavior.
2. IF neither `'additions'` nor `'deletions'` has any numeric values across all edges THEN the system SHALL log a warning for each affected property and set its `commitData` entry to `[]`, matching current behavior.
3. IF exactly one of `'additions'` or `'deletions'` has numeric values and the other does not THEN the system SHALL derive the shared boundaries from the property that has values, log a warning for the empty property, and set the empty property's entry to `[]`.
4. WHEN all combined `additions`/`deletions` values are equal THEN the system SHALL apply the existing single-bucket fallback (as in `createRanges` today) using that shared value for both properties' boundaries.

## Non-Functional Requirements

### Code Architecture and Modularity
- Refactor `parser.ts` so range-boundary computation (min/max/bucket edges) is separable from count assignment, allowing boundaries computed from a combined `additions`+`deletions` dataset to be reused when assigning counts for each property individually. Prefer extracting/adjusting helper functions over duplicating `createRanges` logic.
- `createRanges`'s existing signature and behavior must remain unchanged for callers that pass a single property's data (e.g. `changedFiles`), preserving backward compatibility for any other current or future single-property use.
- Keep `parseRepoEdges`'s public signature (`edges`, `properties`) and return shape (`RepoCommitData[]`) unchanged; this is an internal bucketing behavior change only.

### Performance
- No material performance impact expected; the change is still O(n) over edges per requested property, with one extra pass to combine `additions`/`deletions` values when both are requested.

### Security
- N/A — no new external input, network, or auth surface is introduced.

### Reliability
- Preserve existing error/warning logging via `logger` for missing or empty numeric data, applied per property as described in Requirement 3.
- `createRanges`'s existing input validation (throwing on empty/invalid data) must still apply appropriately to the combined `additions`/`deletions` dataset and to `changedFiles`'s independent dataset.

### Usability
- N/A — backend data-shaping change; no direct UI surface, though it improves the accuracy of frontend chart comparisons between additions and deletions series.

### Unit Testing
- Add/extend tests in `src/backend/lib/github/__tests__/` (or equivalent) covering:
  - `additions` and `deletions` produce identical bucket `min`/`max`/`label` values but distinct `count` values when both are requested.
  - `changedFiles` ranges remain unaffected by and independent of `additions`/`deletions` data.
  - Only `additions` or only `deletions` requested (not both) falls back to independent ranging.
  - One of `additions`/`deletions` empty while the other has values (warning logged, empty array returned for the empty one, shared range still derived from the non-empty one).
  - Both `additions` and `deletions` empty (existing warn + `[]` behavior for both).
  - All combined `additions`/`deletions` values equal (single-bucket fallback shared across both properties).

### Integration Testing
- Verify `src/backend/routes/repo.ts`'s call to `parseRepoEdges(edges, ['additions', 'deletions', 'changedFiles'])` returns a `RepoCommitData[]` where `additions` and `deletions` bucket boundaries match, `changedFiles` is unaffected, and the overall response shape/contract to the frontend is unchanged.

### E2E Testing
- N/A — this is an internal backend data-shaping change with no new user-facing flow; existing E2E/manual verification of the repo data visualization page is sufficient to confirm no regressions.
