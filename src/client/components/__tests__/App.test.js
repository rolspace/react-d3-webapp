import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import App from '../App'
import userEvent from '@testing-library/user-event'

test('App renders correctly', async () => {
  render(<App />)

  expect(
    screen.getByRole('heading', {
      name: /gh repositories \/ charts and data/i,
    }),
  ).toBeInTheDocument()
  expect(screen.getAllByRole('listitem').length).toEqual(4)
  expect(screen.getAllByRole('link').length).toEqual(5)
  expect(
    screen.queryByRole('presentation', {
      hidden: true,
    }),
  ).toBeNull()

  const menuButton = screen.getByRole('button', {
    name: /menu/i,
  })

  await userEvent.click(menuButton)

  expect(
    screen.getByRole('presentation', {
      hidden: false,
    }),
  ).toBeInTheDocument()
})
