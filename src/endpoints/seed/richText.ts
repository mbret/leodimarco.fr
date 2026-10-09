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

// Splits "plain *emphasised* plain _foreign_" into text nodes: emphasised parts in bold italic,
// foreign words and product names in italic
const inline = (value: string) =>
  value
    .split(/(\*[^*]+\*|_[^_]+_)/)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith('*') && part.endsWith('*')) return text(part.slice(1, -1), BOLD | ITALIC)
      if (part.startsWith('_') && part.endsWith('_')) return text(part.slice(1, -1), ITALIC)
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

type Node =
  | ReturnType<typeof heading>
  | ReturnType<typeof paragraph>
  | ReturnType<typeof quote>
  | ReturnType<typeof list>

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
