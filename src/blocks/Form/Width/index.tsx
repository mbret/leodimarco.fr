import * as React from 'react'

import { cn } from '@/utilities/ui'

export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  return (
    <div className={cn('grid gap-2', className)} style={{ maxWidth: width ? `${width}%` : undefined }}>
      {children}
    </div>
  )
}
