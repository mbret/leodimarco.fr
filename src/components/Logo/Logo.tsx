import clsx from 'clsx'
import React from 'react'

import { SITE_NAME } from '@/utilities/siteName'

interface Props {
  className?: string
}

export const Logo = ({ className }: Props) => {
  return <span className={clsx('font-heading text-xl font-bold tracking-tight', className)}>{SITE_NAME}</span>
}
