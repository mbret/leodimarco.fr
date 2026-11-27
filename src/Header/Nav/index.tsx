'use client'

import { MenuIcon, MessageCircleIcon } from 'lucide-react'
import React, { useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-3 md:gap-6">
      <nav className="hidden items-center gap-6 md:flex">
        {navItems.map(({ link }, i) => {
          return <CMSLink key={i} {...link} appearance="link" />
        })}
      </nav>

      {data?.enableButton && data.button && (
        <CMSLink {...data.button} appearance="default" label={null} size="sm">
          <MessageCircleIcon aria-hidden />
          <span className="max-lg:sr-only">{data.button.label}</span>
        </CMSLink>
      )}

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
              return (
                <CMSLink key={i} {...link} appearance="link" className="justify-start text-lg" />
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
