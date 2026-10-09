import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

import type { Form, Page } from '@/payload-types'

import { aProposPageData } from './aPropos'
import { faqPageData } from './faq'
import { homePageData } from './home'
import { pageLink } from './links'
import { prestationsPageData, servicePagesData } from './prestations'
import { heading, paragraph, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

const hero = (title: string, intro?: string): PageData['hero'] => ({
  type: 'lowImpact',
  dotPattern: true,
  richText: richText(heading(title), ...(intro ? [paragraph(intro)] : [])),
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

const contactFormData: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Contact',
  submitButtonLabel: 'Envoyer',
  confirmationType: 'message',
  confirmationMessage: richText(
    heading('Merci !', 'h2'),
    paragraph('Votre message a bien été envoyé. Je vous réponds dès que possible.'),
  ),
  fields: [
    { blockType: 'text', name: 'nom', label: 'Nom', required: true, width: 100 },
    { blockType: 'email', name: 'email', label: 'Email', required: true, width: 100 },
    { blockType: 'text', name: 'telephone', label: 'Téléphone', required: false, width: 100 },
    {
      blockType: 'textarea',
      name: 'projet',
      label: 'Votre situation (zone concernée, attentes)',
      required: true,
      width: 100,
    },
  ],
}

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

  // The FAQ links to the prestations page, which leads to the service pages, which link back to the
  // FAQ: a new prestations page gets its links to the service pages once they exist
  const prestationsExisted = Boolean(await findPage('prestations'))
  const prestations = await ensurePage(prestationsPageData({ contact }))

  const aPropos = await ensurePage(aProposPageData({ contact }))

  const faq = await ensurePage(faqPageData({ aPropos, contact, galerie, prestations }))

  const servicePages = servicePagesData({ contact, faq, galerie, prestations })
  const services = {
    effetRase: await ensurePage(servicePages.effetRase),
    densification: await ensurePage(servicePages.densification),
    camouflage: await ensurePage(servicePages.camouflage),
  }
  if (!prestationsExisted) {
    await payload.update({
      collection: 'pages',
      id: prestations.id,
      data: prestationsPageData({ contact, services }),
      depth: 0,
      req,
    })
  }

  const home = await ensurePage(homePageData({ aPropos, faq, galerie }))

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
