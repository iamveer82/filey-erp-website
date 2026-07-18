import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const SMALL_SCREEN = '(max-width: 767px)'

let lenis: Lenis | null = null
let rafCallback: ((time: number) => void) | null = null

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia(REDUCED_MOTION).matches
}

function smoothScrollWanted(): boolean {
  if (typeof window === 'undefined') return false
  return !window.matchMedia(REDUCED_MOTION).matches && !window.matchMedia(SMALL_SCREEN).matches
}

function createLenis(): void {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  rafCallback = (time: number) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(rafCallback)
  gsap.ticker.lagSmoothing(0)
  ScrollTrigger.refresh()
}

function destroyLenis(): void {
  if (rafCallback) {
    gsap.ticker.remove(rafCallback)
    rafCallback = null
  }
  lenis?.destroy()
  lenis = null
}

/**
 * Initialize Lenis smooth scrolling (once, at app root).
 * Disabled when prefers-reduced-motion or viewport < 768px — native scroll there.
 * Re-evaluates when the media queries change.
 */
export function initSmoothScroll(): () => void {
  if (typeof window === 'undefined') return () => {}

  const reduced = window.matchMedia(REDUCED_MOTION)
  const small = window.matchMedia(SMALL_SCREEN)

  const update = () => {
    if (smoothScrollWanted()) {
      if (!lenis) createLenis()
    } else if (lenis) {
      destroyLenis()
    }
  }

  update()
  reduced.addEventListener('change', update)
  small.addEventListener('change', update)

  return () => {
    reduced.removeEventListener('change', update)
    small.removeEventListener('change', update)
    destroyLenis()
  }
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Scroll to an in-page anchor, offset for the fixed 64px navbar. */
export function scrollToHash(hash: string): void {
  const target = hash.startsWith('#') ? hash : `#${hash}`
  const el = document.querySelector(target)
  if (!el) return
  if (lenis) {
    lenis.scrollTo(target, { offset: -64, duration: 1.2 })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY - 64
    window.scrollTo({ top, behavior: prefersReducedMotion() ? ('instant' as ScrollBehavior) : 'smooth' })
  }
}

export { gsap, ScrollTrigger }
