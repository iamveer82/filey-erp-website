'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Boxes, ChartNoAxesCombined, FileText, Sparkles, UsersRound } from 'lucide-react'
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
        return () => { section.classList.remove('hero-story--animated') }
      })
    }, section)
    return () => { media.revert(); context.revert() }
  }, [])

  return (
    <section id="top" ref={root} className="hero-story" aria-labelledby="hero-title">
      <div className="hero-story__stage">
        <div className="hero-story__intro">
          <h1 id="hero-title">Everything your business needs. <br />In one place.</h1>
          <p>Bring your customers, invoices, inventory, and everyday work together. Meet Filey, your business’s new home.</p>
          <div className="hero-story__actions">
            <a className="hero-story__button hero-story__button--primary" href="#download">
              Get Filey <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
            </a>
            <a className="hero-story__button hero-story__button--secondary" href="#demo">Take a look</a>
          </div>
        </div>
        <div className="hero-story__visual">
          <div className="hero-story__logo">
            <img src="/filey-mark.png" width="512" height="512" fetchPriority="high" alt="Filey, a smiling yellow folder" />
          </div>
          <ul className="hero-story__sheets" aria-label="What you can do with Filey">
            {features.map(({ title, icon: Icon, description, items }) => (
              <li key={title} className="hero-story__sheet">
                <div className="hero-story__sheet-top">
                  <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h2>{title}</h2>
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
