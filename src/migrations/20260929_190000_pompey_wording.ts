import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-vercel-postgres'

// The studio is in Pompey, near Nancy. Only the exact texts written by the starter content
// are replaced, so anything an editor wrote about Nancy is left untouched.
const replacements: [string, string][] = [
  ['Tricopigmentation à Nancy', 'Tricopigmentation à Pompey, près de Nancy'],
  [
    'Tricopigmentation à Nancy. Effet crâne rasé, densification et camouflage de cicatrices, dans un studio privé sur rendez-vous.',
    'Tricopigmentation à Pompey, près de Nancy. Effet crâne rasé, densification et camouflage de cicatrices, dans un studio privé sur rendez-vous.',
  ],
  [
    'Léo Di Marco, tricopigmentation (micropigmentation capillaire) à Nancy (54) : effet crâne rasé, densification et camouflage de cicatrices.',
    'Léo Di Marco, tricopigmentation (micropigmentation capillaire) à Pompey (54), près de Nancy : effet crâne rasé, densification et camouflage de cicatrices.',
  ],
  [
    'Prenez rendez-vous pour une tricopigmentation à Nancy : studio privé, sur rendez-vous. Décrivez votre situation, réponse rapide.',
    'Prenez rendez-vous pour une tricopigmentation à Pompey, près de Nancy : studio privé, sur rendez-vous. Décrivez votre situation, réponse rapide.',
  ],
  [
    'Photos avant / après de tricopigmentations réalisées à Nancy : effet crâne rasé, densification, cicatrices.',
    'Photos avant / après de tricopigmentations réalisées à Pompey, près de Nancy : effet crâne rasé, densification, cicatrices.',
  ],
  [
    'Tricopigmentation à Nancy : effet crâne rasé, densification des cheveux clairsemés, camouflage de cicatrices et retouches.',
    'Tricopigmentation à Pompey, près de Nancy : effet crâne rasé, densification des cheveux clairsemés, camouflage de cicatrices et retouches.',
  ],
  [
    'Je suis Léo, praticien en tricopigmentation, formé et certifié par la Medico Derm Academy. Je vous accueille dans mon studio privé à Nancy, sur rendez-vous.',
    'Je suis Léo, praticien en tricopigmentation, formé et certifié par la Medico Derm Academy. Je vous accueille dans mon studio privé à Pompey, près de Nancy, sur rendez-vous.',
  ],
  [
    'Léo Di Marco, praticien en tricopigmentation formé à la Medico Derm Academy, studio privé à Nancy.',
    'Léo Di Marco, praticien en tricopigmentation formé à la Medico Derm Academy, studio privé à Pompey, près de Nancy.',
  ],
  [
    'Tout savoir sur la tricopigmentation : origine, différence avec le tatouage, matériel, séances, douleur, résultat et soins. Studio à Nancy.',
    'Tout savoir sur la tricopigmentation : origine, différence avec le tatouage, matériel, séances, douleur, résultat et soins. Studio à Pompey, près de Nancy.',
  ],
]

// Replaces whole string values only: a text that merely contains one of these is not changed
const reword = <T>(value: T): T => {
  let json = JSON.stringify(value)
  for (const [from, to] of replacements) {
    json = json.split(JSON.stringify(from)).join(JSON.stringify(to))
  }
  return JSON.parse(json)
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs: pages } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 0,
    pagination: false,
    req,
  })

  for (const page of pages) {
    const data = { hero: page.hero, layout: page.layout, meta: page.meta }
    const reworded = reword(data)
    if (JSON.stringify(reworded) === JSON.stringify(data)) continue

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: reworded,
      depth: 0,
      req,
      // Migrations run before the build, which renders the new content anyway
      context: { disableRevalidate: true },
    })
  }

  // Move the studio address, unless it was changed from the previous default
  const studio = await payload.findGlobal({ slug: 'studio', depth: 0, req })
  if (
    studio.street === '23 Grande Rue' &&
    studio.postalCode === '54000' &&
    studio.city === 'Nancy'
  ) {
    await payload.updateGlobal({
      slug: 'studio',
      data: { street: '74 rue des Jardins Fleuris', postalCode: '54340', city: 'Pompey' },
      depth: 0,
      req,
      context: { disableRevalidate: true },
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content change only
}
