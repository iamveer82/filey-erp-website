import type { MouseEvent, ReactNode } from 'react'
import { Github } from 'lucide-react'
import { scrollToHash } from '@/lib/scroll'
import {
  CONTRIBUTING_URL,
  ISSUES_URL,
  LICENSE_URL,
  RELEASE_TAG,
  RELEASES_URL,
  REPO_URL,
  ROADMAP_URL,
} from '@/lib/constants'
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
      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-fg"
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
      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-fg"
    >
      {children}
    </a>
  )
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-faint">{title}</h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="relative bg-ink-900">
      {/* gradient hairline divider */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, #1E2C40, transparent)' }}
        aria-hidden
      />
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
                src={`${import.meta.env.BASE_URL}logo.svg`}
                alt="Filey ERP logo"
                className="h-7 w-7"
                width={28}
                height={28}
              />
              <span className="font-display text-[17px]">
                <span className="font-bold text-fg">Filey</span>{' '}
                <span className="font-medium text-mint-400">ERP</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Free, open-source, offline-first ERP &amp; CRM for small businesses.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                title="Star on GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-600 text-muted-foreground transition-colors duration-200 hover:border-mint-400/50 hover:text-fg"
              >
                <Github className="h-[18px] w-[18px]" />
              </a>
              <span className="rounded-full border border-mint-400/40 px-2.5 py-1 font-mono text-[10px] text-mint-400">
                {RELEASE_TAG}
              </span>
            </div>
          </div>

          <Column title="Product">
            <li><AnchorLink hash="#download">Download</AnchorLink></li>
            <li><AnchorLink hash="#demo">Live demo</AnchorLink></li>
            <li><AnchorLink hash="#run-locally">Run locally</AnchorLink></li>
            <li><ExtLink href={RELEASES_URL}>All releases →</ExtLink></li>
          </Column>

          <Column title="Open source">
            <li><ExtLink href={REPO_URL}>GitHub repository →</ExtLink></li>
            <li><ExtLink href={LICENSE_URL}>License (AGPL-3.0) →</ExtLink></li>
            <li><ExtLink href={CONTRIBUTING_URL}>Contributing →</ExtLink></li>
            <li><ExtLink href={ROADMAP_URL}>Roadmap →</ExtLink></li>
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
        <div className="mt-14 flex flex-col gap-3 border-t border-ink-700/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-faint">
            © 2026 Filey ERP — free &amp; open source under the AGPL-3.0 license.
          </p>
          <p className="font-mono text-[11px] text-faint">
            Tauri · React · Tailwind — and zero tracking scripts
          </p>
        </div>
      </Reveal>
    </footer>
  )
}
