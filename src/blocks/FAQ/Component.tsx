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

type Item = NonNullable<FAQBlockProps['categories']>[number]['items'][number]

const itemKey = (item: Item) => item.id || item.question

// Anchor of a category, from its title without accents: « Est-ce adapté à mon cas ? » gives
// #est-ce-adapte-a-mon-cas
const categoryAnchor = (title: string, index: number) =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `categorie-${index + 1}`

// French puts a space before ? ! : ; and inside « »: a no-break space keeps the mark on the line of
// its word, so a question never ends with a lone « ? » on narrow screens
const keepPunctuation = (text: string) =>
  text.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')

export const FAQBlock: React.FC<FAQBlockProps> = ({ categories, highlightsTitle }) => {
  const groups = (categories || []).map((group, index) => ({
    ...group,
    anchor: categoryAnchor(group.title, index),
    items: group.items || [],
    title: keepPunctuation(group.title),
  }))
  const highlights = groups.flatMap(({ items }) => items.filter((item) => item.highlight))
  // A single category, such as the few questions on the home page, needs no links to itself
  const showNav = groups.length > 1

  // Lets search engines show the questions directly in results
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap(({ items }) =>
      items.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: toPlainText(answer) },
      })),
    ),
  }

  return (
    <div className="container flex flex-col gap-16">
      {highlights.length > 0 && (
        <section>
          {highlightsTitle && (
            <h2 className="mb-6 text-sm tracking-widest text-muted-foreground uppercase">
              {highlightsTitle}
            </h2>
          )}
          {/* One band in the green of the studio wall, split into a card per question */}
          <ol className="grid overflow-hidden rounded-xl bg-studio md:grid-cols-3">
            {highlights.map((item, i) => (
              <li
                className="group relative flex flex-col border-white/15 p-6 transition-colors not-first:border-t hover:bg-white/5 md:p-8 md:not-first:border-t-0 md:not-first:border-l"
                key={itemKey(item)}
              >
                <span
                  aria-hidden
                  className="font-heading text-5xl leading-none font-semibold tracking-tight text-white/40 tabular-nums md:text-6xl"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 text-lg leading-snug font-semibold md:mt-10">
                  {keepPunctuation(item.question)}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/75">
                  {item.shortAnswer && keepPunctuation(item.shortAnswer)}
                </p>
                {/* The link covers the whole card */}
                <a
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-white/60 focus-visible:after:ring-inset"
                  href={`#${questionAnchor(itemKey(item))}`}
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
      )}
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
            <section className="scroll-mt-8" id={group.anchor} key={group.id || group.anchor}>
              <h2 className="mb-5 text-2xl font-semibold">{group.title}</h2>
              <div className="rounded-xl border border-border bg-card px-5 md:px-7">
                <CategoryAccordion ids={group.items.map(itemKey)}>
                  {group.items.map((item) => (
                    <AccordionItem
                      className="scroll-mt-8"
                      id={questionAnchor(itemKey(item))}
                      key={itemKey(item)}
                      value={itemKey(item)}
                    >
                      <AccordionTrigger className="py-5 text-base leading-snug md:text-[1.0625rem]">
                        {keepPunctuation(item.question)}
                      </AccordionTrigger>
                      {/* Answers line up with their question, and from tablets stay clear of the
                          button beside it */}
                      <AccordionContent className="pb-6 md:pr-11">
                        {/* Answers sit below their question: smaller and muted, with emphasised
                            words in full colour rather than bold */}
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
