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
    // Always shown with a message icon (Header/Nav), so it suits a link that opens a conversation
    {
      name: 'enableButton',
      type: 'checkbox',
      label: 'Ajouter un bouton après le menu',
      admin: {
        description:
          'Avec une icône de message, pour ouvrir une conversation. Sur les téléphones et les tablettes, le bouton ne montre que son icône.',
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
