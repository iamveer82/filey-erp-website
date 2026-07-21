import type { MouseEvent, ReactNode } from 'react'
import { Github } from 'lucide-react'
import { scrollToHash } from '@/lib/scroll'
import { ISSUES_URL, RELEASES_URL, REPO_URL } from '@/lib/constants'
import Reveal from '@/components/Reveal'

function AnchorLink({ hash, children }: { hash: string; children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToHash(hash)
  }
  return (
    <a
      href={hash}
      onClick={onClick}
      className="text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
    >
      {children}
    </a>
  )
}

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
    >
      {children}
    </a>
  )
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-900">{title}</h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="relative bg-white">
      {/* hairline divider */}
      <div className="h-px w-full bg-zinc-200" aria-hidden />
      <Reveal y={24} className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                scrollToHash('#top')
              }}
              className="flex items-center gap-2.5"
            >
              <img
                src={`${import.meta.env.BASE_URL}filey-logo.png`}
                alt="Filey ERP logo"
                className="h-7 w-7 rounded-md"
                width={28}
                height={28}
              />
              <span className="font-display text-[17px]">
                <span className="font-bold text-zinc-900">Filey</span>{' '}
                <span className="font-medium text-amber-600">ERP</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-600">
              Offline-first desktop ERP &amp; CRM for small businesses — FTA-compliant invoicing,
              inventory and sales in one app. Free to start.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Source code on GitHub"
                title="Source code"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
              >
                <Github className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          <Column title="Product">
            <li><AnchorLink hash="#download">Download</AnchorLink></li>
            <li><AnchorLink hash="#demo">Live demo</AnchorLink></li>
            <li><AnchorLink hash="#pricing">Pricing</AnchorLink></li>
            <li><ExtLink href={RELEASES_URL}>All releases →</ExtLink></li>
          </Column>

          <Column title="Resources">
            <li><AnchorLink hash="#run-locally">Run locally</AnchorLink></li>
            <li><AnchorLink hash="#faq">FAQ</AnchorLink></li>
            <li><ExtLink href={REPO_URL}>Source code →</ExtLink></li>
            <li><ExtLink href={ISSUES_URL}>Issues →</ExtLink></li>
          </Column>

          <Column title="Modules">
            <li><AnchorLink hash="#features">Invoicing</AnchorLink></li>
            <li><AnchorLink hash="#features">CRM pipeline</AnchorLink></li>
            <li><AnchorLink hash="#features">Inventory</AnchorLink></li>
            <li><AnchorLink hash="#features">PDF toolkit</AnchorLink></li>
          </Column>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-zinc-200 pt-6">
          <p className="text-[13px] text-zinc-400">© 2026 Filey ERP. All rights reserved.</p>
        </div>
      </Reveal>
    </footer>
  )
}
