'use client'
import React, { useEffect } from 'react'

// Chrome draws the SVG favicon once, when it downloads it, so the light/dark rule inside it only
// applies on page load. Giving the icon a URL per color scheme makes the browser redraw it.
export const FaviconThemeListener: React.FC = () => {
  useEffect(() => {
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
    if (!icon) return

    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      icon.href = `/favicon.svg?${darkMode.matches ? 'dark' : 'light'}`
    }

    update()
    darkMode.addEventListener('change', update)
    return () => darkMode.removeEventListener('change', update)
  }, [])

  return null
}
