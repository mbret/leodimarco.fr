import { StarIcon } from 'lucide-react'
import React from 'react'

import type { TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'

import { colorFullStop } from '@/components/FullStop'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

type Review = NonNullable<TestimonialsBlockProps['reviews']>[number]

// Backgrounds of the initials, taken in turn as on Google, dark enough for the white initial
const INITIAL_BACKGROUNDS = [
  'bg-[oklch(0.5_0.13_255)]',
  'bg-[oklch(0.5_0.1_195)]',
  'bg-[oklch(0.5_0.13_300)]',
  'bg-[oklch(0.5_0.12_150)]',
  'bg-[oklch(0.5_0.13_20)]',
]

// The client's name after their photo, or after their initial when there is no photo
const Byline: React.FC<{ index: number; review: Review }> = ({ index, review }) => {
  const photo = typeof review.photo === 'object' ? review.photo : null
  if (!photo && !review.author) return null

  return (
    <figcaption className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
      {photo ? (
        <Media
          className="relative size-10 shrink-0 overflow-hidden rounded-full"
          fill
          imgClassName="object-cover"
          resource={photo}
          size="40px"
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full text-base font-medium text-white',
            INITIAL_BACKGROUNDS[index % INITIAL_BACKGROUNDS.length],
          )}
        >
          {Array.from((review.author ?? '').trim())[0]?.toLocaleUpperCase('fr')}
        </span>
      )}
      {review.author}
    </figcaption>
  )
}

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div aria-label={`Note : ${rating} sur 5`} className="flex gap-1" role="img">
    {Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        aria-hidden
        className={cn('size-4', i < rating ? 'fill-current' : 'text-muted-foreground')}
        key={i}
      />
    ))}
  </div>
)

// The first review in large type, beside the others: one quote gets read where three equal cards
// get skipped. Each review shows its excerpt when it has one.
const Featured: React.FC<{ reviews: Review[] }> = ({ reviews: [first, ...others] }) => (
  <div className="mt-8 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
    <figure>
      <Stars rating={first.rating} />
      <blockquote className="mt-5 font-heading text-2xl leading-tight font-medium tracking-tight text-balance md:text-4xl">
        «&nbsp;{first.excerpt || first.text}&nbsp;»
      </blockquote>
      <Byline index={0} review={first} />
    </figure>
    {others.length > 0 && (
      <ul className="grid content-start gap-6">
        {others.map((review, index) => (
          <li className="border-t border-border pt-5" key={review.id}>
            <figure>
              <Stars rating={review.rating} />
              <blockquote className="mt-3 leading-relaxed">
                «&nbsp;{review.excerpt || review.text}&nbsp;»
              </blockquote>
              <Byline index={index + 1} review={review} />
            </figure>
          </li>
        ))}
      </ul>
    )}
  </div>
)

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({
  enableLink,
  heading,
  intro,
  layout,
  link,
  reviews,
}) => {
  const items = reviews || []

  // Nothing to show without a review or a link, such as the one to the Google reviews
  if (items.length === 0 && !enableLink) return null

  return (
    <div className="container">
      {heading && <h2 className="text-2xl font-semibold">{colorFullStop(heading)}</h2>}
      {intro && <p className="mt-4 max-w-[48rem] text-muted-foreground">{intro}</p>}
      {items.length > 0 && layout === 'featured' && <Featured reviews={items} />}
      {items.length > 0 && layout !== 'featured' && (
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((review, index) => (
            <li key={review.id}>
              <figure className="flex h-full flex-col rounded-lg border border-border bg-card p-6">
                <Stars rating={review.rating} />
                <blockquote className="mt-4 flex-1 leading-relaxed whitespace-pre-line">
                  {review.text}
                </blockquote>
                <Byline index={index} review={review} />
              </figure>
            </li>
          ))}
        </ul>
      )}
      {enableLink && (
        <CMSLink
          className="mt-8 inline-block text-sm font-medium underline underline-offset-4"
          {...link}
        />
      )}
    </div>
  )
}
