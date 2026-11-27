import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FAQBlock } from '@/blocks/FAQ/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { GalleryBlock } from '@/blocks/Gallery/Component'
import { KeyFactsBlock } from '@/blocks/KeyFacts/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ServicesBlock } from '@/blocks/Services/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'

const blockComponents = {
  content: ContentBlock,
  cta: CallToActionBlock,
  faq: FAQBlock,
  formBlock: FormBlock,
  gallery: GalleryBlock,
  keyFacts: KeyFactsBlock,
  mediaBlock: MediaBlock,
  services: ServicesBlock,
  testimonials: TestimonialsBlock,
}

type Block = Page['layout'][0]

// A green band that ends the page rests on the footer, without the space under the other blocks
export const endsOnBand = (blocks?: Block[] | null) => {
  const last = blocks?.at(-1)
  return last?.blockType === 'cta' && last.style === 'band'
}

export const RenderBlocks: React.FC<{
  blocks: Block[]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              const restsOnFooter = index === blocks.length - 1 && endsOnBand(blocks)
              return (
                <div className={restsOnFooter ? 'mt-10 md:mt-16' : 'my-10 md:my-16'} key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
