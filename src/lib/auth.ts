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
const DODO_FN = 'https://voyrjqgaypiylwskkwpr.functions.supabase.co/dodo'

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

async function post(path: string, body: unknown, token?: string) {
  let res: Response
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method: 'POST',
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
  if (!res.ok) throw new Error(friendly(data?.msg || data?.error_description || data?.message || ''))
  return data
}

/* ---------------- the session ---------------- */

export interface Session {
  access_token: string
  refresh_token: string
  /** Unix seconds. */
  expires_at: number
  email: string
}

const KEY = 'filey-site-session'
const CHANGED = 'filey-site-session-changed'

function read(): string | null {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function getSession(): Session | null {
  try { return JSON.parse(read() ?? 'null') as Session | null } catch { return null }
}

function store(s: Session | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s))
    else localStorage.removeItem(KEY)
  } catch { /* private window: signed in for this page only */ }
  window.dispatchEvent(new Event(CHANGED))
}

type TokenResponse = { access_token?: string; refresh_token?: string; expires_at?: number; expires_in?: number; user?: { email?: string } }

function save(data: TokenResponse): Session {
  if (!data.access_token || !data.refresh_token) throw new Error('Signed in, but no session came back. Try signing in again.')
  const s: Session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    email: data.user?.email ?? '',
  }
  store(s)
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
  const s = getSession()
  if (!s) return null
  if (s.expires_at - Date.now() / 1000 > 60) return s.access_token
  try {
    return save({ ...(await post('token?grant_type=refresh_token', { refresh_token: s.refresh_token })), user: { email: s.email } }).access_token
  } catch {
    store(null)
    return null
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
  return save(await post('verify', { type: 'signup', email: norm(email), token: token.trim() }))
}

export function resendSignupCode(email: string) {
  return post('resend', { type: 'signup', email: norm(email) })
}

export async function signIn(email: string, password: string) {
  return save(await post('token?grant_type=password', { email: norm(email), password }))
}

/** Sign in without a password — also the way back in for a forgotten one. */
export function sendLoginCode(email: string) {
  return post('otp', { email: norm(email), create_user: false })
}

export async function verifyLoginCode(email: string, token: string) {
  return save(await post('verify', { type: 'email', email: norm(email), token: token.trim() }))
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

/** Open Dodo's hosted checkout for the signed-in account. The purchase is
 *  attached to the account itself (user and workspace ids travel as checkout
 *  metadata), so the plan is already on it the next time they open Filey. */
export async function checkout(plan: PaidPlan): Promise<void> {
  const token = await freshToken()
  if (!token) throw new SignInRequired('Sign in to continue.')
  const res = await fetch(DODO_FN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: plan === 'pro' ? 'checkout_cloud' : 'checkout', from: 'web' }),
  }).catch((e) => { throw new Error(friendly(errorOf(e))) })
  const body = await res.json().catch(() => ({}))
  if (res.status === 401) {
    store(null)
    throw new SignInRequired('Your session ended. Sign in again to continue.')
  }
  if (!res.ok || !body?.url) throw new Error(body?.error || 'Checkout is unavailable right now. Please try again.')
  window.location.href = body.url
}
