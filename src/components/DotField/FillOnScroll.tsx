'use client'

import React, { useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  start: number
  style?: React.CSSProperties
}

// Sets --dot-fill on its element: `start` once the page has loaded, rising to 1 as the visitor
// scrolls the element out of view. It never goes back down, like pigment that stays. Visitors who
// reduce motion get the full field from the stylesheet instead.
export const FillOnScroll: React.FC<Props> = ({ children, className, start, style }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let fill = start
    let frame = 0

    const update = () => {
      frame = 0
      // Share of the way scrolled to the element's bottom
      const end = Math.max(element.getBoundingClientRect().bottom + window.scrollY, 1)
      const next = start + (1 - start) * Math.min(window.scrollY / end, 1)
      if (next <= fill) return

      fill = next
      element.style.setProperty('--dot-fill', String(fill))
      if (fill >= 1) window.removeEventListener('scroll', onScroll)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [start])

  return (
    <div
      aria-hidden
      className={className}
      ref={ref}
      style={{ ...style, '--dot-fill': start } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
