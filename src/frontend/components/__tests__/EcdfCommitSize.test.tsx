import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { CommitRow } from '../../types/commit.types'
import { Status } from '../../types/state.types'
import { renderWithStores, resetStores } from '../../utils/testUtils'
import { computeEcdf, ecdfQuantile } from '../../utils/ecdf'
import { createEcdfLayout, EcdfSeries, renderEcdfChart } from '../../services/ecdfChart'
import RepoCommits from '../../features/repo/RepoCommits'
import EcdfCommitSize from '../EcdfCommitSize'

const row = (oid: string, additions: number, deletions: number, changedFiles: number): CommitRow => ({
  oid, date: null, additions, deletions, changedFiles, author: null,
})

// additions [10, 20, 20, 300], deletions [5, 5, 40, 0], changedFiles [1, 2, 3, 4]
const rows: CommitRow[] = [
  row('a', 10, 5, 1),
  row('b', 20, 5, 2),
  row('c', 20, 40, 3),
  row('d', 300, 0, 4),
]

const stepsFor = (container: HTMLElement, key: string) =>
  container.querySelectorAll(`[data-series="${key}"] circle.ecdf-step`)

const renderChart = (commits: CommitRow[], props: { hasNextPage?: boolean; status?: Status } = {}) =>
  render(
    <EcdfCommitSize
      commits={commits}
      hasNextPage={props.hasNextPage ?? false}
      status={props.status ?? Status.Success}
    />,
  )

