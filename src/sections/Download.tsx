import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { Command, Download as DownloadIcon, Monitor, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import TerminalCard from '@/components/TerminalCard'
import Reveal from '@/components/Reveal'
import { gsap, prefersReducedMotion } from '@/lib/scroll'
import { DOWNLOAD_URLS, RELEASE_TAG, REPO_URL } from '@/lib/constants'
import type { OS } from '@/lib/constants'
import { detectOS } from '@/lib/os'
import { cn } from '@/lib/utils'

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
      className="dl-primary btn-gradient inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#1A1206] transition-all duration-200 active:scale-[0.98]"
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
        'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-900 transition-colors duration-200 hover:border-amber-500 hover:bg-amber-50 active:scale-[0.98]',
        className,
      )}
    >
      {label} <span className="font-mono text-xs font-normal text-zinc-400">— {size}</span>
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
}

function OsCardShell({ os, recommended, icon, name, caption, children, className }: OsCardShellProps) {
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
        <span className="btn-gradient absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#1A1206]">
          Recommended for you
        </span>
      )}
      <div
        className={cn(
          'relative z-10 flex h-full flex-col rounded-xl border bg-white p-6 transition-colors duration-200',
          isRec
            ? 'border-amber-400 shadow-[0_8px_40px_-12px_rgba(245,158,11,0.25)]'
            : 'border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-amber-400',
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-amber-50 text-amber-600">
            {icon}
          </span>
          <div>
            <h3 className="font-display text-[22px] font-semibold leading-tight text-zinc-900">{name}</h3>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{caption}</p>
          </div>
          <span className="ml-auto self-start rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] text-amber-700">
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
        { boxShadow: '0 0 0px rgba(251,191,36,0)' },
        {
          boxShadow: '0 0 26px rgba(251,191,36,0.4)',
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
      className="relative border-t border-zinc-200 py-28 lg:py-40"
    >
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* centered header — SectionHeader rhythm, light */}
        <Reveal className="mx-auto mb-14 max-w-3xl text-center lg:mb-20" y={24} duration={0.9} start="top 80%">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber-600">
            {'// '}04 — download
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-zinc-900">
            Download Filey ERP.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-zinc-600">
            Free plan included — 20 invoices a month, offline. Upgrade to Pro inside the app
            whenever you&rsquo;re ready.
          </p>
        </Reveal>

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

          {/* macOS — build from source */}
          <OsCardShell
            os="macos"
            recommended={recommended}
            icon={<Command className="h-5 w-5" />}
            name="macOS"
            caption="Apple Silicon & Intel — build from source"
          >
            <p className="text-sm leading-relaxed text-zinc-600">
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
              className="group inline-flex items-center gap-1.5 self-start font-mono text-[13px] text-zinc-600 transition-colors duration-200 hover:text-amber-600"
            >
              Open the repo
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          </OsCardShell>
        </div>
      </div>
    </section>
  )
}
