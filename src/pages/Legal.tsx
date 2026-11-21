import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { SUPPORT_EMAIL } from '@/lib/constants'

// Privacy, terms and data deletion. Meta's App Review links to all three for
// the Instagram DM feature, so keep the Instagram sections in step with
// supabase/2026-11-04-instagram-automations.sql in the app repo.

const UPDATED = '21 November 2026'
const Mail = () => <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>

function LegalPage({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return <article className="legal-page">
    <title>{`${title} · Filey ERP`}</title>
    <div className="site-container">
      <nav className="legal-tabs" aria-label="Legal pages">
        <NavLink to="/privacy">Privacy</NavLink>
        <NavLink to="/terms">Terms</NavLink>
        <NavLink to="/refunds">Refunds</NavLink>
        <NavLink to="/data-deletion">Data deletion</NavLink>
      </nav>
      <h1>{title}</h1>
      <p className="legal-updated">Last updated {UPDATED}</p>
      <p className="legal-lead">{lead}</p>
      {children}
    </div>
  </article>
}

export function Privacy() {
  return <LegalPage
    title="Privacy policy"
    lead="Filey is a desktop app. Your business records stay on your computer unless you turn on a feature that needs the internet. This page explains what reaches us, why, and how to remove it."
  >
    <h2>Who we are</h2>
    <p>Filey ERP ("Filey", "we") makes the Filey ERP app and runs gofiley.com. Questions about this policy or your data go to <Mail />.</p>

    <h2>What stays on your computer</h2>
    <p>Invoices, quotes, customers, suppliers, products, stock, accounts, letters, files and everything else you create in Filey are saved in a database on your own computer. We cannot see them, and they are not sent to us unless you use one of the online features below.</p>

    <h2>What we collect</h2>
    <ul>
      <li><strong>Your account.</strong> Your email address, your sign-in details and, if you give it, your name and business name.</li>
      <li><strong>Your computers.</strong> An identifier and name for each computer where you start a trial or activate Filey, so we can apply the one-trial-per-computer rule and the two-computer limit on Freedom.</li>
      <li><strong>Purchases.</strong> Which plan or Filey AI Coins you bought, the amount, the date and the payment status. Payments are taken by Dodo Payments; we never see your full card details.</li>
      <li><strong>Filey AI.</strong> When you use Filey AI with Coins, your request and the business details the assistant needs for that task pass through our server to the AI provider (currently DeepSeek) to produce the answer. We keep a usage record (model, number of tokens, cost), not the conversation. If you use your own AI key, requests go from your computer straight to the provider you chose, under their terms. When the assistant searches the web, the search words go to Exa.</li>
      <li><strong>Online features you turn on.</strong> Features such as cloud sync and backup, shared document links, sending email from Filey, and Filey Link (using Filey from your phone) store or pass through our servers the data they need to work.</li>
      <li><strong>Instagram.</strong> Only if you connect an Instagram account. See the next section.</li>
      <li><strong>Error reports.</strong> Online features may send a crash report with the error type and the place in Filey's code where it happened. These reports contain no business data and no personal details. Filey running in local mode sends none.</li>
      <li><strong>This website.</strong> gofiley.com is hosted by Vercel, which keeps standard server logs such as IP address and browser type. The site has no advertising or analytics trackers and uses your browser's storage only to keep you signed in.</li>
    </ul>
    <p>WhatsApp, Telegram and email accounts you link in Filey connect from your own computer. Messages you send or receive there go through those services under their own privacy policies.</p>

    <h2 id="instagram">Instagram DM automation</h2>
    <p>If you connect an Instagram professional (Business or Creator) account in Filey under Marketing → Instagram DMs, and approve access on Instagram, we receive and store:</p>
    <ul>
      <li>your Instagram account ID, username and account type;</li>
      <li>an access token that lets Filey reply on your behalf (it lasts 60 days and can be renewed);</li>
      <li>the automations you build: their names, keywords, messages, buttons and the post they run on.</li>
    </ul>
    <p>While an automation is on, Instagram sends Filey the comments, story replies, mentions and messages on your account. We check each one against your keywords and, when it matches, send the reply or direct message you wrote. We do <strong>not</strong> store the text of comments or messages. We keep an activity log of what each automation did: the person's Instagram-scoped ID and username, the comment or message ID, the time and the result. To avoid replying twice, we keep the IDs of handled comments and messages for 30 days.</p>
    <p>Links in automated messages go through a short Filey link so you can see how many times each was opened. We count the click and its time only; we do not record who clicked or their IP address.</p>
    <p>We use this data only to run your automations and show you their results. We do not sell it, use it for advertising, or use it to train AI models, and we share it only with Meta, to send the replies. Disconnecting the account in Filey deletes the token, its automations, links, click counts and activity log straight away. You can also remove Filey's access in Instagram under Settings → Apps and websites. Full steps are on the <a href="/data-deletion">data deletion</a> page.</p>

    <h2>How we use data</h2>
    <p>To provide and secure your account, run the features you use, apply your plan, process purchases, answer support requests and fix problems. We do not sell personal data and we do not show ads.</p>

    <h2>Who processes data for us</h2>
    <p>We use these providers, each only for the job listed:</p>
    <ul>
      <li><strong>Supabase:</strong> accounts, sign-in, our database and server functions.</li>
      <li><strong>Vercel:</strong> hosting gofiley.com.</li>
      <li><strong>Dodo Payments:</strong> checkout, receipts and subscriptions. Dodo is the merchant of record.</li>
      <li><strong>Resend:</strong> emails such as sign-in codes and documents you send.</li>
      <li><strong>DeepSeek:</strong> answers for Filey AI paid with Coins.</li>
      <li><strong>Exa:</strong> web search for Filey AI.</li>
      <li><strong>Meta:</strong> the Instagram feature, if you connect an account.</li>
      <li><strong>Sentry:</strong> the error reports described above.</li>
    </ul>
    <p>These providers may process data in countries other than yours. We may also disclose data when the law requires it.</p>

    <h2>How long we keep it</h2>
    <p>Account and purchase records are kept while your account exists. After deletion we keep only what tax and accounting law requires, such as payment records. Instagram data is kept until you disconnect the account, except the 30-day duplicate-check IDs described above.</p>

    <h2>Your choices and rights</h2>
    <p>You can ask to see, correct, export or delete your personal data, or object to how we use it. Email <Mail /> from your account's address and we will reply within 30 days. Your business records are already on your computer and can be exported from Filey at any time.</p>

    <h2>Security</h2>
    <p>Data travels over encrypted connections. Instagram tokens and other secrets are readable only by our server functions, never by the app or other users. No system is perfectly secure, so please tell us at <Mail /> if you find a problem.</p>

    <h2>Children</h2>
    <p>Filey is a business tool and is not meant for anyone under 16.</p>

    <h2>Changes</h2>
    <p>If we change this policy we will update the date above, and tell you in the app or by email before an important change applies to you.</p>
  </LegalPage>
}

export function Terms() {
  return <LegalPage
    title="Terms of service"
    lead="These terms cover your use of Filey ERP, your Filey account, paid plans, Filey AI and the online features. By using them you agree to these terms."
  >
    <h2>The software</h2>
    <p>Filey ERP is open-source software under the GNU AGPL-3.0 license, which governs the source code. These terms govern the services we run around it: accounts, plans, Filey AI, online features and this website.</p>

    <h2>Your account</h2>
    <p>Give accurate details, keep your sign-in secure and tell us if you think someone else has used your account. You are responsible for what happens under your account, including by people you invite to your workspace.</p>

    <h2>Plans and payment</h2>
    <ul>
      <li><strong>Basic</strong> is a free 14-day trial, one per account and one per computer. When it ends your data stays viewable, printable and exportable, but creating and editing need a paid plan.</li>
      <li><strong>Freedom</strong> is a one-time payment for Filey on up to two computers, with updates and support. You can move it to a new computer.</li>
      <li><strong>Pro</strong> subscriptions renew monthly until you cancel. You can cancel any time from your account page, and the plan stays active until the end of the period you paid for.</li>
      <li><strong>Filey AI Coins</strong> are prepaid credit for Filey AI. They are used up as you use the assistant, cannot be exchanged for cash and cannot be transferred.</li>
    </ul>
    <p>Prices are shown at checkout. Payments are processed by Dodo Payments as merchant of record, and their checkout terms also apply. Refunds and cancellations follow our <a href="/refunds">refund and cancellation policy</a>.</p>

    <h2>Your data</h2>
    <p>Your business data belongs to you. Records saved on your computer are your responsibility to back up. For data on our servers, we act only as described in the <a href="/privacy">privacy policy</a>.</p>

    <h2>Acceptable use</h2>
    <p>Do not use Filey to break the law, to send spam or unsolicited bulk messages, to harass anyone, or to get around plan limits or licensing. Automations you run on Instagram, WhatsApp or other platforms must follow those platforms' rules, including Meta's Platform Terms and Instagram's Community Guidelines. We may suspend features or accounts that are used this way.</p>

    <h2>Third-party services</h2>
    <p>Instagram, WhatsApp, Telegram, email providers, AI providers and payment providers are run by other companies under their own terms. They can change or withdraw features, and we are not responsible for their availability.</p>

    <h2>Filey AI</h2>
    <p>AI answers can be wrong. Check invoices, letters, figures and messages before you send or file them. You are responsible for what you send from Filey.</p>

    <h2>Tax and accounting</h2>
    <p>Filey helps you prepare invoices, VAT and GST figures and reports, but it is not tax, legal or accounting advice. You remain responsible for what you file with the authorities.</p>

    <h2>Changes and availability</h2>
    <p>We keep improving Filey and may change or remove features. Online features may sometimes be unavailable for maintenance or outages.</p>

    <h2>Ending your use</h2>
    <p>You can stop using Filey at any time and ask us to delete your account (see <a href="/data-deletion">data deletion</a>). We may suspend or close an account that seriously or repeatedly breaks these terms, and will tell you why unless the law prevents it.</p>

    <h2>Disclaimer and liability</h2>
    <p>Filey is provided "as is", without warranties beyond those the law requires. To the extent the law allows, we are not liable for indirect or consequential losses such as lost profits or lost data, and our total liability for any claim is limited to the amount you paid us in the 12 months before it. Nothing in these terms limits rights you have under consumer protection law.</p>

    <h2>Changes to these terms</h2>
    <p>If we change these terms we will update the date above, and tell you in the app or by email before an important change applies to you.</p>

    <h2>Contact</h2>
    <p><Mail /></p>
  </LegalPage>
}

export function Refunds() {
  return <LegalPage
    title="Refund and cancellation policy"
    lead="How to cancel a plan and when you can get your money back. Payments are taken by Dodo Payments, our merchant of record, and refunds go back through them."
  >
    <h2>How much is refunded</h2>
    <p>An approved refund returns <strong>90%</strong> of what you paid. The other 10% covers payment processing and handling costs.</p>

    <h2>Freedom</h2>
    <p>Freedom is a one-time purchase. If it is not right for you, ask for a refund within 7 days of buying it and you get 90% of the price back. The licence is cancelled when the refund is made, so Filey can no longer be activated with it.</p>

    <h2>Pro</h2>
    <p>You can cancel Pro at any time from your account page. It stays active until the end of the month you already paid for and is not charged again. We do not refund part of a month. If a renewal was charged after you meant to cancel, ask within 7 days of the charge and we will refund 90% of it.</p>

    <h2>Filey AI Coins</h2>
    <p>Coins you have not used can be refunded, at 90% of what you paid for them, if you ask within 7 days of buying them. Coins already spent on Filey AI cannot be refunded.</p>

    <h2>How to ask</h2>
    <p>Email <Mail /> from the address you bought with, and include your receipt or order number. We answer within 2 business days. Approved refunds go back to the card or account you paid with, usually within 5 to 10 business days, depending on your bank.</p>

    <h2>On your statement</h2>
    <p>Your card or bank statement shows the charge from Dodo Payments, starting with <strong>DODOPAY</strong>, not from Filey. Please contact us before disputing a charge with your bank; we can usually sort it out faster. A charge reversed through your bank cancels the licence or plan it paid for.</p>

    <h2>Your legal rights</h2>
    <p>Nothing here limits refund rights you have under the consumer law of your country.</p>
  </LegalPage>
}

export function DataDeletion() {
  return <LegalPage
    title="Data deletion"
    lead="How to remove the data Filey holds about you, whether you use Filey or only commented on a business that does."
  >
    <h2>Remove a connected Instagram account</h2>
    <ol>
      <li>In Filey, open <strong>Marketing → Instagram DMs</strong>.</li>
      <li>Press the <strong>×</strong> next to the account name and confirm <strong>Disconnect</strong>.</li>
    </ol>
    <p>This immediately deletes the account's access token, its automations, tracked links, click counts and activity log from our servers. The IDs of handled comments and messages, kept only to avoid double replies, are deleted within 30 days.</p>
    <p>You can also remove Filey's access in Instagram under <strong>Settings → Apps and websites</strong>. If you removed it there without disconnecting in Filey first, email <Mail /> and we will delete the remaining data within 30 days.</p>

    <h2>If a business replied to you through Filey</h2>
    <p>If you commented on or messaged a business that uses Filey and want the record of that reply removed, email <Mail /> with your Instagram username. We will delete it within 30 days and confirm by email.</p>

    <h2>Delete your Filey account</h2>
    <p>Email <Mail /> from your account's email address with the subject <strong>Delete my account</strong>. We delete your account and everything stored with it on our servers within 30 days, then confirm by email. We keep only the payment records that tax law requires.</p>

    <h2>Data on your computer</h2>
    <p>Your business records live on your own computer, so you control them. Export anything you want to keep, then uninstall Filey and delete its data folders. On Windows they are <code>%APPDATA%\com.iamvi.filey-erp</code> and <code>%LOCALAPPDATA%\com.iamvi.filey-erp</code>.</p>
  </LegalPage>
}
