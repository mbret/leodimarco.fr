'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/utilities/ui'

// Dots like a tricopigmentation, drawn by the browser in a new arrangement every time the page is
// shown. Two kinds:
// - hero: a patch beside the page title, dense on the right and fading out to the left with an
//   uneven edge, as a frontal hairline does. It keeps clear of the title, text and buttons.
// - end: the same patch mirrored, at the bottom left of the page, behind the content.
// Once a drawing is on screen, its dots are pigmented in group by group, and then stay. Visitors who
// reduce motion get the full drawing from the stylesheet instead.

type Variant = 'hero' | 'end'
type Box = { left: number; right: number; top: number; bottom: number }

const WIDTH = 560
const GROUPS = 16 // dots appear group by group, each group with its own dot size
const SPACING = 9 // minimum distance between two dots
// Share of the placed dots that is drawn: drawing them all reads as too busy, and the spacing still
// comes from all of them
const SHOWN = 0.6

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
  // Where the dots start to thicken, and two waves that make that edge uneven
  const edge = between(0.25, 0.38)
  const waves = [
    { amplitude: between(0.06, 0.1), frequency: between(5, 9), phase: between(0, 2 * Math.PI) },
    { amplitude: between(0.02, 0.04), frequency: between(13, 19), phase: between(0, 2 * Math.PI) },
  ]
  const shape = (u: number, v: number) => {
    const at = waves.reduce(
      (sum, { amplitude, frequency, phase }) => sum + amplitude * Math.sin(v * frequency + phase),
      edge,
    )
    return smoothstep(at - 0.2, at + 0.3, u) * (1 - smoothstep(0.88, 1, u))
  }
  // Dense on the left at the end of the page
  return variant === 'hero' ? shape : (u: number, v: number) => shape(1 - u, v)
}

// Random points, kept according to the shape and only when no other dot is too close. Each group
// is one path of zero-length segments, which round line caps draw as dots.
export const randomDots = (variant: Variant, width: number, height: number, avoid: Box[] = []) => {
  const shape = randomShape(variant)
  const cell = SPACING / Math.SQRT2 // small enough to hold one dot at most
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
        tooClose = Boolean(other && (other[0] - x) ** 2 + (other[1] - y) ** 2 < SPACING ** 2)
      }
    }
    if (tooClose) continue

    grid[row * columns + column] = [x, y]
    if (Math.random() < SHOWN) {
      paths[Math.floor(Math.random() * GROUPS)] += `M${Math.round(x)} ${Math.round(y)}h0`
    }
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
      const width = Math.round(box.width) || WIDTH
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

    // Draws again when the text moves: once late fonts have loaded, or when the drawing resizes
    let active = true
    if (document.fonts?.status === 'loading') document.fonts.ready.then(() => active && draw())
    let size = `${element.clientWidth}x${element.clientHeight}`
    let timer = 0
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            const next = `${element.clientWidth}x${element.clientHeight}`
            if (next === size) return
            size = next
            window.clearTimeout(timer)
            timer = window.setTimeout(draw, 150)
          })
    resizeObserver?.observe(element)

    // Pigments the dots in once most of the drawing is on screen: the stylesheet animates
    // --dot-fill from 0 to 1. The title's patch is on screen as the page loads, the end's once the
    // visitor reaches it.
    const reveal = () => element.style.setProperty('--dot-fill', '1')
    const intersectionObserver =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(
            ([entry], observer) => {
              if (!entry?.isIntersecting) return
              reveal()
              observer.disconnect()
            },
            { threshold: 0.75 },
          )
    if (intersectionObserver) intersectionObserver.observe(element)
    else reveal()

    return () => {
      active = false
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      window.clearTimeout(timer)
    }
  }, [variant])

  return (
    <div
      aria-hidden
      className={cn(
        'dot-field pointer-events-none text-foreground/30',
        `dot-field-${variant}`,
        className,
      )}
      ref={ref}
      style={{ '--dot-fill': 0, '--dot-groups': GROUPS } as React.CSSProperties}
    >
      <svg
        className={cn('absolute top-0 h-full', variant === 'hero' ? 'right-0' : 'left-0')}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        style={{ width: WIDTH }}
      />
    </div>
  )
}
