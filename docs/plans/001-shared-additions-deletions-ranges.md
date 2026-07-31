# Plan: Shared Additions/Deletions Ranges

## Context

`src/backend/lib/github/parser.ts` exports `parseRepoEdges`, which is called from `src/backend/routes/repo.ts` as `parseRepoEdges(edges, ['additions', 'deletions', 'changedFiles'])`. Today it loops over each requested property and calls the private `createRanges` helper independently per property, so `additions` and `deletions` each get bucket boundaries derived only from their own min/max. Per `docs/requirements/001-shared-additions-deletions-ranges.md`, `additions` and `deletions` must share one set of computed boundaries (min, max, 20 bucket edges/labels) derived from their combined values, while each still gets its own per-bucket `count`. `changedFiles` must remain completely independent, and `createRanges`'s existing signature/behavior must stay unchanged for single-property callers.

---

## Options Considered

### Option A: Extract boundary computation from count assignment, reuse for shared case
Split `createRanges`'s internals into `computeRangeBoundaries(values, numberOfRanges)` (min/max/bucket edges/labels, single-bucket fallback) and `assignCounts(boundaries, values)` (walks a value array and increments counts using the existing clamp formula). `createRanges` becomes a thin wrapper composing both, preserving its current signature and behavior. A new `assignSharedRanges` helper in `parser.ts` computes boundaries once from the combined `additions`+`deletions` values, then calls `assignCounts` twice (once per property) against that same boundary object.

**Pros**: No duplicated bucketing/clamping math; single source of truth for the algorithm; `createRanges` behavior is provably unchanged since it's just recomposing the same steps; matches the NFR's explicit instruction to extract rather than duplicate.
**Cons**: Slightly larger diff than a quick hack.

### Option B: Call `createRanges` twice with concatenated data, then re-derive counts manually
Keep `createRanges` monolithic; for the shared case, build a combined `DataItem[]` tagged under one key to get boundaries, then write a separate bucketing loop in `parser.ts` that duplicates the clamp/`Math.floor` math to assign per-property counts.

**Pros**: Avoids touching `createRanges` internals at all.
**Cons**: Duplicates the exact bucketing formula in two places, which will drift if `createRanges` ever changes; directly contradicts the NFR ("Prefer extracting/adjusting helper functions over duplicating `createRanges` logic").

**Chosen**: Option A — it satisfies the explicit modularity requirement, keeps `createRanges`'s public contract untouched, and eliminates any risk of the two bucketing implementations diverging.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/backend/lib/github/__tests__/parser.test.ts` | Unit tests for `parseRepoEdges` covering shared-range behavior, independence of `changedFiles`, single-property fallback, empty-data warnings, and the equal-values single-bucket fallback. |

---

## Files to Modify

| File | Change |
|---|---|
| `src/backend/lib/github/parser.ts` | Extract `computeRangeBoundaries` and `assignCounts` helpers from `createRanges`; add `assignIndependentRange` and `assignSharedRanges` helpers; rewrite `parseRepoEdges` to route `additions`/`deletions` through the shared-boundary path when both are requested, and everything else (including a lone `additions` or `deletions`, or `changedFiles`) through the existing independent path. |

---

## Implementation

### 1. `parser.ts` — extract boundary/count helpers from `createRanges`

Introduce an internal `RangeBoundaries` shape and two helpers that `createRanges` will compose, so the exact bucketing math is defined once:

```ts
interface RangeBoundaries {
  minValue: number
  maxValue: number
  rangeWidth: number
  ranges: SeriesItem[] // template ranges with count: 0
}

function extractSingleValues(data: DataItem[]): number[] {
  return data
    .map((item) => {
      const keys = Object.keys(item)
      return keys.length > 0 ? item[keys[0]] : null
    })
    .filter((val): val is number => typeof val === 'number')
}

function computeRangeBoundaries(values: number[], numberOfRanges: number): RangeBoundaries {
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  if (minValue === maxValue) {
    return {
      minValue,
      maxValue,
      rangeWidth: 0,
      ranges: [{ min: minValue, max: maxValue, count: 0, label: `${minValue}-${maxValue}` }],
    }
  }

  const rangeWidth = (maxValue - minValue) / numberOfRanges
  const ranges: SeriesItem[] = []
  for (let i = 0; i < numberOfRanges; i++) {
    const min = minValue + i * rangeWidth
    const max = i === numberOfRanges - 1 ? maxValue : minValue + (i + 1) * rangeWidth
    const minRange = i === 0 ? Math.floor(min) : Math.floor(min) + 1
    const maxRange = Math.floor(max)
    ranges.push({ min: minRange, max: maxRange, count: 0, label: `${minRange}-${maxRange}` })
  }

  return { minValue, maxValue, rangeWidth, ranges }
}

function assignCounts(boundaries: RangeBoundaries, values: number[]): SeriesItem[] {
  const ranges = boundaries.ranges.map((range) => ({ ...range, count: 0 }))

  if (ranges.length === 1) {
    ranges[0].count = values.length
    return ranges
  }

  values.forEach((value) => {
    const rangeIndex = Math.min(
      Math.floor((value - boundaries.minValue) / boundaries.rangeWidth),
      ranges.length - 1, // preserve existing upper clamp behavior
    )
    ranges[rangeIndex].count++
  })

  return ranges
}
```

