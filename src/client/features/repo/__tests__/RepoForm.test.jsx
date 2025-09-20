import '@testing-library/jest-dom/vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, describe, it, expect, beforeEach } from 'vitest'
import { renderWithStores, resetStores } from '../../../utils/testUtils'
import RepoForm from '../RepoForm'

describe('RepoForm', () => {
  beforeEach(() => {
    resetStores()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders correctly', () => {
    renderWithStores(<RepoForm />, {
      repoInitialState: { owner: 'facebook', repository: 'react' },
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
    const user = userEvent.setup()

    renderWithStores(<RepoForm />, {
      repoInitialState: { owner: 'facebook', repository: 'react', error: null },
      userInitialState: { token: '' },
    })

    const button = screen.getByRole('button', {
      name: /go/i,
    })

    expect(button).toBeDisabled()

    const ownerInput = screen.getByRole('textbox', {
      name: /owner/i,
    })

    await user.clear(ownerInput)
    await user.type(ownerInput, 'dotnet')

    expect(button).not.toBeDisabled()
    expect(ownerInput).toHaveValue('dotnet')

    const repositoryInput = screen.getByRole('textbox', {
      name: /repository/i,
    })

    await user.clear(repositoryInput)
    await user.type(repositoryInput, 'runtime')

    expect(button).not.toBeDisabled()
    expect(ownerInput).toHaveValue('dotnet')
    expect(repositoryInput).toHaveValue('runtime')

    await user.clear(ownerInput)
    await user.type(ownerInput, 'facebook')
    await user.clear(repositoryInput)
    await user.type(repositoryInput, 'react')

    expect(button).toBeDisabled()
    expect(ownerInput).toHaveValue('facebook')
    expect(repositoryInput).toHaveValue('react')
  })
})
