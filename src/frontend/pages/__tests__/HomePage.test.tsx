import '@testing-library/jest-dom/vitest'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { homeCards } from '../homeCards'
import HomePage from '../HomePage'

const mockState = vi.hoisted(() => ({ throwFor: null as string | null }))

vi.mock('../../components/PlaceholderChart', async () => {
  const React = await import('react')
  return {
    default: ({ title }: { title: string }) => {
      if (title === mockState.throwFor) {
        throw new Error('chart failed')
      }
      return React.createElement('svg', { role: 'img', 'aria-label': `Placeholder chart for ${title}` })
    },
  }
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <HomePage />
      </ThemeProvider>
    </MemoryRouter>,
  )

describe('HomePage', () => {
  beforeEach(() => {
    mockState.throwFor = null
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('HomePage_Renders_FourCardsWithExpectedTitles', () => {
    const { container } = renderPage()

    expect(container.querySelectorAll('.MuiCard-root')).toHaveLength(4)
    for (const { title } of homeCards) {
      expect(screen.getByRole('heading', { name: title, level: 2 })).toBeInTheDocument()
    }
  })

  it('HomePage_CommitsPerWeekCard_LinksToWeeklyChart', () => {
    renderPage()

    expect(screen.getByRole('link', { name: 'Commits per Week' })).toHaveAttribute(
      'href',
      '/graphs/repo-commits-per-week',
    )
    expect(screen.getByRole('link', { name: 'Commits per Week' }).closest('h2')).not.toBeNull()
    expect(screen.queryByRole('link', { name: 'Adds / Deletes' })).toBeNull()
  })

  it('HomePage_OneChartThrows_OtherCardsStillRendered', () => {
    mockState.throwFor = 'Changed Files'

    const { container } = renderPage()

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toHaveTextContent('Chart unavailable')
    expect(container.querySelectorAll('.MuiCard-root')).toHaveLength(4)
    expect(screen.getAllByRole('img')).toHaveLength(3)
    for (const { title } of homeCards) {
      expect(screen.getByRole('heading', { name: title, level: 2 })).toBeInTheDocument()
    }
    expect(within(alerts[0].closest('.MuiCard-root') as HTMLElement).getByText('Changed Files')).toBeInTheDocument()
  })
})
