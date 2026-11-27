import type { Page } from '@/payload-types'

import { showsDotPattern } from '@/heros/LowImpact'

// A page that ends on a green band rests it on the footer, with no space under it. Otherwise the
// dots beside its title are mirrored at the bottom left: a band would cover them.
export const pageEnd = ({ hero, layout }: Pick<Page, 'hero' | 'layout'>) => {
  const last = layout?.at(-1)
  const band = last?.blockType === 'cta' && last.style === 'band'
  return { band, dots: !band && showsDotPattern(hero) }
}
