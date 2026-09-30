import { useMemo, useSyncExternalStore } from 'react'
import type { PaidPlan } from '@/lib/plans'

// Accounts on the website: the same Supabase project the desktop app uses, so
// one account works in both. Plain REST calls and a session in localStorage
// are all a marketing site needs — pulling in @supabase/supabase-js would
// triple what this file does.
// The publishable key is a client-side key by design; RLS guards the data.
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://voyrjqgaypiylwskkwpr.supabase.co'
const ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'sb_publishable_seG6PypmkIEN9FYKY9Of6w_UGNTGAgv'
const DODO_FN = SUPABASE_URL + '/functions/v1/dodo'

/** Supabase rejects anything shorter (password_min_length). */
export const MIN_PASSWORD = 8
/** Matches smtp_max_frequency — resending sooner only returns an error. */
export const RESEND_COOLDOWN = 60

/** Supabase answers in its own vocabulary; say what to do instead. */
function friendly(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "That email and password don't match. Try again, or sign in with a one-time code."
  if (/email not confirmed/i.test(message))
    return "This email isn't confirmed yet. Sign in with a one-time code to confirm it."
  if (/expired or is invalid|otp_expired|invalid otp/i.test(message))
    return 'That code is wrong or has expired. Check the latest email, or send a new one.'
  if (/signups not allowed for otp|otp_disabled|user not found/i.test(message))
    return 'No Filey account uses this email. Create one instead.'
  if (/already registered|already exists/i.test(message))
    return 'An account with this email already exists.'
  if (/rate limit|security purposes|too many/i.test(message))
    return 'Too many attempts. Wait a minute, then try again.'
  if (/failed to fetch|network/i.test(message))
    return "Can't reach Filey right now. Check your connection and try again."
  return message || 'Something went wrong.'
}

const errorOf = (e: unknown) => (e instanceof Error ? e.message : String(e))

async function post(path: string, body: unknown, token?: string, method = 'POST') {
  let res: Response
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method,
      headers: {
        apikey: ANON_KEY,
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw new Error(friendly(errorOf(e)))
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(friendly(data?.msg || data?.error_description || data?.message || '')), { status: res.status })
  return data
}

/* ---------------- the session ---------------- */

export interface Session {
  access_token: string
  refresh_token: string
  /** Unix seconds. */
  expires_at: number
  email: string
  /** When they last proved who they are (ms) — refreshes keep it. */
  signed_in_at?: number
}

const KEY = 'filey-site-session'
const CHANGED = 'filey-site-session-changed'
let authRevision = 0
if (typeof window !== 'undefined') window.addEventListener?.('storage', (event) => {
  if (event.key === KEY || event.key === null) authRevision++
})

function sessionGuard() {
  const revision = authRevision
  return () => {
    if (revision !== authRevision) throw new SignInRequired('Your account changed. Reopen this page to continue.')
  }
}

function read(): string | null {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function getSession(): Session | null {
  try { return JSON.parse(read() ?? 'null') as Session | null } catch { return null }
}

function store(s: Session | null, refresh = false) {
  if (!refresh) authRevision++
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s))
    else localStorage.removeItem(KEY)
  } catch { /* private window: signed in for this page only */ }
  window.dispatchEvent(new Event(CHANGED))
}

type TokenResponse = { access_token?: string; refresh_token?: string; expires_at?: number; expires_in?: number; user?: { email?: string } }

function save(data: TokenResponse, signedInAt = Date.now(), refresh = false): Session {
  if (!data.access_token || !data.refresh_token) throw new Error('Signed in, but no session came back. Try signing in again.')
  const s: Session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    email: data.user?.email ?? '',
    signed_in_at: signedInAt,
  }
  store(s, refresh)
  return s
}

const subscribe = (cb: () => void) => {
  window.addEventListener(CHANGED, cb)
  window.addEventListener('storage', cb) // another tab signed in or out
  return () => {
    window.removeEventListener(CHANGED, cb)
    window.removeEventListener('storage', cb)
  }
}

