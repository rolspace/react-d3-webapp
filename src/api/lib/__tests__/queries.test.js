import { getQuery, loadQueries } from '../queries'

describe('getQueries', () => {
  beforeAll(() => {
    return loadQueries()
  })

  test('Returns the correct object if the query exists', () => {
    const { name } = getQuery('repoCommits')

    expect(name).toBe('repoCommits')
  })

  test('Throws an error if the function parameter is missing', () => {
    expect(() => {
      getQuery()
    }).toThrow()
  })

  test('Throws an error if the query does not exist', () => {
    expect(() => {
      getQuery('thisQueryDoesNotExist')
    }).toThrow()
  })
})
