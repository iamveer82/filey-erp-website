import Hero from '@/sections/Hero'
import ModuleExplorer from '@/sections/ModuleExplorer'
import DashboardPreview from '@/sections/DashboardPreview'
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
      <ModuleExplorer />
      <DashboardPreview />
      <LiveDemo />
      <Pricing />
      <Download />
      <RunLocally />
      <Faq />
      <FinalCta />
    </>
  )
}
