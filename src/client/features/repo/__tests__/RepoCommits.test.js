import '@testing-library/jest-dom/extend-expect'
import { screen } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import 'whatwg-fetch'
import BarGraphAddsDeletes from '../../../components/BarGraphAddsDeletes'
import { renderWithProviders } from '../../../utils/test-utils'
import RepoCommits from '../RepoCommits'

export const handlers = [
  rest.post(/\/api\/repo\//, (req, res, context) => {
    return res(
      context.json({
        data: [
          {
            node: {
              additions: 54,
              deletions: 32,
              changedFiles: 3,
              pushedDate: '2023-04-21T18:23:50Z',
              oid: '123abc',
              author: {
                user: {
                  login: 'author1',
                },
              },
            },
          },
          {
            node: {
              additions: 1,
              deletions: 1,
              changedFiles: 1,
              pushedDate: '2023-04-21T18:23:27Z',
              oid: '456def',
              author: {
                user: {
                  login: 'author2',
                },
              },
            },
          },
          {
            node: {
              additions: 521,
              deletions: 35,
              changedFiles: 7,
              pushedDate: '2023-04-21T17:29:47Z',
              oid: '789ghi',
              author: {
                user: {
                  login: 'author3',
                },
              },
            },
          },
        ],
      }),
    )
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

test('RepoCommits fetches repo data and renders graph', async () => {
  process.env.SERVER_URL = 'http://localhost'

  const { container } = renderWithProviders(
    <RepoCommits
      graphComponent={BarGraphAddsDeletes}
      options={{
        xAxis: 'label',
        yAxis: 'count',
      }}
    />,
    {
      preloadedState: {
        user: {
          token: 'AbcDeF123456',
        },
        repo: {
          owner: 'facebook',
          name: 'react',
          commits: {
            changedFiles: [],
            linesAdded: [],
            linesDeleted: [],
          },
          loading: 'idle',
          fulfilled: false,
          error: null,
        },
      },
    },
  )

  expect(await screen.findByText(/total commits/i)).toBeInTheDocument()
  expect(
    container.querySelector(
      'body > div > div > div > div > svg > g > rect:nth-child(5)',
    ),
  ).toBeInTheDocument()
})
