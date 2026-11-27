'use client'

import React, { useEffect, useRef } from 'react'

import type { ServicesBlock } from '@/payload-types'

import {
  type Point,
  between,
  dotPath,
  randomGroups,
  randomWave,
  scatterDots,
  smoothstep,
} from '@/components/DotField/dots'
import { cn } from '@/utilities/ui'

type Effect = NonNullable<ServicesBlock['items'][number]['illustration']>

// The drawing's box, which its frame shows at 5:4
const WIDTH = 400
const HEIGHT = 320
// The scar's dots fill it group by group, in a loop that globals.css draws (.scar-dots)
const SCAR_GROUPS = 6

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
    const onScar = ([x, y]: Point) =>
      Math.abs(y - HEIGHT * (0.52 + amplitude * Math.sin((x / WIDTH) * 3.2 + phase))) < 10
    const points = scatterDots(() => 0.9, WIDTH, HEIGHT)
    return {
      dots: dotPath(points.filter((point) => !onScar(point))),
      scar: randomGroups(points.filter(onScar), SCAR_GROUPS).map(dotPath),
    }
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
      if (delay) element.style.animationDelay = `${delay}ms`
      return element
    }

    const { dots, hairs, scar = [] } = drawings[effect]()
    svg.replaceChildren(
      ...(hairs ? [path(hairs, 1.4, 'opacity-60')] : []),
      path(dots, 3),
      ...scar.map((d, i) => path(d, 3, 'scar-dots', i * 150)),
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