### 2. `parser.ts` — recompose `createRanges` (signature/behavior unchanged)

```ts
function createRanges(data: DataItem[], numberOfRanges: number = 20): SeriesItem[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    const errorMsg = 'Invalid input: data must be a non-empty array'
    logger.error(errorMsg)
    throw new Error(errorMsg)
  }

  const values = extractSingleValues(data)

  if (values.length === 0) {
    const errorMsg = 'No valid numeric values found in data'
    logger.error(errorMsg)
    throw new Error(errorMsg)
  }

  const boundaries = computeRangeBoundaries(values, numberOfRanges)
  return assignCounts(boundaries, values)
}
```

This preserves the existing throw-on-empty validation and exact bucketing output for any current or future single-property caller (e.g. `changedFiles`).

### 3. `parser.ts` — route `additions`/`deletions` through a shared path

```ts
const SHARED_RANGE_PROPERTIES: ReadonlyArray<keyof CommitNode> = ['additions', 'deletions']

function extractPropertyValues(edges: CommitEdge[], prop: keyof CommitNode): number[] {
  return edges
    .map((edge) => edge.node[prop])
    .filter((val): val is number => typeof val === 'number')
}

function assignIndependentRange(
  edges: CommitEdge[],
  prop: keyof CommitNode,
  commitData: RepoCommitData,
  numberOfRanges = 20,
): void {
  const values = extractPropertyValues(edges, prop)

  if (values.length === 0) {
    logger.warn(`No numeric values found for property '${prop}' in commit edges`)
    commitData[prop] = []
    return
  }

  commitData[prop] = createRanges(
    values.map((val) => ({ [prop]: val }) as DataItem),
    numberOfRanges,
  )
}

function assignSharedRanges(
  edges: CommitEdge[],
  props: (keyof CommitNode)[],
  commitData: RepoCommitData,
  numberOfRanges = 20,
): void {
  const valuesByProp = new Map(props.map((prop) => [prop, extractPropertyValues(edges, prop)]))
  const combinedValues = props.flatMap((prop) => valuesByProp.get(prop) as number[])

  if (combinedValues.length === 0) {
    props.forEach((prop) => {
      logger.warn(`No numeric values found for property '${prop}' in commit edges`)
      commitData[prop] = []
    })
    return
  }

  const boundaries = computeRangeBoundaries(combinedValues, numberOfRanges)

  props.forEach((prop) => {
    const values = valuesByProp.get(prop) as number[]

    if (values.length === 0) {
      logger.warn(`No numeric values found for property '${prop}' in commit edges`)
      commitData[prop] = []
      return
    }

    commitData[prop] = assignCounts(boundaries, values)
  })
}
```

### 4. `parser.ts` — rewrite `parseRepoEdges`

```ts
export function parseRepoEdges(edges: CommitEdge[], properties: (keyof CommitNode)[]): RepoCommitData[] {
  const commitData: RepoCommitData = {}

  const sharedProps = properties.filter((prop) => SHARED_RANGE_PROPERTIES.includes(prop))
  const independentProps = properties.filter((prop) => !SHARED_RANGE_PROPERTIES.includes(prop))

  if (sharedProps.length === 2) {
    assignSharedRanges(edges, sharedProps, commitData)
  } else {
    sharedProps.forEach((prop) => assignIndependentRange(edges, prop, commitData))
  }

  independentProps.forEach((prop) => assignIndependentRange(edges, prop, commitData))

  return [commitData]
}
```

Before/after summary:

```ts
// Before: every property (including additions/deletions) ranged independently
properties.forEach((prop) => { /* independent createRanges call */ })

// After: additions+deletions share boundaries when both requested;
// any other combination (one of them alone, or changedFiles) is unaffected
```

`src/backend/routes/repo.ts` requires no changes — `parseRepoEdges(edges, ['additions', 'deletions', 'changedFiles'])` automatically gets the new shared-boundary behavior for the first two and unchanged behavior for `changedFiles`.

---

## Key Technical Decisions