/** The signed-in session, re-rendering when it changes (in any tab). */
export function useSession(): Session | null {
  const raw = useSyncExternalStore(subscribe, read, () => null)
  return useMemo(() => {
    try { return JSON.parse(raw ?? 'null') as Session | null } catch { return null }
  }, [raw])
}

/** A usable access token, refreshed if it is about to expire; null when the
 *  session is gone for good (the caller sends the visitor to sign in). */
async function freshToken(): Promise<string | null> {
  const current = sessionGuard()
  const original = read()
  const s = getSession()
  if (!s) return null
  if (s.expires_at - Date.now() / 1000 > 60) return s.access_token
  try {
    const data = await post('token?grant_type=refresh_token', { refresh_token: s.refresh_token })
    current()
    if (read() !== original) throw new SignInRequired('Your account changed. Reopen this page to continue.')
    return save({ ...data, user: { email: s.email } }, s.signed_in_at ?? 0, true).access_token
  } catch (error) {
    current()
    if (read() !== original) throw new SignInRequired('Your account changed. Reopen this page to continue.')
    // A temporary network/server failure must not sign the customer out.
    const status = (error as { status?: number }).status
    if (status === 400 || status === 401 || status === 403) {
      store(null)
      return null
    }
    throw error
  }
}

/* ---------------- sign up, sign in, sign out ---------------- */

const norm = (email: string) => email.trim().toLowerCase()

export async function signUp(email: string, password: string) {
  const data = await post('signup', { email: norm(email), password })
  // Signing up an address that already exists returns a decoy user with an
  // empty identities array rather than an error, which would otherwise strand
  // the visitor on the code step waiting for mail that never comes.
  if (Array.isArray(data?.identities) && data.identities.length === 0)
    throw new Error('An account with this email already exists.')
  return data
}

/** The 6-digit code that confirms a new account. It signs them in, too. */
export async function verifySignupCode(email: string, token: string) {
  const current = sessionGuard()
  const data = await post('verify', { type: 'signup', email: norm(email), token: token.trim() })
  current()
  return save(data)
}

export function resendSignupCode(email: string) {
  return post('resend', { type: 'signup', email: norm(email) })
}

export async function signIn(email: string, password: string) {
  const current = sessionGuard()
  const data = await post('token?grant_type=password', { email: norm(email), password })
  current()
  return save(data)
}

/** Sign in without a password — also the way back in for a forgotten one. */
export function sendLoginCode(email: string) {
  return post('otp', { email: norm(email), create_user: false })
}

export async function verifyLoginCode(email: string, token: string) {
  const current = sessionGuard()
  const data = await post('verify', { type: 'email', email: norm(email), token: token.trim() })
  current()
  return save(data)
}

export async function signOut() {
  const s = getSession()
  store(null)
  // Best effort: the local session is already gone, which is what matters here.
  if (s) await post('logout', {}, s.access_token).catch(() => {})
}

/* ---------------- paying ---------------- */

/** Thrown when paying needs a sign-in first. */
export class SignInRequired extends Error {}
export class MfaRequired extends Error {
  constructor() { super('Complete two-step verification in Filey to continue.') }
}

/** Match the app's payment handoff: only HTTPS on Dodo's own domains. */
function paymentUrl(value: unknown): string {
  try {
    if (typeof value !== 'string' || Array.from(value).some(char => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) throw new Error()
    const url = new URL(value)
    if (url.protocol === 'https:' && !url.username && !url.password && !url.port &&
        /(^|\.)dodopayments\.com$/.test(url.hostname)) return url.href
  } catch { /* fail closed for an invalid provider destination */ }
  throw new Error('Payments are unavailable right now. Please try again shortly.')
}

/** Open Dodo's hosted checkout for the signed-in account. The purchase is
 *  attached to the account itself (user and workspace ids travel as checkout
 *  metadata), so the plan is already on it the next time they open Filey. */
export async function checkout(plan: PaidPlan): Promise<void> {
  const current = sessionGuard()
  const token = await freshToken()
  current()
  if (!token) throw new SignInRequired('Sign in to continue.')
  await verifiedUser(token, current)
  const res = await fetch(DODO_FN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: plan === 'pro' ? 'checkout_cloud' : 'checkout', from: 'web' }),
  }).catch((e) => { throw new Error(friendly(errorOf(e))) })
  const body = await res.json().catch(() => ({}))
  current()
  if (res.status === 401) {
    store(null)
    throw new SignInRequired('Your session ended. Sign in again to continue.')
  }
  if (body?.code === 'mfa_required') throw new MfaRequired()
  if (!res.ok || !body?.url) throw new Error('Checkout is unavailable right now. Please try again.')
  window.location.href = paymentUrl(body.url)
}

