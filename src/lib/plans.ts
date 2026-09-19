// The three plans, named as they are inside the app: Basic, Pro, Ultra.
// lib/auth.ts maps pro/ultra onto the backend's older cloud/freedom names.

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

export const PAID: Record<PaidPlan, Plan & { cta: string }> = {
  pro: {
    cta: 'Get Pro',
    name: 'Pro',
    tagline: 'Work from anywhere',
    price: '$5',
    period: 'Per month, cancel any time',
    features: ['Cloud sync on up to 5 registered devices', 'Filey on the web — any browser, any computer', 'Unlimited invoices — no monthly cap', 'Your team shares one workspace', 'Backed up off your machine', 'Conflicting edits held for review, never lost'],
    note: 'Your subscription follows your account, not your machine. Cancel any time from Billing inside the app.',
  },
  ultra: {
    cta: 'Get Ultra',
    name: 'Ultra',
    tagline: 'Yours for the long run',
    price: '$100',
    period: 'One-time license',
    features: ['Unlimited invoicing, no monthly cap', 'Works fully offline — no network to check in with', 'Two device slots', 'Filey on the web — any browser, any computer', 'Documents without the Filey watermark', 'App updates and priority support'],
    note: 'Pay once. Updates and Filey on the web included.',
  },
}

