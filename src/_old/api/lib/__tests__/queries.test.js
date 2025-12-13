import { beforeAll, describe, expect, it } from 'vitest'
import { getQuery, loadQueries } from '../queries'

describe('getQueries', () => {
  beforeAll(() => {
    return loadQueries()
  })

  it('Returns the correct object if the query exists', () => {
    const { name } = getQuery('repoCommits')
    expect(name).toBe('repoCommits')
  })

  it('Throws an error if the function parameter is missing', () => {
    expect(() => {
      getQuery()
    }).toThrow()
  })

  it('Throws an error if the query does not exist', () => {
    expect(() => {
      getQuery('thisQueryDoesNotExist')
    }).toThrow()
  })
})
