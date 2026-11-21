'use client'

import React, { useEffect, useState } from 'react'

import { cn } from '@/utilities/ui'

type Category = { anchor: string; count: number; title: string }

// Links to the categories, marking the one being read: chips above the questions on phones and
// tablets, and a list beside them that stays in view on large screens
export const CategoryNav: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const [current, setCurrent] = useState(categories[0]?.anchor)

  useEffect(() => {
    // The category being read is the last one whose top has passed 30% of the screen height. At
    // the end of the page, which a short last category can keep lower than that, it is the
    // category of the question or category the page links to when that is on screen, else the
    // last category.
    const markCurrent = () => {
      const { innerHeight, location, scrollY } = window
      const byId = (id: string) => document.getElementById(id)
      const passed = categories.filter(
        ({ anchor }) =>
          (byId(anchor)?.getBoundingClientRect().top ?? Infinity) <= innerHeight * 0.3,
      )
      let category: Category | undefined = passed.at(-1) ?? categories[0]

      if (scrollY > 0 && innerHeight + scrollY >= document.documentElement.scrollHeight - 1) {
        const target = location.hash && byId(decodeURIComponent(location.hash.slice(1)))
        const box = target && target.getBoundingClientRect()
        const linked =
          box && box.bottom > 0 && box.top < innerHeight
            ? categories.find(({ anchor }) => byId(anchor)?.contains(target))
            : undefined
        category = linked ?? categories.at(-1)
      }
      if (category) setCurrent(category.anchor)
    }
    markCurrent()
    // A link to a category already on screen changes the address without scrolling
    window.addEventListener('hashchange', markCurrent)
    window.addEventListener('scroll', markCurrent, { passive: true })
    window.addEventListener('resize', markCurrent)
    return () => {
      window.removeEventListener('hashchange', markCurrent)
      window.removeEventListener('scroll', markCurrent)
      window.removeEventListener('resize', markCurrent)
    }
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
              <span
                aria-hidden
                className="hidden text-xs text-muted-foreground tabular-nums lg:inline"
              >
                {count}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
