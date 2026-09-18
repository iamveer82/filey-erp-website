import { ArrowUpRight, Plus } from 'lucide-react'
import { REPO_URL } from '@/lib/constants'

const questions = [
  ['Can I use Filey for free?', 'Yes. Free gives you the whole ERP and CRM on your own device, with 5 invoices a month. Cloud is $5/month and adds sync across your devices with no invoice cap; Freedom is a one-time $100 licence for unlimited offline use on two machines. External services may have their own charges.'],
  ['What works without an internet connection?', 'Local mode is included on Free and keeps business records on your device for core document and record workflows. Hosted AI, email, messaging and cloud synchronization need a connection. Local and cloud workspaces keep separate records; you choose when to transfer data.'],
  ['What can Filey AI do?', 'Filey AI can look up records, draft invoices and purchase orders, and use supported tools in your workspace. CRM records can prepare contextual requests for your review. Actions follow your account permissions and agent approval settings. Use a supported local model or your own provider key; hosted usage limits and charges still apply.'],
  ['Can I send an invoice on WhatsApp?', 'Filey supports invoice messaging workflows. A chat link can prepare a message; attaching or sending a PDF depends on the desktop bridge, device sharing support or a configured business provider. Provider channels must be connected before automated delivery can work.'],
  ['Which countries does Filey support?', 'Filey includes country and tax-profile settings for India, the UAE, Saudi Arabia, EU member states and more. Document currency and tax country are separate choices. The accounting ledger remains AED, and country settings do not provide certified tax filing or complete statutory localization.'],
  ['Are the website previews my real business data?', 'No. The interactive preview uses sample records in this browser tab. It does not create invoices in your Filey account or connect to an AI service. Download the desktop app to use your own workspace.'],
  ['Which computers can run Filey?', 'Published downloads are available for Windows x64, Linux x64 and Apple Silicon macOS when those installers are present in the latest release. Use the download section for the actual available packages.'],
]

export default function Faq() {
  return <>
    <section id="faq" className="site-section faq-section"><div className="site-container faq-layout">
      <div className="section-heading" data-reveal><h2>A few good<br />questions.</h2><p>For everything else, the documentation and community are a click away.</p><a className="text-link" href={REPO_URL + '#readme'}>Read the documentation <ArrowUpRight size={16} /></a></div>
      <div className="faq-list" data-reveal>{questions.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={19} /></summary><p>{answer}</p></details>)}</div>
    </div></section>
    <section id="run-locally" className="source-section">
      <div className="site-container source-inner" data-reveal>
        <div>
          <p className="eyebrow">Open by design</p>
          <h2>Your business.<br />Your tools.</h2>
          <p>Download the app, explore the code, and make Filey part of your workday.</p>
        </div>
        <div className="source-actions">
          <a className="site-button" href="#download">Get Filey <ArrowUpRight size={17} aria-hidden="true" /></a>
          <a className="site-button site-button-secondary" href={REPO_URL}>Explore the source <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  </>
}
