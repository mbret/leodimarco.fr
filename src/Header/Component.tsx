import Link from 'next/link'
import React from 'react'

import { Logo } from '@/components/Logo/Logo'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { HeaderNav } from './Nav'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  return (
    <header className="container relative z-20">
      <div className="py-8 flex justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <HeaderNav data={headerData} />
      </div>
    </header>
  )
}
