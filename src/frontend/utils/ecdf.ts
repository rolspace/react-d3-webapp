import { bisector } from 'd3'

export interface EcdfStep {
  /** A distinct metric value. */
  value: number
  /** Number of commits with exactly this value. */
  count: number
  /** Number of commits with a value <= `value`. */
  cumulativeCount: number
  /** cumulativeCount / total, in (0, 1]. The last step is exactly 1. */
  fraction: number
}

export interface Ecdf {
  steps: EcdfStep[]
  /** Number of valid (finite numeric) values. */
  total: number
}

// Absorbs floating-point error in p * total (for example 0.9 * n).
const QUANTILE_EPSILON = 1e-9

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)

const byValue = bisector<EcdfStep, number>((s) => s.value)

/** Builds the ECDF of `values`. Null, undefined, NaN, ±Infinity and non-numbers are skipped. */
export function computeEcdf(values: ReadonlyArray<unknown>): Ecdf {
  const sorted = values.filter(isFiniteNumber).sort((a, b) => a - b)
  const { length: total } = sorted
  const steps: EcdfStep[] = []

  sorted.forEach((value, i) => {
    const cumulativeCount = i + 1
    const fraction = cumulativeCount / total
    const last = steps.length > 0 ? steps[steps.length - 1] : undefined
    if (last && last.value === value) {
      last.count += 1
      last.cumulativeCount = cumulativeCount
      last.fraction = fraction
    } else {
      steps.push({ value, count: 1, cumulativeCount, fraction })
    }
  })

  return { steps, total }
}

/** F(x): the share of values <= x. Returns 0 for an empty ECDF. */
export function ecdfAt({ steps }: Ecdf, x: number): number {
  const i = byValue.right(steps, x)
  return i === 0 ? 0 : steps[i - 1].fraction
}

/**
 * The inverse ECDF (type-1 quantile): the smallest observed value v with F(v) >= p.
 * Returns null for an empty ECDF or for p outside (0, 1].
 */
export function ecdfQuantile({ steps, total }: Ecdf, p: number): number | null {
  if (total === 0 || !(p > 0 && p <= 1)) {
    return null
  }
  const target = p * total - QUANTILE_EPSILON
  return steps.find((s) => s.cumulativeCount >= target)?.value ?? null
}

/** The sorted union of distinct values across several ECDFs. These are the keyboard cursor stops. */
export function ecdfStops(ecdfs: Ecdf[]): number[] {
  return Array.from(new Set(ecdfs.flatMap((e) => e.steps.map((s) => s.value)))).sort((a, b) => a - b)
}
