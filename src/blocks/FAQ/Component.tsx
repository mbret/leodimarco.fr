import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toPlainText } from '@/utilities/toPlainText'

export const FAQBlock: React.FC<FAQBlockProps> = ({ categories }) => {
  const groups = categories || []

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
      {groups.map((group) => (
        <section key={group.id}>
          <h2 className="mb-4 text-2xl font-semibold">{group.title}</h2>
          <Accordion collapsible type="single">
            {(group.items || []).map((item) => (
              <AccordionItem key={item.id} value={item.id || item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <RichText data={item.answer} enableGutter={false} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
