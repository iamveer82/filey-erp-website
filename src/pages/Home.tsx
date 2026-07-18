import Hero from '@/sections/Hero'
import Ticker from '@/components/Ticker'
import ModuleExplorer from '@/sections/ModuleExplorer'
import WhyFiley from '@/sections/WhyFiley'
import DashboardPreview from '@/sections/DashboardPreview'
import LiveDemo from '@/sections/LiveDemo'
import Download from '@/sections/Download'
import RunLocally from '@/sections/RunLocally'
import OpenSource from '@/sections/OpenSource'
import Faq from '@/sections/Faq'
import FinalCta from '@/sections/FinalCta'

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <ModuleExplorer />
      <WhyFiley />
      <DashboardPreview />
      <LiveDemo />
      <Download />
      <RunLocally />
      <OpenSource />
      <Faq />
      <FinalCta />
    </>
  )
}
