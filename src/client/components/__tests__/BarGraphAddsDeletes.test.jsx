import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import React from 'react'
import BarGraphAddsDeletes from '../BarGraphAddsDeletes'

const datasource = {
  linesAdded: [
    {
      count: 1,
      label: '1-20',
      max: 20,
      min: 1,
    },
    {
      count: 2,
      label: '21-40',
      max: 40,
      min: 21,
    },
  ],
  linesDeleted: [
    {
      count: 3,
      label: '1-20',
      max: 20,
      min: 1,
    },
    {
      count: 4,
      label: '21-40',
      max: 40,
      min: 21,
    },
  ],
}

describe('BarGraphAddsDeletes', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders correctly', () => {
    render(
      <BarGraphAddsDeletes
        datasource={datasource}
        loading="false"
        xAxis="label"
        yAxis="count"
      />,
    )
    expect(screen.getByText(/code lines/i)).toBeInTheDocument()
    expect(screen.getByText(/total commits/i)).toBeInTheDocument()
    expect(screen.getByText(/1-20/i)).toBeInTheDocument()
    expect(screen.getByText(/21-40/i)).toBeInTheDocument()
  })

  it('does not render component if required props are missing', () => {
    render(<BarGraphAddsDeletes />)
    expect(screen.queryByText(/code lines/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/total commits/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/1-20/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/21-40/i)).not.toBeInTheDocument()
  })
})
