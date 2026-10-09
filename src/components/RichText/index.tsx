import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  SerializedListItemNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'
import { Check } from 'lucide-react'

import type {
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<CTABlockProps | MediaBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  return value.slug === 'home' ? '/' : `/${value.slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  // Check lists show a check mark, or an empty circle when unticked, instead of the editor's
  // checkboxes. Screen readers are told which items are unticked.
  list: (args) => {
    const { node, nodesToJSX } = args
    if (node.listType !== 'check') {
      const { list } = defaultConverters
      return typeof list === 'function' ? list(args) : list
    }

    return (
      <ul className="not-prose mt-4 mb-8 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-6">
        {(node.children as SerializedListItemNode[]).map((item, i) => (
          <li className="flex gap-3" key={i}>
            <span
              aria-hidden
              className={cn(
                'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                item.checked ? 'bg-foreground text-background' : 'border border-border',
              )}
            >
              {item.checked && <Check className="size-3.5" strokeWidth={3} />}
            </span>
            <span>
              {!item.checked && <span className="sr-only">Non coché : </span>}
              {nodesToJSX({ nodes: item.children })}
            </span>
          </li>
        ))}
      </ul>
    )
  },
  blocks: {
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
