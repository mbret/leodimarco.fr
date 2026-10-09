import type { RequiredDataFromCollectionSlug } from 'payload'

import type { Page } from '@/payload-types'

import { contactCta } from './contactCta'
import { pageLink } from './links'
import { bulletList, heading, paragraph, richText, table } from './richText'

type PageData = RequiredDataFromCollectionSlug<'pages'>

// Pages that the service pages link to
type LinkedPages = { contact: Page; faq: Page; galerie: Page }

export type ServicePages<T = Page> = { effetRase: T; densification: T; camouflage: T }

type Link = ReturnType<typeof pageLink>

const serviceHero = ({
  title,
  subtitle,
  intro,
  links,
}: {
  title: string
  subtitle: string
  intro: string[]
  links?: Link[]
}): PageData['hero'] => ({
  type: 'lowImpact',
  richText: richText(heading(title), heading(subtitle, 'h2'), ...intro.map(paragraph)),
  links,
})

// A section of text, optionally boxed or ending with a button
const section = (
  text: ReturnType<typeof richText>,
  { boxed = false, link }: { boxed?: boolean; link?: Link } = {},
) => ({
  blockType: 'content' as const,
  columns: [{ size: 'full' as const, boxed, richText: text, enableLink: Boolean(link), ...link }],
})

// Closing call to action: send photos to find out whether the service suits your case
const photosCta = (contact: Page, title: string, text: string[], label: string) => ({
  blockType: 'cta' as const,
  richText: richText(heading(title, 'h2'), ...text.map(paragraph)),
  links: [pageLink(contact, label)],
})

// Boxed list of the cases the service suits
const suitsYouIf = (...items: string[]) =>
  section(richText(heading('Cette solution peut vous convenir si…', 'h2'), bulletList(...items)), {
    boxed: true,
  })

