import React from 'react'

import type { KeyFactsBlock as KeyFactsBlockProps } from '@/payload-types'

export const KeyFactsBlock: React.FC<KeyFactsBlockProps> = ({ items }) => {
  return (
    <div className="container">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {(items || []).map((item) => (
          <li
            className="flex flex-col rounded-lg border border-border bg-card p-4 sm:p-6"
            key={item.id}
          >
            <p className="font-heading text-xl leading-tight font-semibold tracking-tight sm:text-2xl lg:text-3xl">
              {item.value}
            </p>
            {/* Captions line up at the bottom when a value wraps */}
            <p className="mt-auto pt-3 text-sm leading-snug text-muted-foreground">{item.label}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
