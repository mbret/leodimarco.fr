import React from 'react'

// Two full stops, as in an ellipsis, stay as they are
export const endsWithFullStop = (text: string) => text.endsWith('.') && !text.endsWith('..')

// The full stop that ends a title, in the green of the studio wall: a point of pigment
export const FullStop: React.FC = () => <span className="text-point">.</span>

// A plain text title, with its closing full stop in the green
export const withFullStop = (title: string): React.ReactNode =>
  endsWithFullStop(title) ? (
    <>
      {title.slice(0, -1)}
      <FullStop />
    </>
  ) : (
    title
  )
