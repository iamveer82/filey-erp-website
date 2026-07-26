// Talks to the same Supabase project the desktop app uses. Two REST calls is
// less than pulling in @supabase/supabase-js for a marketing page.
// The publishable key is a client-side key by design; RLS guards the data.
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://voyrjqgaypiylwskkwpr.supabase.co'
const ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'sb_publishable_seG6PypmkIEN9FYKY9Of6w_UGNTGAgv'

/** Supabase rejects anything shorter (password_min_length). */
export const MIN_PASSWORD = 8
/** Matches smtp_max_frequency — resending sooner only returns an error. */
export const RESEND_COOLDOWN = 60

async function post(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.msg || data?.error_description || 'Something went wrong.')
  return data
}

export async function signUp(email: string, password: string) {
  const data = await post('signup', { email: email.trim().toLowerCase(), password })
  // Signing up an address that already exists returns a decoy user with an
  // empty identities array rather than an error, which would otherwise strand
  // the visitor on the code step waiting for mail that never comes.
  if (Array.isArray(data?.identities) && data.identities.length === 0)
    throw new Error('An account with this email already exists. Open the desktop app to sign in.')
  return data
}

export function verifyOtp(email: string, token: string) {
  return post('verify', { type: 'signup', email: email.trim().toLowerCase(), token: token.trim() })
}

export function resendOtp(email: string) {
  return post('resend', { type: 'signup', email: email.trim().toLowerCase() })
}
