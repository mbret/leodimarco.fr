import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Page } from '@/payload-types'

import { bulletList, heading, paragraph, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

// FAQ page content, from Léo's FAQ mockup. Used by the seed and by the migration that
// brings existing sites up to date.
export const faqPageData = (contact: Page): PageData => ({
  slug: 'faq',
  title: 'FAQ',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: richText(
      heading('FAQ'),
      paragraph('Foire aux questions'),
      paragraph(
        'Vous trouverez ici les réponses aux questions les plus fréquentes sur la tricopigmentation : déroulement, douleur, résultat, cicatrisation, entretien et indications.',
      ),
      paragraph(
        'Pour les informations spécifiques à chaque cas (*effet rasé*, *densification* ou *cicatrices*), les pages prestations détaillent les différentes approches.',
      ),
    ),
  },
  layout: [
    {
      blockType: 'faq',
      categories: [
        {
          title: 'Comprendre la tricopigmentation',
          items: [
            {
              question: 'Qu’est-ce que la tricopigmentation ?',
              answer: richText(
                paragraph(
                  'C’est une *micropigmentation capillaire semi-permanente* qui vise à imiter l’apparence de petits cheveux rasés de près.',
                ),
                paragraph(
                  'Elle consiste à implanter des *milliers de micro points de pigment très fins* dans le cuir chevelu.',
                ),
                paragraph(
                  'Selon les cas, elle peut être *utilisée pour un effet rasé*, une *densification capillaire*, le *camouflage de certaines cicatrices* ou la *reconstruction d’une ligne frontale*.',
                ),
              ),
            },
            {
              question: 'D’où vient la tricopigmentation ?',
              answer: richText(
                paragraph('Le terme « *tricho* » vient du grec et signifie *cheveu* ou *poil*.'),
                paragraph(
                  'Aussi appelée *micropigmentation capillaire*, ou *SMP* pour Scalp Micropigmentation en anglais, c’est une technique relativement moderne.',
                ),
                paragraph(
                  'Elle s’est développée en Europe à partir de la *fin des années 1990*, notamment en *Italie* puis au *Royaume-Uni*, grâce au travail de praticiens qui ont progressivement perfectionné les méthodes, les pigments et l’approche du cuir chevelu.',
                ),
                paragraph(
                  'Avec le temps, cette discipline est devenue une *réponse esthétique sérieuse* face à la perte de cheveux.',
                ),
              ),
            },
            {
              question: 'Quelle est la différence avec un tatouage classique ?',
              answer: richText(
                paragraph(
                  'La tricopigmentation repose, comme le tatouage, sur l’implantation d’un pigment dans la peau. Mais le *travail* et le *rendu recherché* ne sont pas les mêmes.',
                ),
                paragraph(
                  'La différence majeure concerne la *profondeur d’implantation*. Dans ma pratique, je vise une *couche superficielle du derme*, ce qui permet :',
                ),
                bulletList(
                  '*un rendu plus léger,*',
                  '*un bon vieillissement,*',
                  '*l’absence de saignement pendant la séance.*',
                ),
              ),
            },
            {
              question: 'Quel matériel est utilisé ?',
              answer: richText(
                paragraph(
                  'Du *dermographe* jusqu’aux *aiguilles*, je travaille exclusivement avec du *matériel professionnel de tricopigmentation*.',
                ),
                paragraph(
                  'Le dermographe apporte le *contrôle* et la *régularité du geste*, tandis que les aiguilles permettent la *finesse du travail*.',
                ),
                paragraph(
                  'J’utilise un pigment « *carbon black* » spécialement adapté. Le choix de la *teinte* joue un rôle déterminant dans la *discrétion du résultat*.',
                ),
                paragraph('Ce pigment est conforme aux normes *REACH* en vigueur.'),
                paragraph(
                  'Chaque paramètre influence directement la *netteté du point* et l’*harmonie finale du rendu*.',
                ),
              ),
            },
          ],
        },
        {
          title: 'Déroulement et résultat',
          items: [
            {
              question: 'Combien de séances faut-il ?',
              answer: richText(
                paragraph(
                  'En général trois à quatre séances, pour construire la densité progressivement. Le nombre exact dépend de votre situation et se définit lors de la consultation.',
                ),
              ),
            },
            {
              question: 'Est-ce douloureux ?',
              answer: richText(
                paragraph(
                  'La sensation varie selon les personnes. Elle est le plus souvent décrite comme un inconfort léger, moins intense qu’un tatouage classique.',
                ),
              ),
            },
            {
              question: 'Combien de temps dure le résultat ?',
              answer: richText(
                paragraph(
                  'Le pigment s’estompe très progressivement avec les années. Une séance d’entretien permet de garder un rendu net.',
                ),
              ),
            },
            {
              question: 'Quels soins après une séance ?',
              answer: richText(
                paragraph(
                  'Des rougeurs après la séance sont normales et disparaissent vite, souvent dès le lendemain.',
                ),
                paragraph(
                  'Des consignes détaillées vous sont données après chaque séance. En résumé : ne pas mouiller le crâne ni transpirer les premiers jours, et éviter soleil, piscine et sport intense pendant la cicatrisation.',
                ),
              ),
            },
          ],
        },
        {
          title: 'Autres questions',
          items: [
            {
              question: 'Comment prendre rendez-vous ?',
              answer: richText(
                paragraph(
                  'Remplissez le formulaire de la page Contact en décrivant votre situation. Un premier rendez-vous permet d’en discuter, de définir la ligne frontale et de choisir la teinte.',
                ),
              ),
            },
          ],
        },
      ],
    },
    {
      blockType: 'cta',
      richText: richText(heading('Avez-vous d’autres questions ?', 'h3')),
      links: [
        {
          link: {
            type: 'reference',
            reference: { relationTo: 'pages', value: contact.id },
            label: 'Me contacter',
          },
        },
      ],
    },
  ],
  meta: {
    title: 'Questions fréquentes',
    description:
      'Tout savoir sur la tricopigmentation : origine, différence avec le tatouage, matériel, séances, douleur, résultat et soins. Studio à Pompey, près de Nancy.',
  },
})
