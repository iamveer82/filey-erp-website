import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = ts.transpileModule(readFileSync(new URL('../src/pages/SignUp.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText

function mount() {
  const state = [], calls = [], exports = {}
  let cursor = 0, finishSignup, finishVerify
  const signupPending = new Promise(resolve => { finishSignup = resolve })
  const verifyPending = new Promise(resolve => { finishVerify = resolve })
  const jsx = (type, props) => ({ type, props })
  const backend = {
    MIN_PASSWORD: 8, RESEND_COOLDOWN: 60,
    signUp: (...args) => { calls.push(['signup', ...args]); return signupPending },
    verifyOtp: (...args) => { calls.push(['verify', ...args]); return verifyPending },
    resendOtp: (...args) => { calls.push(['resend', ...args]); return Promise.resolve() },
  }
  runInNewContext(source, {
    exports,
    require: name => {
      if (name === 'react') return {
        useEffect: () => {},
        useState: initial => {
          const index = cursor++
          if (!(index in state)) state[index] = initial
          return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value }]
        },
      }
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' }
      if (name === '@/lib/signup') return backend
      if (name === '@/lib/constants') return { REPO_URL: 'https://github.com/iamveer82/Filey-erp' }
      if (name === 'react-router') return { Link: 'a' }
      if (name === '@/components/ui/input-otp') return { InputOTP: 'otp', InputOTPGroup: 'otp-group', InputOTPSlot: 'otp-slot' }
      return {}
    },
  })
  return { calls, finishSignup, finishVerify, render: () => { cursor = 0; return exports.default() } }
}

function find(tree, predicate) {
  if (Array.isArray(tree)) {
    for (const child of tree) { const match = find(child, predicate); if (match) return match }
  } else if (tree && typeof tree === 'object') {
    if (predicate(tree)) return tree
    return find(tree.props?.children, predicate)
  }
}

test('keeps account identity locked while signup and verification are pending', async () => {
  const page = mount()
  let tree = page.render()
  for (const [id, value] of [['email', 'owner@example.test'], ['password', 'sample-password'], ['confirm', 'sample-password']]) {
    find(tree, node => node.type === 'input' && node.props.id === id).props.onChange({ target: { value } })
  }
  const submit = () => find(tree, node => node.type === 'form').props.onSubmit({ preventDefault() {} })
  tree = page.render()
  const registration = submit()
  tree = page.render()
  assert.equal(find(tree, node => node.type === 'fieldset').props.disabled, true)
  assert.equal(find(tree, node => node.type === 'input' && node.props.id === 'email').props.value, 'owner@example.test')
  await submit()
  assert.deepEqual(page.calls, [['signup', 'owner@example.test', 'sample-password']])

  page.finishSignup()
  await registration
  tree = page.render()
  assert.equal(find(tree, node => node.type === 'strong').props.children, 'owner@example.test')
  find(tree, node => node.type === 'otp').props.onChange('123456')
  tree = page.render()
  const verification = submit()
  tree = page.render()
  assert.equal(find(tree, node => node.type === 'otp').props.disabled, true)
  assert.equal(find(tree, node => node.props?.className === 'signup-back').props.disabled, true)
  await submit()
  assert.deepEqual(page.calls, [
    ['signup', 'owner@example.test', 'sample-password'],
    ['verify', 'owner@example.test', '123456'],
  ])
  page.finishVerify()
  await verification
  tree = page.render()
  assert.equal(find(tree, node => node.type === 'strong').props.children, 'owner@example.test')
})
