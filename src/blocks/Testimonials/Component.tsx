import { StarIcon } from 'lucide-react'
import React from 'react'

import type { TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({
  enableLink,
  heading,
  intro,
  link,
  reviews,
}) => {
  // Nothing to show until a review has been entered
  if (!reviews?.length) return null

  return (
    <div className="container">
      {heading && <h2 className="text-2xl font-semibold">{heading}</h2>}
      {intro && <p className="mt-4 max-w-[48rem] text-muted-foreground">{intro}</p>}
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <li key={review.id}>
            <figure className="flex h-full flex-col rounded-lg border border-border bg-card p-6">
              <div aria-label={`Note : ${review.rating} sur 5`} className="flex gap-1" role="img">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    aria-hidden
                    className={cn(
                      'size-4',
                      i < review.rating ? 'fill-current' : 'text-muted-foreground',
                    )}
                    key={i}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 leading-relaxed whitespace-pre-line">
                {review.text}
              </blockquote>
              {review.author && (
                <figcaption className="mt-6 text-sm text-muted-foreground">
                  {review.author}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
      {enableLink && (
        <CMSLink
          className="mt-8 inline-block text-sm font-medium underline underline-offset-4"
          {...link}
        />
      )}
    </div>
  )
}
