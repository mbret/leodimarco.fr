import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { HeaderNav } from '@/Header/Nav'

afterEach(cleanup)

describe('Header', () => {
  it('shows its button after the menu, named by its label even when only the icon shows', () => {
    render(
      React.createElement(HeaderNav, {
        data: {
          id: 1,
          navItems: [],
          enableButton: true,
          button: { type: 'custom', url: 'https://wa.me/33744429488', label: 'Envoyer mes photos' },
        },
      }),
    )

    const button = screen.getByRole('link', { name: 'Envoyer mes photos' })
    expect(button.getAttribute('href')).toBe('https://wa.me/33744429488')
  })

  it('has no button unless one is turned on', () => {
    render(React.createElement(HeaderNav, { data: { id: 1, navItems: [] } }))

    expect(screen.queryByRole('link')).toBeNull()
  })
})
