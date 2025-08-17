import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import React from 'react'
import App from '../App'

describe('App', () => {
  it('renders correctly', async () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: /gh repositories \/ charts and data/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBe(4)
    expect(screen.getAllByRole('link').length).toBe(5)
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
})
