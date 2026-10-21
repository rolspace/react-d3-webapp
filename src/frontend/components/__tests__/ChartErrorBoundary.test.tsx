import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChartErrorBoundary from '../ChartErrorBoundary'

const Thrower: React.FC = () => {
  throw new Error('chart exploded')
}

describe('ChartErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ChartErrorBoundary_ChildThrows_RendersFallback', () => {
    render(
      <>
        <ChartErrorBoundary>
          <Thrower />
        </ChartErrorBoundary>
        <span>sibling</span>
      </>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Chart unavailable')
    expect(screen.getByText('sibling')).toBeInTheDocument()
  })
})
