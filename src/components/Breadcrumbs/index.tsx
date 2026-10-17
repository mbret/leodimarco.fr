import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Page } from '@/payload-types'

import { getServerSideURL } from '@/utilities/getURL'

// Trail above the title of a page that sits under another one, such as « Prestations › Effet
// rasé ». Search engines get it as structured data and can show it in their results.
export const Breadcrumbs: React.FC<{ breadcrumbs?: Page['breadcrumbs'] }> = ({ breadcrumbs }) => {
  const crumbs = (breadcrumbs || []).filter((crumb) => crumb.url && crumb.label)
  if (crumbs.length < 2) return null

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      item: `${getServerSideURL()}${crumb.url}`,
    })),
  }

  return (
    <nav aria-label="Fil d’Ariane" className="mb-4 md:mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((crumb, i) => (
          <li className="flex items-center gap-1.5" key={crumb.id || crumb.url}>
            {i > 0 && <ChevronRight aria-hidden className="size-3.5" />}
            {i === crumbs.length - 1 ? (
              <span aria-current="page" className="text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link className="transition-colors hover:text-foreground" href={crumb.url!}>
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
        type="application/ld+json"
      />
    </nav>
  )
}
