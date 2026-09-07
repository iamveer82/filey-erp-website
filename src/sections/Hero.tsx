'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowRight, Boxes, ChartNoAxesCombined, FileText, Sparkles, UsersRound } from 'lucide-react'
import type { HeroScene } from './HeroScene'
import type { HeroSceneMode } from './heroSceneMotion'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    title: 'Sales & invoices', icon: FileText,
    description: 'From your first quote to the final payment.',
    items: ['Quotations', 'Invoices & receipts', 'Payment tracking'],
  },
  {
    title: 'CRM', icon: UsersRound,
    description: 'Keep the next conversation close to the last.',
    items: ['Customer records', 'Deals & follow-ups', 'Activity history'],
  },
  {
    title: 'Inventory & purchasing', icon: Boxes,
    description: 'Stay close to what comes in and what goes out.',
    items: ['Products & stock', 'Purchase orders', 'Supplier records'],
  },
  {
    title: 'Reports', icon: ChartNoAxesCombined,
    description: 'Turn the work you record into a clearer picture.',
    items: ['Sales performance', 'Financial summaries', 'Inventory reports'],
  },
  {
    title: 'Filey AI', icon: Sparkles,
    description: 'A helping hand with the work already in front of you.',
    items: ['Find information', 'Draft documents', 'Take the next step'],
  },
]

