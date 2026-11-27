import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import RichText from '@/components/RichText'
import {
  bulletList,
  checkList,
  heading,
  paragraph,
  richText,
  table,
} from '@/endpoints/seed/richText'
import type { ContentBlock } from '@/payload-types'

afterEach(cleanup)

// Rich text as a content block stores it
type StoredRichText = NonNullable<NonNullable<ContentBlock['columns']>[number]['richText']>

const renderRichText = (data: StoredRichText) => render(React.createElement(RichText, { data }))

describe('Rich text', () => {
  it('shows the full stop that ends a title in the green of the studio wall', () => {
    renderRichText(
      richText(
        heading('Tricopigmentation à Nancy.'),
        heading('Envoyez-moi quelques photos.', 'h2'),
      ),
    )

    const [title, sectionTitle] = screen.getAllByRole('heading')
    expect(title.textContent).toBe('Tricopigmentation à Nancy.')
    expect(title.querySelector('.text-point')?.textContent).toBe('.')
    expect(sectionTitle.textContent).toBe('Envoyez-moi quelques photos.')
    expect(sectionTitle.querySelector('.text-point')?.textContent).toBe('.')
  })

  it('leaves an ellipsis and the full stop of a smaller heading as they are', () => {
    renderRichText(richText(heading('Et ensuite...', 'h2'), heading('Basé à Pompey.', 'h3')))

    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Et ensuite...')
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Basé à Pompey.')
    expect(document.querySelector('.text-point')).toBeNull()
  })

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

  it('shows tables with column headings and row labels', () => {
    renderRichText(
      richText(
        table({
          head: ['Style de rendu', 'Objectif'],
          rows: [['Très fondu', 'Résultat discret, peu marqué']],
        }),
      ),
    )

    expect(screen.getByRole('columnheader', { name: 'Objectif' })).toBeTruthy()
    expect(screen.getByRole('rowheader', { name: 'Très fondu' })).toBeTruthy()
    expect(screen.getByRole('cell', { name: 'Résultat discret, peu marqué' })).toBeTruthy()
  })

  it('keeps the footnote mark of a bold price', () => {
    renderRichText(richText(paragraph('**À partir de 200 €***')))

    expect(screen.getByText('À partir de 200 €').tagName).toBe('STRONG')
    expect(screen.getByRole('paragraph').textContent).toBe('À partir de 200 €*')
  })

  it('keeps French punctuation on the line of its word', () => {
    renderRichText(richText(paragraph('Est-ce douloureux ? « Très peu » : c’est tout l’enjeu.')))

    expect(screen.getByRole('paragraph').textContent).toBe(
      'Est-ce douloureux\u00a0? «\u00a0Très peu\u00a0»\u00a0: c’est tout l’enjeu.',
    )
  })

  it('keeps the format of text with French punctuation', () => {
    renderRichText(richText(paragraph('C’est **tout l’enjeu :** ligne frontale.')))

    const bold = screen.getByText(/enjeu/)
    expect(bold.tagName).toBe('STRONG')
    expect(bold.textContent).toBe('tout l’enjeu\u00a0:')
  })
})
