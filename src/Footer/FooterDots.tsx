'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import { DotField } from '@/components/DotField'

// The band of dots along the top of the footer: drawn again for every page, so it fills in each
// time a visitor reaches the end of one
export const FooterDots: React.FC = () => {
  const pathname = usePathname()

  return <DotField className="relative h-14 overflow-hidden" key={pathname} variant="band" />
}
