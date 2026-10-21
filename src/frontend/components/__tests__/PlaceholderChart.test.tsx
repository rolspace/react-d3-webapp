import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PlaceholderChart from '../PlaceholderChart'

const disconnect = vi.fn()

class ResizeObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = disconnect
}

describe('PlaceholderChart', () => {
  beforeEach(() => {
    disconnect.mockClear()
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('PlaceholderChart_Renders_SvgWithAriaLabelAndBars', () => {
    const { container } = render(<PlaceholderChart title="Adds / Deletes" />)

    const svg = screen.getByRole('img', { name: /placeholder/i })
    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(container.querySelectorAll('rect')).toHaveLength(6)
  })

  it('PlaceholderChart_Unmount_DisconnectsObserver', () => {
    const { container, unmount } = render(<PlaceholderChart title="Adds / Deletes" />)
    const svg = screen.getByRole('img', { name: /placeholder/i })
    expect(svg.childNodes.length).toBeGreaterThan(0)

    unmount()

    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(svg.childNodes.length).toBe(0)
    expect(container).toBeEmptyDOMElement()
  })

  it('PlaceholderChart_Render_MakesNoNetworkRequest', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    render(<PlaceholderChart title="Adds / Deletes" />)

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