// Service pages, from Léo's prestations document. Used by the seed and by the migration that brings
// existing sites up to date.
export const servicePagesData = ({
  contact,
  faq,
  galerie,
}: LinkedPages): ServicePages<PageData> => {
  const readFaq = pageLink(faq, 'Lire la FAQ', 'outline')
  const seeResults = pageLink(galerie, 'Voir les résultats', 'default')

  return {
    effetRase: {
      slug: 'effet-rase',
      title: 'Effet rasé',
      _status: 'published',
      hero: serviceHero({
        title: 'Effet rasé',
        subtitle: 'Recréer l’apparence d’un crâne rasé de près',
        intro: [
          'Vous avez une calvitie avancée, la densification n’est plus crédible, et vous voulez retrouver un rendu propre sans dépendre de poudres, fibres capillaires ou solutions à refaire chaque matin.',
          'La tricopigmentation effet rasé permet de recréer visuellement l’apparence de follicules rasés très court grâce à des milliers de micro-points de pigments biorésorbables.',
          'Résultat : on voit simplement quelqu’un qui se rase le crâne.',
        ],
        links: [seeResults],
      }),
      layout: [
        suitsYouIf(
          'vous avez une calvitie avancée ;',
          'votre ligne frontale est reculée ou irrégulière ;',
          'la densification capillaire n’est plus crédible ;',
          'vous êtes prêt à garder les cheveux très courts ;',
          'vous souhaitez une alternative esthétique à la greffe ;',
          'vous voulez éviter les poudres, fibres ou routines à refaire chaque matin ;',
          'vous préférez éviter les traitements médicamenteux.',
        ),
        section(
          richText(
            heading('Le naturel se joue surtout dans la ligne frontale', 'h2'),
            paragraph(
              'La ligne frontale est l’un des éléments les plus importants dans une tricopigmentation effet rasé.',
            ),
            paragraph(
              'Une ligne trop basse, trop droite ou trop marquée peut rapidement créer un rendu artificiel. Lors de la première séance, je prends toujours un temps supplémentaire pour construire une ligne adaptée à votre visage et vos proportions.',
            ),
          ),
        ),
        section(
          richText(
            heading('Ma manière de travailler', 'h2'),
            paragraph(
              'Mon objectif est d’obtenir un résultat qui semble naturel dans la vie quotidienne, pas seulement sur une photo prise juste après la séance.',
            ),
            paragraph(
              'Chaque projet commence par une observation de l’équilibre du visage, de la forme du crâne, de la densité restante et de la couleur naturelle des cheveux.',
            ),
            paragraph('Selon votre profil, le rendu peut être :'),
            table({
              head: ['Style de rendu', 'Objectif'],
              rows: [
                ['Très fondu', 'Résultat discret, peu marqué'],
                ['Légèrement structuré', 'Rendu propre, mais toujours réaliste'],
                ['Plus affirmé', 'Style plus net, inspiré _barber cut_'],
              ],
            }),
            table({
              head: ['Ce que je privilégie', 'Pourquoi c’est important'],
              rows: [
                ['Des micro-points fins', 'Pour éviter un rendu lourd ou artificiel'],
                ['Une densité progressive', 'Pour contrôler le résultat étape par étape'],
                ['Une teinte adaptée', 'Pour rester cohérent avec votre peau et vos cheveux'],
                [
                  'Des transitions douces',
                  'Pour fondre les zones pigmentées avec les cheveux existants',
                ],
                [
                  'Une ligne frontale personnalisée',
                  'Pour respecter votre visage et éviter l’effet « dessiné »',
                ],
              ],
            }),
          ),
        ),
        section(
          richText(
            heading('Combien de séances faut-il ?', 'h2'),
            paragraph(
              'Une tricopigmentation effet rasé se construit généralement en **3 séances**.',
            ),
            paragraph(
              'Ces séances permettent d’avancer progressivement, d’observer la réaction de la peau et d’ajuster la densité si nécessaire.',
            ),
            paragraph(
              'La surface à traiter, le type de peau, le rendu souhaité et la tenue du pigment peuvent influencer le protocole.',
            ),
            paragraph(
              'Les détails sur le déroulement, la cicatrisation et les soins sont expliqués dans la FAQ.',
            ),
          ),
          { link: readFaq },
        ),
        section(
          richText(
            heading('L’entretien au quotidien', 'h2'),
            paragraph(
              'Pour conserver un rendu idéal, il est important de garder les cheveux très courts.',
            ),
            paragraph(
              'Selon votre vitesse de repousse, cela implique généralement un rasage quotidien ou tous les deux jours.',
            ),
            paragraph(
              'Vous pouvez utiliser un rasoir classique ou une tondeuse électrique adaptée au crâne, comme un _skull shaver_. Ce type d’appareil est particulièrement efficace pour entretenir un effet rasé régulier.',
            ),
            paragraph(
              'Plus les cheveux repoussent, plus le contraste entre les vrais cheveux et la zone pigmentée peut devenir visible. L’entretien de la coupe fait partie du résultat.',
            ),
            paragraph('Sur le long terme, il est conseillé de :'),
            table({
              head: ['À faire', 'Objectif'],
              rows: [
                ['garder une coupe très courte', 'préserver l’homogénéité du rendu'],
                ['hydrater le cuir chevelu', 'garder une peau saine'],
                ['protéger du soleil', 'limiter l’altération du pigment'],
                ['prévoir une retouche si besoin', 'conserver un rendu optimal'],
              ],
            }),
            paragraph(
              'Des retouches peuvent être envisagées tous les 18 - 24 mois selon la peau, l’exposition au soleil et l’entretien général.',
            ),
          ),
        ),
        section(
          richText(
            heading('Tarif effet rasé', 'h2'),
            paragraph(
              'Le tarif d’une tricopigmentation effet rasé dépend de la surface à traiter, du niveau de calvitie et du nombre de séances nécessaires.',
            ),
            paragraph('Un devis précis est établi après échange.'),
            paragraph('**Effet rasé : à partir de 400 €***'),
            paragraph('* Ce tarif correspond à une petite zone localisée.'),
          ),
          { boxed: true },
        ),
        photosCta(
          contact,
          'Vous voulez savoir si l’effet rasé est adapté à votre cas ?',
          [
            'Envoyez-moi quelques photos de votre cuir chevelu sous bonne lumière. Je vous dirai honnêtement si la tricopigmentation effet rasé peut donner un résultat naturel dans votre situation.',
          ],
          'Prendre contact',
        ),
      ],
      meta: {
        title: 'Effet rasé : tricopigmentation près de Nancy',
        description:
          'Tricopigmentation effet rasé à Pompey, près de Nancy : recréer l’apparence d’un crâne rasé de près en cas de calvitie avancée. À partir de 400 €.',
      },
    },

    densification: {
      slug: 'densification-capillaire',
      title: 'Densification capillaire',
      _status: 'published',
      hero: serviceHero({
        title: 'Densification capillaire',
        subtitle: 'Réduire visuellement la transparence du cuir chevelu',
        intro: [
          'Vous avez encore des cheveux, mais certaines zones paraissent plus clairsemées. Sous la lumière, sur les photos, après une coupe ou au niveau de la raie, le cuir chevelu devient plus visible.',
          'La densification capillaire par tricopigmentation permet de diminuer ce contraste en ajoutant de très fins micro-points entre les cheveux existants.',
          'Le but est de diminuer la visibilité du cuir chevelu à travers vos cheveux.',
        ],
      }),
      layout: [
        suitsYouIf(
          'vous avez encore une base de cheveux suffisante ;',
          'votre cuir chevelu devient visible sous la lumière ;',
          'certaines zones sont clairsemées ou moins homogènes ;',
          'vous voulez garder votre coupe actuelle ;',
          'vous recherchez un résultat discret ;',
          'vous ne voulez pas utiliser de poudre ou de fibres capillaires au quotidien.',
        ),
        section(
          richText(
            heading('Une solution discrète pour les cheveux clairsemés', 'h2'),
            paragraph('Elle s’adresse aussi bien aux hommes qu’aux femmes.'),
            paragraph(
              'Chez la femme, elle peut notamment permettre d’atténuer la visibilité du cuir chevelu au niveau de la raie ou de certaines zones de transparence, tout en restant discrète sous les cheveux existants.',
            ),
            paragraph(
              'Elle peut aussi être intéressante après une greffe capillaire lorsque le résultat manque encore de densité visuelle malgré les implants.',
            ),
          ),
          { link: seeResults },
        ),
        section(
          richText(
            heading('Le point essentiel : avoir assez de cheveux', 'h2'),
            paragraph(
              'La densification capillaire fonctionne uniquement s’il reste suffisamment de cheveux pour intégrer le travail.',
            ),
            paragraph(
              'Si la densité de départ est trop faible, le résultat risque de ne pas être naturel. Dans ce cas, un effet rasé peut parfois être plus adapté.',
            ),
            paragraph(
              'Chaque projet est évalué au cas par cas. Si je pense que ce n’est pas la bonne solution, je vous le dirai clairement.',
            ),
          ),
        ),
        section(
          richText(
            heading('Ma manière de travailler', 'h2'),
            paragraph(
              'Mon objectif est que la tricopigmentation se fonde dans vos cheveux existants.',
            ),
            paragraph(
              'Je travaille de manière ciblée, en observant la répartition des cheveux, les zones de transparence, les contrastes et la couleur naturelle de votre cuir chevelu.',
            ),
            paragraph('Mon approche repose sur :'),
            table({
              rows: [
                ['Des micro-points très fins', 'Pour se fondre dans la masse capillaire'],
                ['Une densité progressive', 'Pour éviter les démarcations visibles'],
                ['Une teinte adaptée', 'Pour rester cohérent avec vos cheveux'],
                ['Un travail ciblé', 'Pour corriger les zones visibles sans surcharger'],
                ['Un rendu discret', 'Pour que le résultat reste naturel au quotidien'],
              ],
            }),
          ),
        ),
        section(
          richText(
            heading('Combien de séances faut-il ?', 'h2'),
            paragraph(
              'La densification se construit généralement en plusieurs séances, souvent autour de **3 séances**.',
            ),
            paragraph(
              'Cela permet de travailler progressivement, d’observer la réaction de la peau et d’ajuster la densité si nécessaire.',
            ),
            paragraph(
              'Le nombre exact dépend de la zone à traiter, de la densité déjà présente, du résultat recherché et de la manière dont la peau retient le pigment.',
            ),
            paragraph(
              'Les informations plus détaillées sur le déroulement, la préparation et les soins sont disponibles dans la FAQ.',
            ),
          ),
          { link: readFaq },
        ),
        section(
          richText(
            heading('Tarifs effet densité', 'h2'),
            paragraph(
              'Le tarif d’une tricopigmentation effet densité dépend de la surface à travailler et du nombre de séances nécessaires.',
            ),
            paragraph('Un devis précis est établi après échange.'),
            paragraph('**Effet densité : à partir de 400 €***'),
            paragraph('* Ce tarif correspond à une petite zone localisée.'),
          ),
          { boxed: true },
        ),
        photosCta(
          contact,
          'Vous voulez savoir si la densification est adaptée à votre cas ?',
          [
            'Envoyez-moi quelques photos de votre cuir chevelu sous bonne lumière, avec les cheveux dans leur état habituel.',
            'Je vous dirai si la densification capillaire peut donner un résultat naturel dans votre situation, ou si une autre approche serait plus adaptée.',
          ],
          'M’envoyer des photos',
        ),
      ],
      meta: {
        title: 'Densification capillaire : tricopigmentation près de Nancy',
        description:
          'Densification capillaire par tricopigmentation à Pompey, près de Nancy : réduire la transparence du cuir chevelu, chez l’homme comme chez la femme. Dès 400 €.',
      },
    },

    camouflage: {
      slug: 'camouflage-de-cicatrices',
      title: 'Camouflage de cicatrices',
      _status: 'published',
      hero: serviceHero({
        title: 'Camouflage de cicatrices',
        subtitle: 'Atténuer visuellement une cicatrice du cuir chevelu',
        intro: [
          'Certaines cicatrices du cuir chevelu restent visibles, surtout lorsque les cheveux sont portés courts.',
          'Selon leur emplacement, leur couleur ou leur relief, elles peuvent créer une démarcation qui attire le regard et devenir source de gêne au quotidien.',
          'La tricopigmentation permet d’en atténuer l’impact visuel en recréant une continuité plus cohérente avec la zone environnante.',
        ],
      }),
      layout: [
        // The three kinds of scars side by side
        {
          blockType: 'content',
          columns: [
            richText(
              heading('Cicatrices après greffe FUE', 'h2'),
              paragraph('La greffe FUE laisse de multiples micro-marques dans la zone donneuse.'),
              paragraph(
                'En travaillant chacune d’elles avec minutie, je pourrais les rendre nettement moins visibles.',
              ),
            ),
            richText(
              heading('Cicatrice après greffe FUT', 'h2'),
              paragraph('La technique FUT laisse une cicatrice linéaire à l’arrière du crâne.'),
              paragraph(
                'Invisible lorsque les cheveux sont longs, elle apparaitra si vous décidez d’adopter une coupe courte.',
              ),
              paragraph(
                'Je pourrais casser cette ligne et l’intégrer visuellement dans l’ensemble.',
              ),
            ),
            richText(
              heading('Autres cicatrices', 'h2'),
              paragraph(
                'Ancienne blessure, intervention chirurgicale, chute ou marque de naissance : chaque cicatrice présente des caractéristiques propres.',
              ),
            ),
          ].map((text) => ({ size: 'oneThird' as const, richText: text })),
        },
        section(
          richText(
            heading('Ma manière de travailler', 'h2'),
            paragraph(
              'Le camouflage d’une cicatrice demande une approche prudente et progressive.',
            ),
            paragraph('Avant toute séance, j’observe attentivement :'),
            bulletList(
              'la couleur de la cicatrice ;',
              'sa largeur ;',
              'son relief ;',
              'son ancienneté ;',
              'la qualité de la peau ;',
              'la densité capillaire autour ;',
              'le contraste avec la zone environnante.',
            ),
          ),
        ),
        section(
          richText(
            heading('Combien de séances ?', 'h2'),
            paragraph('Le camouflage d’une cicatrice nécessite généralement **2 séances**.'),
            paragraph(
              'Selon le type de cicatrice et son ancienneté, une **3e séance** peut parfois être nécessaire.',
            ),
          ),
          { link: readFaq },
        ),
        section(
          richText(
            heading('Tarifs camouflage de cicatrices', 'h2'),
            paragraph('**À partir de 200 €***'),
            paragraph(
              'Le tarif dépend de la taille de la cicatrice et de la complexité du travail nécessaire.',
            ),
            paragraph('Un devis précis est donné après échange.'),
            paragraph('* Ce tarif correspond à une petite cicatrice.'),
          ),
          { boxed: true },
        ),
        photosCta(
          contact,
          'Vous voulez savoir si votre cicatrice peut être camouflée ?',
          [
            'Envoyez-moi quelques photos nettes de votre cicatrice, sous bonne lumière.',
            'Je vous dirai si la tricopigmentation peut l’atténuer de manière naturelle, ou si le résultat risque d’être limité.',
          ],
          'M’envoyer mes photos',
        ),
      ],
      meta: {
        title: 'Camouflage de cicatrices : tricopigmentation près de Nancy',
        description:
          'Camouflage de cicatrices du cuir chevelu par tricopigmentation à Pompey, près de Nancy : greffe FUE ou FUT, blessure, intervention. À partir de 200 €.',
      },
    },
  }
}

