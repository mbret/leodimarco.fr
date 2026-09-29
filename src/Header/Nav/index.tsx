'use client'

import { MenuIcon } from 'lucide-react'
import React, { useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        {navItems.map(({ link }, i) => {
          return <CMSLink key={i} {...link} appearance="link" />
        })}
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="md:hidden" size="icon" variant="ghost">
            <MenuIcon />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          {/* Close the menu once a link is followed */}
          <nav className="flex flex-col gap-4 px-4" onClick={() => setOpen(false)}>
            {navItems.map(({ link }, i) => {
              return <CMSLink key={i} {...link} appearance="link" className="justify-start text-lg" />
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
