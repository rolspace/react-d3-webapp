import { CommitEdge, CommitNode } from '../../types/commit.js'
import { logger } from '../logger.js'

interface DataItem {
  [key: string]: number
}

interface SeriesItem {
  min: number
  max: number
  count: number
  label: string
}

interface RepoCommitData {
  [key: string]: SeriesItem[]
}

interface RangeBoundaries {
  minValue: number
  maxValue: number
  rangeWidth: number
  ranges: SeriesItem[]
}

const SHARED_RANGE_PROPERTIES: ReadonlyArray<keyof CommitNode> = ['additions', 'deletions']

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

function extractPropertyValues(edges: CommitEdge[], prop: keyof CommitNode): number[] {
  return edges
    .map((edge) => edge.node[prop])
    .filter((val): val is number => typeof val === 'number')
}

function assignIndependentRange(
  edges: CommitEdge[],
  prop: keyof CommitNode,
  commitData: RepoCommitData,
  numberOfRanges: number = 20,
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

/**
 * Computes shared range boundaries from the combined values of all given properties,
 * then assigns each property its own per-bucket counts against those shared boundaries.
 */
function assignSharedRanges(
  edges: CommitEdge[],
  props: (keyof CommitNode)[],
  commitData: RepoCommitData,
  numberOfRanges: number = 20,
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

/**
 * Creates ranges from an array of data objects and assigns each value to a range
 * @param data - Array of objects containing a single numeric property
 * @param numberOfRanges - Number of ranges to create (default: 20)
 * @returns Array of Range objects with min, max, count, and label properties
 */
function createRanges(data: DataItem[], numberOfRanges: number = 20): SeriesItem[] {
  // Validate input
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

function extractSingleValues(data: DataItem[]): number[] {
  return data
    .map((item) => {
      const keys = Object.keys(item)
      return keys.length > 0 ? item[keys[0]] : null
    })
    .filter((val): val is number => typeof val === 'number')
}

function computeRangeBoundaries(values: number[], numberOfRanges: number): RangeBoundaries {
  // Find min and max values
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  // Handle edge case where all values are the same
  if (minValue === maxValue) {
    return {
      minValue,
      maxValue,
      rangeWidth: 0,
      ranges: [
        {
          min: minValue,
          max: maxValue,
          count: 0,
          label: `${minValue}-${maxValue}`,
        },
      ],
    }
  }

  const rangeWidth = (maxValue - minValue) / numberOfRanges

  // Initialize ranges
  const ranges: SeriesItem[] = []
  for (let i = 0; i < numberOfRanges; i++) {
    const min = minValue + i * rangeWidth
    const max = i === numberOfRanges - 1 ? maxValue : minValue + (i + 1) * rangeWidth

    const minRange = i === 0 ? Math.floor(min) : Math.floor(min) + 1
    const maxRange = Math.floor(max)

    ranges.push({
      min: minRange,
      max: maxRange,
      count: 0,
      label: `${minRange}-${maxRange}`,
    })
  }

  return { minValue, maxValue, rangeWidth, ranges }
}

function assignCounts(boundaries: RangeBoundaries, values: number[]): SeriesItem[] {
  const ranges = boundaries.ranges.map((range) => ({ ...range, count: 0 }))

  if (ranges.length === 1) {
    const [onlyRange] = ranges
    onlyRange.count = values.length // eslint-disable-line prefer-destructuring
    return ranges
  }

  // Assign each value to a range
  values.forEach((value) => {
    const rangeIndex = Math.min(
      Math.floor((value - boundaries.minValue) / boundaries.rangeWidth),
      ranges.length - 1, // Ensure max value goes into the last range
    )
    ranges[rangeIndex].count++
  })

  return ranges
}
