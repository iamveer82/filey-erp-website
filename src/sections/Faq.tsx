import { ArrowUpRight, Plus } from 'lucide-react'
import { REPO_URL } from '@/lib/constants'

const questions = [
  ['Can I use Filey for free?', 'Yes. The published Free plan includes core tools and 5 cloud invoices each month. The next desktop update is being prepared with unlimited local invoicing on Free. Freedom removes the invoice limit and adds the licensed features shown above.'],
  ['What works without an internet connection?', 'Local mode stores business records on your device and supports core document and record workflows. Hosted AI, email, messaging and cloud synchronization need a connection. Local-mode availability depends on the installed version and license.'],
  ['What can Filey AI do?', 'Filey AI can look up records, draft invoices and purchase orders, and use supported tools in your workspace. Actions follow your account permissions and agent approval settings. Connect a supported AI provider; its usage limits and charges still apply.'],
  ['Can I send an invoice on WhatsApp?', 'Filey supports invoice messaging workflows. A chat link can prepare a message; attaching or sending a PDF depends on the desktop bridge, device sharing support or a configured business provider. Provider channels must be connected before automated delivery can work.'],
  ['Which countries does Filey support?', 'Filey supports multiple currencies. The next update adds explicit country and tax-profile settings for India, the UAE, Saudi Arabia, the EU and more. Currency and tax country are separate choices. Check local requirements before issuing tax documents.'],
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
