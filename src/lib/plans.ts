// The plans on sale: Basic and Freedom. Pro is off sale for now; existing
// subscribers keep their plan and can still manage billing from Account.
// lib/auth.ts maps ultra onto the backend's freedom name (ultra = Freedom).

export type PaidPlan = 'ultra'

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
  note: 'One free trial per account and per computer. After 14 days your data stays viewable, printable and exportable; Freedom unlocks creating and editing again.',
}

export const PAID: Record<PaidPlan, Plan & { cta: string }> = {
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

