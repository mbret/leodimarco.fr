import type { Payload } from 'payload'

import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

// Only shown until the starter pages exist
const BeforeDashboard = async ({ payload }: { payload: Payload }) => {
  const { totalDocs } = await payload.count({ collection: 'pages' })

  if (totalDocs > 0) return null

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Le site n&apos;a pas encore de pages.</h4>
      </Banner>
      <SeedButton /> : Accueil, Prestations, Galerie, À propos, FAQ et Contact, avec le menu et le
      formulaire de contact. Il ne reste plus qu&apos;à modifier les textes et ajouter les photos.
    </div>
  )
}

export default BeforeDashboard
