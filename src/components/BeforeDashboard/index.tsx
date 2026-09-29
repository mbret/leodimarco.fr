import type { Payload } from 'payload'

import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

// Shown until the seed has finished: the home page and header menu are among its last steps,
// so a seed that failed partway can still be resumed from here
const BeforeDashboard = async ({ payload }: { payload: Payload }) => {
  const [{ totalDocs: homePages }, header] = await Promise.all([
    payload.count({ collection: 'pages', where: { slug: { equals: 'home' } } }),
    payload.findGlobal({ slug: 'header', depth: 0 }),
  ])

  if (homePages > 0 && header.navItems?.length) return null

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Le site n&apos;est pas encore prêt.</h4>
      </Banner>
      <SeedButton /> : Accueil, Prestations, Galerie, À propos, FAQ et Contact, avec le menu et le
      formulaire de contact. Il ne reste plus qu&apos;à modifier les textes et ajouter les photos.
    </div>
  )
}

export default BeforeDashboard
