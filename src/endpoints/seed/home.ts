import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Page } from '@/payload-types'

import { externalLink, INSTAGRAM_MESSAGE_URL, pageLink, WHATSAPP_URL } from './links'
import type { ServicePages } from './prestations'
import { heading, paragraph, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

// Pages that the home page buttons lead to. Without the service pages, the effect cards have no
// button.
type LinkedPages = {
  aPropos: Page
  contact: Page
  faq: Page
  galerie: Page
  prestations?: Page
  services?: ServicePages
}

// Photos of the home page, by their id in the media collection, named after where they go
export type HomePhotos = {
  // A healed result, beside the title
  hero: number
  // The healed points up close, beside « Une bonne tricopigmentation ne se remarque pas »
  technique: number
  // Léo in his studio, on the green band that tells his story
  story: number
}

const TECHNIQUE_TITLE = 'Une bonne tricopigmentation ne se remarque pas.'
const techniqueText = [
  paragraph(
    'La tricopigmentation est une technique de micropigmentation du cuir chevelu qui recrée visuellement l’apparence de cheveux rasés ou atténue l’effet de transparence lorsque la densité s’affaiblit.',
  ),
  paragraph(
    'Inspirée du tatouage, elle consiste à déposer des milliers de micro-points de pigments sur le cuir chevelu et permet sans chirurgie et sans délai d’apporter une réelle transformation visuelle.',
  ),
  paragraph(
    'Une densité plus homogène, une teinte adaptée, une ligne frontale qui épouse votre morphologie et un rendu global suffisamment naturel pour que le changement soit visible, sans attirer l’attention.',
  ),
]

// Léo's Google Business profile, where clients leave their reviews
const GOOGLE_REVIEWS_URL =
  'https://www.google.fr/maps/place/L%C3%A9o+Di+Marco+Tricopigmentation+Nancy/@48.6953784,6.1783947,652m/data=!3m2!1e3!4b1!4m6!3m5!1s0x479499bc88386e6b:0xca515ade1aa9ae26!8m2!3d48.6953784!4d6.1809696!16s%2Fg%2F11z50_qz8t?entry=ttu&g_ep=EgoyMDI2MTAwNi4wIKXMDSoASAFQAw%3D%3D'

// Three of the reviews on Léo's Google Business profile, shown above the link to all of them
export const googleReviews = [
  {
    rating: 5,
    text: 'Léo est au top. Il est à l’écoute, soigneux, et très doué. Vu pour une retouche c’est parfait. Je recommande et reviendrai sans soucis',
    author: 'Mathieu',
  },
  {
    rating: 5,
    text: 'Parfait ! Le résultat est super naturel, vraiment indissociable de la réalité, et encore mieux que dans mes attentes. C’est même au-dessus de tout ce que j’ai pu voir sur les réseaux. Léo est à l’écoute, très sympathique, arrangeant et surtout super impliqué. Les prix sont très abordables. Je recommande les yeux fermés ! En plus, la douleur est très supportable, je me suis même endormi quelques minutes lors de ma dernière session.',
    author: 'ily an',
  },
  {
    rating: 5,
    text: 'Super expérience avec Léo pour ma tricopigmentation du crâne. Du premier accueil jusqu’à la fin des 3 séances, tout a été parfaitement géré. Très professionnel, à l’écoute, et le résultat est vraiment top. Le cadre est super agréable aussi, on s’y sent direct en confiance. Je recommande fortement !',
    author: 'Théo M.',
  },
]

// Button to a service's page, as on the Prestations cards
const serviceButton = (page: Page, label: string) => ({
  enableLink: true,
  ...pageLink(page, label, 'outline'),
})

// The three effects, each leading to its service's page
export const effectCards = (services?: ServicePages) => [
  {
    title: 'Effet rasé',
    illustration: 'shaved' as const,
    description: 'Recréer l’apparence d’un cuir chevelu rasé net et homogène',
    ...(services && serviceButton(services.effetRase, 'Découvrir l’effet rasé')),
  },
  {
    title: 'Effet densité',
    illustration: 'density' as const,
    description: 'Réduire visuellement la transparence sur une zone clairsemée',
    ...(services && serviceButton(services.densification, 'Découvrir la densification')),
  },
  {
    title: 'Camouflage de cicatrice',
    illustration: 'scar' as const,
    description: 'Atténuer visuellement le contraste d’une cicatrice du cuir chevelu',
    ...(services && serviceButton(services.camouflage, 'Découvrir le camouflage')),
  },
]

// Home page content, from Léo's home page document. Without photos, as on a new site, the dot
// pattern stays beside the title. Used by the seed and by the migrations that bring existing sites
// up to date.
export const homePageData = ({
  aPropos,
  contact,
  faq,
  galerie,
  photos,
  prestations,
  services,
}: LinkedPages & { photos?: HomePhotos }): PageData => ({
  slug: 'home',
  title: 'Accueil',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    // The photo takes the place of the dots, which come back if it is removed
    dotPattern: true,
    media: photos?.hero,
    richText: richText(
      // The non-breaking space keeps "à Nancy" together when the title wraps on phones
      heading('Tricopigmentation à\u00a0Nancy.'),
      paragraph('**Un résultat qui se voit.**\n**Une technique qui ne se remarque pas.**'),
      paragraph('Je suis Léo et je vous reçois dans mon studio à Pompey, près de Nancy.'),
    ),
    links: [
      externalLink(WHATSAPP_URL, 'Envoyer mes photos', 'default'),
      pageLink(galerie, 'Voir les résultats', 'outline'),
    ],
  },
  layout: [
    {
      blockType: 'content',
      columns: photos
        ? [
            // On phones the text comes first, between the result beside the title and the close-up
            { size: 'half', richText: richText(heading(TECHNIQUE_TITLE, 'h2'), ...techniqueText) },
            { size: 'half', media: photos.technique },
          ]
        : [
            { size: 'oneThird', richText: richText(heading(TECHNIQUE_TITLE, 'h2')) },
            { size: 'twoThirds', richText: richText(...techniqueText) },
          ],
    },
    {
      blockType: 'services',
      heading: 'Trois effets.',
      items: effectCards(services),
      ...(prestations && {
        enableLink: true,
        ...pageLink(prestations, 'Toutes les prestations →'),
      }),
    },
    {
      blockType: 'gallery',
      heading: 'Mes résultats, une fois cicatrisés.',
      limit: 2,
    },
    {
      blockType: 'cta',
      style: 'band',
      media: photos?.story,
      richText: richText(
        heading('J’ai été client avant d’être praticien.', 'h2'),
        paragraph(
          'À 29 ans, j’ai moi-même fait une tricopigmentation. Le naturel du résultat, la ligne frontale, la façon dont les pigments vont évoluer avec le temps : ce sont des sujets auxquels je suis particulièrement attentif aujourd’hui.',
        ),
        paragraph(
          'C’est ce qui m’a amené à me former, puis à ouvrir mon propre studio, entièrement dédié à la tricopigmentation.',
        ),
      ),
      links: [pageLink(aPropos, 'Mon parcours et mon studio', 'outline')],
    },
    {
      blockType: 'testimonials',
      heading: 'Mes clients témoignent',
      intro:
        'Au-delà du changement esthétique, mes clients parlent souvent d’une chose : retrouver de la confiance et ne plus avoir à penser constamment à leur perte de cheveux.',
      reviews: googleReviews,
      enableLink: true,
      ...externalLink(GOOGLE_REVIEWS_URL, 'Voir tous les avis Google →'),
    },
    {
      blockType: 'faq',
      categories: [
        {
          title: 'Questions fréquentes',
          items: [
            {
              question: 'Est-ce que le rendu fait tatouage ?',
              answer: richText(
                paragraph(
                  'Non. Lorsqu’elle est réalisée correctement, la tricopigmentation est pensée pour rester discrète. La technique et le matériel utilisés diffèrent du tatouage traditionnel.',
                ),
              ),
            },
            {
              question: 'Est-ce que les pigments peuvent devenir bleus ?',
              answer: richText(
                paragraph(
                  'Une tricopigmentation correctement réalisée est justement pensée pour éviter ce type de vieillissement. Le choix du pigment, sa dilution, la profondeur d’implantation et la technique employée sont déterminants pour obtenir une évolution naturelle dans le temps.',
                ),
              ),
            },
            {
              question: 'Est-ce douloureux ?',
              answer: richText(
                paragraph(
                  'La sensibilité varie selon les personnes et les zones travaillées. La plupart des clients décrivent cependant davantage un inconfort qu’une réelle douleur.',
                ),
              ),
            },
          ],
          enableLink: true,
          ...pageLink(faq, 'Voir toutes les questions fréquentes', 'outline'),
        },
      ],
    },
    {
      blockType: 'cta',
      style: 'band',
      richText: richText(
        heading('Envoyez-moi quelques photos.', 'h2'),
        paragraph(
          'Chaque cuir chevelu et chaque projet sont différents. J’étudie votre situation et je vous donne un premier avis.',
        ),
      ),
      links: [
        externalLink(WHATSAPP_URL, 'WhatsApp'),
        externalLink(INSTAGRAM_MESSAGE_URL, 'Instagram', 'outline'),
        pageLink(contact, 'Me contacter', 'outline'),
      ],
    },
  ],
  meta: {
    title: 'Tricopigmentation à Pompey, près de Nancy',
    description:
      'Léo Di Marco, tricopigmentation (micropigmentation capillaire) à Pompey (54), près de Nancy : effet crâne rasé, densification et camouflage de cicatrices.',
  },
})
