import Hero from '@/sections/Hero'
import Features from '@/sections/Features'
import FileyAI from '@/sections/FileyAI'
import LiveDemo from '@/sections/LiveDemo'
import Pricing from '@/sections/Pricing'
import Download from '@/sections/Download'
import RunLocally from '@/sections/RunLocally'
import Faq from '@/sections/Faq'
import FinalCta from '@/sections/FinalCta'

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <FileyAI />
      <LiveDemo />
      <Pricing />
      <Download />
      <RunLocally />
      <Faq />
      <FinalCta />
    </>
  )
}
