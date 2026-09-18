// The three plans, named as they are inside the app: Basic, Pro, Ultra.
//
// Paid plans are sold through Dodo Payments' hosted checkout (static payment
// links on the live products), so a buy button goes straight to payment. No
// account is needed: the webhook parks the purchase against the email the
// buyer types at checkout, and the app collects it the first time they sign in
// with that address. Product ids: Filey-erp docs/dodo-payments.md.

export type PaidPlan = 'pro' | 'ultra'

const checkout = (product: string, plan: PaidPlan) =>
  `https://checkout.dodopayments.com/buy/${product}?quantity=1&redirect_url=${encodeURIComponent(`https://gofiley.com/thanks?plan=${plan}`)}`

export interface Plan {
  name: string
  tagline: string
  price: string
  period: string
  features: string[]
  note: string
}

export const BASIC: Plan = {
  name: 'Basic',
  tagline: 'For getting started',
  price: '$0',
  period: 'Free, on your device',
  features: ['The whole ERP and CRM on your device', '5 invoices each month', 'Inventory, accounting and PDF tools', 'Local backups you control', 'Local AI models or your own provider key', 'Community support'],
  note: 'Everything runs on this machine. Hosted AI, messaging and other external services may have separate provider costs.',
}

export const PAID: Record<PaidPlan, Plan & { checkout: string; cta: string }> = {
  pro: {
    checkout: checkout('pdt_0NnqAUoNM0pPYUuGHkiR5', 'pro'),
    cta: 'Get Pro',
    name: 'Pro',
    tagline: 'Work from anywhere',
    price: '$5',
    period: 'Per month, cancel any time',
    features: ['Sync every device you sign in on', 'Unlimited invoices — no monthly cap', 'Your team shares one workspace', 'Backed up off your machine', 'Conflicting edits held for review, never lost'],
    note: 'Your subscription follows your account, not your machine. Cancel any time from Billing inside the app.',
  },
  ultra: {
    checkout: checkout('pdt_0NnqAUlBQ5P8F8IERLZOF', 'ultra'),
    cta: 'Get Ultra',
    name: 'Ultra',
    tagline: 'Yours for the long run',
    price: '$100',
    period: 'One-time license',
    features: ['Unlimited invoicing, no monthly cap', 'Works fully offline — no network to check in with', 'Two device slots', 'Documents without the Filey watermark', 'App updates and priority support'],
    note: 'Add Pro for $5/month if you want sync as well.',
  },
}

