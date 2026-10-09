import React from 'react'

import type { ServicesBlock as ServicesBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/utilities/ui'

export const ServicesBlock: React.FC<ServicesBlockProps> = ({ heading, items }) => {
  // Service names are headings so search engines see them, one level below the block heading
  const ItemHeading = heading ? 'h3' : 'h2'
  const services = items || []

  return (
    <div className="container">
      {heading && <h2 className="mb-8 text-3xl font-semibold">{heading}</h2>}
      {/* Rows of three on large screens when the services fill them, otherwise two columns */}
      <div
        className={cn(
          'grid gap-4',
          services.length % 3 === 0 ? 'lg:grid-cols-3' : 'md:grid-cols-2',
        )}
      >
        {services.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="font-heading">
                {/* globals.css tightens h2 letter spacing, which only suits large titles */}
                <ItemHeading className="tracking-normal">{item.title}</ItemHeading>
              </CardTitle>
              {item.price && <CardDescription>{item.price}</CardDescription>}
            </CardHeader>
            {item.description && (
              <CardContent>
                <p className="whitespace-pre-line">{item.description}</p>
              </CardContent>
            )}
            {/* Kept at the bottom so the buttons line up across cards */}
            {item.enableLink && (
              <CardFooter className="mt-auto">
                <CMSLink {...item.link} />
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
