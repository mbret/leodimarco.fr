import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    // The main action on every page, such as sending photos on WhatsApp
    {
      name: 'enableButton',
      type: 'checkbox',
      label: 'Ajouter un bouton après le menu',
      admin: {
        description: 'Sur les téléphones, le bouton ne montre que son icône.',
      },
    },
    link({
      appearances: false,
      overrides: {
        name: 'button',
        admin: {
          condition: (_data, siblingData) => Boolean(siblingData?.enableButton),
        },
      },
    }),
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
