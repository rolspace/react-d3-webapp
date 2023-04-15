import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import GraphList from '../GraphList'

test('GraphList renders correctly', () => {
  render(
    <BrowserRouter>
      <GraphList />
    </BrowserRouter>,
  )

  expect(screen.getAllByRole('listitem').length).toEqual(4)
  expect(screen.getAllByRole('link').length).toEqual(4)
  expect(screen.getByText(/Adds vs. Deletes/i))
  expect(screen.getByText(/Changed Files/i))
})
