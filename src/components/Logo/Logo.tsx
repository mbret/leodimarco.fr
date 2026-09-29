import clsx from 'clsx'
import React from 'react'

import { SITE_NAME } from '@/utilities/siteName'

interface Props {
  className?: string
}

export const Logo = ({ className }: Props) => {
  return <span className={clsx('text-xl font-semibold', className)}>{SITE_NAME}</span>
}