describe('EcdfCommitSize', () => {
  beforeEach(() => {
    process.env.API_URL = 'http://localhost'
  })

  afterEach(() => {
    cleanup()
  })

  it('EcdfCommitSize_AddsDeletesDefault_RendersOneStepPerDistinctValuePerSeries', () => {
    const { container } = renderChart(rows)

    expect(stepsFor(container, 'additions')).toHaveLength(3)
    expect(stepsFor(container, 'deletions')).toHaveLength(3)
    expect(container.querySelectorAll('path.ecdf-line')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Adds + Deletes' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.textContent).toContain('Lines changed per commit')
    expect(container.textContent).toContain('Share of commits at or below x')
  })

  it('EcdfCommitSize_MetricChangedFiles_RedrawsSingleSeries', async () => {
    const user = userEvent.setup()
    const { container } = renderChart(rows)

    await user.click(screen.getByRole('button', { name: 'Changed files' }))

    expect(container.querySelectorAll('circle.ecdf-step')).toHaveLength(4)
    expect(stepsFor(container, 'changedFiles')).toHaveLength(4)
    expect(container.querySelector('[data-series="additions"]')).toBeNull()
    expect(container.textContent).toContain('Files changed per commit')
  })

  it('EcdfCommitSize_Rendered_ShowsLabelledReferenceLinesAndQuantileSummary', () => {
    const { container } = renderChart(rows)

    expect(container.querySelectorAll('line.ecdf-ref')).toHaveLength(2)
    expect(screen.getByText('Median (50%)')).toBeInTheDocument()
    expect(screen.getByText('90th percentile (90%)')).toBeInTheDocument()
    expect(screen.getByText('Additions: median 20 · 90th pct 300 lines')).toBeInTheDocument()
    expect(container.querySelectorAll('line.ecdf-quantile')).toHaveLength(4)
  })

  it('EcdfCommitSize_KeyboardFocus_ShowsTooltipAndArrowMovesCursor', async () => {
    const user = userEvent.setup()
    const { container } = renderChart(rows)
    const chart = screen.getByRole('img', { name: /cumulative distribution/i })

    act(() => chart.focus())

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('≤ 20 lines')
    expect(tooltip).toHaveTextContent('Additions: 75.0% of commits')
    expect(tooltip).toHaveTextContent('Deletions: 75.0% of commits')
    expect(chart).toHaveAttribute('aria-describedby', tooltip.id)

    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tooltip')).toHaveTextContent('≤ 40 lines')
    expect(screen.getByRole('tooltip')).toHaveTextContent('Deletions: 100.0% of commits')

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(container.querySelector('.ecdf-cursor')).toBeNull()
  })

  it('EcdfCommitSize_LogScaleToggled_RedrawsWithDecadeTicks', async () => {
    const user = userEvent.setup()
    const { container } = renderChart(rows)
    const tickLabels = () =>
      Array.from(container.querySelectorAll('.axis--x .tick text')).map((t) => t.textContent)

    expect(tickLabels()).not.toContain('1')
    const before = stepsFor(container, 'additions').length + stepsFor(container, 'deletions').length

    await user.click(screen.getByRole('button', { name: 'Log' }))

    expect(tickLabels()).toEqual(expect.arrayContaining(['1', '10', '100']))
    const after = stepsFor(container, 'additions').length + stepsFor(container, 'deletions').length
    expect(after).toBe(before)
  })

  it('EcdfCommitSize_NoCommits_ShowsEmptyStateWithoutAxes', () => {
    const { container } = renderChart([])

    expect(screen.getByRole('status')).toHaveTextContent(/no commits to display/i)
    expect(container.querySelector('.axis')).toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('EcdfCommitSize_AllValuesEqual_RendersSingleStep', async () => {
    const user = userEvent.setup()
    const equal = [row('a', 7, 7, 1), row('b', 7, 7, 1), row('c', 7, 7, 1)]
    const { container } = renderChart(equal)

    await user.click(screen.getByRole('button', { name: 'Additions' }))

    expect(container.querySelectorAll('circle.ecdf-step')).toHaveLength(1)
    expect(container.querySelector('path.ecdf-line')?.getAttribute('d')).not.toContain('NaN')
  })

  it('EcdfCommitSize_SingleCommit_RendersWithoutError', () => {
    const { container } = renderChart([rows[0]])

    expect(stepsFor(container, 'additions')).toHaveLength(1)
    expect(stepsFor(container, 'deletions')).toHaveLength(1)

    act(() => screen.getByRole('img', { name: /cumulative distribution/i }).focus())

    expect(screen.getByRole('tooltip')).toHaveTextContent('100.0%')
  })

  it('EcdfCommitSize_HasNextPage_ShowsLatestNCommitsNote', () => {
    const { unmount } = renderChart(rows, { hasNextPage: true })

    expect(screen.getByText('This chart covers the latest 4 commits only.')).toBeInTheDocument()
    unmount()

    renderChart(rows, { hasNextPage: false })
    expect(screen.queryByText(/covers the latest/i)).toBeNull()
  })

  it('EcdfCommitSize_Pending_ShowsSpinner', () => {
    renderChart([], { status: Status.Pending })

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('EcdfCommitSize_100Commits_ComputesAndDrawsUnder50ms', () => {
    const many = Array.from({ length: 100 }, (_, i) =>
      row(String(i), Math.floor(Math.random() * 2000), Math.floor(Math.random() * 500), 1 + (i % 12)))
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const plot = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svg.appendChild(plot)

    const toSeries = (key: EcdfSeries['key'], label: string, values: number[]): EcdfSeries => {
      const ecdf = computeEcdf(values)
      return { key, label, color: '#2da44e', ecdf, median: ecdfQuantile(ecdf, 0.5), p90: ecdfQuantile(ecdf, 0.9) }
    }

    const start = performance.now()
    const series = [
      toSeries('additions', 'Additions', many.map((c) => c.additions)),
      toSeries('deletions', 'Deletions', many.map((c) => c.deletions)),
    ]
    const layout = createEcdfLayout(series, 'linear')!
    renderEcdfChart(plot as unknown as SVGGElement, series, layout, { x: 'Lines', y: 'Share' })
    const elapsed = performance.now() - start

    expect(plot.querySelectorAll('circle.ecdf-step').length).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(50)
  })
})

describe('RepoCommits with EcdfCommitSize', () => {
  const server = setupServer(
    http.get(/\/api\/repo\//, () => HttpResponse.json({ commits: rows, hasNextPage: true })),
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

  it('RepoCommits_EcdfRoute_FetchesAndRendersSteps', async () => {
    const { container } = renderWithStores(
      <RepoCommits graphComponent={EcdfCommitSize} />,
    )

    expect(await screen.findByText(/latest 4 commits/i)).toBeInTheDocument()
    await waitFor(() => expect(container.querySelectorAll('circle.ecdf-step')).toHaveLength(6))
  })
})
