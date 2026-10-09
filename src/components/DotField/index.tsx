'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/utilities/ui'

// Dots like a tricopigmentation, drawn by the browser in a new arrangement every time the page is
// shown. Two kinds:
// - hero: a patch beside the page title, dense on the right and fading out to the left with an
//   uneven edge, as a frontal hairline does. It keeps clear of the title, text and buttons. A share
//   of the dots shows once the page has loaded, and the rest fill in as the visitor scrolls the
//   title away.
// - band: a dense strip, the finished result, filling in as it comes into view.
// Dots that have filled in stay, like pigment. Visitors who reduce motion get the full drawing from
// the stylesheet instead.

type Variant = 'hero' | 'band'
type Box = { left: number; right: number; top: number; bottom: number }

const HERO_WIDTH = 560
const GROUPS = 16 // dots appear group by group, each group with its own dot size
const START: Record<Variant, number> = { hero: 0.4, band: 0 } // share shown before scrolling
const SPACING: Record<Variant, number> = { hero: 9, band: 7 } // minimum distance between dots

const between = (min: number, max: number) => min + Math.random() * (max - min)

const smoothstep = (from: number, to: number, x: number) => {
  const t = Math.min(Math.max((x - from) / (to - from), 0), 1)
  return t * t * (3 - 2 * t)
}

// No dots within 8 pixels of the text, a full share from 40 pixels away
const clearance = (avoid: Box[], x: number, y: number) => {
  let nearest = Infinity
  for (const box of avoid) {
    const dx = Math.max(box.left - x, 0, x - box.right)
    const dy = Math.max(box.top - y, 0, y - box.bottom)
    nearest = Math.min(nearest, Math.hypot(dx, dy))
  }
  return smoothstep(8, 40, nearest)
}

// Chance of a dot at (u, v), both from 0 to 1 across the drawing, with a random shape each time
const randomShape = (variant: Variant) => {
  if (variant === 'band') {
    // A strip that meanders a little, fading out at both ends and clear of its top and bottom
    const amplitude = between(0.06, 0.12)
    const frequency = between(4, 8)
    const phase = between(0, 2 * Math.PI)
    return (u: number, v: number) => {
      const middle = 0.5 + amplitude * Math.sin(u * frequency + phase)
      const across = 1 - smoothstep(0.15, 0.45, Math.abs(v - middle))
      const ends = smoothstep(0, 0.2, u) * (1 - smoothstep(0.8, 1, u))
      return across * ends * smoothstep(0, 0.2, v) * (1 - smoothstep(0.8, 1, v))
    }
  }

  // Where the dots start to thicken, and two waves that make that edge uneven
  const edge = between(0.25, 0.38)
  const waves = [
    { amplitude: between(0.06, 0.1), frequency: between(5, 9), phase: between(0, 2 * Math.PI) },
    { amplitude: between(0.02, 0.04), frequency: between(13, 19), phase: between(0, 2 * Math.PI) },
  ]
  return (u: number, v: number) => {
    const at = waves.reduce(
      (sum, { amplitude, frequency, phase }) => sum + amplitude * Math.sin(v * frequency + phase),
      edge,
    )
    return smoothstep(at - 0.2, at + 0.3, u) * (1 - smoothstep(0.88, 1, u))
  }
}

// Random points, kept according to the shape and only when no other dot is too close. Each group
// is one path of zero-length segments, which round line caps draw as dots.
export const randomDots = (variant: Variant, width: number, height: number, avoid: Box[] = []) => {
  const shape = randomShape(variant)
  const spacing = SPACING[variant]
  const cell = spacing / Math.SQRT2 // small enough to hold one dot at most
  const columns = Math.ceil(width / cell)
  const grid: [number, number][] = []
  const paths = Array.from({ length: GROUPS }, () => '')

  for (let attempt = Math.round(width * height * 0.22); attempt > 0; attempt--) {
    const x = Math.random() * width
    const y = Math.random() * height
    const chance = shape(x / width, y / height)
    if (!chance || Math.random() > chance * clearance(avoid, x, y)) continue

    const column = Math.floor(x / cell)
    const row = Math.floor(y / cell)
    let tooClose = false
    for (let j = row - 2; j <= row + 2 && !tooClose; j++) {
      for (let i = column - 2; i <= column + 2 && !tooClose; i++) {
        const other = grid[j * columns + i]
        tooClose = Boolean(other && (other[0] - x) ** 2 + (other[1] - y) ** 2 < spacing ** 2)
      }
    }
    if (tooClose) continue

    grid[row * columns + column] = [x, y]
    paths[Math.floor(Math.random() * GROUPS)] += `M${Math.round(x)} ${Math.round(y)}h0`
  }

  return paths.map((d, i) => ({ d, threshold: i / GROUPS, width: between(2.2, 3.4) }))
}

