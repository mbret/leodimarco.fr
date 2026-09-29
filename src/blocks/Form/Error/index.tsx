'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <div className="text-destructive text-sm">
      {(errors[name]?.message as string) || 'Ce champ est obligatoire'}
    </div>
  )
}
