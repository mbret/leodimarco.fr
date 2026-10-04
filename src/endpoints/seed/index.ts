import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

import type { Form, Page } from '@/payload-types'
import { SITE_NAME } from '@/utilities/siteName'

import { contactFormData } from './contactForm'
import { faqPageData } from './faq'
import { pageLink } from './links'
import { heading, paragraph, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

const hero = (title: string, intro?: string): PageData['hero'] => ({
  type: 'lowImpact',
  richText: richText(heading(title), ...(intro ? [paragraph(intro)] : [])),
})

const contactCta = (contact: Page) => ({
  blockType: 'cta' as const,
  richText: richText(
    heading('Envie d’en savoir plus ?', 'h3'),
    paragraph('Décrivez votre situation, je vous réponds pour en discuter.'),
  ),
  links: [pageLink(contact, 'Me contacter')],
})

const INSTAGRAM_URL = 'https://www.instagram.com/leodimarcotricopigmentation/'
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61557075478028'

const instagramCta = {
  blockType: 'cta' as const,
  richText: richText(
    heading('Plus de résultats sur Instagram', 'h3'),
    paragraph('Je partage régulièrement mes derniers résultats cicatrisés.'),
  ),
  links: [
    {
      link: {
        type: 'custom' as const,
        url: INSTAGRAM_URL,
        newTab: true,
        label: 'Suivre sur Instagram',
      },
    },
  ],
}

// SEO title and description; generateMeta appends the site name to the title
const meta = (title: string, description: string) => ({ title, description })

// Menu items whose page was deleted keep their row but lose their link
const hasValidLinks = (
  navItems?: { link?: { url?: string | null; reference?: { value?: unknown } | null } }[] | null,
) => Boolean(navItems?.some(({ link }) => link?.url || link?.reference?.value))

/**
 * Creates the starter pages, contact form and menus with placeholder text.
 * Only fills in what is missing, so it never overwrites content edited in the admin.
 */
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Creating starter content...')

  const findPage = async (slug: string) =>
    (
      await payload.find({
        collection: 'pages',
        depth: 0,
        limit: 1,
        req,
        where: { slug: { equals: slug } },
      })
    ).docs[0]

  const ensurePage = async (data: PageData): Promise<Page> =>
    (await findPage(data.slug!)) ||
    payload.create({
      collection: 'pages',
      data: { _status: 'published', ...data },
      depth: 0,
      req,
    })

  const existingForm = (
    await payload.find({
      collection: 'forms',
      depth: 0,
      limit: 1,
      req,
      where: { title: { equals: contactFormData.title } },
    })
  ).docs[0]

  const contactForm: Form =
    existingForm ||
    (await payload.create({ collection: 'forms', data: contactFormData, depth: 0, req }))

  const contact = await ensurePage({
    slug: 'contact',
    title: 'Contact',
    hero: hero(
      'Contact',
      'Studio privé, sur rendez-vous. Décrivez votre situation, je vous réponds pour convenir d’une consultation.',
    ),
    layout: [{ blockType: 'formBlock', form: contactForm.id, enableIntro: false }, instagramCta],
    meta: meta(
      'Contact et rendez-vous',
      'Prenez rendez-vous pour une tricopigmentation à Pompey, près de Nancy : studio privé, sur rendez-vous. Décrivez votre situation, réponse rapide.',
    ),
  })

  const galerie = await ensurePage({
    slug: 'galerie',
    title: 'Galerie',
    hero: hero(
      'Résultats',
      'Des résultats avant / après réalisés au studio, photographiés une fois cicatrisés.',
    ),
    layout: [{ blockType: 'gallery' }, instagramCta],
    meta: meta(
      'Résultats avant / après',
      'Photos avant / après de tricopigmentations réalisées à Pompey, près de Nancy : effet crâne rasé, densification, cicatrices.',
    ),
  })

  const prestations = await ensurePage({
    slug: 'prestations',
    title: 'Prestations',
    hero: hero(
      'Prestations',
      'Chaque projet commence par un rendez-vous pour étudier votre situation, définir la ligne frontale et choisir la teinte.',
    ),
    layout: [
      {
        blockType: 'services',
        items: [
          {
            title: 'Effet crâne rasé',
            description:
              'Recrée l’aspect d’une coupe rasée de près sur un crâne dégarni ou chauve, avec une ligne frontale adaptée à votre visage.',
            price: 'Sur devis',
          },
          {
            title: 'Densification',
            description:
              'Pour les cheveux clairsemés : des points de pigment entre les cheveux réduisent le contraste avec le cuir chevelu et donnent un effet de densité.',
            price: 'Sur devis',
          },
          {
            title: 'Camouflage de cicatrices',
            description:
              'Atténue les cicatrices de greffe (FUE, FUT) ou d’accident en les fondant dans la zone environnante.',
            price: 'Sur devis',
          },
          {
            title: 'Retouche',
            description: 'Raviver une tricopigmentation qui a pâli avec le temps.',
            price: 'Sur devis',
          },
        ],
      },
      contactCta(contact),
    ],
    meta: meta(
      'Prestations',
      'Tricopigmentation à Pompey, près de Nancy : effet crâne rasé, densification des cheveux clairsemés, camouflage de cicatrices et retouches.',
    ),
  })

  const aPropos = await ensurePage({
    slug: 'a-propos',
    title: 'À propos',
    hero: hero('À propos'),
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: richText(
              paragraph(
                'Je suis Léo, praticien en tricopigmentation, formé et certifié par la Medico Derm Academy. Je vous accueille dans mon studio privé à Pompey, près de Nancy, sur rendez-vous.',
              ),
              paragraph(
                'Lorsque la ligne frontale recule, les proportions du visage changent. Je n’aime pas l’idée de transformer un visage : j’aime l’idée de le rééquilibrer. Un résultat naturel se construit point après point, dans le détail.',
              ),
            ),
          },
        ],
      },
    ],
    meta: meta(
      'À propos',
      'Léo Di Marco, praticien en tricopigmentation formé à la Medico Derm Academy, studio privé à Pompey, près de Nancy.',
    ),
  })

  const faq = await ensurePage(faqPageData({ aPropos, contact, galerie, prestations }))

  const home = await ensurePage({
    slug: 'home',
    title: 'Accueil',
    hero: {
      type: 'lowImpact',
      richText: richText(
        heading(SITE_NAME),
        paragraph(
          'Tricopigmentation à Pompey, près de Nancy. Effet crâne rasé, densification et camouflage de cicatrices, dans un studio privé sur rendez-vous.',
        ),
      ),
      links: [
        pageLink(contact, 'Prendre rendez-vous', 'default'),
        pageLink(galerie, 'Voir les résultats', 'outline'),
      ],
    },
    layout: [{ blockType: 'gallery', heading: 'Avant / après', limit: 6 }, contactCta(contact)],
    meta: meta(
      'Tricopigmentation à Pompey, près de Nancy',
      'Léo Di Marco, tricopigmentation (micropigmentation capillaire) à Pompey (54), près de Nancy : effet crâne rasé, densification et camouflage de cicatrices.',
    ),
  })

  const header = await payload.findGlobal({ slug: 'header', depth: 0, req })
  if (!hasValidLinks(header.navItems)) {
    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          pageLink(home, 'Accueil'),
          pageLink(prestations, 'Prestations'),
          pageLink(galerie, 'Résultats'),
          pageLink(aPropos, 'À propos'),
          pageLink(faq, 'FAQ'),
          pageLink(contact, 'Contact'),
        ],
      },
      req,
    })
  }

  const footer = await payload.findGlobal({ slug: 'footer', depth: 0, req })
  if (!hasValidLinks(footer.navItems)) {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [pageLink(faq, 'FAQ'), pageLink(contact, 'Contact')],
      },
      req,
    })
  }

  // Fill in each studio detail only where nothing has been entered yet
  const studio = await payload.findGlobal({ slug: 'studio', depth: 0, req })
  const studioDefaults = {
    phone: '+33618510548',
    street: '74 rue des Jardins Fleuris',
    postalCode: '54340',
    city: 'Pompey',
  }
  const missingStudio = {
    ...Object.fromEntries(
      Object.entries(studioDefaults).filter(([key]) => !studio[key as keyof typeof studioDefaults]),
    ),
    ...(!studio.socials?.length && {
      socials: [
        { platform: 'instagram' as const, url: INSTAGRAM_URL },
        { platform: 'facebook' as const, url: FACEBOOK_URL },
      ],
    }),
  }
  if (Object.keys(missingStudio).length > 0) {
    await payload.updateGlobal({ slug: 'studio', data: missingStudio, req })
  }

  payload.logger.info('Starter content created.')
}