- **Boundaries computed from the combined value array, not merged `SeriesItem[]`**: Combining raw numeric values before bucketing (rather than trying to merge two already-bucketed range sets) guarantees `computeRangeBoundaries` sees the true combined min/max, matching Requirement 1.1 exactly and reusing the same code path as the single-property case.
- **`assignCounts` clones the boundary template per call**: `boundaries.ranges` is a shared template with `count: 0`; each property gets its own mapped copy so counting for `additions` never mutates the counts used for `deletions`.
- **No explicit lower-bound clamp added**: Since `boundaries.minValue` is the min of the combined set, every individual `additions`/`deletions` value is `>= minValue` by construction, so `Math.floor((value - minValue) / rangeWidth)` is always `>= 0`. Only the existing upper clamp (`Math.min(..., ranges.length - 1)`) is needed, preserving current behavior per Requirement 1.4.
- **`sharedProps.length !== 2` falls back to `assignIndependentRange` per property**: This single branch naturally covers both "only one of additions/deletions requested" (Requirement 3.1) and "properties array omits both" (empty loop, no-op) without extra conditionals.

---

## Tests to Add

All tests live in `src/backend/lib/github/__tests__/parser.test.ts`, importing `parseRepoEdges` from `../parser.js` and building minimal `CommitEdge[]` fixtures (`{ node: { additions, deletions, changedFiles, pushedDate: null, oid: 'x', author: { user: { login: 'a' } } } }`). Use `vi.spyOn(logger, 'warn')` per the project's existing spy convention.

### Test 1: `parseRepoEdges_AdditionsAndDeletionsRequested_ProduceIdenticalBoundariesWithDistinctCounts`
- **Setup**: Edges with varied `additions` and `deletions` values (different distributions). Call `parseRepoEdges(edges, ['additions', 'deletions'])`.
- **Assert**: `result[0].additions.map(r => ({min:r.min,max:r.max,label:r.label}))` deep-equals the same projection of `result[0].deletions`; at least one bucket index has a different `count` between the two.

### Test 2: `parseRepoEdges_ChangedFilesWithAdditionsAndDeletions_RemainsIndependent`
- **Setup**: Edges with `changedFiles` values on a very different scale than `additions`/`deletions`. Call with `['additions', 'deletions', 'changedFiles']`.
- **Assert**: `changedFiles` bucket boundaries are derived only from `changedFiles` values (min/max match `Math.min`/`Math.max` of that property), unaffected by the shared additions/deletions boundaries.

### Test 3: `parseRepoEdges_OnlyAdditionsRequested_RangesIndependently`
- **Setup**: Edges with `additions` values. Call with `['additions']`.
- **Assert**: Output matches calling the pre-refactor independent bucketing (spot-check min/max/label/count against manually computed expected buckets).

### Test 4: `parseRepoEdges_DeletionsEmptyAdditionsPopulated_WarnsAndReturnsEmptyForDeletions`
- **Setup**: Edges where every `deletions` value is non-numeric/absent but `additions` has values. Call with `['additions', 'deletions']`.
- **Assert**: `logger.warn` called once mentioning `'deletions'`; `result[0].deletions` equals `[]`; `result[0].additions` is non-empty and its boundaries derive from `additions`' own min/max (equal to the combined set since `deletions` contributed nothing).

### Test 5: `parseRepoEdges_AdditionsAndDeletionsBothEmpty_WarnsForBothAndReturnsEmptyArrays`
- **Setup**: Edges with no numeric `additions`/`deletions` values. Call with `['additions', 'deletions']`.
- **Assert**: `logger.warn` called twice (once per property); `result[0].additions` and `result[0].deletions` both equal `[]`.

### Test 6: `parseRepoEdges_AllCombinedAdditionsDeletionsValuesEqual_UsesSingleBucketFallbackForBoth`
- **Setup**: Edges where every `additions` and `deletions` value equals the same constant `N`. Call with `['additions', 'deletions']`.
- **Assert**: `result[0].additions` and `result[0].deletions` each have exactly one `SeriesItem` with `min === max === N`, `label === '${N}-${N}'`, and `count` equal to the respective number of edges.

### Test 7: `parseRepoEdges_AdditionsValueOutsideOwnRangeButWithinSharedRange_ClampsIntoBoundaryBucket`
- **Setup**: Edges where `deletions` values push the combined max well above the largest `additions` value (e.g., `additions` max 10, `deletions` max 1000). Call with `['additions', 'deletions']`.
- **Assert**: Every bucket index assigned to an `additions` value is within `[0, 19]`; the resulting `additions` counts sum to the number of `additions` values (no values dropped), confirming clamped bucketing works against the wider shared scale.

---

## Verification

```bash
# 1. Type-check / build passes
yarn build

# 2. Full test suite (includes the new parser tests)
yarn test

# 3. Focused run of the new/changed test file
npx vitest run src/backend/lib/github/__tests__/parser.test.ts
```

Manual verification: hit the `/api/repo/:owner/:repo` endpoint (or run the app) against a real repository and confirm the frontend charts for additions/deletions now render on a shared scale while `changedFiles` is unaffected.
