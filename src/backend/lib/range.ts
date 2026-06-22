import { logger } from './logger.js'

interface DataItem {
  additions: number
}

interface Range {
  min: number
  max: number
  count: number
  label: string
}

/**
 * Creates ranges from an array of data objects and assigns each value to a range
 * @param data - Array of objects containing numeric values
 * @param numberOfRanges - Number of ranges to create (default: 20)
 * @returns Array of Range objects with min, max, count, and label properties
 */
export function createRanges(data: DataItem[], numberOfRanges: number = 20): Range[] {
  // Validate input
  if (!data || !Array.isArray(data) || data.length === 0) {
    const errorMsg = 'Invalid input: data must be a non-empty array'
    logger.error(errorMsg)
    throw new Error(errorMsg)
  }

  // Extract numeric values from the data
  const values = data.map((item) => item.additions).filter((val) => typeof val === 'number')

  if (values.length === 0) {
    const errorMsg = 'No valid numeric values found in data'
    logger.error(errorMsg)
    throw new Error(errorMsg)
  }

  // Find min and max values
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  // Handle edge case where all values are the same
  if (minValue === maxValue) {
    return [
      {
        min: minValue,
        max: maxValue,
        count: values.length,
        label: `${minValue}-${maxValue}`,
      },
    ]
  }

  const rangeWidth = (maxValue - minValue) / numberOfRanges

  // Initialize ranges
  const ranges: Range[] = []
  for (let i = 0; i < numberOfRanges; i++) {
    const min = minValue + i * rangeWidth
    const max = i === numberOfRanges - 1 ? maxValue : minValue + (i + 1) * rangeWidth
    ranges.push({
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      count: 0,
      label: `${Math.round(min)}-${Math.round(max)}`,
    })
  }

  // Assign each value to a range
  values.forEach((value) => {
    const rangeIndex = Math.min(
      Math.floor((value - minValue) / rangeWidth),
      numberOfRanges - 1, // Ensure max value goes into the last range
    )
    ranges[rangeIndex].count++
  })

  return ranges
}
