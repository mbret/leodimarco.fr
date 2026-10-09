import { cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FaviconThemeListener } from '@/components/FaviconThemeListener'

let darkMode = false
let onSchemeChange: (() => void) | undefined

beforeEach(() => {
  darkMode = false
  window.matchMedia = vi.fn().mockReturnValue({
    get matches() {
      return darkMode
    },
    addEventListener: (_type: string, listener: () => void) => {
      onSchemeChange = listener
    },
    removeEventListener: vi.fn(),
  })
  document.head.innerHTML = '<link href="/favicon.svg" rel="icon" type="image/svg+xml" />'
})

afterEach(cleanup)

describe('Favicon', () => {
  it('points the icon at the current color scheme and follows its changes', () => {
    render(React.createElement(FaviconThemeListener))
    const icon = document.querySelector('link[rel="icon"]')
    expect(icon?.getAttribute('href')).toBe('/favicon.svg?light')

    darkMode = true
    onSchemeChange?.()
    expect(icon?.getAttribute('href')).toBe('/favicon.svg?dark')
  })
})
