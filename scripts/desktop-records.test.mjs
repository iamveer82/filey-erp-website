import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

function loadSample(name) {
  const source = readFileSync(new URL(`../src/sections/demo/${name}.ts`, import.meta.url), 'utf8')
  const exports = {}
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports })
  return exports
}

const { SAMPLE_CRM, DEMO_STAGES, moveSampleRecord } = loadSample('crmSample')
const { SAMPLE_PRODUCTS, applySampleStockEntry, sampleInventoryTotals } = loadSample('inventorySample')

test('CRM board changes update the app stage probability without changing reset data', () => {
  const before = JSON.stringify(SAMPLE_CRM)
  for (const [stage, probability] of [['qualification', 20], ['proposal', 45], ['negotiation', 70], ['won', 100], ['lost', 0]]) {
    assert.ok(DEMO_STAGES.includes(stage))
    const changed = moveSampleRecord(SAMPLE_CRM, 'deals', 9, stage)
    assert.equal(changed.deals.find(record => record.id === 9).stage, stage)
    assert.equal(changed.deals.find(record => record.id === 9).probability, probability)
    assert.equal(changed.companies, SAMPLE_CRM.companies)
  }
  assert.equal(JSON.stringify(SAMPLE_CRM), before)
  assert.equal(moveSampleRecord(SAMPLE_CRM, 'deals', 9, 'unexpected'), SAMPLE_CRM)
  assert.equal(moveSampleRecord(SAMPLE_CRM, 'tasks', 14, 'done').tasks.find(record => record.id === 14).status, 'done')
})

test('receiving and issuing stock update counts, value, alerts, and movement history', () => {
  const before = JSON.stringify(SAMPLE_PRODUCTS)
  const opening = sampleInventoryTotals(SAMPLE_PRODUCTS)
  const received = applySampleStockEntry(SAMPLE_PRODUCTS, 4, 'in', 20, 'PO-SAMPLE-001', 'Restock', '2026-09-07')
  const afterReceipt = sampleInventoryTotals(received.products)
  assert.equal(received.products.find(product => product.id === 4).quantity, 20)
  assert.equal(received.movement.quantity, 20)
  assert.equal(afterReceipt.out, opening.out - 1)
  assert.equal(afterReceipt.low, opening.low - 1)
  assert.equal(afterReceipt.value, opening.value + 20 * 32)
  const issued = applySampleStockEntry(received.products, 4, 'out', 20, 'INV-SAMPLE-001', 'Dispatch', '2026-09-07')
  assert.equal(issued.products.find(product => product.id === 4).quantity, 0)
  assert.equal(issued.products.find(product => product.id === 4).issued, 60)
  assert.equal(issued.movement.quantity, -20)
  assert.equal(sampleInventoryTotals(issued.products).value, opening.value)
  assert.equal(JSON.stringify(SAMPLE_PRODUCTS), before)
})

test('physical counts use a delta, permit a zero count, and leave other items unchanged', () => {
  const counted = applySampleStockEntry(SAMPLE_PRODUCTS, 1, 'adjust', 0, 'Stocktake', 'Count correction', '2026-09-07')
  assert.equal(counted.movement.quantity, -24)
  assert.equal(counted.products.find(product => product.id === 1).quantity, 0)
  assert.equal(counted.products.find(product => product.id === 1).issued, 36)
  assert.equal(counted.products.find(product => product.id === 2), SAMPLE_PRODUCTS.find(product => product.id === 2))
  assert.throws(() => applySampleStockEntry(SAMPLE_PRODUCTS, 1, 'adjust', 24, '', '', ''), /matches the current stock/)
})

test('invalid stock movements cannot mutate quantities or the reset fixture', () => {
  const before = JSON.stringify(SAMPLE_PRODUCTS)
  const cases = [
    [1, 'out', 25, 'INV-1', /Only 24/],
    [1, 'out', 1, '  ', /reference/],
    [1, 'in', 0, '', /greater than zero/],
    [1, 'adjust', -1, '', /zero or more/],
    [1, 'in', 1.5, '', /whole quantity/],
    [1, 'in', Infinity, '', /whole quantity/],
    [1, 'invalid', 1, '', /entry type/],
    [999, 'in', 1, '', /could not be found/],
  ]
  for (const [id, mode, quantity, reference, expected] of cases) {
    assert.throws(() => applySampleStockEntry(SAMPLE_PRODUCTS, id, mode, quantity, reference, '', ''), expected)
  }
  assert.equal(JSON.stringify(SAMPLE_PRODUCTS), before)
})
