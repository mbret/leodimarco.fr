import { ArrowRightIcon } from 'lucide-react'
import React from 'react'

import type { ServicesBlock as ServicesBlockProps } from '@/payload-types'

import { BlockHeading } from '@/components/BlockHeading'
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

import { EffectDrawing } from './EffectDrawing'

type Service = ServicesBlockProps['items'][number]

// A service as a tile without a frame. Its link's ::after covers the whole tile.
const ServiceTile: React.FC<{ Heading: 'h2' | 'h3'; item: Service }> = ({ Heading, item }) => (
  <div className="group relative flex flex-col">
    {item.illustration && (
      <EffectDrawing
        className="aspect-[5/4] w-full rounded-lg bg-muted text-foreground/70"
        effect={item.illustration}
      />
    )}
    <Heading className="mt-5 font-heading text-lg font-semibold tracking-normal">
      {item.title}
    </Heading>
    {item.price && <p className="mt-1 text-sm text-muted-foreground">{item.price}</p>}
    {item.description && (
      <p className="mt-2 whitespace-pre-line text-muted-foreground">{item.description}</p>
    )}
    {item.enableLink && (
      <CMSLink
        {...item.link}
        appearance="inline"
        className="mt-4 inline-flex items-center gap-1.5 self-start font-medium outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
      >
        <ArrowRightIcon
          aria-hidden
          className="size-4 transition-transform group-hover:translate-x-1"
        />
      </CMSLink>
    )}
  </div>
)

export const ServicesBlock: React.FC<ServicesBlockProps> = ({
  enableLink,
  heading,
  items,
  layout,
  link,
}) => {
  // Service names are headings so search engines see them, one level below the block heading
  const ItemHeading = heading ? 'h3' : 'h2'
  const services = items || []

  return (
    <div className="container">
      <BlockHeading enableLink={enableLink} heading={heading} link={link} />
      {/* Two columns from tablets, and rows of three on large screens when the services fill them */}
      <div
        className={cn('grid gap-4 md:grid-cols-2', {
          'lg:grid-cols-3': services.length % 3 === 0,
          'gap-x-6 gap-y-10': layout === 'drawings',
        })}
      >
        {services.map((item) =>
          layout === 'drawings' ? (
            <ServiceTile Heading={ItemHeading} item={item} key={item.id} />
          ) : (
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
          ),
        )}
      </div>
    </div>
  )
}
