'use client'

import React, { useEffect, useState } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

// A point of the photo, in percent of its width and height
export type ZoomPoint = { x: number; y: number }

const OPENING_SCALE = 2.5

export const pointIn = (element: Element, clientX: number, clientY: number): ZoomPoint => {
  const box = element.getBoundingClientRect()
  if (!box.width || !box.height) return { x: 50, y: 50 }
  const clamp = (value: number) => Math.min(100, Math.max(0, value))
  return {
    x: clamp(((clientX - box.left) / box.width) * 100),
    y: clamp(((clientY - box.top) / box.height) * 100),
  }
}

// The photo enlarged over its frame, from the full-size file so the pigment dots stay sharp. It
// opens enlarged on the point that was tapped, on the photo already shown until the full-size file
// loads. A pinch or the mouse wheel zooms, a drag moves the photo, and a double tap zooms in or
// back out. Escape closes it.
export const PhotoZoom: React.FC<{
  at: ZoomPoint
  // The frame's size in pixels, to open on `at`
  frame: { width: number; height: number }
  objectPosition?: string
  onClose: () => void
  // The photo the frame already shows, at a smaller size
  preview: string
  src: string
}> = ({ at, frame, objectPosition, onClose, preview, src }) => {
  const [loaded, setLoaded] = useState(false)

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
      // Keeps the browser from scrolling or zooming the page while a finger moves the photo
      className="absolute inset-0 cursor-grab touch-none overflow-hidden rounded-md active:cursor-grabbing"
      data-testid="photo-zoom"
    >
      <TransformWrapper
        doubleClick={{ mode: 'toggle' }}
        initialPositionX={(at.x / 100) * frame.width * (1 - OPENING_SCALE)}
        initialPositionY={(at.y / 100) * frame.height * (1 - OPENING_SCALE)}
        initialScale={OPENING_SCALE}
        maxScale={8}
        minScale={1}
        wheel={{ step: 0.2 }}
      >
        <TransformComponent contentClass="!h-full !w-full" wrapperClass="!h-full !w-full">
          <div className="relative h-full w-full">
            {preview && (
              /* eslint-disable-next-line @next/next/no-img-element -- a file the page already loaded */
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
                src={preview}
                style={{ objectPosition }}
              />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- the full-size file, not a resized one */}
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 motion-reduce:transition-none"
              data-full-size
              draggable={false}
              onLoad={() => setLoaded(true)}
              src={src}
              style={{ objectPosition, opacity: loaded ? 1 : 0 }}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}
