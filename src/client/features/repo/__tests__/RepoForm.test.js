import '@testing-library/jest-dom/extend-expect'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../utils/test-utils'
import React from 'react'
import RepoForm from '../RepoForm'
import userEvent from '@testing-library/user-event'

test('RepoForm renders correctly', () => {
  renderWithProviders(<RepoForm />, {
    repo: { owner: 'facebook', name: 'react' },
  })

  const ownerInput = screen.getByRole('textbox', {
    name: /owner/i,
  })

  const repositoryInput = screen.getByRole('textbox', {
    name: /repository/i,
  })

  expect(ownerInput).toHaveValue('facebook')
  expect(repositoryInput).toHaveValue('react')
  expect(screen.getAllByRole('button').length).toEqual(1)
})

test('RepoForm sets form inputs and state correctly on user events', async () => {
  renderWithProviders(<RepoForm />, {
    repo: { owner: 'facebook', name: 'react' },
  })

  const ownerInput = screen.getByRole('textbox', {
    name: /owner/i,
  })

  await userEvent.clear(ownerInput)
  await userEvent.type(ownerInput, 'dotnet')

  expect(ownerInput).toHaveValue('dotnet')
})
