import { quantile } from 'd3'
import { CommitRow } from '../types/commit.types'
import { isFiniteNumber } from './ecdf'

export const TOP_COMMITS_LIMIT = 10
export const SHORT_OID_LENGTH = 7
export const UNKNOWN_AUTHOR = 'Unknown'

export type SizeMetric = 'additions' | 'deletions' | 'changedFiles'
export const SIZE_METRICS: SizeMetric[] = ['additions', 'deletions', 'changedFiles']

export interface CommitTotals {
  commitCount: number
  additions: number
  deletions: number
  /** additions - deletions. Can be negative. */
  netLines: number
}

export interface MetricQuantiles {
  /** Null when the metric has no finite numeric values. */
  median: number | null
  p90: number | null
}

export interface RankedCommit {
  oid: string
  shortOid: string
  /** The commit author, or UNKNOWN_AUTHOR when it is null or blank. */
  author: string
  /** Null when the value is missing or not a finite number. */
  additions: number | null
  deletions: number | null
  changedFiles: number | null
  /** additions + deletions, with missing values counted as 0. The ranking key. */
  size: number
}

export interface CommitSummary {
  totals: CommitTotals
  quantiles: Record<SizeMetric, MetricQuantiles>
  largest: RankedCommit[]
}

const valueOrNull = (v: unknown): number | null => (isFiniteNumber(v) ? v : null)
const valueOrZero = (v: unknown): number => (isFiniteNumber(v) ? v : 0)

/** Sums each metric. Missing or non-finite values count as 0. Never throws. */
export function computeTotals(commits: ReadonlyArray<CommitRow>): CommitTotals {
  let additions = 0
  let deletions = 0
  for (const c of commits) {
    additions += valueOrZero(c.additions)
    deletions += valueOrZero(c.deletions)
  }
  return { commitCount: commits.length, additions, deletions, netLines: additions - deletions }
}

/** Median and 90th percentile with linear interpolation (d3.quantile, R-7). Non-finite values are skipped. */
export function computeQuantiles(values: ReadonlyArray<unknown>): MetricQuantiles {
  const numbers = values.filter(isFiniteNumber)
  if (numbers.length === 0) {
    return { median: null, p90: null }
  }
  return { median: quantile(numbers, 0.5) ?? null, p90: quantile(numbers, 0.9) ?? null }
}

/** The first 7 characters of the oid. Returns '' for a non-string. */
export function shortOid(oid: unknown): string {
  return typeof oid === 'string' ? oid.slice(0, SHORT_OID_LENGTH) : ''
}

/**
 * The largest commits by additions + deletions, descending.
 * Ties keep their order in the response (the index is the explicit tie-breaker).
 */
export function topCommitsBySize(
  commits: ReadonlyArray<CommitRow>,
  limit = TOP_COMMITS_LIMIT,
): RankedCommit[] {
  return commits
    .map((c, index) => ({
      index,
      commit: {
        oid: typeof c.oid === 'string' ? c.oid : '',
        shortOid: shortOid(c.oid),
        author: typeof c.author === 'string' && c.author.trim() !== '' ? c.author : UNKNOWN_AUTHOR,
        additions: valueOrNull(c.additions),
        deletions: valueOrNull(c.deletions),
        changedFiles: valueOrNull(c.changedFiles),
        size: valueOrZero(c.additions) + valueOrZero(c.deletions),
      },
    }))
    .sort((a, b) => b.commit.size - a.commit.size || a.index - b.index)
    .slice(0, limit)
    .map(({ commit }) => commit)
}

// GitHub owner names: letters, digits and single hyphens. Repository names: letters, digits, '.', '_' and '-'.
const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/
const REPOSITORY_PATTERN = /^[A-Za-z0-9._-]{1,100}$/
const OID_PATTERN = /^[0-9a-f]{7,40}$/i

/**
 * https://github.com/{owner}/{repo}/commit/{oid}, with each segment encoded.
 * Returns null when any segment is not a valid GitHub name or commit hash, so no link is rendered.
 */
export function buildCommitUrl(owner: string, repository: string, oid: string): string | null {
  const validOwner = OWNER_PATTERN.test(owner)
  const validRepository = REPOSITORY_PATTERN.test(repository) && repository !== '.' && repository !== '..'
  if (!validOwner || !validRepository || !OID_PATTERN.test(oid)) {
    return null
  }
  return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commit/${encodeURIComponent(oid)}`
}

export function computeCommitSummary(commits: ReadonlyArray<CommitRow>): CommitSummary {
  const quantiles = Object.fromEntries(
    SIZE_METRICS.map((key) => [key, computeQuantiles(commits.map((c) => c[key]))]),
  ) as Record<SizeMetric, MetricQuantiles>
  return { totals: computeTotals(commits), quantiles, largest: topCommitsBySize(commits) }
}
