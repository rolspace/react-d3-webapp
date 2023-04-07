import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import GraphList from '../GraphList'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

describe('Components: GraphList component', () => {
  test('renders correctly', () => {
    render(
      <BrowserRouter>
        <GraphList />
      </BrowserRouter>,
    )

    expect(screen.getAllByRole('listitem').length).toEqual(4)
  })
})
