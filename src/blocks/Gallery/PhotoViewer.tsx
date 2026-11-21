'use client'

import { XIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

import { cn } from '@/utilities/ui'

export type ViewerPhoto = {
  id: string
  alt: string
  label: string
  // The size the card already loaded, shown until the full-size file arrives
  preview: string
  src: string
}

// One view, whole on the screen at first. A pinch, the mouse wheel or a double tap zooms, and a
// drag moves the photo. It shows the size the card loaded until the full-size file arrives.
const ZoomablePhoto: React.FC<{ photo: ViewerPhoto }> = ({ photo }) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <TransformWrapper doubleClick={{ mode: 'toggle', step: 1.5 }} maxScale={8} minScale={1}>
      <TransformComponent contentClass="!h-full !w-full" wrapperClass="!h-full !w-full">
        <div className="relative h-full w-full">
          {photo.preview && (
            /* eslint-disable-next-line @next/next/no-img-element -- a file the page already loaded */
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
              src={photo.preview}
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- the full-size file, not a resized one */}
          <img
            alt={photo.alt}
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-200 motion-reduce:transition-none"
            draggable={false}
            onLoad={() => setLoaded(true)}
            src={photo.src}
            style={{ opacity: loaded ? 1 : 0 }}
          />
        </div>
      </TransformComponent>
    </TransformWrapper>
  )
}

// A client's photos one view at a time, with a chip per view: on the whole screen on phones, in a
// large panel over the dimmed page from tablets. It returns the view last shown to `onClose`, so the
// card can show it too. Escape or a click beside the panel closes it, and the arrow keys change the
// view.
export const PhotoViewer: React.FC<{
  onClose: (shown: number) => void
  photos: ViewerPhoto[]
  start: number
  title: string
}> = ({ onClose, photos, start, title }) => {
  const [shown, setShown] = useState(start)
  const close = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const photo = photos[shown]

  useEffect(() => {
    const opener = document.activeElement
    const { overflow } = document.documentElement.style
    document.documentElement.style.overflow = 'hidden'
    close.current?.focus()
    return () => {
      document.documentElement.style.overflow = overflow
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose(shown)
      if (event.key === 'ArrowRight') setShown((index) => Math.min(index + 1, photos.length - 1))
      if (event.key === 'ArrowLeft') setShown((index) => Math.max(index - 1, 0))
      // Keeps Tab among the viewer's buttons, as the page behind is out of reach
      if (event.key === 'Tab') {
        const buttons = [...(dialog.current?.querySelectorAll('button') ?? [])]
        const first = buttons[0]
        const last = buttons.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, photos.length, shown])

  if (!photo) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black md:bg-black/80 md:p-8 md:backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose(shown)
      }}
    >
      <div
        aria-label={title}
        aria-modal
        className="flex h-full w-full flex-col bg-black text-white md:h-[min(90vh,64rem)] md:w-[min(90vw,48rem)] md:overflow-hidden md:rounded-xl md:border md:border-white/15"
        ref={dialog}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
          <span className="text-sm">
            {title} · {photo.label}
          </span>
          <button
            aria-label="Fermer"
            className="rounded-full border border-white/30 p-2 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            onClick={() => onClose(shown)}
            ref={close}
            type="button"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        {/* Keeps the browser from scrolling or zooming the page while a finger moves the photo */}
        <div className="relative min-h-0 flex-1 cursor-grab touch-none active:cursor-grabbing">
          <ZoomablePhoto key={photo.id} photo={photo} />
        </div>
        {photos.length > 1 && (
          <div
            aria-label="Vues"
            className="flex justify-center gap-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            role="group"
          >
            {photos.map(({ id, label }, index) => (
              <button
                aria-pressed={index === shown}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                  index === shown
                    ? 'border-white bg-white text-black'
                    : 'border-white/30 text-white/80 hover:text-white',
                )}
                key={id}
                onClick={() => setShown(index)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
