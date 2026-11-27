import { describe, expect, it } from 'vitest'
import { safeReturnPath } from '../returnPath.js'

describe('safeReturnPath', () => {
  it('safeReturnPath_SameOriginPath_ReturnsPathWithQuery', () => {
    expect(safeReturnPath('/graphs/repo-commits-per-week?x=1')).toBe('/graphs/repo-commits-per-week?x=1')
  })

  it('safeReturnPath_AbsoluteUrl_ReturnsUndefined', () => {
    expect(safeReturnPath('https://evil.example/')).toBeUndefined()
  })

  it('safeReturnPath_ProtocolRelativeUrl_ReturnsUndefined', () => {
    expect(safeReturnPath('//evil.example/')).toBeUndefined()
  })

  it('safeReturnPath_BackslashForm_ReturnsUndefined', () => {
    expect(safeReturnPath('/\\evil.example')).toBeUndefined()
  })

  it('safeReturnPath_NonString_ReturnsUndefined', () => {
    expect(safeReturnPath(undefined)).toBeUndefined()
    expect(safeReturnPath(['/a'])).toBeUndefined()
  })
})
