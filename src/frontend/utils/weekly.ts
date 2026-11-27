import { extent, rollup, utcMonday } from 'd3'
import { CommitRow } from '../types/commit.types'

export interface WeekBucket {
  /** Monday 00:00:00.000 UTC. */
  weekStart: Date
  count: number
}

export interface WeeklyCommits {
  /** One bucket per week from the first to the last dated commit, gaps filled with count 0. Ascending. */
  weeks: WeekBucket[]
  /** Commits with a valid date (the sum of all bucket counts). */
  datedCount: number
  /** Commits whose date was null, empty or unparseable. */
  excludedCount: number
  /** Earliest and latest valid commit timestamps, or null when there are none. */
  firstDate: Date | null
  lastDate: Date | null
}

/** Parses an ISO-8601 commit date. Returns null for null, non-strings, blank strings and invalid dates. Never throws. */
export function parseCommitDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function groupCommitsByWeek(commits: ReadonlyArray<Pick<CommitRow, 'date'>>): WeeklyCommits {
  const dates = commits
    .map((c) => parseCommitDate(c.date))
    .filter((d): d is Date => d !== null)
  const excludedCount = commits.length - dates.length
  const [firstDate, lastDate] = extent(dates)

  if (firstDate === undefined || lastDate === undefined) {
    return { weeks: [], datedCount: 0, excludedCount, firstDate: null, lastDate: null }
  }

  const counts = rollup(dates, (v) => v.length, (d) => utcMonday.floor(d).getTime())
  const weeks = utcMonday
    .range(utcMonday.floor(firstDate), utcMonday.offset(utcMonday.floor(lastDate), 1))
    .map((weekStart) => ({ weekStart, count: counts.get(weekStart.getTime()) ?? 0 }))

  return { weeks, datedCount: dates.length, excludedCount, firstDate, lastDate }
}
