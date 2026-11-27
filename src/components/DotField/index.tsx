'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/utilities/ui'

import { between, dotPath, randomGroups, randomWave, scatterDots, smoothstep } from './dots'

// Dots like a tricopigmentation, drawn by the browser in a new arrangement every time the page is
// shown. Three kinds:
// - hero: a patch beside the page title, dense on the right and fading out to the left with an
//   uneven edge, as a frontal hairline does. It keeps clear of the title, text and buttons.
// - band: the same patch on the right of a green band, clear of its text.
// - end: the same patch mirrored, at the bottom left of the page, behind the content.
// Once a drawing is on screen, its dots are pigmented in group by group, and then stay. Visitors who
// reduce motion get the full drawing from the stylesheet instead.

type Variant = 'hero' | 'band' | 'end'
type Box = { left: number; right: number; top: number; bottom: number }

const WIDTH = 560
const GROUPS = 16 // dots appear group by group, each group with its own dot size
// Share of the placed dots that is drawn: drawing them all reads as too busy, and the spacing still
// comes from all of them
const SHOWN = 0.6

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
  // Where the dots start to thicken, made uneven by a wave
  const edge = between(0.25, 0.38)
  const wave = randomWave(between(0.06, 0.1))
  const shape = (u: number, v: number) => {
    const at = edge + wave(v)
    return smoothstep(at - 0.2, at + 0.3, u) * (1 - smoothstep(0.88, 1, u))
  }
  // Dense on the left at the end of the page
  return variant === 'end' ? (u: number, v: number) => shape(1 - u, v) : shape
}

export const randomDots = (variant: Variant, width: number, height: number, avoid: Box[] = []) => {
  const shape = randomShape(variant)
  const points = scatterDots(
    (x, y) => shape(x / width, y / height) * clearance(avoid, x, y),
    width,
    height,
  )
  const shown = points.filter(() => Math.random() < SHOWN)

  return randomGroups(shown, GROUPS).map((group, i) => ({
    d: dotPath(group),
    threshold: i / GROUPS,
    width: between(2.2, 3.4),
  }))
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
      const avoid = variant === 'end' ? [] : textBoxes(container, box)

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
        // Stronger on phones and tablets, where the patch is a small corner
        'dot-field pointer-events-none text-foreground/50 lg:text-foreground/30',
        `dot-field-${variant}`,
        className,
      )}
      ref={ref}
      style={{ '--dot-fill': 0, '--dot-groups': GROUPS } as React.CSSProperties}
    >
      <svg
        className={cn('absolute top-0 h-full', variant === 'end' ? 'left-0' : 'right-0')}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        style={{ width: WIDTH }}
      />
    </div>
  )
}
