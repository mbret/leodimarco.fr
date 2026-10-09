import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Page } from '@/payload-types'

import { pageLink } from './links'
import { heading, paragraph, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

// Pages that the home page buttons lead to
type LinkedPages = { aPropos: Page; contact: Page; faq: Page; galerie: Page }

// Ways to send photos to Léo besides the contact form: WhatsApp on 07 44 42 94 88 and a direct
// message on Instagram
const WHATSAPP_URL = 'https://wa.me/33744429488'
const INSTAGRAM_MESSAGE_URL = 'https://ig.me/m/leodimarcotricopigmentation'

// Léo's Google Business profile, where clients leave their reviews
const GOOGLE_REVIEWS_URL =
  'https://www.google.fr/maps/place/L%C3%A9o+Di+Marco+Tricopigmentation+Nancy/@48.6953784,6.1783947,652m/data=!3m2!1e3!4b1!4m6!3m5!1s0x479499bc88386e6b:0xca515ade1aa9ae26!8m2!3d48.6953784!4d6.1809696!16s%2Fg%2F11z50_qz8t?entry=ttu&g_ep=EgoyMDI2MTAwNi4wIKXMDSoASAFQAw%3D%3D'

const externalLink = (url: string, label: string) => ({
  link: { type: 'custom' as const, url, newTab: true, label },
})

// Home page content, from Léo's home page document. Used by the seed and by the migration that
// brings existing sites up to date.
export const homePageData = ({ aPropos, contact, faq, galerie }: LinkedPages): PageData => ({
  slug: 'home',
  title: 'Accueil',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    dotPattern: true,
    richText: richText(
      // The non-breaking space keeps "à Nancy" together when the title wraps on phones
      heading('Tricopigmentation à\u00a0Nancy.'),
      paragraph('**Un résultat qui se voit.**\n**Une technique qui ne se remarque pas.**'),
    ),
    // Updates keep the fields they are not given, so the previous buttons are removed explicitly
    links: [],
  },
  layout: [
    {
      blockType: 'services',
      items: [
        {
          title: 'Effet rasé',
          description: 'Recréer l’apparence d’un cuir chevelu rasé net et homogène',
        },
        {
          title: 'Effet densité',
          description: 'Réduire visuellement la transparence sur une zone clairsemée',
        },
        {
          title: 'Camouflage de cicatrice',
          description: 'Atténuer visuellement le contraste d’une cicatrice du cuir chevelu',
        },
      ],
    },
    {
      blockType: 'content',
      columns: [
        {
          size: 'oneThird',
          richText: richText(
            heading('Une solution esthétique moderne contre la perte de cheveux', 'h2'),
          ),
        },
        {
          size: 'twoThirds',
          richText: richText(
            paragraph(
              'Je mets ma minutie au service de votre image afin de vous aider à retrouver un style qui vous correspond et davantage de confiance.',
            ),
            paragraph(
              'En tant que praticien spécialisé en tricopigmentation, je vous accompagne à chaque étape de cette transformation.',
            ),
          ),
          enableLink: true,
          ...pageLink(galerie, 'Mes résultats', 'default'),
        },
      ],
    },
    {
      blockType: 'content',
      columns: [
        {
          size: 'oneThird',
          richText: richText(heading('Une bonne tricopigmentation ne se remarque pas', 'h2')),
        },
        {
          size: 'twoThirds',
          richText: richText(
            paragraph(
              'La tricopigmentation est une technique de micropigmentation du cuir chevelu qui recrée visuellement l’apparence de cheveux rasés ou atténue l’effet de transparence lorsque la densité s’affaiblit.',
            ),
            paragraph(
              'Inspirée du tatouage, elle consiste à déposer des milliers de micro-points de pigments sur le cuir chevelu et permet sans chirurgie et sans délai d’apporter une réelle transformation visuelle.',
            ),
            paragraph(
              'Une densité plus homogène, une teinte adaptée, une ligne frontale qui épouse votre morphologie et un rendu global suffisamment naturel pour que le changement soit visible, sans attirer l’attention.',
            ),
          ),
        },
      ],
    },
    {
      blockType: 'cta',
      richText: richText(
        heading('Basé à Pompey, près de Nancy, au service de la Lorraine et du Grand Est', 'h3'),
        paragraph(
          'Je vous reçois à Pompey, à proximité de Nancy, dans un espace entièrement dédié à la tricopigmentation.',
        ),
        paragraph(
          'Une attention particulière est portée à l’hygiène, à l’organisation du poste de travail et à la qualité du matériel utilisé, afin de garantir une prestation rigoureuse du premier échange jusqu’au suivi.',
        ),
      ),
      links: [pageLink(aPropos, 'Découvrir mon studio', 'outline')],
    },
    // Léo adds his clients' reviews from the admin. Until then the section shows its introduction
    // and the link to the Google reviews.
    {
      blockType: 'testimonials',
      heading: 'Mes clients témoignent',
      intro:
        'Au-delà du changement esthétique, mes clients parlent souvent d’une chose : retrouver de la confiance et ne plus avoir à penser constamment à leur perte de cheveux.',
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
      richText: richText(
        heading('Vous envisagez une tricopigmentation ?', 'h3'),
        paragraph(
          'Chaque cuir chevelu et chaque projet sont différents. Envoyez-moi quelques photos afin que je puisse étudier votre situation et vous donner un premier avis.',
        ),
      ),
      links: [
        externalLink(WHATSAPP_URL, 'WhatsApp'),
        externalLink(INSTAGRAM_MESSAGE_URL, 'Instagram'),
        pageLink(contact, 'Me contacter'),
      ],
    },
  ],
  meta: {
    title: 'Tricopigmentation à Pompey, près de Nancy',
    description:
      'Léo Di Marco, tricopigmentation (micropigmentation capillaire) à Pompey (54), près de Nancy : effet crâne rasé, densification et camouflage de cicatrices.',
  },
})