export default function Hero() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const section = root.current
    if (!section) return
    const media = gsap.matchMedia()
    const enhance = (timeline: gsap.core.Timeline, mode: HeroSceneMode) => {
      const host = section.querySelector<HTMLElement>('.hero-story__canvas')!
      const logo = section.querySelector<HTMLImageElement>('.hero-story__logo img')!
      let scene: HeroScene | undefined
      let stopped = false
      let started = false
      let timer = 0
      let idle = 0
      const fallback = () => {
        section.classList.remove('hero-story--3d')
        host.dataset.state = 'fallback'
        scene?.dispose()
        scene = undefined
      }
      const load = async () => {
        try {
          const [module] = await Promise.all([import('./HeroScene'), logo.decode(), document.fonts.ready])
          if (stopped) return
          scene = module.createHeroScene(host, logo, features, mode, timeline.progress(), fallback)
          section.classList.add('hero-story--3d')
          host.dataset.state = 'ready'
        } catch { if (!stopped) fallback() }
      }
      timeline.eventCallback('onUpdate', () => scene?.update(timeline.progress()))
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || started) return
        started = true
        host.dataset.state = 'loading'
        // The logo and copy paint before the optional WebGL bundle is requested.
        timer = window.setTimeout(() => {
          if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => { void load() }, { timeout: 1000 })
          else void load()
        }, 250)
      })
      observer.observe(host)
      return () => {
        stopped = true
        clearTimeout(timer)
        if (idle) window.cancelIdleCallback(idle)
        observer.disconnect()
        timeline.eventCallback('onUpdate', null)
        scene?.dispose()
        section.classList.remove('hero-story--3d')
        delete host.dataset.state
      }
    }
    const context = gsap.context(() => {
      media.add('(min-width: 1100px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)', () => {
        const stage = section.querySelector<HTMLElement>('.hero-story__stage')!
        const sheets = gsap.utils.toArray<HTMLElement>('.hero-story__sheet', section)
        section.classList.add('hero-story--animated')

        // The documents begin inside Filey's folder, then reveal the work it holds.
        gsap.set(sheets, {
          x: (index) => (index - 2) * 6, y: 18, scale: 0.4,
          rotation: (index) => (index - 2) * 3, opacity: 0,
        })
        const spread = () => Math.min((stage.clientWidth - 380) / 2, 470)
        const lift = () => Math.min(stage.clientHeight * 0.39, 310)
        const positions = [
          { x: -1, y: -0.19, rotation: -11 },
          { x: -0.52, y: -0.85, rotation: -6 },
          { x: 0, y: -1, rotation: 0 },
          { x: 0.52, y: -0.85, rotation: 6 },
          { x: 1, y: -0.19, rotation: 11 },
        ]
        const timeline = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            // The persistent navigation occupies the first 72px of the viewport.
            trigger: section, start: 'top 72px',
            end: () => `+=${section.offsetHeight - stage.offsetHeight}`,
            scrub: 0.8, invalidateOnRefresh: true,
          },
        })
        timeline
          .to('.hero-story__intro', { autoAlpha: 0, y: -36, duration: 0.22 }, 0)
          .to('.hero-story__cue', { autoAlpha: 0, y: 8, duration: 0.12 }, 0)
          .to('.hero-story__logo', { y: () => Math.min(48, stage.clientHeight * 0.055), scale: 0.78, duration: 0.8 }, 0.08)
          .to(sheets, { opacity: 1, y: -115, scale: 0.56, stagger: 0.015, duration: 0.19 }, 0.08)
        sheets.forEach((sheet, index) => {
          const position = positions[index]
          timeline.to(sheet, {
            x: () => spread() * position.x,
            y: () => lift() * position.y,
            rotation: position.rotation, scale: 1, duration: 0.6,
          }, 0.31 + index * 0.022)
        })
        const stopScene = enhance(timeline, 'desktop')
        return () => { stopScene(); section.classList.remove('hero-story--animated') }
      })

      media.add('(max-width: 1099px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)', () => {
        const stage = section.querySelector<HTMLElement>('.hero-story__stage')!
        const sheets = gsap.utils.toArray<HTMLElement>('.hero-story__sheet', section)
        section.classList.add('hero-story--compact')
        gsap.set(sheets, { y: 18, x: 0, scale: 0.38, opacity: 0, rotation: 0, zIndex: (index) => index + 1 })
        const lift = () => stage.clientHeight * 0.37
        const timeline = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: section,
            start: () => `top ${getComputedStyle(stage).top}`,
            end: () => `+=${section.offsetHeight - stage.offsetHeight}`,
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        })
        timeline
          .to('.hero-story__intro', { autoAlpha: 0, y: -24, duration: 0.38 }, 0)
          .to('.hero-story__cue', { autoAlpha: 0, y: 8, duration: 0.18 }, 0)
          .to('.hero-story__logo', { y: () => Math.min(74, stage.clientHeight * 0.1), scale: 0.64, duration: 0.7 }, 0.12)
        // Each document gets its own readable pause; earlier sheets become a quiet stack.
        sheets.forEach((sheet, index) => {
          const start = 0.2 + index * 0.9
          if (index) timeline.to(sheets.slice(0, index), {
            y: () => -lift() - 12, scale: 0.94, duration: 0.35,
          }, start)
          timeline.set(sheet, { opacity: 1 }, start)
          timeline.to(sheet, {
            y: () => -lift(), x: index % 2 ? 3 : -3,
            scale: 1, rotation: index % 2 ? 1.2 : -1.2,
            duration: 0.45,
          }, start)
        })
        timeline.to(sheets[sheets.length - 1], { x: 0, rotation: 0, duration: 0.5 }, 4.25)
        const stopScene = enhance(timeline, 'compact')
        return () => { stopScene(); section.classList.remove('hero-story--compact') }
      })
    }, section)
    return () => { media.revert(); context.revert() }
  }, [])

  return (
    <section id="top" ref={root} className="hero-story" aria-labelledby="hero-title">
      <div className="hero-story__stage">
        <div className="hero-story__intro">
          <h1 id="hero-title">Your business. <br />Neatly filed.</h1>
          <p>Invoices, customers, inventory and everyday work. Together in a workspace that feels like yours.</p>
          <div className="hero-story__actions">
            <a className="hero-story__button hero-story__button--primary" href="#download">
              Get Filey <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
            </a>
            <a className="hero-story__button hero-story__button--secondary" href="#demo">Take a look</a>
          </div>
        </div>
        <div className="hero-story__visual">
          <div className="hero-story__canvas" aria-hidden="true" />
          <div className="hero-story__logo">
            <img src="/filey-mark.png" width="512" height="512" fetchPriority="high" alt="Filey, a smiling yellow folder" />
          </div>
          <p className="hero-story__cue"><ArrowDown size={14} strokeWidth={1.7} aria-hidden="true" />Scroll to explore</p>
          <ul className="hero-story__sheets" aria-label="What you can do with Filey">
            {features.map(({ title, icon: Icon, description, items }) => (
              <li key={title} className="hero-story__sheet">
                <div className="hero-story__sheet-top">
                  <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                  <h2>{title}</h2>
                </div>
                <p>{description}</p>
                <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
