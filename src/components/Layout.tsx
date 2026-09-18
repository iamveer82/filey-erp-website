import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // Native fragment navigation runs before React has mounted these sections.
    const hash = window.location.hash
    if (!hash) return
    // The deployed dodo function returns signed-in buyers to the app's old
    // route (#/settings?section=license|billing&checkout=…); forward them to
    // the page that means something here. Harmless once it returns /thanks.
    const legacy = hash.match(/^#\/settings\?section=(license|billing)&checkout=(success|cancel)/)
    if (legacy) {
      const status = hash.match(/[?&]status=([a-z_]+)/)?.[1]
      window.location.replace(
        legacy[2] === 'cancel'
          ? '/#pricing'
          : `/thanks?plan=${legacy[1] === 'license' ? 'freedom' : 'cloud'}${status ? `&status=${status}` : ''}`
      )
      return
    }
    let id: string
    try { id = decodeURIComponent(hash.slice(1)) } catch { return }
    let active = true
    let frame = 0
    void document.fonts.ready.then(() => {
      if (!active) return
      frame = requestAnimationFrame(() => {
        if (active && window.location.hash === hash)
          document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
      })
    })
    return () => { active = false; cancelAnimationFrame(frame) }
  }, [])
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.08 })
    const elements = root.current?.querySelectorAll('[data-reveal]') ?? []
    elements.forEach(element => { element.classList.add('reveal-ready'); observer.observe(element) })
    return () => { observer.disconnect(); elements.forEach(element => element.classList.remove('reveal-ready')) }
  }, [])
  return <div className="site-root" ref={root}>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navbar />
    <main id="main">{children}</main>
    <Footer />
  </div>
}
