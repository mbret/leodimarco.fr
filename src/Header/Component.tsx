import Link from 'next/link'
import React from 'react'

import { Logo } from '@/components/Logo/Logo'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { HeaderNav } from './Nav'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  return (
    <header className="container relative z-20">
      {/* As much space above and below the menu as on its sides, like the container: 16px on
          phones, 32px from tablets */}
      <div className="py-4 md:py-8 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <HeaderNav data={headerData} />
      </div>
    </header>
  )
}
