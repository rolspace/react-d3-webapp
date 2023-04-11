import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import React from 'react'
import BarGraphAddsDeletes from '../BarGraphAddsDeletes'

describe('Component: BarGraphAddsDeletes component', () => {
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

  test('renders correctly', () => {
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

  test('does not render component if required props are missing', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(<BarGraphAddsDeletes />)

    expect(spy).toHaveBeenCalledTimes(4)
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('Failed prop type'),
    )
    spy.mockRestore()
  })
})
