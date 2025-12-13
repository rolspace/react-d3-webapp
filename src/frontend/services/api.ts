import {
  SampleItem,
  HealthResponse,
  ErrorResponse,
} from '../types/app.types'

const API_URL = process.env.API_URL || 'https://localhost:3000'

class ApiError extends Error {
  constructor (
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T> (response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new ApiError(error.message || 'API request failed', response.status)
  }
  return response.json()
}

export async function fetchHealth (): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/api/health`)
  return handleResponse<HealthResponse>(response)
}

export async function fetchSampleData (): Promise<SampleItem[]> {
  const response = await fetch(`${API_URL}/api/sample`)
  return handleResponse<SampleItem[]>(response)
}

export async function createSampleItem (
  item: Omit<SampleItem, 'id'>,
): Promise<SampleItem> {
  const response = await fetch(`${API_URL}/api/sample`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })
  return handleResponse<SampleItem>(response)
}
