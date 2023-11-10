import { readFile, readdir } from 'node:fs/promises'

const queries = []

export const getQuery = (name) => {
  if (!name) {
    throw new Error('Parameter "name" not provided')
  }

  const query = queries.find((query) => name === query.name)

  if (!query) {
    throw new Error(`Query ${name} not found`)
  }

  return query
}

export const loadQueries = async () => {
  const fileNames = await readdir('data')

  for (const fileName of fileNames) {
    queries.push({
      name: fileName,
      text: await readFile(`data/${fileName}`, { encoding: 'utf8' }),
    })
  }
}
