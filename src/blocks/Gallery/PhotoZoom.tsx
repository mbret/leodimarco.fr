'use client'

import React, { useEffect, useRef, useState } from 'react'

// A point of the photo, in percent of its width and height
export type ZoomPoint = { x: number; y: number }

const ZOOM = 2.5

export const pointIn = (element: Element, clientX: number, clientY: number): ZoomPoint => {
  const box = element.getBoundingClientRect()
  if (!box.width || !box.height) return { x: 50, y: 50 }
  const clamp = (value: number) => Math.min(100, Math.max(0, value))
  return {
    x: clamp(((clientX - box.left) / box.width) * 100),
    y: clamp(((clientY - box.top) / box.height) * 100),
  }
}

// The photo enlarged over its frame, at full size so the pigment dots stay sharp. The enlarged
// area follows the mouse, or the finger while it drags. A tap or a click that ends no drag closes
// it, and so does Escape.
export const PhotoZoom: React.FC<{
  at: ZoomPoint
  objectPosition?: string
  onClose: () => void
  onMove: (point: ZoomPoint) => void
  src: string
}> = ({ at, objectPosition, onClose, onMove, src }) => {
  const [loaded, setLoaded] = useState(false)
  // Where the pointer went down, to tell a tap from a drag
  const pressedAt = useRef<{ x: number; y: number } | null>(null)
  const dragged = useRef(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div
      aria-hidden
      className="absolute inset-0 cursor-zoom-out touch-none overflow-hidden rounded-md"
      data-testid="photo-zoom"
      // Closing on the click rather than on pointerup: a phone sends its click after the finger
      // lifts, and it would reopen the zoom from the photo under it
      onClick={() => {
        if (!dragged.current) onClose()
        dragged.current = false
      }}
      onPointerDown={(event) => {
        pressedAt.current = { x: event.clientX, y: event.clientY }
        dragged.current = false
        event.currentTarget.setPointerCapture?.(event.pointerId)
      }}
      onPointerMove={(event) => {
        const start = pressedAt.current
        // A mouse moves the enlarged area as it hovers, a finger only while it drags
        if (event.pointerType !== 'mouse' && !start) return
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 8) {
          dragged.current = true
        }
        onMove(pointIn(event.currentTarget, event.clientX, event.clientY))
      }}
      onPointerUp={() => {
        pressedAt.current = null
      }}
      onPointerCancel={() => {
        pressedAt.current = null
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the full-size file, not a resized one */}
      <img
        alt=""
        className="h-full w-full object-cover transition-opacity duration-200 motion-reduce:transition-none"
        draggable={false}
        onLoad={() => setLoaded(true)}
        src={src}
        style={{
          objectPosition,
          opacity: loaded ? 1 : 0,
          transform: `scale(${ZOOM})`,
          transformOrigin: `${at.x}% ${at.y}%`,
        }}
      />
    </div>
  )
}