// Card leading to a service's page, once the page exists
const serviceLink = (page: Page | undefined, label: string) =>
  page ? { enableLink: true, ...pageLink(page, label, 'outline') } : {}

// Prestations page: an overview of the services, each card leading to the service's page
export const prestationsPageData = ({
  contact,
  services,
}: {
  contact: Page
  services?: ServicePages
}): PageData => ({
  slug: 'prestations',
  title: 'Prestations',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: richText(
      heading('Prestations'),
      paragraph(
        'Chaque projet commence par un rendez-vous pour étudier votre situation, définir la ligne frontale et choisir la teinte.',
      ),
    ),
  },
  layout: [
    {
      blockType: 'services',
      items: [
        {
          title: 'Effet rasé',
          description: 'Recréer l’apparence d’un crâne rasé de près.',
          price: 'À partir de 400 €',
          ...serviceLink(services?.effetRase, 'Découvrir l’effet rasé'),
        },
        {
          title: 'Densification capillaire',
          description: 'Réduire visuellement la transparence du cuir chevelu.',
          price: 'À partir de 400 €',
          ...serviceLink(services?.densification, 'Découvrir la densification'),
        },
        {
          title: 'Camouflage de cicatrices',
          description: 'Atténuer visuellement une cicatrice du cuir chevelu.',
          price: 'À partir de 200 €',
          ...serviceLink(services?.camouflage, 'Découvrir le camouflage'),
        },
      ],
    },
    contactCta(contact),
  ],
  meta: {
    title: 'Prestations et tarifs',
    description:
      'Tricopigmentation à Pompey, près de Nancy : effet rasé et densification capillaire à partir de 400 €, camouflage de cicatrices à partir de 200 €.',
  },
})
