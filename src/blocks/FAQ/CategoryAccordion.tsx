'use client'

import React, { useEffect, useState } from 'react'

import { Accordion } from '@/components/ui/accordion'

import { questionAnchor } from './questionAnchor'

// Opens the question named in the URL hash, so a highlighted question card leads to its answer
export const CategoryAccordion: React.FC<{ children: React.ReactNode; ids: string[] }> = ({
  children,
  ids,
}) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    const openFromHash = () => {
      const id = ids.find((id) => window.location.hash === `#${questionAnchor(id)}`)
      if (id) setValue(id)
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [ids])

  return (
    <Accordion collapsible onValueChange={setValue} type="single" value={value}>
      {children}
    </Accordion>
  )
}
