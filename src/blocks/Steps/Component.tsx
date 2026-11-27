import React from 'react'

import type { StepsBlock as StepsBlockProps } from '@/payload-types'

import { BlockHeading } from '@/components/BlockHeading'
import { cn } from '@/utilities/ui'

// Numbered steps joined by a line of dots: down the page on phones and tablets, across it in one
// row on large screens
export const StepsBlock: React.FC<StepsBlockProps> = ({ heading, items }) => {
  const steps = items || []
  // One level below the block heading, as the names of the services
  const StepHeading = heading ? 'h3' : 'h2'

  return (
    <div className="container">
      <BlockHeading heading={heading} />
      <ol className="grid gap-8 lg:auto-cols-fr lg:grid-flow-col lg:gap-6">
        {steps.map(({ id, label, text, title }, index) => (
          <li className="relative pl-14 lg:pt-14 lg:pl-0" key={id}>
            <span
              aria-hidden
              className="absolute top-0 left-0 grid size-9 place-items-center rounded-full border border-foreground text-sm font-medium tabular-nums"
            >
              {index + 1}
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute top-12 -bottom-6 left-[17px] w-[3px] text-foreground/40',
                  'bg-[radial-gradient(circle,currentColor_1.2px,transparent_1.6px)] bg-[length:3px_9px] bg-repeat-y',
                  'lg:top-[17px] lg:right-[-0.75rem] lg:bottom-auto lg:left-12 lg:h-[3px] lg:w-auto lg:bg-[length:9px_3px] lg:bg-repeat-x',
                )}
              />
            )}
            {label && (
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                {label}
              </p>
            )}
            <StepHeading className="mt-1 font-heading text-lg leading-snug font-semibold tracking-normal">
              {title}
            </StepHeading>
            {text && <p className="mt-2 text-muted-foreground">{text}</p>}
          </li>
        ))}
      </ol>
    </div>
  )
}
