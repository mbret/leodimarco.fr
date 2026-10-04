import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toPlainText } from '@/utilities/toPlainText'

import { CategoryAccordion } from './CategoryAccordion'
import { questionAnchor } from './questionAnchor'

type Item = NonNullable<FAQBlockProps['categories']>[number]['items'][number]

const itemKey = (item: Item) => item.id || item.question

export const FAQBlock: React.FC<FAQBlockProps> = ({ categories, highlightsTitle }) => {
  const groups = categories || []
  const highlights = groups.flatMap(({ items }) => (items || []).filter((item) => item.highlight))

  // Lets search engines show the questions directly in results
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap(({ items }) =>
      (items || []).map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: toPlainText(answer) },
      })),
    ),
  }

  return (
    <div className="container flex max-w-3xl flex-col gap-16">
      {highlights.length > 0 && (
        <section>
          {highlightsTitle && (
            <h2 className="mb-6 text-sm tracking-widest text-muted-foreground uppercase">
              {highlightsTitle}
            </h2>
          )}
          <ol className="grid gap-4 md:grid-cols-3">
            {highlights.map((item, i) => (
              <li
                className="flex flex-col rounded-lg border border-border bg-card p-6"
                key={itemKey(item)}
              >
                <span aria-hidden className="text-6xl leading-none font-semibold tracking-tight">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <h3 className="mt-10 text-lg leading-snug font-semibold">{item.question}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.shortAnswer}
                </p>
                <a
                  className="mt-6 text-sm font-medium underline underline-offset-4"
                  href={`#${questionAnchor(itemKey(item))}`}
                >
                  Lire la réponse →
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
      {groups.map((group) => (
        <section key={group.id}>
          <h2 className="mb-4 text-2xl font-semibold">{group.title}</h2>
          <CategoryAccordion ids={(group.items || []).map(itemKey)}>
            {(group.items || []).map((item) => (
              <AccordionItem
                className="scroll-mt-8"
                id={questionAnchor(itemKey(item))}
                key={itemKey(item)}
                value={itemKey(item)}
              >
                <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
                <AccordionContent>
                  {/* Answers sit below their question: smaller and muted, with emphasised words in full colour */}
                  <RichText
                    className="prose-sm [--tw-prose-body:var(--color-muted-foreground)]!"
                    data={item.answer}
                    enableGutter={false}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </CategoryAccordion>
          {group.enableLink && (
            <div className="mt-8">
              <CMSLink {...group.link} />
            </div>
          )}
        </section>
      ))}
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
        type="application/ld+json"
      />
    </div>
  )
}
