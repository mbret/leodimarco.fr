import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Page } from '@/payload-types'

import { pageLink } from './links'
import { checkList, heading, paragraph, quote, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

// À propos page content, from Léo's À propos document: key facts first, one sentence set apart as a
// quote, the hygiene commitments as a check list, and the closing invitation to get in touch as the
// contact call to action. Used by the seed and by the migration that brings existing sites up to
// date.
export const aProposPageData = ({ contact }: { contact: Page }): PageData => ({
  slug: 'a-propos',
  title: 'À propos',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: richText(
      heading('À propos'),
      paragraph('Je m’appelle Léo Di Marco et je suis praticien en tricopigmentation.'),
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
            paragraph(
              'J’ai toujours été attiré par le tatouage et le travail de l’image : les lignes, les contrastes, les détails et tout ce qui touche à l’esthétique de manière générale. C’est un univers qui fait partie de moi depuis longtemps et qui m’a naturellement amené vers la tricopigmentation.',
            ),
            quote(
              'Mais si j’ai choisi de me spécialiser dans ce domaine, c’est aussi parce que je suis directement concerné.',
            ),
            paragraph(
              'J’ai commencé à perdre mes cheveux assez jeune et, comme beaucoup d’hommes dans cette situation, j’ai cherché pendant longtemps la solution qui me correspondait vraiment. La greffe n’était pas adaptée à mon cas et je ne souhaitais pas dépendre d’un traitement sur le long terme.',
            ),
            paragraph('À 29 ans, j’ai finalement choisi de faire une tricopigmentation.'),
            paragraph(
              'Je sais donc ce que peut représenter la perte de cheveux, les questions qu’on peut se poser avant de se lancer, mais aussi l’importance d’obtenir un résultat dans lequel on se reconnaît.',
            ),
            paragraph(
              'Aujourd’hui, cette expérience personnelle fait aussi partie de ma manière de travailler. Je prends le temps d’échanger avec chaque personne, de comprendre ce qu’elle recherche.',
            ),
            paragraph(
              'En tricopigmentation, quelques millimètres, une densité ou une ligne frontale légèrement différente peuvent complètement changer un résultat.',
            ),
            heading('Ma manière de travailler', 'h2'),
            paragraph('Pour moi, la tricopigmentation est avant tout un travail de précision.'),
            paragraph(
              'Chaque personne est différente : forme du crâne, implantation, couleur des cheveux, densité, type de peau… Tous ces éléments comptent pour obtenir un résultat naturel et cohérent avec le visage.',
            ),
            paragraph(
              'Je prends donc le temps d’observer et de préparer mon travail avant de commencer. La ligne frontale, la densité, les contrastes ou encore la répartition des pigments sont réfléchis en fonction de chaque personne.',
            ),
            paragraph(
              'J’aime travailler progressivement. Je préfère partir sur quelque chose de subtil et construire le résultat au fil des séances plutôt que d’en faire trop dès le départ. Cela permet d’ajuster le travail en fonction de la façon dont la peau réagit et dont le pigment évolue.',
            ),
            paragraph(
              'Mon objectif reste toujours le même : obtenir un résultat naturel, équilibré et suffisamment discret pour qu’on ne se demande pas si une tricopigmentation a été réalisée.',
            ),
            paragraph(
              'Enfin, j’accorde beaucoup d’importance à l’échange. Prendre le temps de comprendre ce que vous recherchez, répondre à vos questions et vous mettre à l’aise fait tout autant partie de mon travail que la réalisation elle-même.',
            ),
            heading('Formation et exigence technique', 'h2'),
            paragraph(
              'Je me suis formé à la tricopigmentation auprès de Samuel Troonen, praticien reconnu en Belgique, au sein de la Médicoderm Académie.',
            ),
            paragraph(
              'Depuis, je continue à me former et à suivre le travail de praticiens internationaux, notamment Marc Allen de Creative Scalps, en Angleterre. Cela me permet de découvrir d’autres approches, d’affiner ma technique et de faire évoluer ma façon de travailler.',
            ),
            paragraph(
              'J’ai également suivi la formation obligatoire en hygiène et salubrité, indispensable à la pratique de la tricopigmentation.',
            ),
            paragraph(
              'Pour moi, la formation ne s’arrête pas à l’obtention d’un certificat. C’est un métier qui évolue et dans lequel il y a toujours quelque chose à améliorer : la technique, le choix du matériel, la compréhension de la peau ou simplement le regard que l’on porte sur son propre travail.',
            ),
            paragraph(
              'Je continue donc à apprendre, à observer et à faire évoluer ma pratique au fil du temps.',
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
