import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CommitRow } from '../../types/commit.types'
import { Status } from '../../types/state.types'
import { renderWithStores, resetStores } from '../../utils/testUtils'
import { groupCommitsByWeek } from '../../utils/weekly'
import { CHART_MARGINS, CHART_WIDTH } from '../../services/chartScaffold'
import { createWeeklyLayout, renderWeeklyChart } from '../../services/weeklyChart'
import RepoCommits from '../../features/repo/RepoCommits'
import CommitsPerWeek from '../CommitsPerWeek'

const SVG_NS = 'http://www.w3.org/2000/svg'
const DAY_MS = 24 * 3600 * 1000

const row = (oid: string, date: string | null): CommitRow => ({
  oid, date, additions: 1, deletions: 1, changedFiles: 1, author: null,
})

// Weeks of 2024-01-08, 01-15, 01-22, 01-29 hold 2, 0, 0, 1 commits. One commit is undated.
const rows: CommitRow[] = [
  row('a', '2024-01-08T10:00:00Z'),
  row('b', '2024-01-09T10:00:00Z'),
  row('c', '2024-01-29T10:00:00Z'),
  row('d', null),
]

const renderChart = (commits: CommitRow[], props: { hasNextPage?: boolean; status?: Status } = {}) =>
  render(
    <CommitsPerWeek
      commits={commits}
      hasNextPage={props.hasNextPage ?? false}
      status={props.status ?? Status.Success}
    />,
  )

const bars = (container: HTMLElement) => container.querySelectorAll('rect.weekly-bar')

