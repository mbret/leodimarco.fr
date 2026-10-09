import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Page } from '@/payload-types'

import { pageLink } from './links'
import { heading, paragraph, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

// Pages that the home page buttons lead to
type LinkedPages = { aPropos: Page; faq: Page; galerie: Page }

// Ways to send photos to Léo: the studio phone on WhatsApp and a direct message on Instagram
const WHATSAPP_URL = 'https://wa.me/33618510548'
const INSTAGRAM_MESSAGE_URL = 'https://ig.me/m/leodimarcotricopigmentation'

const externalLink = (url: string, label: string) => ({
  link: { type: 'custom' as const, url, newTab: true, label },
})

// Home page content, from Léo's home page document. Used by the seed and by the migration that
// brings existing sites up to date.
export const homePageData = ({ aPropos, faq, galerie }: LinkedPages): PageData => ({
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
    // Shown once reviews are added from the admin. The link to the Google reviews is ready to be
    // turned on with its address.
    {
      blockType: 'testimonials',
      heading: 'Mes clients témoignent',
      intro:
        'Au-delà du changement esthétique, mes clients parlent souvent d’une chose : retrouver de la confiance et ne plus avoir à penser constamment à leur perte de cheveux.',
      enableLink: false,
      link: { type: 'custom', newTab: true, label: 'Voir tous les avis Google →' },
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
      ],
    },
  ],
  meta: {
    title: 'Tricopigmentation à Pompey, près de Nancy',
    description:
      'Léo Di Marco, tricopigmentation (micropigmentation capillaire) à Pompey (54), près de Nancy : effet crâne rasé, densification et camouflage de cicatrices.',
  },
})
