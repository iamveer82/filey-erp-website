// The three plans, named as they are inside the app: Basic, Pro, Ultra.
// `sku` is what the payment backend calls a plan — "cloud" and "freedom"
// predate the names, and changing them would orphan every past purchase.

export type PaidPlan = 'pro' | 'ultra'

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

export const PAID: Record<PaidPlan, Plan & { sku: 'cloud' | 'freedom'; cta: string }> = {
  pro: {
    sku: 'cloud',
    cta: 'Get Pro',
    name: 'Pro',
    tagline: 'Work from anywhere',
    price: '$5',
    period: 'Per month, cancel any time',
    features: ['Sync every device you sign in on', 'Unlimited invoices — no monthly cap', 'Your team shares one workspace', 'Backed up off your machine', 'Conflicting edits held for review, never lost'],
    note: 'Your subscription follows your account, not your machine. Cancel any time from Billing inside the app.',
  },
  ultra: {
    sku: 'freedom',
    cta: 'Get Ultra',
    name: 'Ultra',
    tagline: 'Yours for the long run',
    price: '$100',
    period: 'One-time license',
    features: ['Unlimited invoicing, no monthly cap', 'Works fully offline — no network to check in with', 'Two device slots', 'Documents without the Filey watermark', 'App updates and priority support'],
    note: 'Add Pro for $5/month if you want sync as well.',
  },
}

