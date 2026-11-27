import React from 'react'

// Two full stops, as in an ellipsis, stay as they are
export const endsWithFullStop = (text: string) => text.endsWith('.') && !text.endsWith('..')

export const FullStop: React.FC = () => <span className="text-full-stop">.</span>

export const colorFullStop = (title: string): React.ReactNode =>
  endsWithFullStop(title) ? (
    <>
      {title.slice(0, -1)}
      <FullStop />
    </>
  ) : (
    title
  )
