// Minimal builders for the Lexical JSON that rich text fields store

// Lexical text format flags
const BOLD = 1
const ITALIC = 2

const text = (value: string, format = 0) => ({
  type: 'text' as const,
  detail: 0,
  format,
  mode: 'normal' as const,
  style: '',
  text: value,
  version: 1,
})

// Splits "plain **bold** *emphasised* plain _foreign_" into text nodes: bold parts in bold,
// emphasised parts in bold italic, foreign words and product names in italic. A lone asterisk,
// such as a footnote mark, stays plain text.
const inline = (value: string) =>
  value
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/)
    .filter(Boolean)
    .map((part) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) return text(part.slice(2, -2), BOLD)
      if (/^\*[^*]+\*$/.test(part)) return text(part.slice(1, -1), BOLD | ITALIC)
      if (/^_[^_]+_$/.test(part)) return text(part.slice(1, -1), ITALIC)
      return text(part)
    })

export const heading = (value: string, tag: 'h1' | 'h2' | 'h3' = 'h1') => ({
  type: 'heading' as const,
  children: inline(value),
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  tag,
  version: 1,
})

export const paragraph = (value: string) => ({
  type: 'paragraph' as const,
  children: inline(value),
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
})

export const quote = (value: string) => ({
  type: 'quote' as const,
  children: inline(value),
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})

// Check list items are all ticked
const list = (listType: 'bullet' | 'check', items: string[]) => ({
  type: 'list' as const,
  listType,
  tag: 'ul' as const,
  start: 1,
  children: items.map((item, i) => ({
    type: 'listitem' as const,
    ...(listType === 'check' && { checked: true }),
    value: i + 1,
    children: inline(item),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  })),
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})

export const bulletList = (...items: string[]) => list('bullet', items)

export const checkList = (...items: string[]) => list('check', items)

// Lexical table header flags: the cell is in the header row, or in the header column
const HEADER_ROW = 1
const HEADER_COLUMN = 2

const tableCell = (value: string, headerState: number) => ({
  type: 'tablecell' as const,
  children: [paragraph(value)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  backgroundColor: null,
  colSpan: 1,
  headerState,
  rowSpan: 1,
})

const tableRow = (cells: ReturnType<typeof tableCell>[]) => ({
  type: 'tablerow' as const,
  children: cells,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})

// Table whose first column labels each row, with an optional row of column headings. The column
// widths only apply in the admin editor, which otherwise squeezes the columns.
export const table = ({ head, rows }: { head?: string[]; rows: string[][] }) => ({
  type: 'table' as const,
  colWidths: [220, ...Array((head || rows[0]).length - 1).fill(380)],
  children: [
    ...(head
      ? [
          tableRow(
            head.map((cell, i) =>
              tableCell(cell, i === 0 ? HEADER_ROW | HEADER_COLUMN : HEADER_ROW),
            ),
          ),
        ]
      : []),
    ...rows.map((cells) =>
      tableRow(cells.map((cell, i) => tableCell(cell, i === 0 ? HEADER_COLUMN : 0))),
    ),
  ],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})

type Node =
  | ReturnType<typeof heading>
  | ReturnType<typeof paragraph>
  | ReturnType<typeof quote>
  | ReturnType<typeof list>
  | ReturnType<typeof table>

export const richText = (...children: Node[]) => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})
