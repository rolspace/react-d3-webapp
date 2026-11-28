import '@testing-library/jest-dom/vitest'
import { cleanup, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import RepoCommits from '../../features/repo/RepoCommits'
import { useRepoStore } from '../../stores/repoStore'
import { CommitRow } from '../../types/commit.types'
import { Status } from '../../types/state.types'
import { renderWithStores, resetStores } from '../../utils/testUtils'
import CommitSummaryStats from '../CommitSummaryStats'

const HEX40 = 'b'.repeat(40)

const row = (oid: string, additions: number, deletions: number, changedFiles = 1, author: string | null = 'octocat'): CommitRow => ({
  oid, date: '2024-01-08T10:00:00Z', additions, deletions, changedFiles, author,
})

const renderPanel = (
  commits: CommitRow[],
  props: { hasNextPage?: boolean; status?: Status } = {},
) =>
  renderWithStores(
    <CommitSummaryStats
      commits={commits}
      hasNextPage={props.hasNextPage ?? false}
      status={props.status ?? Status.Success}
    />,
  )

const commitSizeTable = () => screen.getByRole('table', { name: 'Median and 90th percentile commit size' })
const largestTable = () => screen.getByRole('table', { name: 'Largest commits by lines changed' })

describe('CommitSummaryStats', () => {
  beforeEach(() => {
    resetStores()
    process.env.API_URL = 'http://localhost'
  })

  afterEach(() => {
    cleanup()
  })

  it('CommitSummaryStats_Rows_ShowsFormattedTotalsAndNetLines', () => {
    renderPanel([row(HEX40, 1000, 10), row('c'.repeat(40), 234, 24)])

    // Additions and Deletions are also column headers in the largest-commits table, so check the labels exist.
    for (const label of ['Commits', 'Additions', 'Deletions', 'Net lines']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('+1,200')).toBeInTheDocument()
  })

  it('CommitSummaryStats_NegativeNetLines_ShowsMinusSign', () => {
    renderPanel([row(HEX40, 5, 1050)])

    expect(screen.getByText('−1,045')).toBeInTheDocument()
  })

  it('CommitSummaryStats_Rows_ShowsMedianAndP90PerMetric', () => {
    renderPanel([row('1'.repeat(40), 10, 0), row('2'.repeat(40), 20, 0), row('3'.repeat(40), 30, 0), row('4'.repeat(40), 40, 0)])

    const table = within(commitSizeTable())
    expect(table.getByRole('columnheader', { name: 'Metric' })).toBeInTheDocument()
    expect(table.getByRole('columnheader', { name: 'Median' })).toBeInTheDocument()
    expect(table.getByRole('columnheader', { name: '90th percentile' })).toBeInTheDocument()
    const additionsRow = table.getByRole('row', { name: /Additions/ })
    expect(within(additionsRow).getByText('25')).toBeInTheDocument()
    expect(within(additionsRow).getByText('37')).toBeInTheDocument()
  })

  it('CommitSummaryStats_MetricWithoutValues_ShowsDash', () => {
    renderPanel([
      { ...row(HEX40, 1, 1), changedFiles: null as unknown as number },
      { ...row('d'.repeat(40), 2, 2), changedFiles: null as unknown as number },
    ])

    const changedRow = within(commitSizeTable()).getByRole('row', { name: /Changed files/ })
    expect(within(changedRow).getAllByText('—')).toHaveLength(2)
  })

  it('CommitSummaryStats_Rows_ListsLargestCommitsInSemanticTable', () => {
    const rows = Array.from({ length: 12 }, (_, i) =>
      row(`${(i + 1).toString(16).padStart(7, '0')}${'0'.repeat(33)}`, i + 1, 0))

    renderPanel(rows)

    const table = within(largestTable())
    for (const name of ['Commit', 'Author', 'Additions', 'Deletions', 'Changed files']) {
      expect(table.getByRole('columnheader', { name })).toBeInTheDocument()
    }
    const bodyRows = table.getAllByRole('row').slice(1)
    expect(bodyRows).toHaveLength(10)
    // The largest commit (size 12) is the 12th row, whose oid starts with '000000c' (12 in hex).
    expect(within(bodyRows[0]).getByRole('link')).toHaveTextContent('000000c')
    expect(within(bodyRows[0]).getByRole('link').textContent).toHaveLength(7)
  })

  it('CommitSummaryStats_NullAuthor_ShowsUnknown', () => {
    renderPanel([row(HEX40, 1, 1, 1, null)])

    expect(within(largestTable()).getByText('Unknown')).toBeInTheDocument()
  })

  it('CommitSummaryStats_CommitLink_OpensGithubCommitInNewTab', () => {
    renderPanel([row('abcdef1234567890' + '0'.repeat(24), 1, 1)])

    const link = screen.getByRole('link', { name: 'Commit abcdef1 on GitHub (opens in a new tab)' })
    expect(link).toHaveAttribute('href', `https://github.com/facebook/react/commit/abcdef1234567890${'0'.repeat(24)}`)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('CommitSummaryStats_InvalidOwnerInStore_RendersOidWithoutLink', () => {
    useRepoStore.setState({ owner: 'bad/owner' })

    renderPanel([row('abcdef1' + '0'.repeat(33), 1, 1)])

    expect(within(largestTable()).getByText('abcdef1')).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('CommitSummaryStats_CoverageLabel_AlwaysShowsLatestNCommits', () => {
    renderPanel([row(HEX40, 1, 1), row('c'.repeat(40), 1, 1), row('d'.repeat(40), 1, 1)])

    expect(screen.getByText('Totals cover the latest 3 commits.')).toBeInTheDocument()
    expect(screen.queryByText('Older commits are not included.')).toBeNull()
  })

  it('CommitSummaryStats_HasNextPage_ShowsOlderCommitsNote', () => {
    renderPanel([row(HEX40, 1, 1), row('c'.repeat(40), 1, 1), row('d'.repeat(40), 1, 1)], { hasNextPage: true })

    expect(screen.getByText('Older commits are not included.')).toBeInTheDocument()
  })

  it('CommitSummaryStats_NoCommits_ShowsEmptyState', () => {
    renderPanel([])

    expect(screen.getByRole('status')).toHaveTextContent('No commits to display for this repository.')
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('CommitSummaryStats_Pending_ShowsSpinner', () => {
    renderPanel([], { status: Status.Pending })

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeNull()
  })
})

describe('RepoCommits with CommitSummaryStats', () => {
  const server = setupServer(
    http.get(/\/api\/repo\//, () =>
      HttpResponse.json({
        commits: [
          row(HEX40, 10, 1, 2, null),
          row('c'.repeat(40), 20, 2),
          row('d'.repeat(40), 30, 3),
          row('e'.repeat(40), 40, 4),
        ],
        hasNextPage: true,
      })),
  )

  beforeAll(() => {
    process.env.API_URL = 'http://localhost'
    server.listen()
  })

  afterAll(() => server.close())

  beforeEach(() => {
    resetStores()
  })

  afterEach(() => {
    server.resetHandlers()
    cleanup()
  })

  it('RepoCommits_SummaryRoute_FetchesAndRendersPanel', async () => {
    renderWithStores(<RepoCommits graphComponent={CommitSummaryStats} />)

    expect(await screen.findByText(/Totals cover the latest 4 commits/)).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('Older commits are not included.')).toBeInTheDocument()
    // The largest commit (size 44) is the 'e' commit, so it is the first link.
    await waitFor(() =>
      expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', `https://github.com/facebook/react/commit/${'e'.repeat(40)}`))
  })
})
