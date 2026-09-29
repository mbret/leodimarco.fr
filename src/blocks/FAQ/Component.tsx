import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const FAQBlock: React.FC<FAQBlockProps> = ({ heading, items }) => {
  const questions = items || []

  // Lets search engines show the questions directly in results
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <div className="container max-w-3xl">
      {heading && <h2 className="mb-8 text-3xl font-semibold">{heading}</h2>}
      <Accordion collapsible type="single">
        {questions.map((item) => (
          <AccordionItem key={item.id} value={item.id || item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
        type="application/ld+json"
      />
    </div>
  )
}
