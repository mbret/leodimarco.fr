import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Media } from '../../components/Media'
import { toPlainText } from '@/utilities/toPlainText'

type Column = NonNullable<ContentBlockProps['columns']>[number]
type Size = NonNullable<Column['size']>

const colsSpanClasses: Record<Size, string> = {
  full: '12',
  half: '6',
  oneThird: '4',
  twoThirds: '8',
}

// Written out in full so that Tailwind finds the classes
const rowSpanClasses: Record<Size, string> = {
  full: 'md:col-span-12',
  half: 'md:col-span-6',
  oneThird: 'md:col-span-4',
  twoThirds: 'md:col-span-8',
}

const widthShares: Record<Size, number> = {
  full: 1,
  half: 1 / 2,
  oneThird: 1 / 3,
  twoThirds: 2 / 3,
}

// Page column: 960px wide from 1024px screens. Text columns take half the screen on tablets, a full
// column stays as narrow as the hero text.
const columnImageSizes = (size: Size) =>
  size === 'full'
    ? '(max-width: 768px) 100vw, 768px'
    : `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, ${Math.round(960 * widthShares[size])}px`

const rowImageSizes = (size: Size) => {
  const share = widthShares[size]
  return `(max-width: 768px) 70vw, (max-width: 1024px) ${Math.round(100 * share)}vw, ${Math.round(960 * share)}px`
}

const isImageOnly = ({ enableLink, media, richText }: Column) =>
  Boolean(media) && !enableLink && !toPlainText(richText)

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  // Columns that each hold only an image make a row of photos: side by side from tablets, and a row
  // to swipe on phones, where each photo takes most of the screen and the next one shows at the edge
  if (columns && columns.length > 0 && columns.every(isImageOnly)) {
    return (
      <div className="container">
        <ul
          aria-label="Photos"
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:mx-0 md:grid md:grid-cols-12 md:gap-4 md:overflow-visible md:px-0"
          // Lets keyboard users scroll the row on phones
          tabIndex={0}
        >
          {columns.map(({ id, media, size }, index) => (
            <li
              className={cn(
                'w-[70%] shrink-0 snap-start md:w-auto',
                rowSpanClasses[size || 'oneThird'],
              )}
              key={id || index}
            >
              <Media
                imgClassName="rounded-xl border border-border"
                resource={media}
                size={rowImageSizes(size || 'oneThird')}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, media, richText, size } = col
            const hasText = Boolean(toPlainText(richText))

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                  // Keeps long text readable, no wider than the hero text
                  'max-w-[48rem]': size === 'full',
                })}
                key={index}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {media && (
                  <Media
                    className={cn(hasText && 'mt-6')}
                    imgClassName="rounded-xl border border-border"
                    resource={media}
                    size={columnImageSizes(size || 'oneThird')}
                  />
                )}

                {enableLink && (
                  <div className="mt-6">
                    <CMSLink {...link} />
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
