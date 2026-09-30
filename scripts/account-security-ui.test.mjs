import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = ts.transpileModule(readFileSync(new URL('../src/pages/Account.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
class SignInRequired extends Error {}
class MfaRequired extends Error {}

function mount() {
  const state = [], pendingEffects = [], exports = {}, requests = []
  let cursor = 0, session = { access_token: 'owner-token', email: 'owner@example.test', signed_in_at: 1 }
  const params = new URLSearchParams()
  const jsx = (type, props) => ({ type, props })
  runInNewContext(source, {
    exports,
    require: name => {
      if (name === 'react') return {
        useState: initial => {
          const index = cursor++
          if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial
          return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value }]
        },
        useEffect: (effect, deps) => {
          const index = cursor++, previous = state[index]
          if (previous && deps.every((value, i) => Object.is(value, previous.deps[i]))) return
          pendingEffects.push(() => { previous?.cleanup?.(); state[index] = { deps, cleanup: effect() } })
        },
      }
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx }
      if (name === 'react-router') return { Link: 'a', Navigate: 'navigate', useNavigate: () => () => {}, useSearchParams: () => [params] }
      if (name === '@/lib/auth') return {
        APP_URL: 'https://app.gofiley.com', SignInRequired, MfaRequired,
        useSession: () => session,
        getAccount: () => { const pending = deferred(); requests.push(pending); return pending.promise },
      }
      return {}
    },
  })
  return { requests, change: next => { session = next },
    render: () => { cursor = 0; return exports.default() },
    effects: () => { while (pendingEffects.length) pendingEffects.shift()() } }
}
function textOf(tree) {
  if (Array.isArray(tree)) return tree.map(textOf).join(' ')
  return tree && typeof tree === 'object' ? textOf(tree.props?.children) : typeof tree === 'string' ? tree : ''
}
function links(tree) {
  if (Array.isArray(tree)) return tree.flatMap(links)
  if (!tree || typeof tree !== 'object') return []
  return [...(tree.type === 'a' ? [tree.props] : []), ...links(tree.props?.children)]
}
const settle = async () => { await Promise.resolve(); await Promise.resolve() }
const account = { email: 'owner@example.test', company: 'Private Owner Company', name: 'Owner',
  workspace: 'Owner workspace', pro: null, ultra: null, grandfathered: false, web: true }

test('account changes immediately hide the previous account while the replacement loads', async () => {
  const page = mount()
  page.render(); page.effects()
  page.requests[0].resolve(account)
  await settle()
  assert.match(textOf(page.render()), /Private Owner Company/)

  page.change({ access_token: 'teammate-token', email: 'teammate@example.test', signed_in_at: 2 })
  const loading = page.render()
  assert.doesNotMatch(textOf(loading), /Private Owner Company|owner@example.test/)
  assert.match(textOf(loading), /Loading your account/)
  page.effects()
  page.requests[1].resolve({ ...account, company: 'Teammate Company', email: 'teammate@example.test' })
  await settle()
  assert.match(textOf(page.render()), /Teammate Company/)
})

test('MFA-required account loads expose the app verification link and no private account cards', async () => {
  const page = mount()
  page.render(); page.effects()
  page.requests[0].reject(new MfaRequired('Complete two-step verification in Filey to continue.'))
  await settle()
  const tree = page.render()
  assert.match(textOf(tree), /Complete two-step verification/)
  assert.doesNotMatch(textOf(tree), /Account information|Change password|Private Owner Company/)
  assert.ok(links(tree).some(link => link.href === 'https://app.gofiley.com' && /Open Filey to verify/.test(textOf(link.children))))
})
