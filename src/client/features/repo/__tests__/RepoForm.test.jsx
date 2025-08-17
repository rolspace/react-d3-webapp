import '@testing-library/jest-dom/vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../../utils/testUtils'
import RepoForm from '../RepoForm'

describe('RepoForm', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders correctly', () => {
    renderWithProviders(<RepoForm />, {
      preloadedState: {
        repo: { owner: 'facebook', repository: 'react' },
      },
    })

    const ownerInput = screen.getByRole('textbox', {
      name: /owner/i,
    })

    const repositoryInput = screen.getByRole('textbox', {
      name: /repository/i,
    })

    expect(ownerInput).toHaveValue('facebook')
    expect(repositoryInput).toHaveValue('react')
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('sets correct values on user input', async () => {
    renderWithProviders(<RepoForm />, {
      preloadedState: {
        repo: { owner: 'facebook', repository: 'react', error: null },
        user: { token: '' },
      },
    })

    const button = screen.getByRole('button', {
      name: /go/i,
    })

    expect(button).toBeDisabled()

    const ownerInput = screen.getByRole('textbox', {
      name: /owner/i,
    })

    await userEvent.clear(ownerInput)
    await userEvent.type(ownerInput, 'dotnet')

    expect(button).not.toBeDisabled()
    expect(ownerInput).toHaveValue('dotnet')

    const repositoryInput = screen.getByRole('textbox', {
      name: /repository/i,
    })

    await userEvent.clear(repositoryInput)
    await userEvent.type(repositoryInput, 'runtime')

    expect(button).not.toBeDisabled()
    expect(ownerInput).toHaveValue('dotnet')
    expect(repositoryInput).toHaveValue('runtime')

    await userEvent.clear(ownerInput)
    await userEvent.type(ownerInput, 'facebook')
    await userEvent.clear(repositoryInput)
    await userEvent.type(repositoryInput, 'react')

    expect(button).toBeDisabled()
    expect(ownerInput).toHaveValue('facebook')
    expect(repositoryInput).toHaveValue('react')
  })
})
