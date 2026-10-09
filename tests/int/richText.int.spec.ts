import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import RichText from '@/components/RichText'
import { bulletList, checkList, richText } from '@/endpoints/seed/richText'
import type { ContentBlock } from '@/payload-types'

afterEach(cleanup)

// Rich text as a content block stores it
type StoredRichText = NonNullable<NonNullable<ContentBlock['columns']>[number]['richText']>

const renderRichText = (data: StoredRichText) => render(React.createElement(RichText, { data }))

describe('Rich text', () => {
  it('shows check lists as a list with check marks, not as checkboxes', () => {
    renderRichText(richText(checkList('Poste désinfecté', 'Consommables stériles')))

    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Poste désinfecté',
      'Consommables stériles',
    ])
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('tells screen readers which check list items are unticked', () => {
    const list = checkList('Poste désinfecté', 'Consommables stériles')
    list.children[1].checked = false
    renderRichText(richText(list))

    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Poste désinfecté',
      'Non coché : Consommables stériles',
    ])
  })

  it('keeps bullet lists as they are', () => {
    const { container } = renderRichText(richText(bulletList('Rendu léger')))

    expect(container.querySelector('ul.list-bullet li')?.textContent).toBe('Rendu léger')
  })
})
