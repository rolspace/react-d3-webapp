import '@testing-library/jest-dom/extend-expect'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../../../utils/test-utils'
import RepoForm from '../RepoForm'

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

test('RepoForm sets correct values on user input', async () => {
  renderWithProviders(<RepoForm />, {
    repo: { owner: 'facebook', name: 'react' },
  })

  const ownerInput = screen.getByRole('textbox', {
    name: /owner/i,
  })

  await userEvent.clear(ownerInput)
  await userEvent.type(ownerInput, 'dotnet')

  expect(ownerInput).toHaveValue('dotnet')

  const repositoryInput = screen.getByRole('textbox', {
    name: /repository/i,
  })

  await userEvent.clear(repositoryInput)
  await userEvent.type(repositoryInput, 'runtime')

  expect(ownerInput).toHaveValue('dotnet')
  expect(repositoryInput).toHaveValue('runtime')
})
