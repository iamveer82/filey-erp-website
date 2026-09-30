import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = ts.transpileModule(
  readFileSync(new URL('../src/lib/auth.ts', import.meta.url), 'utf8').replaceAll('import.meta.env', '{}'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText

const token = (id = 'owner', aal = 'aal1', extra = {}) => 'header.' +
  Buffer.from(JSON.stringify({ sub: id, role: 'authenticated', aal, ...extra })).toString('base64url') + '.signature'
const session = (id = 'owner', aal = 'aal1') => ({ access_token: token(id, aal), refresh_token: `refresh-${id}`,
  expires_at: Date.now() / 1000 + 600, email: `${id}@example.test`, signed_in_at: Date.now() })
const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data })
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }

function mount(initial = session(), route) {
  const exports = {}, calls = [], events = new Map(), location = { href: '' }
  let stored = JSON.stringify(initial)
  runInNewContext(source, {
    exports, require: () => ({}), URL, Date, Event, atob, encodeURIComponent,
    window: { location, addEventListener: (name, callback) => events.set(name, callback), dispatchEvent() {} },
    localStorage: {
      getItem: () => stored,
      setItem: (_key, value) => { stored = value },
      removeItem: () => { stored = null },
    },
    fetch: async (url, options = {}) => {
      const path = new URL(url).pathname
      calls.push({ path, options })
      const handled = await route?.(path, options)
      if (handled) return handled
      if (path.endsWith('/user')) {
        const claims = JSON.parse(Buffer.from(options.headers.Authorization.split('.')[1], 'base64url').toString())
        return response({ id: claims.sub, email: `${claims.sub}@example.test`, factors: [] })
      }
      if (path.endsWith('/token')) {
        const id = JSON.parse(options.body).email.split('@')[0]
        return response({ ...session(id), user: { email: `${id}@example.test` } })
      }
      if (path.endsWith('/logout')) return response({})
      if (path.endsWith('/dodo')) return response({ url: 'https://checkout.dodopayments.com/session' })
      if (path.endsWith('/current_org')) return response('workspace')
      if (path.endsWith('/filey_cloud_access')) return response(true)
      if (path.endsWith('/organizations')) return response([{ name: 'Owner workspace', plan: 'free' }])
      return response([])
    },
  })
  return { auth: exports, calls, location, stored: () => stored,
    switchInAnotherTab: value => { stored = JSON.stringify(value); events.get('storage')?.({ key: 'filey-site-session' }) } }
}

test('late refresh responses cannot restore a signed-out account or replace the new account', async () => {
  for (const change of ['signout', 'signin', 'other-tab']) {
    for (const status of [200, 401]) {
      const pending = deferred()
      const expired = { ...session(), expires_at: 1 }
      const app = mount(expired, (path, options) => path.endsWith('/token') && JSON.parse(options.body).refresh_token
        ? pending.promise : undefined)
      const loading = app.auth.getAccount()
      const rejected = assert.rejects(loading, error => error instanceof app.auth.SignInRequired)
      if (change === 'signout') await app.auth.signOut()
      else if (change === 'signin') await app.auth.signIn('teammate@example.test', 'test-password')
      else app.switchInAnotherTab(session('teammate'))
      const expected = app.stored()
      pending.resolve(response({ ...session('owner'), user: { email: 'owner@example.test' } }, status))
      await rejected
      assert.equal(app.stored(), expected)
      assert.equal(app.calls.some(call => call.path.endsWith('/organizations')), false)
    }
  }
})

test('an unfinished sign-in and password reauthentication stop when the account changes', async () => {
  for (const action of ['signin', 'password']) {
    const pending = deferred()
    const app = mount(session(), path => path.endsWith('/token') ? pending.promise : undefined)
    const operation = action === 'signin' ? app.auth.signIn('owner@example.test', 'test-password')
      : app.auth.changePassword('test-password', 'next-password')
    const rejected = assert.rejects(operation, error => error instanceof app.auth.SignInRequired)
    app.switchInAnotherTab(session('teammate'))
    const expected = app.stored()
    pending.resolve(response({ ...session(), user: { email: 'owner@example.test' } }))
    await rejected
    assert.equal(app.stored(), expected)
    assert.equal(app.calls.some(call => call.options.method === 'PUT'), false)
  }
})

test('verified MFA factors require app verification before account, billing or password actions', async () => {
  for (const action of ['getAccount', 'checkout', 'openBillingPortal', 'changePassword']) {
    const app = mount(session(), path => path.endsWith('/user')
      ? response({ id: 'owner', factors: [{ status: 'verified' }] }) : undefined)
    const args = action === 'checkout' ? ['pro'] : action === 'changePassword' ? ['', 'next-password'] : []
    await assert.rejects(app.auth[action](...args), error => error instanceof app.auth.MfaRequired)
    assert.deepEqual(app.calls.map(call => call.path), ['/auth/v1/user'])
    assert.equal(app.location.href, '')
  }
  const verified = mount(session('owner', 'aal2'), path => path.endsWith('/user')
    ? response({ id: 'owner', factors: [{ status: 'verified' }] }) : undefined)
  await verified.auth.checkout('pro')
  assert.equal(verified.location.href, 'https://checkout.dodopayments.com/session')
})

test('verified Auth identity must match token claims and malformed factor metadata fails closed', async () => {
  const cases = [
    [token('other'), { id: 'owner', factors: [] }],
    [token('owner', 'aal2', { role: 'anon' }), { id: 'owner', factors: [] }],
    [token(), { id: 'owner', factors: null }],
    ['not-a-jwt', { id: 'owner', factors: [] }],
  ]
  for (const [access_token, user] of cases) {
    const app = mount({ ...session(), access_token }, path => path.endsWith('/user') ? response(user) : undefined)
    await assert.rejects(app.auth.checkout('pro'), /Couldn't verify your sign-in/)
    assert.equal(app.calls.some(call => call.path.endsWith('/dodo')), false)
  }
})

test('checkout and portal allow only HTTPS destinations on the payment provider domain', async () => {
  const invalid = ['javascript:alert(1)', 'https://dodopayments.com.attacker.test/checkout',
    'https://dodopayments.com@attacker.test/', 'https://owner:secret@checkout.dodopayments.com/',
    'http://checkout.dodopayments.com/', 'https://checkout.dodopayments.com:444/',
    'https://checkout.dodopayments.com/\nnext']
  for (const action of ['checkout', 'openBillingPortal']) {
    for (const url of invalid) {
      const app = mount(session(), path => path.endsWith('/dodo') ? response({ url }) : undefined)
      await assert.rejects(app.auth[action]('pro'), /Payments are unavailable/)
      assert.equal(app.location.href, '')
    }
  }
  const app = mount()
  await app.auth.openBillingPortal()
  assert.equal(app.location.href, 'https://checkout.dodopayments.com/session')
})

test('a late payment response cannot redirect or sign out an account selected afterward', async () => {
  for (const status of [200, 401]) {
    const pending = deferred(), started = deferred()
    const app = mount(session(), path => {
      if (path.endsWith('/dodo')) { started.resolve(); return pending.promise }
    })
    const operation = app.auth.checkout('pro')
    const rejected = assert.rejects(operation, error => error instanceof app.auth.SignInRequired)
    await started.promise
    app.switchInAnotherTab(session('teammate'))
    const expected = app.stored()
    pending.resolve(response({ url: 'https://checkout.dodopayments.com/session' }, status))
    await rejected
    assert.equal(app.stored(), expected)
    assert.equal(app.location.href, '')
  }
})