describe('CommitsPerWeek', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://localhost'
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('CommitsPerWeek_Rows_RendersOneBarPerWeekIncludingZeroWeeks', () => {
    const { container } = renderChart(rows)

    const counts = Array.from(bars(container)).map((b) => b.getAttribute('data-count'))
    expect(counts).toEqual(['2', '0', '0', '1'])
    const zeroBars = Array.from(bars(container)).filter((b) => b.getAttribute('data-count') === '0')
    zeroBars.forEach((b) => expect(b).toHaveAttribute('height', '0'))
    expect(container.textContent).toContain('Week starting (UTC)')
    expect(container.textContent).toContain('Commits')
    expect(container.querySelector('.axis--x .tick text')?.textContent).toContain('Jan 8')
  })

  it('CommitsPerWeek_Rows_ShowsDateRangeAndTextAlternative', () => {
    const { container } = renderChart(rows)

    expect(screen.getByText('3 commits from Jan 8, 2024 to Jan 29, 2024')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName(/3 commits across 4 weeks/)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('CommitsPerWeek_UndatedCommit_ShowsExclusionNote', () => {
    const { unmount } = renderChart(rows)

    expect(screen.getByText(/1 commit without a valid date is not shown\./)).toBeInTheDocument()
    unmount()

    renderChart(rows.slice(0, 3))
    expect(screen.queryByText(/without a valid date/)).toBeNull()
  })

  it('CommitsPerWeek_KeyboardFocus_ShowsTooltipAndArrowsMoveWeek', async () => {
    const user = userEvent.setup()
    const { container } = renderChart(rows)
    const chart = screen.getByRole('img')

    act(() => chart.focus())

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Week of Jan 29, 2024')
    expect(tooltip).toHaveTextContent('1 commit')
    expect(chart).toHaveAttribute('aria-describedby', tooltip.id)

    await user.keyboard('{Home}')
    expect(screen.getByRole('tooltip')).toHaveTextContent('Week of Jan 8, 2024')
    expect(screen.getByRole('tooltip')).toHaveTextContent('2 commits')

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tooltip')).toHaveTextContent('Week of Jan 15, 2024')
    expect(screen.getByRole('tooltip')).toHaveTextContent('0 commits')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(container.querySelector('.weekly-highlight')).toBeNull()
  })

  it('CommitsPerWeek_PointerMove_ShowsTooltipForHoveredWeek', () => {
    const { container } = renderChart(rows)
    const svg = screen.getByRole('img')
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, right: CHART_WIDTH, bottom: 500, width: CHART_WIDTH, height: 500, x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect)
    // innerWidth 720 over 4 weeks, so each slot is 180 px. This points at the fourth slot.
    const slotWidth = (CHART_WIDTH - CHART_MARGINS.left - CHART_MARGINS.right) / 4
    const clientX = CHART_MARGINS.left + slotWidth * 3.5

    fireEvent(svg, new MouseEvent('pointermove', { bubbles: true, clientX }))

    expect(screen.getByRole('tooltip')).toHaveTextContent('Week of Jan 29, 2024')

    fireEvent.pointerLeave(svg)

    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(container.querySelector('.weekly-highlight')).toBeNull()
  })

  it('CommitsPerWeek_AllDatesInvalid_ShowsDatedEmptyStateAndNote', () => {
    const { container } = renderChart([row('x', null), row('y', 'garbage')])

    expect(screen.getByRole('status')).toHaveTextContent('No dated commits are available for this repository.')
    expect(screen.getByText(/2 commits without a valid date are not shown\./)).toBeInTheDocument()
    expect(container.querySelector('svg[role="img"]')).toBeNull()
  })

  it('CommitsPerWeek_NoCommits_ShowsDefaultEmptyState', () => {
    const { container } = renderChart([])

    expect(screen.getByRole('status')).toHaveTextContent(/no commits to display/i)
    expect(container.querySelector('.axis')).toBeNull()
  })

  it('CommitsPerWeek_SingleWeek_RendersSingleBarWithoutError', () => {
    const { container } = renderChart([
      row('p', '2024-03-05T10:00:00Z'),
      row('q', '2024-03-06T10:00:00Z'),
    ])

    const [bar] = Array.from(bars(container))
    expect(bars(container)).toHaveLength(1)
    expect(bar).toHaveAttribute('width', '48')
    expect(bar.getAttribute('x')).not.toBeNull()
    expect(Number.isNaN(Number(bar.getAttribute('x')))).toBe(false)
  })

  it('CommitsPerWeek_HasNextPage_ShowsLatestCommitsNote', () => {
    const { unmount } = renderChart(rows, { hasNextPage: true })

    expect(screen.getByText('This chart covers the latest 4 commits only.')).toBeInTheDocument()
    unmount()

    renderChart(rows, { hasNextPage: false })
    expect(screen.queryByText(/covers the latest/)).toBeNull()
  })

  it('CommitsPerWeek_Pending_ShowsSpinner', () => {
    renderChart([], { status: Status.Pending })

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('CommitsPerWeek_100Commits_GroupsAndDrawsUnder50ms', () => {
    // Deterministic dates spread over about two years, so the chart covers roughly 104 weeks.
    const start = Date.UTC(2022, 5, 1)
    const many = Array.from({ length: 100 }, (_, i) =>
      row(`c${i}`, new Date(start + ((i * 7919) % 730) * DAY_MS).toISOString()))
    const svg = document.createElementNS(SVG_NS, 'svg')
    const plot = document.createElementNS(SVG_NS, 'g')
    svg.appendChild(plot)

    const begin = performance.now()
    const { weeks } = groupCommitsByWeek(many)
    const layout = createWeeklyLayout(weeks, CHART_WIDTH)!
    renderWeeklyChart(plot, weeks, layout, { x: 'Week', y: 'Commits' })
    const elapsed = performance.now() - begin

    expect(plot.querySelectorAll('rect.weekly-bar')).toHaveLength(weeks.length)
    expect(elapsed).toBeLessThan(50)
  })
})

describe('RepoCommits with CommitsPerWeek', () => {
  const server = setupServer(
    http.post(/\/api\/repo\//, () => HttpResponse.json({ commits: rows, hasNextPage: true })),
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

  it('RepoCommits_WeeklyRoute_FetchesAndRendersBars', async () => {
    const { container } = renderWithStores(
      <RepoCommits graphComponent={CommitsPerWeek} />,
      { userInitialState: { token: 'AbcDeF123456' } },
    )

    expect(await screen.findByText(/latest 4 commits/i)).toBeInTheDocument()
    await waitFor(() => expect(container.querySelectorAll('rect.weekly-bar')).toHaveLength(4))
  })
})
