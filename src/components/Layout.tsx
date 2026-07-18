import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { initSmoothScroll } from '@/lib/scroll'

/**
 * App shell — fixed Navbar + scroll progress + page slot + Footer.
 * Owns the fixed-nav offset (pt-16) per the Navbar positioning contract;
 * the full-bleed hero opts out inside the page with -mt-16.
 * Also the Lenis smooth-scroll root (disabled for reduced-motion / <768px).
 */
export default function Layout({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const cleanup = initSmoothScroll()
    return cleanup
  }, [])

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground">
      {/* thin scroll-progress bar, above the navbar */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-mint-400"
        style={{ scaleX }}
        aria-hidden
      />
      <Navbar />
      <main className="relative pt-16">{children}</main>
      <Footer />
    </div>
  )
}