/** Filey on the web — the ERP itself, with the account's plan allowances. */
export const APP_URL = 'https://app.gofiley.com'

/** Dodo's customer portal: card, invoices, cancelling Pro. */
export async function openBillingPortal(): Promise<void> {
  const current = sessionGuard()
  const token = await freshToken()
  current()
  if (!token) throw new SignInRequired('Sign in to manage billing.')
  await verifiedUser(token, current)
  const res = await fetch(DODO_FN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'portal' }),
  }).catch((e) => { throw new Error(friendly(errorOf(e))) })
  const body = await res.json().catch(() => ({}))
  current()
  if (body?.code === 'mfa_required') throw new MfaRequired()
  if (!res.ok || !body?.url) throw new Error('Billing is unavailable right now. Please try again.')
  window.location.href = paymentUrl(body.url)
}

/* ---------------- the account page ---------------- */

/** Read rows the signed-in account may see. RLS scopes every table to the
 *  account's own profile, workspace and licence. */
async function rest<T>(path: string, token: string, current: () => void): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  })
  current()
  if (res.status === 401) {
    store(null)
    throw new SignInRequired('Your session ended. Sign in again.')
  }
  if (!res.ok) throw new Error("Couldn't load your account. Try again in a moment.")
  const data = await res.json()
  current()
  return data
}

export interface Account {
  email: string
  createdAt: string | null
  lastSignIn: string | null
  name: string
  company: string
  workspace: string
  /** Pro: a live subscription on the workspace. */
  pro: { status: string; renews: string | null } | null
  /** Ultra: the licence this account bought, and the devices using it. */
  ultra: { since: string; devices: { name: string; since: string; active: boolean }[] } | null
  /** Workspaces that had free cloud before it became Pro keep it. */
  grandfathered: boolean
  /** May open Filey on the web. */
  web: boolean
}

type AuthUser = { id: string; email?: string; created_at?: string; last_sign_in_at?: string; factors?: { status: string }[] }
type Org = { name?: string; plan?: string; plan_status?: string; current_period_end?: string; cloud_grandfathered?: boolean; owner_id?: string }

async function rpc(name: string, token: string, current: () => void): Promise<unknown> {
  const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, {
    method: 'POST', headers: { apikey: ANON_KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: '{}',
  })
  current()
  if (!res.ok) throw new Error("Couldn't load your workspace. Please try again.")
  const data = await res.json()
  current()
  return data
}

/** Auth verifies this exact token. An MFA-enabled account continues in the
 * app's existing authenticator flow; a decoded JWT alone is never trusted. */
async function verifiedUser(token: string, current: () => void): Promise<AuthUser> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } })
  current()
  if (res.status === 401) {
    store(null)
    throw new SignInRequired('Your session ended. Sign in again.')
  }
  if (!res.ok) throw new Error("Couldn't load your account. Try again.")
  const user = (await res.json()) as AuthUser
  current()
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error()
    const claims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (claims.sub !== user.id || claims.role !== 'authenticated' ||
        (user.factors !== undefined && !Array.isArray(user.factors))) throw new Error()
    if (claims.aal !== 'aal2' && (user.factors ?? []).some(factor => factor.status === 'verified')) throw new MfaRequired()
  } catch (error) {
    if (error instanceof MfaRequired) throw error
    throw new Error("Couldn't verify your sign-in. Please sign in again.")
  }
  return user
}

