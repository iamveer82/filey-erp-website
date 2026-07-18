import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Download, Github, Menu, X } from 'lucide-react'
import { ScrollTrigger, getLenis, scrollToHash } from '@/lib/scroll'
import { RELEASE_TAG, REPO_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`

const NAV_LINKS = [
  { label: 'Features', hash: '#features' },
  { label: 'Dashboard', hash: '#dashboard' },
  { label: 'Demo', hash: '#demo' },
  { label: 'Download', hash: '#download' },
  { label: 'Run locally', hash: '#run-locally' },
  { label: 'Open Source', hash: '#open-source' },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  // Hide on scroll-down past 120px, reveal on scroll-up; blur bg after 40px
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 120 && !open)
    setScrolled(y > 40)
  })

  // Active-anchor highlighting
  useEffect(() => {
    const triggers = NAV_LINKS.map(({ hash }) => {
      const el = document.getElementById(hash.slice(1))
      if (!el) return null
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) setActive(hash)
        },
      })
    })
    const onTop = () => {
      if (window.scrollY < window.innerHeight * 0.4) setActive(null)
    }
    window.addEventListener('scroll', onTop, { passive: true })
    return () => {
      triggers.forEach((t) => t?.kill())
      window.removeEventListener('scroll', onTop)
    }
  }, [])

  // Lock body scroll while the mobile overlay is open
  useEffect(() => {
    const lenis = getLenis()
    if (open) {
      document.body.style.overflow = 'hidden'
      lenis?.stop()
    } else {
      document.body.style.overflow = ''
      lenis?.start()
    }
    return () => {
      document.body.style.overflow = ''
      lenis?.start()
    }
  }, [open])

  const handleAnchor = (e: MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault()
    if (open) {
      setOpen(false)
      window.setTimeout(() => scrollToHash(hash), 100)
    } else {
      scrollToHash(hash)
    }
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={hidden ? 'hidden' : 'visible'}
        variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
          scrolled || open
            ? 'border-b border-ink-700/60 bg-ink-950/80 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Left: logo + wordmark + version chip */}
          <a
            href="#top"
            onClick={(e) => handleAnchor(e, '#top')}
            className="flex items-center gap-2.5"
            aria-label="Filey ERP — back to top"
          >
            <img src={LOGO_SRC} alt="" className="h-7 w-7" width={28} height={28} />
            <span className="font-display text-[17px]">
              <span className="font-bold text-fg">Filey</span>{' '}
              <span className="font-medium text-mint-400">ERP</span>
            </span>
            <span className="hidden rounded-full border border-mint-400/40 px-2 py-0.5 font-mono text-[10px] text-mint-400 sm:inline-block">
              {RELEASE_TAG}
            </span>
          </a>

          {/* Center: anchor links */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV_LINKS.map(({ label, hash }) => {
              const isActive = active === hash
              return (
                <a
                  key={hash}
                  href={hash}
                  onClick={(e) => handleAnchor(e, hash)}
                  className={cn(
                    'relative flex items-center font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-200',
                    isActive ? 'text-fg' : 'text-muted-foreground hover:text-fg',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute -left-3 h-1 w-1 rounded-full bg-mint-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {label}
                </a>
              )
            })}
          </nav>

          {/* Right: GitHub + Download CTA + hamburger */}
          <div className="flex items-center gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              title="Star on GitHub"
              className="hidden h-10 w-10 items-center justify-center rounded-lg border border-ink-600 text-muted-foreground transition-colors duration-200 hover:border-mint-400/50 hover:text-fg sm:flex"
            >
              <Github className="h-[18px] w-[18px]" />
            </a>
            <a
              href="#download"
              onClick={(e) => handleAnchor(e, '#download')}
              className="hidden h-9 items-center gap-2 rounded-lg bg-mint-400 px-4 text-sm font-semibold text-ink-950 transition-all duration-200 hover:bg-mint-300 hover:shadow-[0_0_24px_rgba(52,211,153,0.25)] active:scale-[0.98] active:bg-mint-500 sm:flex"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-600 text-muted-foreground transition-colors duration-200 hover:text-fg lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-ink-950/[0.97] px-8 backdrop-blur-2xl lg:hidden"
          >
            <nav className="flex flex-col gap-6" aria-label="Mobile">
              {NAV_LINKS.map(({ label, hash }, i) => (
                <motion.a
                  key={hash}
                  href={hash}
                  onClick={(e) => handleAnchor(e, hash)}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-[32px] font-semibold tracking-tight text-fg"
                >
                  <span className="mr-3 font-mono text-sm text-mint-400">0{i + 1}</span>
                  {label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ delay: 0.32, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 flex items-center gap-4"
            >
              <a
                href="#download"
                onClick={(e) => handleAnchor(e, '#download')}
                className="flex h-11 items-center gap-2 rounded-lg bg-mint-400 px-6 text-[15px] font-semibold text-ink-950 transition-colors duration-200 hover:bg-mint-300"
              >
                <Download className="h-[18px] w-[18px]" />
                Download
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-ink-600 text-muted-foreground transition-colors duration-200 hover:text-fg"
              >
                <Github className="h-5 w-5" />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
