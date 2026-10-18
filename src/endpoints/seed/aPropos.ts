import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Page } from '@/payload-types'

import { pageLink } from './links'
import { checkList, heading, paragraph, quote, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

// À propos page content, from Léo's reworded À propos document: the dot pattern beside the title,
// key facts first, the paragraph on his own tricopigmentation set apart as a quote, the hygiene
// commitments as a check list, and the closing invitation to get in touch as the contact call to
// action. Used by the seed and by the migrations that bring existing sites up to date.
export const aProposPageData = ({ contact }: { contact: Page }): PageData => ({
  slug: 'a-propos',
  title: 'À propos',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    dotPattern: true,
    richText: richText(
      heading('À propos de moi'),
      paragraph(
        'Je m’appelle Léo Di Marco et je suis praticien spécialisé en tricopigmentation, aussi appelée micropigmentation capillaire.',
      ),
    ),
  },
  layout: [
    {
      blockType: 'keyFacts',
      items: [
        { value: '29 ans', label: 'L’âge de ma propre tricopigmentation' },
        { value: 'Médicoderm Académie', label: 'Formé auprès de Samuel Troonen' },
        { value: 'ARS', label: 'Activité et local déclarés' },
        { value: 'Pompey', label: 'Studio professionnel près de Nancy' },
      ],
    },
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: richText(
            quote(
              'Avant de pratiquer cette technique, j’y ai moi-même eu recours. C’est une expérience qui a beaucoup compté dans mon choix d’en faire aujourd’hui mon métier.',
            ),
            heading('Comment j’en suis arrivé à la tricopigmentation', 'h2'),
            paragraph('J’ai commencé à perdre mes cheveux assez jeune.'),
            paragraph(
              'Pendant plusieurs années, je me suis intéressé aux différentes solutions qui existaient. La greffe ne correspondait pas à ma situation et je ne souhaitais pas m’engager dans un traitement sur le long terme.',
            ),
            paragraph('À 29 ans, j’ai finalement décidé de faire une tricopigmentation.'),
            paragraph(
              'J’ai donc découvert cette technique en tant que client, avec toutes les questions qui peuvent accompagner ce choix. Le naturel du résultat, la ligne frontale, la façon dont les pigments vont évoluer avec le temps… Ce sont des sujets auxquels je suis particulièrement attentif aujourd’hui.',
            ),
            paragraph(
              'En découvrant la tricopigmentation, j’ai eu envie de comprendre comment elle fonctionnait et d’apprendre à la pratiquer.',
            ),
            paragraph('C’est ce qui m’a amené à me former, puis à ouvrir mon propre studio.'),
            heading('Ma manière de travailler', 'h2'),
            paragraph(
              'Quand je prépare une tricopigmentation, je regarde d’abord ce qui existe déjà : la forme du crâne, les cheveux encore présents, leur densité et la manière dont ils sont implantés.',
            ),
            paragraph(
              'La ligne frontale demande notamment beaucoup de réflexion. Une implantation trop basse ou trop régulière peut donner un aspect artificiel, même lorsque les points sont bien réalisés.',
            ),
            paragraph(
              'Je préfère généralement une ligne un peu plus conservatrice, qui reste cohérente avec le visage et l’âge de la personne.',
            ),
            paragraph(
              'Je travaille aussi progressivement sur la densité. Plutôt que de chercher à obtenir un résultat très marqué dès le départ, je préfère construire la pigmentation sur plusieurs séances.',
            ),
            paragraph(
              'Je travaille habituellement en trois séances espacées d’environ 10 à 14 jours. Cela permet de voir comment les pigments évoluent après cicatrisation et de faire les ajustements nécessaires.',
            ),
            paragraph(
              'Je m’intéresse particulièrement à l’aspect des résultats une fois cicatrisés. C’est à ce moment-là que l’on peut réellement apprécier la densité, la teinte et l’intégration de la pigmentation avec les cheveux existants.',
            ),
            heading('Ma formation', 'h2'),
            paragraph(
              'Je me suis formé à la tricopigmentation à la **Médicoderm Académie**, auprès de **Samuel Troonen**, en Belgique.',
            ),
            paragraph(
              'Je continue également à perfectionner ma pratique, notamment auprès de **Marc Allen, de Creative Scalps**, au Royaume-Uni.',
            ),
            paragraph('J’ai par ailleurs validé ma formation en hygiène et salubrité.'),
            paragraph(
              'Depuis mes débuts, je prends le temps d’analyser mes résultats, de suivre leur évolution et de m’intéresser aux différentes façons de travailler.',
            ),
            paragraph(
              'Il y a toujours des choses à apprendre, que ce soit dans le choix des pigments, le matériel, la technique ou simplement la façon d’aborder certaines situations.',
            ),
            heading('Le studio', 'h2'),
            paragraph(
              'Je vous reçois à Pompey, à proximité de Nancy, dans un studio professionnel aménagé pour la pratique de la tricopigmentation.',
            ),
            paragraph(
              'J’ai voulu un lieu propre, calme et agréable, dans lequel je peux prendre le temps de vous recevoir, d’échanger avec vous et de travailler dans de bonnes conditions.',
            ),
            paragraph('L’hygiène y occupe une place essentielle :'),
            checkList(
              'Un poste de travail préparé et désinfecté avant chaque rendez-vous',
              'Du matériel professionnel et des consommables stériles à usage unique',
              'Des pigments conformes à la réglementation européenne en vigueur',
            ),
            paragraph(
              'Mon activité et le local sont déclarés auprès de l’ARS, et chaque séance est réalisée dans le respect des règles d’hygiène liées à la pratique de la tricopigmentation.',
            ),
            paragraph(
              'Le studio a aussi été pensé pour que vous puissiez vous sentir à l’aise pendant les séances, qui peuvent durer plusieurs heures. C’était important pour moi d’avoir un véritable espace professionnel, adapté à mon travail et à l’accueil de mes clients.',
            ),
            heading('Mon engagement', 'h2'),
            paragraph(
              'Je tiens à être transparent sur ce qu’il est possible d’obtenir avec une tricopigmentation.',
            ),
            paragraph(
              'Si je considère que cette technique n’est pas adaptée à votre situation ou que je ne suis pas la bonne personne pour réaliser votre projet, je préfère vous le dire plutôt que de vous promettre un résultat qui ne correspondra pas à vos attentes. Lorsque c’est possible, je pourrai également vous orienter vers une solution plus adaptée.',
            ),
          ),
        },
      ],
    },
    {
      blockType: 'cta',
      richText: richText(
        paragraph(
          'Si vous souhaitez savoir ce qu’il est possible de faire dans votre cas, vous pouvez simplement me contacter et m’envoyer quelques photos. Nous pourrons en discuter ensemble.',
        ),
      ),
      links: [pageLink(contact, 'Me contacter')],
    },
  ],
  meta: {
    title: 'À propos',
    description:
      'Léo Di Marco, praticien en tricopigmentation formé à la Médicoderm Académie, studio privé à Pompey, près de Nancy.',
  },
})
