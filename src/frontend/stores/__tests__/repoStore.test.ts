import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { CommitRow } from '../../types/commit.types'
import { Status } from '../../types/state.types'
import { resetStores } from '../../utils/testUtils'
import { useRepoStore } from '../repoStore'

const rowA: CommitRow = { oid: 'a1', date: '2023-04-21T18:23:50Z', additions: 5, deletions: 2, changedFiles: 1, author: 'author1' }
const rowB: CommitRow = { oid: 'b2', date: null, additions: 9, deletions: 0, changedFiles: 3, author: null }

const server = setupServer(
  http.post(/\/api\/repo\//, () => HttpResponse.json({ commits: [rowA, rowB], hasNextPage: true })),
)

const fetchArgs = { owner: 'facebook', repository: 'react', token: 'AbcDeF123456' }

describe('repoStore', () => {
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
  })

  it('fetchRepo_SuccessResponse_StoresCommitsAndHasNextPage', async () => {
    await useRepoStore.getState().fetchRepo(fetchArgs)

    const state = useRepoStore.getState()
    expect(state.commits).toEqual([rowA, rowB])
    expect(state.hasNextPage).toBe(true)
    expect(state.status).toBe(Status.Success)
    expect(state.error).toBeNull()
  })

  it('fetchRepo_NullDateAndAuthor_StoresRowsUnchanged', async () => {
    await useRepoStore.getState().fetchRepo(fetchArgs)

    expect(useRepoStore.getState().commits[1]).toMatchObject({ date: null, author: null })
  })

  it('fetchRepo_Started_ResetsCommitsAndSetsPending', async () => {
    useRepoStore.setState({ commits: [rowA], hasNextPage: true })

    const pending = useRepoStore.getState().fetchRepo(fetchArgs)

    expect(useRepoStore.getState().status).toBe(Status.Pending)
    expect(useRepoStore.getState().commits).toEqual([])
    expect(useRepoStore.getState().hasNextPage).toBe(false)
    await pending
  })

  it('fetchRepo_ErrorResponse_SetsFailureClearsCommitsAndRethrows', async () => {
    server.use(
      http.post(/\/api\/repo\//, () =>
        HttpResponse.json({}, { status: 500, statusText: 'Internal Server Error' })),
    )
    useRepoStore.setState({ commits: [rowA], hasNextPage: true })

    await expect(useRepoStore.getState().fetchRepo(fetchArgs)).rejects.toThrow('Internal Server Error')

    const state = useRepoStore.getState()
    expect(state.status).toBe(Status.Failure)
    expect(state.error?.message).toBe('Internal Server Error')
    expect(state.commits).toEqual([])
    expect(state.hasNextPage).toBe(false)
  })

  it('fetchRepo_NetworkError_SetsFailureAndRethrows', async () => {
    server.use(http.post(/\/api\/repo\//, () => HttpResponse.error()))

    await expect(useRepoStore.getState().fetchRepo(fetchArgs)).rejects.toThrow()

    const state = useRepoStore.getState()
    expect(state.status).toBe(Status.Failure)
    expect(state.error).toBeInstanceOf(Error)
    expect(state.commits).toEqual([])
  })

  it('setRepo_WithExistingCommits_ResetsCommitsAndHasNextPage', () => {
    useRepoStore.setState({ commits: [rowA], hasNextPage: true, status: Status.Success })

    useRepoStore.getState().setRepo({ owner: 'o', repository: 'r' })

    const state = useRepoStore.getState()
    expect(state.owner).toBe('o')
    expect(state.repository).toBe('r')
    expect(state.commits).toEqual([])
    expect(state.hasNextPage).toBe(false)
    expect(state.status).toBe(Status.Idle)
  })

  it('clearRepo_WithExistingCommits_ResetsToDefaults', () => {
    useRepoStore.setState({
      commits: [rowA],
      hasNextPage: true,
      error: new Error('boom'),
      owner: 'x',
      repository: 'y',
    })

    useRepoStore.getState().clearRepo()

    const state = useRepoStore.getState()
    expect(state.owner).toBe('facebook')
    expect(state.repository).toBe('react')
    expect(state.commits).toEqual([])
    expect(state.hasNextPage).toBe(false)
    expect(state.status).toBe(Status.Idle)
    expect(state.error).toBeNull()
  })
})