export async function getAccount(): Promise<Account> {
  const current = sessionGuard()
  const token = await freshToken()
  current()
  if (!token) throw new SignInRequired('Sign in to see your account.')
  const user = await verifiedUser(token, current)
  await rpc('filey_claim_entitlements', token, current)
  const [orgId, web] = await Promise.all([rpc('current_org', token, current), rpc('filey_cloud_access', token, current)])
  const [profiles, orgs, licences] = await Promise.all([
    rest<{ name?: string; company?: string }>(`profiles?select=name,company&id=eq.${user.id}`, token, current),
    rest<Org>('organizations?select=name,plan,plan_status,current_period_end,cloud_grandfathered,owner_id&id=eq.' + encodeURIComponent(String(orgId)) + '&limit=1', token, current),
    rest<{ id: string; created_at: string }>('licenses?select=id,created_at&status=eq.active&order=created_at&limit=1', token, current),
  ])
  const org = orgs[0] ?? {}
  const licence = licences[0]
  const devices = licence
    ? await rest<{ device_name?: string; activated_at: string; deactivated_at?: string | null }>(
        `license_devices?select=device_name,activated_at,deactivated_at&license_id=eq.${licence.id}&order=activated_at`,
        token, current,
      )
    : []
  // Same rule as resolveTier() in the app: any paid plan, live or in grace.
  const pro = org.plan && org.plan !== 'free' && ['active', 'trialing', 'past_due'].includes(org.plan_status ?? '')
    ? { status: org.plan_status ?? 'active', renews: org.current_period_end ?? null }
    : null
  const ultra = licence
    ? { since: licence.created_at, devices: devices.map((d) => ({ name: d.device_name || 'Device', since: d.activated_at, active: !d.deactivated_at })) }
    : null
  const grandfathered = !!org.cloud_grandfathered
  return {
    email: user.email ?? getSession()?.email ?? '',
    createdAt: user.created_at ?? null,
    lastSignIn: user.last_sign_in_at ?? null,
    name: profiles[0]?.name && profiles[0].name !== 'User' ? profiles[0].name : '',
    company: profiles[0]?.company ?? '',
    workspace: org.name ?? '',
    pro,
    ultra,
    grandfathered,
    web: web === true,
  }
}

const RECENT_MS = 10 * 60 * 1000

/** Signed in within the last few minutes — by password or by emailed code. */
export const signedInRecently = (s: Session | null) => !!s?.signed_in_at && Date.now() - s.signed_in_at < RECENT_MS

/** Change the password. A session left open on a shared computer must not be
 *  enough to take the account over, so it needs the current password — unless
 *  they proved themselves minutes ago, which is also the only way someone who
 *  forgot it (and signed in with a code) can set a new one. */
export async function changePassword(current: string, next: string): Promise<void> {
  const active = sessionGuard()
  const s = getSession()
  if (!s) throw new SignInRequired('Sign in to change your password.')
  if (next.length < MIN_PASSWORD) throw new Error(`The new password needs at least ${MIN_PASSWORD} characters.`)
  let token: string | null
  if (current) {
    try {
      // Reauthentication must not replace the active website account before
      // its MFA state and the original operation's scope have been checked.
      const data = await post('token?grant_type=password', { email: norm(s.email), password: current })
      active()
      token = data.access_token ?? null
    } catch (error) {
      active()
      if ((error as { status?: number }).status === 400) throw new Error("Your current password isn't right.")
      throw error
    }
  } else if (signedInRecently(s)) {
    token = await freshToken()
  } else {
    throw new Error('Enter your current password. Forgot it? Sign out, sign in with a code, then set a new one here.')
  }
  active()
  if (!token) throw new SignInRequired('Your session ended. Sign in again.')
  await verifiedUser(token, active)
  await post('user', { password: next }, token, 'PUT')
  active()
}
