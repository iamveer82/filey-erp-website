import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = ts.transpileModule(
  readFileSync(new URL('../src/lib/auth.ts', import.meta.url), 'utf8').replaceAll('import.meta.env', '{}'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText

test('account uses the current workspace and the server cloud gate for team Ultra access', async () => {
  const exports = {}, calls = []
  const session = { access_token: 'test-session', expires_at: Date.now() / 1000 + 600, email: 'qa@filey.invalid' }
  runInNewContext(source, {
    exports, require: () => ({}), URL, Date, encodeURIComponent,
    localStorage: { getItem: () => JSON.stringify(session) },
    fetch: async (url) => {
      calls.push(url)
      const path = new URL(url).pathname
      const data = path.endsWith('/user') ? { id: 'user', email: session.email }
        : path.endsWith('/current_org') ? 'workspace-2'
        : path.endsWith('/filey_cloud_access') ? true
        : path.endsWith('/filey_claim_entitlements') ? { claimed: false }
        : path.endsWith('/organizations') ? [{ name: 'Current workspace', plan: 'free' }]
        : []
      return { ok: true, status: 200, json: async () => data }
    },
  })
  const account = await exports.getAccount()
  assert.equal(account.web, true)
  assert.equal(account.ultra, null)
  assert.equal(account.workspace, 'Current workspace')
  assert.match(calls.find(url => url.includes('/organizations?')), /id=eq.workspace-2/)
  assert.ok(calls.findIndex(url => url.endsWith('/filey_claim_entitlements')) < calls.findIndex(url => url.includes('/organizations?')))
})

test('a temporary refresh failure keeps the account session; a rejected refresh signs out', async () => {
  for (const status of [503, 429, 401]) {
    const exports = {}
    let removed = false
    runInNewContext(source, {
      exports, require: () => ({}), URL, Date, Event, encodeURIComponent,
      window: { dispatchEvent() {} },
      localStorage: {
        getItem: () => JSON.stringify({ access_token: 'expired', refresh_token: 'test-refresh', expires_at: 1 }),
        removeItem: () => { removed = true },
      },
      fetch: async () => ({ ok: false, status, json: async () => ({ message: 'Temporarily unavailable' }) }),
    })
    await assert.rejects(exports.getAccount())
    assert.equal(removed, status === 401)
  }
})
