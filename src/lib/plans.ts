// The three plans, named as they are inside the app: Basic, Pro, Freedom.
// lib/auth.ts maps pro/ultra onto the backend's cloud/freedom names (ultra = Freedom).

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
  tagline: 'Try everything first',
  price: 'Free',
  period: 'For 14 days, on your computer',
  features: ['Every app: invoicing, CRM, inventory, accounting', 'Word, Sheets and PDF built in', 'Works offline, your data stays on your computer', '$1 of Filey AI to try the agent', 'Keep everything when you get Freedom'],
  note: 'One free trial per account and per computer. After 14 days your data stays viewable, printable and exportable; Freedom or Pro unlocks creating and editing again.',
}

export const PAID: Record<PaidPlan, Plan & { cta: string }> = {
  pro: {
    cta: 'Get Pro',
    name: 'Pro',
    tagline: 'Work from anywhere',
    price: '36 AED',
    period: 'Per month, cancel any time',
    features: ['Cloud sync on up to 20 registered devices', 'Filey on the web — any browser, any computer', 'Unlimited invoices — no monthly cap', 'Team chats, channels and shared files', 'Backed up off your machine', 'Choose device or cloud changes when edits conflict'],
    note: 'Your subscription follows your account, not your machine. Cancel any time from Billing inside the app.',
  },
  ultra: {
    cta: 'Get Freedom',
    name: 'Freedom',
    tagline: 'Yours for life',
    price: '1499 AED',
    period: 'One-time payment',
    features: ['Filey on your computer for life', 'Every app, including Word, Sheets and PDF', 'Works fully offline, your data stays on your computer', 'On 2 computers, and move it to a new PC any time', 'Regular updates and support', 'No monthly bill'],
    note: 'Pay once and own it. Accounts made before 17 October 2026 already have Freedom, free.',
  },
}

