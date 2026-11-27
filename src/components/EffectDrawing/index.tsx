'use client'

import React, { useEffect, useRef } from 'react'

import type { ServicesBlock } from '@/payload-types'

import { between, dotPath, scatterDots, smoothstep } from '@/components/DotField'
import { cn } from '@/utilities/ui'

export type Effect = NonNullable<ServicesBlock['items'][number]['illustration']>

// The drawing's box, which its frame shows at 5:4
const WIDTH = 400
const HEIGHT = 320
const SCAR_GROUPS = 6
// Pointing at the tile, the dots fill the scar group by group
const SCAR_CLASS =
  'opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none'

// Two waves with random frequencies and phases, for an uneven line across the drawing
const randomWave = (amplitude: number) => {
  const waves = [
    { amplitude, frequency: between(5, 9), phase: between(0, 2 * Math.PI) },
    { amplitude: amplitude / 3, frequency: between(13, 19), phase: between(0, 2 * Math.PI) },
  ]
  return (t: number) =>
    waves.reduce((sum, wave) => sum + wave.amplitude * Math.sin(t * wave.frequency + wave.phase), 0)
}

type Drawing = { dots: string; hairs?: string; scar?: string[] }

const drawings: Record<Effect, () => Drawing> = {
  // Even dots under an uneven frontal hairline
  shaved: () => {
    const wave = randomWave(0.05)
    const edge = between(0.22, 0.3)
    const chance = (x: number, y: number) =>
      0.95 * smoothstep(-0.06, 0.1, y / HEIGHT - edge - wave(x / WIDTH))
    return { dots: dotPath(scatterDots(chance, WIDTH, HEIGHT)) }
  },
  // Dots between sparse hairs, closer together towards the bottom
  density: () => {
    const hairs = scatterDots(() => 0.015, WIDTH, HEIGHT)
      .map(([x, y]) => {
        const length = between(12, 20)
        const angle = between(-2.1, -1.8)
        const dx = Math.round(Math.cos(angle) * length)
        const dy = Math.round(Math.sin(angle) * length)
        return `M${Math.round(x)} ${Math.round(y)}q${Math.round(dx / 2) + 3} ${Math.round(dy / 2)} ${dx} ${dy}`
      })
      .join('')
    const chance = (_x: number, y: number) => 0.25 + 0.5 * (y / HEIGHT)
    return { dots: dotPath(scatterDots(chance, WIDTH, HEIGHT)), hairs }
  },
  // Dense dots except along a curved scar
  scar: () => {
    const amplitude = between(0.1, 0.16)
    const phase = between(0, 2 * Math.PI)
    const onScar = ([x, y]: [number, number]) =>
      Math.abs(y - HEIGHT * (0.52 + amplitude * Math.sin((x / WIDTH) * 3.2 + phase))) < 10
    const points = scatterDots(() => 0.9, WIDTH, HEIGHT)
    const scar = Array.from({ length: SCAR_GROUPS }, (): [number, number][] => [])
    for (const point of points.filter(onScar)) {
      scar[Math.floor(Math.random() * SCAR_GROUPS)].push(point)
    }
    return { dots: dotPath(points.filter((point) => !onScar(point))), scar: scar.map(dotPath) }
  },
}

// A dot drawing of what an effect does, in a new arrangement on every visit, like the dot pattern
// beside the titles. The browser draws it, so the server and the browser agree on the empty frame.
export const EffectDrawing: React.FC<{ className?: string; effect: Effect }> = ({
  className,
  effect,
}) => {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return

    const path = (d: string, width: number, className?: string, delay?: number) => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      element.setAttribute('d', d)
      element.setAttribute('stroke-width', String(width))
      if (className) element.setAttribute('class', className)
      if (delay) element.style.transitionDelay = `${delay}ms`
      return element
    }

    const { dots, hairs, scar = [] } = drawings[effect]()
    svg.replaceChildren(
      ...(hairs ? [path(hairs, 1.4, 'opacity-60')] : []),
      path(dots, 3),
      ...scar.map((d, i) => path(d, 3, SCAR_CLASS, i * 80)),
    )
  }, [effect])

  return (
    <svg
      aria-hidden
      className={cn('block', className)}
      fill="none"
      ref={ref}
      stroke="currentColor"
      strokeLinecap="round"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    />
  )
}
