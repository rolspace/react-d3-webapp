import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import GraphList from '../GraphList'

describe('GraphList', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <GraphList />
      </BrowserRouter>,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getAllByRole('link')).toHaveLength(4)
    expect(screen.getByText(/Adds \/ Deletes/i)).toBeInTheDocument()
    expect(screen.getByText(/Changed Files/i)).toBeInTheDocument()
  })
})
