import React from 'react'

import type { ServicesBlock as ServicesBlockProps } from '@/payload-types'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const ServicesBlock: React.FC<ServicesBlockProps> = ({ heading, items }) => {
  return (
    <div className="container">
      {heading && <h2 className="mb-8 text-3xl font-semibold">{heading}</h2>}
      <div className="grid gap-4 md:grid-cols-2">
        {(items || []).map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              {item.price && <CardDescription>{item.price}</CardDescription>}
            </CardHeader>
            {item.description && (
              <CardContent>
                <p className="whitespace-pre-line">{item.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
