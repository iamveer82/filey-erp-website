import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = ts.transpileModule(readFileSync(new URL('../src/components/Layout.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText

function mount(hash) {
  const effects = [], calls = [], frames = new Map(), exports = {}
  let ready
  const fonts = new Promise(resolve => { ready = resolve })
  const location = { hash }
  runInNewContext(source, {
    exports,
    require: name => name === 'react'
      ? { useEffect: callback => effects.push(callback), useRef: () => ({ current: null }) }
      : name === 'react/jsx-runtime' ? { jsx: () => null, jsxs: () => null } : {},
    window: { location },
    document: { fonts: { ready: fonts }, getElementById: id => ({ scrollIntoView: options => calls.push({ id, ...options }) }) },
    matchMedia: () => ({ matches: true }),
    requestAnimationFrame: callback => { frames.set(1, callback); return 1 },
    cancelAnimationFrame: id => frames.delete(id),
  })
  exports.default({ children: null })
  const cleanup = effects.map(effect => effect()).filter(Boolean)
  return { location, calls, ready, cleanup: () => cleanup.forEach(stop => stop()), flush: async () => {
    await fonts
    for (const callback of frames.values()) callback()
    frames.clear()
  } }
}

test('restores a direct or signup-return fragment after home mounts and fonts settle', async () => {
  const page = mount('#download')
  assert.equal(page.calls.length, 0)
  page.ready()
  await page.flush()
  assert.equal(page.calls.length, 1)
  assert.equal(page.calls[0].id, 'download')
  assert.equal(page.calls[0].behavior, 'instant')
  assert.equal(page.calls[0].block, 'start')
})

test('does not pull the user back after another navigation or unmount', async () => {
  for (const action of ['navigate', 'unmount']) {
    const page = mount('#download')
    if (action === 'navigate') page.location.hash = '#pricing'
    else page.cleanup()
    page.ready()
    await page.flush()
    assert.equal(page.calls.length, 0)
  }
})

test('handles encoded targets and ignores empty or malformed fragments', async () => {
  for (const hash of ['#down%6coad', '', '#%E0%A4%A']) {
    const page = mount(hash)
    page.ready()
    await page.flush()
    assert.equal(page.calls.length, hash === '#down%6coad' ? 1 : 0)
    if (page.calls.length) assert.equal(page.calls[0].id, 'download')
  }
})
