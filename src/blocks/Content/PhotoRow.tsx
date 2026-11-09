import React from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'

type Photo = { id?: string | null; media: number | MediaType; span: number }

// Photos side by side from tablets, each spanning its twelfths of the page column (80px each from
// 1024px screens). On phones they make a row to swipe, where each photo takes most of the screen
// and the next one shows at the edge.
export const PhotoRow: React.FC<{ photos: Photo[] }> = ({ photos }) => (
  <div className="container">
    <ul
      aria-label="Photos"
      className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:mx-0 md:grid md:grid-cols-12 md:gap-4 md:overflow-visible md:px-0"
      // Lets keyboard users scroll the row on phones
      tabIndex={0}
    >
      {photos.map(({ id, media, span }, index) => (
        // md:col-span-* classes are listed with @source inline in globals.css
        <li
          className={`w-[70%] shrink-0 snap-start md:w-auto md:col-span-${span}`}
          key={id || index}
        >
          <Media
            imgClassName="rounded-xl border border-border"
            resource={media}
            size={`(max-width: 768px) 70vw, (max-width: 1024px) ${Math.round((100 * span) / 12)}vw, ${80 * span}px`}
          />
        </li>
      ))}
    </ul>
  </div>
)
