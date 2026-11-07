import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Media } from '../../components/Media'
import { toPlainText } from '@/utilities/toPlainText'
import { PhotoRow } from './PhotoRow'

type Column = NonNullable<ContentBlockProps['columns']>[number]
type Size = NonNullable<Column['size']>

// Twelfths of the page column
const spans: Record<Size, number> = { full: 12, half: 6, oneThird: 4, twoThirds: 8 }

// Page column: 960px wide from 1024px screens, 80px per twelfth. Text columns take half the screen
// on tablets, and a full column stays as narrow as the hero text.
const imageSizes = (span: number) =>
  span === 12
    ? '(max-width: 768px) 100vw, 768px'
    : `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, ${80 * span}px`

const isImageOnly = (column: Column): column is Column & { media: NonNullable<Column['media']> } =>
  Boolean(column.media) && !column.enableLink && !toPlainText(column.richText)

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  // Several columns that each hold only an image make a row of photos
  if (columns && columns.length > 1 && columns.every(isImageOnly)) {
    return (
      <PhotoRow
        photos={columns.map(({ id, media, size }) => ({
          id,
          media,
          span: spans[size ?? 'oneThird'],
        }))}
      />
    )
  }

  return (
    <div className="container">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, media, richText } = col
            const size = col.size ?? 'oneThird'
            const hasText = Boolean(toPlainText(richText))

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${spans[size]}`, {
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
                    size={imageSizes(spans[size])}
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
