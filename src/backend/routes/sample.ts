import { Request, Response, NextFunction } from 'express'
import { OK, CREATED, BAD_REQUEST } from '../lib/status.js'

interface SampleItem {
  id: number
  name: string
  value: number
}

// In-memory store for demo purposes
let sampleData: SampleItem[] = [
  { id: 1, name: 'Item 1', value: 100 },
  { id: 2, name: 'Item 2', value: 200 },
  { id: 3, name: 'Item 3', value: 300 },
]

let nextId = 4

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100))

    res.status(OK).json(sampleData)
  } catch (error) {
    next(error)
  }
}

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, value } = req.body

    // Validate input
    if (!name || typeof name !== 'string') {
      return res.status(BAD_REQUEST).json({
        error: 'Invalid input',
        message: 'name is required and must be a string',
      })
    }

    if (value === undefined || typeof value !== 'number') {
      return res.status(BAD_REQUEST).json({
        error: 'Invalid input',
        message: 'value is required and must be a number',
      })
    }

    // Create new item
    const newItem: SampleItem = {
      id: nextId++,
      name,
      value,
    }

    sampleData.push(newItem)

    res.status(CREATED).json(newItem)
  } catch (error) {
    next(error)
  }
}
