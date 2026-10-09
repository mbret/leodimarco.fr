import React from 'react'

import { cn } from '@/utilities/ui'

import { FillOnScroll } from './FillOnScroll'

// A patch of dots like a tricopigmentation: dense on the right and fading out to the left with an
// uneven edge, as a frontal hairline does. The dots are placed once, on the server, so the browser
// receives the same drawing every time.

const WIDTH = 560
const HEIGHT = 240
const SPACING = 9 // minimum distance between two dots
const GROUPS = 16 // dots appear group by group, each group with its own dot size
const START = 0.4 // share of the dots shown before the visitor scrolls

// The same pseudo-random numbers on every run, so the pattern never changes
const seededRandom = (seed: number) => () => (seed = (seed * 48271) % 2147483647) / 2147483647

const smoothstep = (from: number, to: number, x: number) => {
  const t = Math.min(Math.max((x - from) / (to - from), 0), 1)
  return t * t * (3 - 2 * t)
}

// Chance of a dot at (u, v), both from 0 to 1 across the patch
const density = (u: number, v: number) => {
  const edge = 0.3 + 0.06 * Math.sin(v * 7 + 1) + 0.03 * Math.sin(v * 17 + 4)
  return smoothstep(edge - 0.2, edge + 0.3, u) * (1 - smoothstep(0.88, 1, u))
}

// Random points, kept according to the density and only when no other dot is too close. Each group
// is one path of zero-length segments, which round line caps draw as dots.
const groups = (() => {
  const random = seededRandom(1729)
  const cell = SPACING / Math.SQRT2 // small enough to hold one dot at most
  const columns = Math.ceil(WIDTH / cell)
  const grid: [number, number][] = []
  const paths = Array.from({ length: GROUPS }, () => '')

  for (let attempt = 0; attempt < 30000; attempt++) {
    const x = random() * WIDTH
    const y = random() * HEIGHT
    if (random() > density(x / WIDTH, y / HEIGHT)) continue

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
    paths[Math.floor(random() * GROUPS)] += `M${Math.round(x)} ${Math.round(y)}h0`
  }

  return paths.map((d, i) => ({
    d,
    threshold: i / GROUPS,
    // Dot sizes from 2.2 to 3.4 pixels, shuffled across the groups
    width: 2.2 + (((i * 7) % GROUPS) / GROUPS) * 1.2,
  }))
})()

export const DotField: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <FillOnScroll
      className={cn('dot-field pointer-events-none text-foreground/30', className)}
      start={START}
      style={{ '--dot-groups': GROUPS } as React.CSSProperties}
    >
      <svg
        className="absolute top-0 right-0 h-full"
        fill="none"
        preserveAspectRatio="xMaxYMid slice"
        stroke="currentColor"
        strokeLinecap="round"
        style={{ width: WIDTH }}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        {groups.map(({ d, threshold, width }) => (
          <path
            d={d}
            key={threshold}
            strokeWidth={width}
            style={{ '--dot-threshold': threshold } as React.CSSProperties}
          />
        ))}
      </svg>
    </FillOnScroll>
  )
}
