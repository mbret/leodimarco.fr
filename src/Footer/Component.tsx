import { getCachedGlobal } from '@/utilities/getGlobals'
import { FacebookIcon, InstagramIcon, YoutubeIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { formatPhone } from '@/utilities/formatPhone'

import { FooterDots } from './FooterDots'

const socialIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
}

export async function Footer() {
  const [footerData, studio] = await Promise.all([
    getCachedGlobal('footer', 1)(),
    getCachedGlobal('studio')(),
  ])

  const navItems = footerData?.navItems || []
  const socials = studio?.socials || []
  const cityLine = [studio?.postalCode, studio?.city].filter(Boolean).join(' ')

  return (
    <footer className="mt-auto border-t border-border bg-card text-card-foreground">
      <div className="container py-4">
        <FooterDots />
      </div>
      <div className="container pb-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <div className="flex flex-col gap-4">
          <Link className="flex items-center" href="/">
            <Logo />
          </Link>
          {(studio?.street || cityLine || studio?.phone) && (
            <address className="text-sm text-muted-foreground not-italic">
              {studio?.street && <div>{studio.street}</div>}
              {cityLine && <div>{cityLine}</div>}
              {studio?.phone && (
                <a className="hover:text-foreground" href={`tel:${studio.phone}`}>
                  {formatPhone(studio.phone)}
                </a>
              )}
            </address>
          )}
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink key={i} {...link} />
            })}
          </nav>
          {socials.length > 0 && (
            <ul className="flex gap-4">
              {socials.map(({ id, platform, url }) => {
                const Icon = socialIcons[platform]
                return (
                  <li key={id}>
                    <a
                      className="text-muted-foreground hover:text-foreground"
                      href={url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon className="size-5" />
                      <span className="sr-only">{platform}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
