import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

test('preview navigation connects Overview actions, invoices and section search', () => {
  const state = [], exports = {}
  let cursor = 0
  const jsx = (type, props) => ({ type, props })
  const source = ts.transpileModule(readFileSync(new URL('../src/sections/LiveDemo.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  runInNewContext(source, {
    exports,
    require: name => {
      if (name === 'react') return {
        lazy: () => 'lazy-preview', Suspense: 'suspense',
        useState: initial => {
          const index = cursor++
          if (!(index in state)) state[index] = initial
          return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value }]
        },
      }
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx }
      if (name === '@/lib/constants') return { REPO_URL: 'https://github.com/iamveer82/Filey-erp' }
      return { default: 'invoice-preview' }
    },
  })
  function find(node, predicate) {
    if (Array.isArray(node)) return node.map(child => find(child, predicate)).find(Boolean)
    if (node && typeof node === 'object') return predicate(node) ? node : find(node.props?.children, predicate)
  }
  const render = () => { cursor = 0; return exports.default() }
  let tree = render()
  assert.equal(find(tree, node => node.props?.className === 'fd-current-page').props.children, 'Overview')
  find(tree, node => typeof node.props?.onNewInvoice === 'function').props.onNewInvoice()
  tree = render()
  assert.equal(find(tree, node => node.props?.id === 'demo-control-invoicing').props['aria-pressed'], true)
  assert.equal(find(tree, node => node.type === 'invoice-preview').props.initialNew, true)

  find(tree, node => node.props?.id === 'demo-control-dashboard').props.onClick()
  tree = render()
  find(tree, node => typeof node.props?.onViewInvoices === 'function').props.onViewInvoices()
  tree = render()
  assert.equal(find(tree, node => node.type === 'invoice-preview').props.initialNew, false)

  find(tree, node => node.props?.['aria-label'] === 'Find a preview section').props.onChange({ target: { value: 'inventory' } })
  tree = render()
  find(tree, node => node.type === 'form').props.onSubmit({ preventDefault() {} })
  tree = render()
  assert.equal(find(tree, node => node.props?.id === 'demo-control-inventory').props['aria-pressed'], true)
  assert.equal(find(tree, node => node.props?.['aria-label'] === 'Find a preview section').props.value, '')
})
