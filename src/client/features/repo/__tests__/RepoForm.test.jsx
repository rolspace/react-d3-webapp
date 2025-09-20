import '@testing-library/jest-dom/vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import RepoForm from '../RepoForm'

describe('RepoForm', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders correctly', () => {
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
    })

    const button = screen.getByRole('button', {
      name: /go/i,
    })

    expect(button).toBeDisabled()

    const ownerInput = screen.getByRole('textbox', {
      name: /owner/i,
    })


    expect(button).not.toBeDisabled()
    expect(ownerInput).toHaveValue('dotnet')

    const repositoryInput = screen.getByRole('textbox', {
      name: /repository/i,
    })


    expect(button).not.toBeDisabled()
    expect(ownerInput).toHaveValue('dotnet')
    expect(repositoryInput).toHaveValue('runtime')


    expect(button).toBeDisabled()
    expect(ownerInput).toHaveValue('facebook')
    expect(repositoryInput).toHaveValue('react')
  })
})
