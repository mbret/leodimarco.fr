import { ArrowDownIcon } from 'lucide-react'
import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toPlainText } from '@/utilities/toPlainText'
import { cn } from '@/utilities/ui'

import { CategoryAccordion } from './CategoryAccordion'
import { CategoryNav } from './CategoryNav'
import { questionAnchor } from './questionAnchor'

// French puts a space before ? ! : ; and inside « »: a no-break space keeps the mark on the line of
// its word
const keepPunctuation = (text: string) =>
  text.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')

// A title without accents, such as est-ce-adapte-a-mon-cas
const slug = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// The categories and questions as shown on the page, each with its anchor
const toGroups = (categories: FAQBlockProps['categories']) => {
  const anchors = new Set<string>()
  // Two titles with the same slug get -2, -3 and so on
  const uniqueAnchor = (title: string) => {
    const base = slug(title) || 'categorie'
    let anchor = base
    for (let n = 2; anchors.has(anchor); n++) anchor = `${base}-${n}`
    anchors.add(anchor)
    return anchor
  }

  return (categories || []).map((group) => ({
    ...group,
    anchor: uniqueAnchor(group.title),
    title: keepPunctuation(group.title),
    items: (group.items || []).map((item) => {
      const id = item.id || item.question
      return {
        ...item,
        id,
        anchor: questionAnchor(id),
        question: keepPunctuation(item.question),
        shortAnswer: item.shortAnswer && keepPunctuation(item.shortAnswer),
      }
    }),
  }))
}

type Group = ReturnType<typeof toGroups>[number]
type Question = Group['items'][number]

const Highlights: React.FC<{ items: Question[]; title?: string | null }> = ({ items, title }) => (
  <section>
    {title && (
      <h2 className="mb-6 text-sm tracking-widest text-muted-foreground uppercase">{title}</h2>
    )}
    {/* The questions share one row of equal columns, whatever their number */}
    <ol className="grid overflow-hidden rounded-xl bg-studio md:auto-cols-fr md:grid-flow-col">
      {items.map((item, i) => (
        <li
          className="group relative flex flex-col border-white/15 p-6 transition-colors not-first:border-t hover:bg-white/5 md:p-8 md:not-first:border-t-0 md:not-first:border-l"
          key={item.id}
        >
          <span
            aria-hidden
            className="font-heading text-5xl leading-none font-semibold tracking-tight text-white/40 tabular-nums md:text-6xl"
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-6 text-lg leading-snug font-semibold md:mt-10">{item.question}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/75">{item.shortAnswer}</p>
          {/* The link covers the whole card */}
          <a
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-white/60 focus-visible:after:ring-inset"
            href={`#${item.anchor}`}
          >
            Lire la réponse
            <ArrowDownIcon
              aria-hidden
              className="size-4 transition-transform group-hover:translate-y-0.5"
            />
          </a>
        </li>
      ))}
    </ol>
  </section>
)

const Category: React.FC<{ group: Group }> = ({ group }) => (
  <section className="scroll-mt-8" id={group.anchor}>
    <h2 className="mb-5 text-2xl font-semibold">{group.title}</h2>
    <div className="rounded-xl border border-border bg-card px-5 md:px-7">
      <CategoryAccordion ids={group.items.map(({ id }) => id)}>
        {group.items.map((item) => (
          <AccordionItem className="scroll-mt-8" id={item.anchor} key={item.id} value={item.id}>
            <AccordionTrigger className="py-5 text-base leading-snug md:text-[1.0625rem]">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              {/* Answers sit below their question: smaller and muted, with emphasised words in full
                  colour rather than bold */}
              <RichText
                className="prose-sm [--tw-prose-body:var(--color-muted-foreground)]! [&_strong]:font-normal"
                data={item.answer}
                enableGutter={false}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </CategoryAccordion>
    </div>
    {group.enableLink && (
      <div className="mt-6">
        <CMSLink {...group.link} />
      </div>
    )}
  </section>
)

export const FAQBlock: React.FC<FAQBlockProps> = ({ categories, highlightsTitle }) => {
  const groups = toGroups(categories)
  const highlights = groups.flatMap(({ items }) => items.filter((item) => item.highlight))
  // A single category needs no links to itself
  const showNav = groups.length > 1

  // Lets search engines show the questions directly in results, with their text as written
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (categories || []).flatMap(({ items }) =>
      (items || []).map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: toPlainText(answer) },
      })),
    ),
  }

  return (
    <div className="container flex flex-col gap-16">
      {highlights.length > 0 && <Highlights items={highlights} title={highlightsTitle} />}
      <div
        className={cn(
          showNav && 'lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-12',
        )}
      >
        {showNav && (
          <CategoryNav
            categories={groups.map(({ anchor, items, title }) => ({
              anchor,
              count: items.length,
              title,
            }))}
          />
        )}
        <div className="flex flex-col gap-14">
          {groups.map((group) => (
            <Category group={group} key={group.anchor} />
          ))}
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
        type="application/ld+json"
      />
    </div>
  )
}