// Where the text and buttons around the drawing sit, relative to the drawing
const textBoxes = (container: Element, origin: DOMRect): Box[] => {
  const boxes: DOMRect[] = []
  const range = document.createRange()
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue
    range.selectNodeContents(node)
    boxes.push(...range.getClientRects())
  }
  container
    .querySelectorAll('a, button')
    .forEach((link) => boxes.push(link.getBoundingClientRect()))

  return boxes.map((box) => ({
    left: box.left - origin.left,
    right: box.right - origin.left,
    top: box.top - origin.top,
    bottom: box.bottom - origin.top,
  }))
}

// How far the visitor has scrolled through the effect, from 0 to 1
const progress: Record<Variant, (box: DOMRect) => number> = {
  // Scrolled share of the way to the patch's bottom
  hero: (box) => window.scrollY / Math.max(box.bottom + window.scrollY, 1),
  // Into view, complete a quarter of a screen after the band has fully appeared
  band: (box) => (window.innerHeight - box.top) / (box.height + window.innerHeight / 4),
}

export const DotField: React.FC<{ className?: string; variant: Variant }> = ({
  className,
  variant,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    const svg = element?.querySelector('svg')
    const container = element?.parentElement
    if (!element || !svg || !container) return

    const draw = () => {
      const box = svg.getBoundingClientRect()
      const width = Math.round(box.width) || HERO_WIDTH
      const height = Math.round(box.height) || 240
      const avoid = variant === 'hero' ? textBoxes(container, box) : []

      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      svg.replaceChildren(
        ...randomDots(variant, width, height, avoid).map(({ d, threshold, width: size }) => {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          path.setAttribute('d', d)
          path.setAttribute('stroke-width', String(size))
          path.style.setProperty('--dot-threshold', String(threshold))
          return path
        }),
      )
    }

    draw()
    // Starts the load animation now that there are dots to show
    element.dataset.ready = ''

    // Draws again when the text moves: once late fonts have loaded, or when the layout resizes
    let active = true
    if (document.fonts?.status === 'loading') document.fonts.ready.then(() => active && draw())
    let size = `${container.clientWidth}x${container.clientHeight}`
    let timer = 0
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            const next = `${container.clientWidth}x${container.clientHeight}`
            if (next === size) return
            size = next
            window.clearTimeout(timer)
            timer = window.setTimeout(draw, 150)
          })
    resizeObserver?.observe(container)

    let fill = START[variant]
    let frame = 0
    const update = () => {
      frame = 0
      const share = Math.min(Math.max(progress[variant](element.getBoundingClientRect()), 0), 1)
      const next = START[variant] + (1 - START[variant]) * share
      if (next <= fill) return

      fill = next
      element.style.setProperty('--dot-fill', String(fill))
      if (fill >= 1) window.removeEventListener('scroll', onScroll)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('scroll', onScroll, { passive: true })
      update()
    }

    return () => {
      active = false
      resizeObserver?.disconnect()
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [variant])

  return (
    <div
      aria-hidden
      className={cn(
        'dot-field pointer-events-none text-foreground/30',
        variant === 'hero' && 'dot-field-hero',
        className,
      )}
      ref={ref}
      style={{ '--dot-fill': START[variant], '--dot-groups': GROUPS } as React.CSSProperties}
    >
      <svg
        className={cn('absolute top-0 right-0 h-full', variant === 'band' && 'w-full')}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        style={variant === 'hero' ? { width: HERO_WIDTH } : undefined}
      />
    </div>
  )
}
