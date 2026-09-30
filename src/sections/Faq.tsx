import { ArrowUpRight, Plus } from 'lucide-react'
import { REPO_URL } from '@/lib/constants'

const questions = [
  ['Can I use Filey for free?', 'Yes. Basic is free and gives you the whole ERP and CRM on your own device, with unlimited local invoices. The separate Basic web allowance is 5 invoices a month. Pro is $5/month and adds cloud sync on up to 20 devices with no invoice cap; Ultra is a one-time $100 licence with two offline activation slots. External services may have their own charges.'],
  ['What works without an internet connection?', 'Local mode is included on Basic and keeps business records on your device for core document and record workflows. Hosted AI, email, messaging and cloud synchronization need a connection. Local and cloud workspaces keep separate records; you choose when to transfer data.'],
  ['What can Filey AI do?', 'Filey AI can look up records, draft invoices and purchase orders, and use supported tools in your workspace. CRM records can prepare contextual requests for your review. Actions follow your account permissions and agent approval settings. Use a supported local model, your own provider key, or optional Coin for the paid OpenRouter models you choose. Provider availability and usage charges still apply.'],
  ['How does Coin work?', 'Coin is an optional Filey AI balance: 1 Coin = US$1. Choose a paid OpenRouter model and pay its reported usage cost from your balance. Top-ups support preset packs or a custom amount from US$5 to US$100, plus a US$0.50 service fee before any applicable tax. The fee does not add to your spendable balance. Coin is separate from your Basic, Pro or Ultra plan.'],
  ['How do I share a workspace with my team?', 'Use Settings → Teams to invite by email or share the six-character invitation code. Teammates request access, and an owner or admin approves them and chooses their role. A code alone does not grant access. Shared channels, private team conversations and supported attachments keep work together; your personal credentials and AI wallet are not shared by joining a team.'],
  ['Can I choose my own avatar?', 'Yes. In Settings → Account & Profile, choose a shape and colour independently, use a default avatar or upload your own photo. Your profile choice appears where Filey displays your avatar. Team members can also have their own profile images.'],
  ['Can I use two-step verification?', 'Set up an authenticator in the Filey app under Settings → Security. If your account requires two-step verification, open Filey and complete it there before accessing account data, billing or changing your password. This website directs you to that verification flow; it does not bypass it.'],
  ['Can I send an invoice on WhatsApp?', 'Filey supports invoice messaging workflows. A chat link can prepare a message; attaching or sending a PDF depends on the desktop bridge, device sharing support or a configured business provider. Provider channels must be connected before automated delivery can work.'],
  ['Which countries does Filey support?', 'Filey includes country and tax-profile settings for India, the UAE, Saudi Arabia, EU member states and more. Document currency and tax country are separate choices. The accounting ledger remains AED, and country settings do not provide certified tax filing or complete statutory localization.'],
  ['Are the website previews my real business data?', 'No. The interactive preview uses sample records in this browser tab. It does not create invoices in your Filey account or connect to an AI service. Open Filey on the web or download the desktop app to use your own workspace.'],
  ['Which computers can run Filey?', 'Published downloads are available for Windows x64, Linux x64, Apple Silicon Macs and Intel Macs when those installers are present in the latest release. Use the download section to choose the package for your computer.'],
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
