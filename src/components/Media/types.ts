import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // covers the positioned ancestor that the caller sets
  focalPoint?: boolean // for a cropped image: keeps the focal point set in the admin in view
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager'
  priority?: boolean // loads eagerly, at high fetch priority
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  resource?: MediaType | string | number | null // for Payload media
  size?: string // the `sizes` attribute: the width the image renders at
  src?: StaticImageData // for static media
  videoClassName?: string
}
