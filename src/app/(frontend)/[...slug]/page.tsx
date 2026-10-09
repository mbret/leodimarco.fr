import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { permanentRedirect } from 'next/navigation'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { DotField } from '@/components/DotField'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { pagePath } from '@/utilities/pagePath'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { cn } from '@/utilities/ui'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      breadcrumbs: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map((doc) => {
      // /prestations/effet-rase becomes ['prestations', 'effet-rase']
      return { slug: pagePath(doc).split('/').filter(Boolean) }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = ['home'] } = await paramsPromise
  // Decode to support slugs with special characters
  const segments = slug.map(decodeURIComponent)
  const url = '/' + segments.join('/')
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug: segments[segments.length - 1],
  })

  // Remove this code once your website is seeded
  if (!page && url === '/home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  // A page has one address: /effet-rase leads to /prestations/effet-rase
  const path = pagePath(page)
  if (page.slug !== 'home' && path !== url) {
    permanentRedirect(path)
  }

  const { breadcrumbs, hero, layout } = page
  // Pages with dots beside their title get them mirrored at the bottom left too
  const dots = hero?.type === 'lowImpact' && Boolean(hero.dotPattern)

  return (
    <article className={cn('pt-8 md:pt-16 pb-12 md:pb-24', dots && 'relative isolate')}>
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} breadcrumbs={breadcrumbs} />
      <RenderBlocks blocks={layout} />
      {dots && (
        <DotField
          className="container absolute inset-x-0 bottom-0 -z-10 h-60 overflow-hidden"
          variant="end"
        />
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = ['home'] } = await paramsPromise
  // Decode to support slugs with special characters
  const segments = slug.map(decodeURIComponent)
  const page = await queryPageBySlug({
    slug: segments[segments.length - 1],
  })

  const url = '/' + segments.join('/')

  return generateMeta({ doc: page, path: page ? pagePath(page) : url === '/home' ? '/' : url })
}

// Slugs are unique, so the last segment of the path is enough to find the page
const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
