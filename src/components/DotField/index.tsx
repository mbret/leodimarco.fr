'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/utilities/ui'

// A patch of dots like a tricopigmentation: dense on the right and fading out to the left with an
// uneven edge, as a frontal hairline does. The browser draws a new patch every time the page is
// shown: the edge sits and waves differently, and the dots fall elsewhere.

const WIDTH = 560
const HEIGHT = 240
const SPACING = 9 // minimum distance between two dots
const GROUPS = 16 // dots appear group by group, each group with its own dot size
const START = 0.4 // share of the dots shown before the visitor scrolls

const between = (min: number, max: number) => min + Math.random() * (max - min)

const smoothstep = (from: number, to: number, x: number) => {
  const t = Math.min(Math.max((x - from) / (to - from), 0), 1)
  return t * t * (3 - 2 * t)
}

// One path per group, of zero-length segments that round line caps draw as dots
const randomPatch = () => {
  // Where the dots start to thicken, and two waves that make that edge uneven
  const edge = between(0.25, 0.38)
  const waves = [
    { amplitude: between(0.06, 0.1), frequency: between(5, 9), phase: between(0, 2 * Math.PI) },
    { amplitude: between(0.02, 0.04), frequency: between(13, 19), phase: between(0, 2 * Math.PI) },
  ]
  // Chance of a dot at (u, v), both from 0 to 1 across the patch
  const density = (u: number, v: number) => {
    const at = waves.reduce(
      (sum, { amplitude, frequency, phase }) => sum + amplitude * Math.sin(v * frequency + phase),
      edge,
    )
    return smoothstep(at - 0.2, at + 0.3, u) * (1 - smoothstep(0.88, 1, u))
  }

  // Random points, kept according to the density and only when no other dot is too close
  const cell = SPACING / Math.SQRT2 // small enough to hold one dot at most
  const columns = Math.ceil(WIDTH / cell)
  const grid: [number, number][] = []
  const paths = Array.from({ length: GROUPS }, () => '')

  for (let attempt = 0; attempt < 30000; attempt++) {
    const x = Math.random() * WIDTH
    const y = Math.random() * HEIGHT
    if (Math.random() > density(x / WIDTH, y / HEIGHT)) continue

    const column = Math.floor(x / cell)
    const row = Math.floor(y / cell)
    let tooClose = false
    for (let j = row - 2; j <= row + 2 && !tooClose; j++) {
      for (let i = column - 2; i <= column + 2 && !tooClose; i++) {
        const other = grid[j * columns + i]
        tooClose = Boolean(other && (other[0] - x) ** 2 + (other[1] - y) ** 2 < SPACING ** 2)
      }
    }
    if (tooClose) continue

    grid[row * columns + column] = [x, y]
    paths[Math.floor(Math.random() * GROUPS)] += `M${Math.round(x)} ${Math.round(y)}h0`
  }

  return paths.map((d, i) => ({ d, threshold: i / GROUPS, width: between(2.2, 3.4) }))
}

// The server sends an empty drawing that the browser fills. Then --dot-fill sets how many dots
// show: `START` once the page has loaded, rising to 1 as the visitor scrolls the patch out of view.
// It never goes back down, like pigment that stays. Visitors who reduce motion get the full patch
// from the stylesheet instead.
export const DotField: React.FC<{ className?: string }> = ({ className }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    const svg = element?.querySelector('svg')
    if (!element || !svg) return

    svg.replaceChildren(
      ...randomPatch().map(({ d, threshold, width }) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', d)
        path.setAttribute('stroke-width', String(width))
        path.style.setProperty('--dot-threshold', String(threshold))
        return path
      }),
    )
    // Starts the load animation now that there are dots to show
    element.dataset.ready = ''

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let fill = START
    let frame = 0

    const update = () => {
      frame = 0
      // Share of the way scrolled to the patch's bottom
      const end = Math.max(element.getBoundingClientRect().bottom + window.scrollY, 1)
      const next = START + (1 - START) * Math.min(window.scrollY / end, 1)
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
  }, [])

  return (
    <div
      aria-hidden
      className={cn('dot-field pointer-events-none text-foreground/30', className)}
      ref={ref}
      style={{ '--dot-fill': START, '--dot-groups': GROUPS } as React.CSSProperties}
    >
      <svg
        className="absolute top-0 right-0 h-full"
        fill="none"
        preserveAspectRatio="xMaxYMid slice"
        stroke="currentColor"
        strokeLinecap="round"
        style={{ width: WIDTH }}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      />
    </div>
  )
}
