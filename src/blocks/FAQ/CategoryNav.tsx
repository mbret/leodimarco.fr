'use client'

import React, { useEffect, useState } from 'react'

import { cn } from '@/utilities/ui'

type Category = { anchor: string; count: number; title: string }

// Links to the categories: chips above the questions on phones and tablets, and a list that stays
// beside them on large screens, marking the category being read
export const CategoryNav: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const [current, setCurrent] = useState(categories[0]?.anchor)

  useEffect(() => {
    // A category is being read while it crosses the band from 10% to 30% of the screen height. In
    // the gap between two categories, the previous one stays marked.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find(({ isIntersecting }) => isIntersecting)
        if (entry) setCurrent(entry.target.id)
      },
      { rootMargin: '-10% 0px -70% 0px' },
    )
    categories.forEach(({ anchor }) => {
      const section = document.getElementById(anchor)
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [categories])

  return (
    <nav aria-label="Catégories de questions" className="mb-10 lg:sticky lg:top-8 lg:mb-0">
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0">
        {categories.map(({ anchor, count, title }) => (
          <li key={anchor}>
            <a
              aria-current={current === anchor ? 'location' : undefined}
              className={cn(
                'flex items-baseline justify-between gap-3 rounded-full border border-border bg-card px-4 py-1.5 text-sm transition-colors hover:text-foreground',
                'lg:rounded-none lg:border-0 lg:border-l-2 lg:bg-transparent lg:py-2.5 lg:pl-4',
                current === anchor
                  ? 'text-foreground lg:border-foreground'
                  : 'text-muted-foreground lg:border-border',
              )}
              href={`#${anchor}`}
            >
              {title}
              <span className="hidden text-xs text-muted-foreground tabular-nums lg:inline">
                {count}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
