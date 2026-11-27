import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import BarGraphAddsDeletes from '../../../components/BarGraphAddsDeletes'
import BarGraphChangedFiles from '../../../components/BarGraphChangedFiles'
import { useRepoStore } from '../../../stores/repoStore'
import { Status } from '../../../types/state.types'
import { renderWithStores, resetStores } from '../../../utils/testUtils'
import RepoCommits from '../RepoCommits'

const rows = [
  { oid: '123abc', date: '2023-04-21T18:23:50Z', additions: 54, deletions: 32, changedFiles: 3, author: 'author1' },
  { oid: '456def', date: '2023-04-21T18:23:27Z', additions: 1, deletions: 1, changedFiles: 1, author: 'author2' },
  { oid: '789ghi', date: '2023-04-21T17:29:47Z', additions: 521, deletions: 35, changedFiles: 7, author: 'author3' },
]

let requestCount = 0

const server = setupServer(
  http.post(/\/api\/repo\//, () => {
    requestCount += 1
    return HttpResponse.json({ commits: rows, hasNextPage: false })
  }),
)

const barRects = (container: HTMLElement) => container.querySelectorAll('svg rect')
const firstXTick = (container: HTMLElement) =>
  container.querySelector('.axis--x .tick text')?.textContent

describe('RepoCommits', () => {
  beforeAll(() => {
    process.env.API_URL = 'http://localhost'
    server.listen()
  })

  afterAll(() => server.close())

  beforeEach(() => {
    requestCount = 0
    resetStores()
  })

  afterEach(() => {
    server.resetHandlers()
    cleanup()
  })

  it('RepoCommits_AddsDeletesLoaded_RendersSharedBinBarsAndControls', async () => {
    const { container } = renderWithStores(
      <RepoCommits graphComponent={BarGraphAddsDeletes} />,
      { userInitialState: { token: 'AbcDeF123456' } },
    )

    expect(await screen.findByText(/total commits/i)).toBeInTheDocument()
    expect(barRects(container)).toHaveLength(40)
    expect(firstXTick(container)).toBe('1-27')
    expect(screen.getByRole('slider', { name: /bins/i })).toHaveAttribute('aria-valuenow', '20')
  })

  it('RepoCommits_ChangedFilesLoaded_RendersIndependentBins', async () => {
    const { container } = renderWithStores(
      <RepoCommits graphComponent={BarGraphChangedFiles} />,
      { userInitialState: { token: 'AbcDeF123456' } },
    )

    expect(await screen.findByText(/total commits/i)).toBeInTheDocument()
    expect(barRects(container)).toHaveLength(7)
    expect(firstXTick(container)).toBe('1')
  })

  it('RepoCommits_BinCountChanged_RebinsWithoutRefetching', async () => {
    const { container } = renderWithStores(
      <RepoCommits graphComponent={BarGraphAddsDeletes} />,
      { userInitialState: { token: 'AbcDeF123456' } },
    )
    await screen.findByText(/total commits/i)

    fireEvent.change(screen.getByRole('slider', { name: /bins/i }), { target: { value: 5 } })

    expect(await screen.findByText('Bins: 5')).toBeInTheDocument()
    expect(barRects(container)).toHaveLength(10)
    expect(firstXTick(container)).toBe('1-105')
    expect(requestCount).toBe(1)
  })

  it('RepoCommits_LogScaleSelected_RedrawsWithLogThresholds', async () => {
    const user = userEvent.setup()
    const { container } = renderWithStores(
      <RepoCommits graphComponent={BarGraphAddsDeletes} />,
      { userInitialState: { token: 'AbcDeF123456' } },
    )
    await screen.findByText(/total commits/i)
    expect(firstXTick(container)).toBe('1-27')

    await user.click(screen.getByRole('button', { name: 'Log' }))

    expect(screen.getByRole('button', { name: 'Log' })).toHaveAttribute('aria-pressed', 'true')
    expect(firstXTick(container)).toBe('1')
    expect(barRects(container).length).toBeGreaterThan(0)
  })

  it('RepoCommits_Pending_ShowsSpinnerAndNoControls', () => {
    renderWithStores(
      <RepoCommits graphComponent={BarGraphAddsDeletes} />,
      { repoInitialState: { status: Status.Pending } },
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('slider')).toBeNull()
  })

  it('RepoCommits_FetchFails_ShowsErrorAlert', async () => {
    server.use(
      http.post(/\/api\/repo\//, () =>
        HttpResponse.json({}, { status: 500, statusText: 'Internal Server Error' })),
    )
    const { container } = renderWithStores(
      <RepoCommits graphComponent={BarGraphAddsDeletes} />,
      { userInitialState: { token: 'AbcDeF123456' } },
    )

    expect(await screen.findByText(/an error ocurred while loading/i)).toBeInTheDocument()
    expect(barRects(container)).toHaveLength(0)
  })

  it('RepoCommits_EmptyCommits_RendersEmptyGraphWithoutControls', async () => {
    server.use(http.post(/\/api\/repo\//, () => HttpResponse.json({ commits: [], hasNextPage: false })))
    const { container } = renderWithStores(
      <RepoCommits graphComponent={BarGraphAddsDeletes} />,
      { userInitialState: { token: 'AbcDeF123456' } },
    )

    await waitFor(() => expect(useRepoStore.getState().status).toBe(Status.Success))
    expect(barRects(container)).toHaveLength(0)
    expect(screen.queryByRole('slider')).toBeNull()
  })
})
