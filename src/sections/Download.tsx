import { memo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { Command, Download as DownloadIcon, Monitor, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import SectionHeader from '@/components/SectionHeader'
import TerminalCard from '@/components/TerminalCard'
import Reveal from '@/components/Reveal'
import { gsap, prefersReducedMotion } from '@/lib/scroll'
import {
  DOWNLOAD_URLS,
  RELEASES_URL,
  RELEASE_CODENAME,
  RELEASE_TAG,
  REPO_URL,
} from '@/lib/constants'
import type { OS } from '@/lib/constants'
import { detectOS } from '@/lib/os'
import { cn } from '@/lib/utils'

const MASCOT_SRC = `${import.meta.env.BASE_URL}mascot.png`

const RELEASE_BULLETS = [
  'Reports module rebuilt from the ground up',
  'CRM board gets the new kanban look',
  'Statement of account with 6 templates',
  '6 new receipt templates',
  'Mascot branding across the app',
]

/* ------------------------- mascot peek + sway loop ------------------------ */

const MascotPeek = memo(function MascotPeek() {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <div className="pointer-events-none absolute -top-[64px] right-3 z-0" aria-hidden>
        <img
          src={MASCOT_SRC}
          alt=""
          width={120}
          height={120}
          loading="lazy"
          className="h-[120px] w-[120px] rotate-6 drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
        />
      </div>
    )
  }
  return (
    <motion.div
      className="pointer-events-none absolute -top-[64px] right-3 z-0"
      aria-hidden
      initial={{ y: 24, rotate: 12, opacity: 0 }}
      whileInView={{ y: 0, rotate: 6, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: 'spring', stiffness: 140, damping: 15 }}
    >
      <motion.div
        animate={{ rotate: [-2, 2] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      >
        <img
          src={MASCOT_SRC}
          alt=""
          width={120}
          height={120}
          loading="lazy"
          className="h-[120px] w-[120px] drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
        />
      </motion.div>
    </motion.div>
  )
})

/* ------------------------------ button pieces ----------------------------- */

function toastDownload(size: string) {
  toast.success(`Download started — ${RELEASE_TAG} (${size}). Thanks for trying Filey!`)
}

function PrimaryDownloadLink({ href, label, size }: { href: string; label: string; size: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      onClick={() => toastDownload(size)}
      className="dl-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mint-400 px-4 text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-mint-300 active:scale-[0.98] active:bg-mint-500"
    >
      <DownloadIcon className="h-4 w-4" />
      {label} — {size}
    </a>
  )
}

function GhostDownloadLink({
  href,
  label,
  size,
  className,
}: {
  href: string
  label: string
  size: string
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      onClick={() => toastDownload(size)}
      className={cn(
        'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-ink-600 px-4 text-sm font-semibold text-fg transition-colors duration-200 hover:border-mint-400/50 hover:bg-mint-400/5 active:scale-[0.98]',
        className,
      )}
    >
      {label} — {size}
    </a>
  )
}

/* --------------------------------- cards ---------------------------------- */

interface OsCardShellProps {
  os: OS
  recommended: OS
  icon: ReactNode
  name: string
  caption: string
  children: ReactNode
  className?: string
  /** Decorative element rendered behind the card (e.g. the peeking mascot). */
  decor?: ReactNode
}

function OsCardShell({ os, recommended, icon, name, caption, children, className, decor }: OsCardShellProps) {
  const isRec = os === recommended
  return (
    <div
      className={cn(
        'dl-card relative',
        isRec ? 'dl-card--rec order-first lg:order-none' : 'dl-card--plain',
        className,
      )}
    >
      {isRec && (
        <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-mint-400 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-950">
          Recommended for you
        </span>
      )}
      {decor}
      <div
        className={cn(
          'relative z-10 flex h-full flex-col rounded-xl border bg-ink-850 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200',
          isRec
            ? 'border-mint-400/50 shadow-[0_0_50px_rgba(52,211,153,0.12),inset_0_1px_0_rgba(255,255,255,0.04)]'
            : 'border-ink-700/70 hover:border-ink-600',
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-ink-700 bg-ink-800 text-mint-400">
            {icon}
          </span>
          <div>
            <h3 className="font-display text-[22px] font-semibold leading-tight text-fg">{name}</h3>
            <p className="mt-0.5 font-mono text-[11px] text-faint">{caption}</p>
          </div>
          <span className="ml-auto self-start rounded-full border border-mint-400/40 px-2 py-0.5 font-mono text-[10px] text-mint-400">
            {RELEASE_TAG}
          </span>
        </div>
        <div className="mt-6 flex flex-1 flex-col justify-end gap-2.5">{children}</div>
      </div>
    </div>
  )
}

/* --------------------------------- section -------------------------------- */

export default function Download() {
  const [recommended] = useState<OS>(() => detectOS())
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // Cards: reveal-up stagger 0.12s — recommended card last with scale 0.96 → 1
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        scrollTrigger: { trigger: '.dl-grid', start: 'top 82%', once: true },
      })
      tl.fromTo(
        '.dl-card--plain',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 },
      ).fromTo(
        '.dl-card--rec',
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7 },
        '-=0.1',
      )
      // Primary buttons pulse-glow ×2 once the cards are in
      tl.fromTo(
        '.dl-primary',
        { boxShadow: '0 0 0px rgba(52,211,153,0)' },
        {
          boxShadow: '0 0 26px rgba(52,211,153,0.4)',
          duration: 0.45,
          ease: 'sine.inOut',
          repeat: 3,
          yoyo: true,
        },
        '-=0.2',
      )
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="download"
      ref={sectionRef}
      className="relative border-t border-ink-700/60 py-28 lg:py-40"
    >
      {/* soft mint glow behind the cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 h-[480px] w-[900px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(52,211,153,0.06), transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="05"
          label="download"
          title="Download Filey ERP."
          align="center"
          lead={
            <>
              {RELEASE_TAG} &ldquo;{RELEASE_CODENAME}&rdquo; · released July 18, 2026 · signed,
              auto-updating desktop builds · free forever under AGPL-3.0.
            </>
          }
        />

        {/* OS cards */}
        <div className="dl-grid mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Windows */}
          <OsCardShell
            os="windows"
            recommended={recommended}
            icon={<Monitor className="h-5 w-5" />}
            name="Windows"
            caption="Windows 10 / 11 · 64-bit"
          >
            <PrimaryDownloadLink href={DOWNLOAD_URLS.windowsExe} label="Installer (.exe)" size="18.9 MB" />
            <GhostDownloadLink href={DOWNLOAD_URLS.windowsMsi} label="MSI package" size="20.6 MB" />
          </OsCardShell>

          {/* Linux */}
          <OsCardShell
            os="linux"
            recommended={recommended}
            icon={<Terminal className="h-5 w-5" />}
            name="Linux"
            caption="AppImage · deb · rpm"
          >
            <PrimaryDownloadLink href={DOWNLOAD_URLS.linuxAppImage} label="AppImage" size="100 MB" />
            <div className="flex gap-2.5">
              <GhostDownloadLink href={DOWNLOAD_URLS.linuxDeb} label=".deb" size="23.3 MB" />
              <GhostDownloadLink href={DOWNLOAD_URLS.linuxRpm} label=".rpm" size="23.3 MB" />
            </div>
          </OsCardShell>

          {/* macOS — build from source, mascot peeking over the corner */}
          <OsCardShell
            os="macos"
            recommended={recommended}
            icon={<Command className="h-5 w-5" />}
            name="macOS"
            caption="Apple Silicon & Intel — build from source"
            className="mt-[64px] lg:mt-0"
            decor={<MascotPeek />}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              Signed macOS builds are on the roadmap. Today, build your own in ~5 minutes with the
              Tauri toolchain:
            </p>
            <TerminalCard
              title="zsh"
              lines={[
                { text: 'git clone https://github.com/iamveer82/Filey-erp.git' },
                { text: 'npm ci' },
                { text: 'npm run tauri build' },
              ]}
            />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 self-start font-mono text-[13px] text-muted-foreground transition-colors duration-200 hover:text-mint-400"
            >
              Open the repo
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          </OsCardShell>
        </div>

        {/* release notes strip */}
        <Reveal delay={0.2} className="mx-auto mt-12 max-w-6xl">
          <div className="rounded-xl border border-ink-700/70 bg-ink-850 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              <div>
                <h3 className="font-display text-xl font-semibold text-fg">
                  What&rsquo;s new in {RELEASE_TAG}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-mint-400/40 bg-mint-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-mint-400">
                    {RELEASE_CODENAME}
                  </span>
                  <span className="font-mono text-[11px] text-faint">2026-07-18</span>
                </div>
              </div>
              <div>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {RELEASE_BULLETS.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span aria-hidden className="mt-px text-mint-400">
                        ▸
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
                  <a
                    href={RELEASES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 font-mono text-[13px] text-muted-foreground transition-colors duration-200 hover:text-mint-400"
                  >
                    Full release notes
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                  <a
                    href={RELEASES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 font-mono text-[13px] text-muted-foreground transition-colors duration-200 hover:text-mint-400"
                  >
                    All releases
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
            <p className="mt-6 border-t border-ink-700/60 pt-4 font-mono text-[11px] text-faint">
              Builds are signed and auto-updating <span className="mx-2 text-ink-600">·</span> No account
              or internet required <span className="mx-2 text-ink-600">·</span> 100% free under AGPL-3.0
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
