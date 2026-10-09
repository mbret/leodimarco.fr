import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Page } from '@/payload-types'

import { pageLink } from './links'
import { bulletList, heading, paragraph, richText } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

// Pages that the category buttons lead to
type LinkedPages = { aPropos: Page; contact: Page; galerie: Page; prestations: Page }

// Button shown after a category's questions
const button = (page: Page, label: string, appearance: 'default' | 'outline') => ({
  enableLink: true,
  ...pageLink(page, label, appearance),
})

// FAQ page content, from Léo's final FAQ document, closed by the contact call to action. Used by the seed and by the migration that
// brings existing sites up to date.
export const faqPageData = ({ aPropos, contact, galerie, prestations }: LinkedPages): PageData => ({
  slug: 'faq',
  title: 'FAQ',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    dotPattern: true,
    richText: richText(
      heading('Questions fréquentes'),
      paragraph(
        'Vous trouverez ici les réponses aux questions les plus fréquentes sur la tricopigmentation : *déroulement*, *douleur*, *résultat*, *cicatrisation*, *entretien* et *indications*.',
      ),
      paragraph(
        'Pour les informations spécifiques à chaque cas (*effet rasé*, *densification* ou *cicatrices*), les pages prestations détaillent les différentes approches.',
      ),
    ),
  },
  layout: [
    {
      blockType: 'faq',
      highlightsTitle: 'Les questions les plus posées',
      categories: [
        {
          title: 'Comprendre la tricopigmentation',
          items: [
            {
              question: 'Qu’est-ce que la tricopigmentation ?',
              answer: richText(
                paragraph(
                  'C’est une *micropigmentation capillaire semi-permanente* qui va imiter l’apparence de petits cheveux rasés de près.',
                ),
                paragraph(
                  'Elle consiste à implanter des *milliers de micro-points de pigment très fins* dans le cuir chevelu.',
                ),
                paragraph(
                  'Selon les cas, elle peut être utilisée pour un *effet rasé*, une *densification capillaire*, le *camouflage de certaines cicatrices* ou la *reconstruction d’une ligne frontale*.',
                ),
              ),
            },
            {
              question: 'D’où vient la tricopigmentation ?',
              answer: richText(
                paragraph('Le terme « *tricho* » vient du grec et signifie *cheveu* ou *poil*.'),
                paragraph(
                  'Aussi appelée *micropigmentation capillaire*, ou *SMP* pour _Scalp Micropigmentation_ en anglais, il s’agit d’une technique relativement moderne.',
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
                  '*un rendu plus léger*',
                  '*un bon vieillissement*',
                  '*l’absence de saignement pendant la séance*',
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
                  'J’utilise un pigment _carbon black_ spécialement adapté. Le choix de la *teinte* joue un rôle déterminant dans la *discrétion du résultat*.',
                ),
                paragraph('Ce pigment est conforme aux normes _REACH_ en vigueur.'),
                paragraph(
                  'Chaque paramètre influence directement la *netteté du point* et l’*harmonie finale du rendu*.',
                ),
              ),
            },
          ],
          ...button(aPropos, 'À propos de moi', 'outline'),
        },
        {
          title: 'Est-ce adapté à mon cas ?',
          items: [
            {
              question: 'À qui s’adresse la tricopigmentation ?',
              answer: richText(
                paragraph(
                  'La tricopigmentation s’adresse aux personnes qui souhaitent corriger visuellement l’impact d’une *perte de cheveux*.',
                ),
                paragraph(
                  'Elle peut convenir en cas de *calvitie plus ou moins avancée*, de *manque de densité*, de *ligne frontale reculée* ou encore de *cicatrices visibles*, notamment après greffe.',
                ),
              ),
            },
            {
              question: 'Est-ce adapté aux femmes ?',
              answer: richText(
                paragraph('Oui, la tricopigmentation peut aussi être adaptée aux femmes.'),
                paragraph(
                  'L’approche est simplement différente, car on ne recherche généralement pas le même rendu que chez un homme.',
                ),
                paragraph(
                  'Chez la femme, le travail vise le plus souvent à *réduire la transparence du cuir chevelu*, souvent au niveau de la *raie*, ou à *camoufler une cicatrice*, tout en restant *très discret* sous les cheveux existants.',
                ),
              ),
            },
            {
              question: 'Peut-on retravailler uniquement la ligne frontale ?',
              answer: richText(
                paragraph(
                  'Oui, dans certains cas, il est possible de retravailler uniquement la *ligne frontale*.',
                ),
                paragraph(
                  'Cela peut permettre de *rééquilibrer visuellement le haut du visage* en corrigeant une ligne devenue *irrégulière* ou *clairsemée*.',
                ),
              ),
            },
            {
              question: 'Est-ce compatible avec une greffe capillaire ?',
              answer: richText(
                paragraph(
                  'Oui, elle peut intervenir en complément pour *densifier visuellement certaines zones encore clairsemées*, *harmoniser l’ensemble* ou *camoufler une cicatrice de greffe FUE ou FUT*.',
                ),
                paragraph(
                  'Il faut simplement que la zone soit *bien cicatrisée*, généralement *12 mois après l’opération*. Il est aussi tout à fait possible de faire une greffe suite à une tricopigmentation, une fois la cicatrisation terminée.',
                ),
              ),
            },
            {
              question: 'Dans quels cas la tricopigmentation n’est-elle pas adaptée ?',
              answer: richText(
                paragraph(
                  'Elle peut être déconseillée lorsque les *attentes sont irréalistes*, lorsque le *cuir chevelu présente une irritation active*, ou lorsque le rendu recherché ne peut pas être obtenu de façon crédible.',
                ),
                paragraph(
                  'Mon rôle est justement d’évaluer votre situation avec *honnêteté* pour vous dire clairement si cette solution est adaptée à votre cas, et dans quelles limites.',
                ),
              ),
            },
          ],
          ...button(prestations, 'Voir les prestations', 'outline'),
        },
        {
          title: 'Déroulement et résultat',
          items: [
            {
              question: 'Combien de temps dure une séance ?',
              answer: richText(
                paragraph(
                  'La durée d’une séance dépend toujours du cas, de la zone à traiter et du niveau de précision nécessaire.',
                ),
                paragraph(
                  'En moyenne, une séance dure entre *2 et 5 heures*. Une petite zone ou une retouche peuvent être plus rapides, tandis qu’un travail plus complet demande naturellement plus de temps.',
                ),
              ),
            },
            {
              question: 'Combien de séances faut-il ?',
              highlight: true,
              shortAnswer:
                'Le plus souvent trois, de 2 à 5 heures chacune, pour construire le résultat étape par étape.',
              answer: richText(
                paragraph(
                  'Le traitement se réalise généralement en *plusieurs séances*, le plus souvent *trois*.',
                ),
                paragraph(
                  'Cette progression permet de construire le résultat *étape par étape*, d’observer la réaction de la peau et d’ajuster la *densité*, la *teinte* ou certaines zones si nécessaire.',
                ),
                paragraph('Le nombre de rendez-vous peut varier selon :'),
                bulletList(
                  'la *surface à traiter*',
                  'le *type de peau*',
                  'le *résultat recherché*',
                  'la *réaction de la peau au pigment*',
                  'les *soins apportés après chaque séance*',
                ),
              ),
            },
            {
              question: 'Est-ce dangereux ou douloureux ?',
              highlight: true,
              shortAnswer:
                'Sans chirurgie ni anesthésie, dans une couche superficielle du derme. La plupart des clients décrivent un inconfort léger, très supportable.',
              answer: richText(
                paragraph(
                  'La tricopigmentation est une procédure *sans chirurgie* et *sans anesthésie*, réalisée dans une *couche superficielle du derme*.',
                ),
                paragraph(
                  'Comme pour toute pigmentation, un *risque allergique* existe. C’est pourquoi je commence toujours par travailler une *petite zone* afin d’observer la réaction de la peau.',
                ),
                paragraph(
                  'L’effet le plus courant est l’apparition de *rougeurs temporaires*, qui disparaissent généralement au bout de *quelques heures*.',
                ),
                paragraph(
                  'La sensation varie selon les personnes et les zones traitées, mais la plupart des clients décrivent surtout un *inconfort léger*, généralement *très supportable*.',
                ),
              ),
            },
            {
              question: 'Le résultat est-il naturel ?',
              highlight: true,
              shortAnswer:
                'C’est tout l’enjeu : ligne frontale, densité, teinte et finesse du point sont pensées ensemble pour un rendu crédible et peu perceptible.',
              answer: richText(
                paragraph(
                  'Lorsque l’on parle de naturel, on pense souvent à l’inverse : des traitements *très marqués*, *très droits*, qui laissent supposer une coupe artificielle.',
                ),
                paragraph(
                  'Même si ce type de rendu peut correspondre à un style recherché — notamment très présent aux *États-Unis* — je déconseille généralement cette approche.',
                ),
                paragraph(
                  'Selon moi, la *ligne frontale*, la *densité*, la *teinte* et la *finesse du point* doivent être pensées dans leur ensemble pour que le rendu reste *crédible* et *peu perceptible*.',
                ),
              ),
            },
            {
              question: 'Est-ce que je vais regretter ?',
              answer: richText(
                paragraph('C’est une question normale avant une tricopigmentation.'),
                paragraph(
                  'Dans les faits, les retours que je reçois parlent souvent d’un vrai *soulagement* : ne plus focaliser autant sur la perte de cheveux et se sentir plus à l’aise face au miroir ou sur les photos.',
                ),
                paragraph(
                  'Lorsqu’elle est bien réalisée, la tricopigmentation peut apporter un réel *confort au quotidien*.',
                ),
              ),
            },
            {
              question: 'Comment vieillit la tricopigmentation ?',
              answer: richText(
                paragraph(
                  'La manière dont elle vieillit dépend de plusieurs facteurs, comme la *peau*, l’*exposition au soleil*, l’*hygiène de vie*, l’*entretien* et la *qualité du travail réalisé au départ*.',
                ),
                paragraph(
                  'Les cellules du cuir chevelu se renouvellent rapidement, ce qui explique que le rendu puisse *s’adoucir*, *perdre légèrement en intensité* et nécessiter une *retouche* pour conserver un résultat idéal.',
                ),
                paragraph('Ces retouches interviennent généralement entre *12 et 18 mois*.'),
              ),
            },
            {
              question: 'Le rendu peut-il virer au bleu ou au vert ?',
              answer: richText(
                paragraph(
                  'Ce type de problème est généralement lié à un travail mal adapté au cuir chevelu : *profondeur excessive*, *teinte mal choisie*, *pigment mal utilisé* ou *geste imprécis du praticien*.',
                ),
                paragraph('C’est précisément ce que mon approche cherche à éviter.'),
              ),
            },
            {
              question: 'Est-on obligé de se raser avant la séance ?',
              answer: richText(
                paragraph('Cela dépend du *rendu recherché*.'),
                bulletList(
                  '*Pour un effet rasé*, j’ai besoin de travailler sur une zone *parfaitement rasée*, car j’ai besoin d’une bonne visibilité du cuir chevelu. L’idéal est de se raser la *veille au soir*, afin d’éviter toute irritation le jour J. Je recommande l’utilisation d’une tondeuse électrique de type _Skull Shaver_, qui permet d’obtenir un rasage très court tout en facilitant la routine par la suite.',
                  '*Pour un effet densité*, il n’est pas nécessaire de se raser. Je travaille *entre les cheveux*, sans toucher les bulbes. L’essentiel est d’arriver à la séance avec les *cheveux propres* et *sans produit coiffant*.',
                ),
              ),
            },
          ],
          ...button(galerie, 'Voir les résultats', 'outline'),
        },
        {
          title: 'Sécurité et accompagnement',
          items: [
            {
              question: 'Qu’en est-il de l’hygiène ?',
              answer: richText(
                paragraph(
                  'La tricopigmentation est un *geste précis* qui exige un *cadre d’hygiène irréprochable*. C’est un point sur lequel je ne fais *aucun compromis*.',
                ),
                paragraph(
                  'J’ai été formé à l’*hygiène et salubrité* et j’accorde ainsi une attention particulière à la *préparation du poste de travail*, à l’*organisation de la séance* et au *respect du cadre réglementaire applicable à l’activité*.',
                ),
                paragraph(
                  'Chaque séance est réalisée avec du *matériel professionnel*, des *consommables stériles à usage unique* et des *pigments conformes aux normes européennes actuelles REACH*.',
                ),
                paragraph('Mon local est *déclaré auprès de l’ARS*.'),
              ),
            },
            {
              question: 'Comment se préparer à sa séance ?',
              answer: richText(
                paragraph('Une bonne séance commence *avant le rendez-vous*.'),
                paragraph(
                  'Pour travailler dans les meilleures conditions, il est important d’arriver *reposé(e)* et avec le *cuir chevelu propre*, sans produit coiffant appliqué le jour J. Je recommande également de porter des *vêtements confortables* pour être à l’aise pendant toute la séance.',
                ),
                paragraph(
                  'Il est préférable d’éviter *l’alcool la veille*, ainsi que l’*excès de café* juste avant le rendez-vous. Si vous utilisez du _minoxidil_, je recommande de l’interrompre au moins *3 jours avant la séance*. Pour un effet rasé, l’idéal est de se raser la *veille au soir*, afin d’éviter toute irritation le jour J.',
                ),
                paragraph(
                  'La peau doit être dans le meilleur état possible au moment de la séance. En cas de *coup de soleil*, d’*irritation*, de *boutons*, de *rougeurs*, ou de problème cutané comme de l’*eczéma* ou du *psoriasis*, il est important de me prévenir en amont. Dans certains cas, il peut être préférable de *décaler la séance* pour travailler dans de bonnes conditions et éviter toute réaction inutile.',
                ),
              ),
            },
            {
              question: 'Quelles consignes faut-il respecter après la séance ?',
              answer: richText(
                paragraph(
                  'Les consignes post-traitement varient légèrement selon le type de prestation, mais le principe reste le même : laisser la zone tranquille pendant les *premiers jours*.',
                ),
                paragraph(
                  'Pour un *effet rasé* ou le *camouflage d’une cicatrice*, il est conseillé de garder la zone *sèche pendant les 3 premiers jours*.',
                ),
                paragraph(
                  'À partir du *4e jour*, un lavage doux avec un *shampoing à pH neutre* peut être repris.',
                ),
                paragraph(
                  'Si la peau est sèche ou tiraille, une fine couche de *Cicaplast B5* peut être appliquée, matin et soir.',
                ),
                paragraph(
                  'Le rasage à la tondeuse peut être repris à partir du *5e jour*. Je recommande d’éviter le *rasoir* tant que la cicatrisation n’est pas terminée.',
                ),
                paragraph(
                  'Pour une *densification capillaire*, la logique est la même : garder la zone *sèche pendant 3 jours*, puis reprendre progressivement ses habitudes avec un *shampoing doux*.',
                ),
                paragraph(
                  'Dans tous les cas, il faut éviter de *gratter* ou de *frotter* la zone, ainsi que la *piscine*, le *hammam*, le *sport intense*, le _minoxidil_ et l’*exposition directe au soleil* pendant les premiers jours.',
                ),
                paragraph(
                  'La reprise du *travail* est généralement rapide si l’environnement le permet.',
                ),
                paragraph(
                  'Sur le long terme, il est également conseillé d’intégrer à sa routine une *hydratation régulière du cuir chevelu*, afin de le garder entretenu au quotidien, ainsi qu’une *protection solaire SPF 30 minimum* en cas d’exposition.',
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
      links: [pageLink(contact, 'Me contacter')],
    },
  ],
  meta: {
    title: 'Questions fréquentes sur la tricopigmentation',
    description:
      'Tout savoir sur la tricopigmentation : origine, différence avec le tatouage, matériel, séances, douleur, résultat et soins. Studio à Pompey, près de Nancy.',
  },
})
