import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

type LexicalNode = { children?: LexicalNode[]; text?: string; type?: string }

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'listitem', 'quote'])

// Flattens Lexical rich text to plain text, one line per paragraph or list item
export const toPlainText = (data?: DefaultTypedEditorState | null): string => {
  const lines: string[] = []

  const walk = (node: LexicalNode): string => {
    if (typeof node.text === 'string') return node.text

    const content = (node.children || []).map(walk).join('')
    if (node.type && BLOCK_TYPES.has(node.type)) {
      lines.push(content)
      return ''
    }
    return content
  }

  walk((data?.root as LexicalNode) || {})

  return lines.filter(Boolean).join('\n')
}
