import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

import type { Form, Page } from '@/payload-types'
import { SITE_NAME } from '@/utilities/siteName'

import { heading, paragraph, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

const pageLink = (page: Page, label: string, appearance?: 'default' | 'outline') => ({
  link: {
    type: 'reference' as const,
    reference: { relationTo: 'pages' as const, value: page.id },
    label,
    ...(appearance ? { appearance } : {}),
  },
})

const hero = (title: string, intro?: string): PageData['hero'] => ({
  type: 'lowImpact',
  richText: richText(heading(title), ...(intro ? [paragraph(intro)] : [])),
})

const contactCta = (contact: Page) => ({
  blockType: 'cta' as const,
  richText: richText(
    heading('Un projet en tête ?', 'h3'),
    paragraph('Décrivez votre idée, l’emplacement et la taille souhaités.'),
  ),
  links: [pageLink(contact, 'Me contacter')],
})

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
      label: 'Votre projet (idée, emplacement, taille)',
      required: true,
      width: 100,
    },
  ],
}

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
    hero: hero('Contact', 'Décrivez votre projet, je vous réponds dès que possible.'),
    layout: [{ blockType: 'formBlock', form: contactForm.id, enableIntro: false }],
  })

  const galerie = await ensurePage({
    slug: 'galerie',
    title: 'Galerie',
    hero: hero('Galerie', 'Une sélection de tatouages réalisés au studio.'),
    layout: [{ blockType: 'gallery' }],
  })

  const prestations = await ensurePage({
    slug: 'prestations',
    title: 'Prestations',
    hero: hero(
      'Prestations',
      'Chaque tatouage commence par un échange pour comprendre votre projet.',
    ),
    layout: [
      {
        blockType: 'services',
        items: [
          {
            title: 'Création sur mesure',
            description:
              'Un dessin unique, réalisé à partir de votre idée, de vos références et de l’emplacement choisi.',
            price: 'Sur devis',
          },
          {
            title: 'Flash',
            description: 'Des motifs déjà dessinés, disponibles tels quels ou légèrement adaptés.',
            price: 'Sur devis',
          },
          {
            title: 'Recouvrement',
            description: 'Transformer ou masquer un ancien tatouage avec un nouveau motif.',
            price: 'Sur devis',
          },
          {
            title: 'Retouche',
            description: 'Raviver un tatouage existant ou reprendre une cicatrisation inégale.',
            price: 'Sur devis',
          },
        ],
      },
      contactCta(contact),
    ],
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
              paragraph('Texte à compléter : votre parcours, votre style et votre studio.'),
            ),
          },
        ],
      },
    ],
  })

  const faq = await ensurePage({
    slug: 'faq',
    title: 'FAQ',
    hero: hero('Questions fréquentes'),
    layout: [
      {
        blockType: 'faq',
        items: [
          {
            question: 'Comment prendre rendez-vous ?',
            answer:
              'Remplissez le formulaire de la page Contact en décrivant votre projet : idée, emplacement, taille et références. Je vous recontacte pour en discuter et fixer une date.',
          },
          {
            question: 'Un acompte est-il demandé ?',
            answer:
              'Un acompte peut être demandé pour réserver la séance. Il est alors déduit du prix final.',
          },
          {
            question: 'Comment préparer la séance ?',
            answer:
              'Dormez bien, mangez avant de venir, évitez l’alcool la veille et venez avec une peau hydratée et non exposée au soleil.',
          },
          {
            question: 'Comment prendre soin de mon tatouage ?',
            answer:
              'Des consignes détaillées vous sont données après la séance. En résumé : laver doucement, hydrater, et éviter soleil, piscine et mer pendant la cicatrisation.',
          },
        ],
      },
      contactCta(contact),
    ],
  })

  const home = await ensurePage({
    slug: 'home',
    title: 'Accueil',
    hero: {
      type: 'lowImpact',
      richText: richText(
        heading(SITE_NAME),
        paragraph('Tatoueur. Créations sur mesure, flashs et recouvrements.'),
      ),
      links: [
        pageLink(contact, 'Prendre rendez-vous', 'default'),
        pageLink(galerie, 'Voir la galerie', 'outline'),
      ],
    },
    layout: [
      { blockType: 'gallery', heading: 'Dernières réalisations', limit: 6 },
      contactCta(contact),
    ],
  })

  const header = await payload.findGlobal({ slug: 'header', depth: 0, req })
  if (!header.navItems?.length) {
    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          pageLink(home, 'Accueil'),
          pageLink(prestations, 'Prestations'),
          pageLink(galerie, 'Galerie'),
          pageLink(aPropos, 'À propos'),
          pageLink(faq, 'FAQ'),
          pageLink(contact, 'Contact'),
        ],
      },
      req,
    })
  }

  const footer = await payload.findGlobal({ slug: 'footer', depth: 0, req })
  if (!footer.navItems?.length) {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [pageLink(faq, 'FAQ'), pageLink(contact, 'Contact')],
      },
      req,
    })
  }

  payload.logger.info('Starter content created.')
}
