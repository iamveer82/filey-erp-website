import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const exports = {}
runInNewContext(ts.transpileModule(readFileSync(new URL('../src/sections/demo/desktopFinanceData.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports })
const { invoiceTotals, invoiceSummary, newDraft, saveSampleDraft, chartRows, SAMPLE_INVOICES } = exports

test('invoice editor rounds line totals, discount and tax to currency precision', () => {
  assert.deepEqual({ ...invoiceTotals({ lines: [{ qty: 3, rate: 19.99 }, { qty: 2, rate: 5.5 }], discount: 10, tax: 5 }) }, {
    subtotal: 70.97, discount: 7.1, tax: 3.19, total: 67.06,
  })
})

test('saving and editing a draft updates one record without billing it or mutating the sample source', () => {
  const draft = { ...newDraft(SAMPLE_INVOICES), customer: 'Sample customer', lines: [{ id: 1, description: 'Shelving', qty: 2, rate: 850 }] }
  const before = invoiceSummary(SAMPLE_INVOICES)
  const saved = saveSampleDraft(draft, SAMPLE_INVOICES)
  assert.equal(saved.length, SAMPLE_INVOICES.length + 1)
  assert.equal(saved[0].status, 'draft')
  assert.equal(invoiceSummary(saved).billed, before.billed)
  assert.equal(invoiceSummary(saved).pending, before.pending)
  draft.lines[0].qty = 99
  assert.equal(saved[0].lines[0].qty, 2)
  const edited = saveSampleDraft({ ...saved[0], customer: 'Updated customer' }, saved)
  assert.equal(edited.length, saved.length)
  assert.equal(edited[0].customer, 'Updated customer')
  assert.equal(saved[0].customer, 'Sample customer')
  assert.equal(SAMPLE_INVOICES.length, 9)
  assert.throws(() => saveSampleDraft({ ...draft, number: SAMPLE_INVOICES[1].number }, saved), /already exists/)
  assert.throws(() => saveSampleDraft({ ...draft, date: '2026-02-31' }, []), /invoice date/)
  assert.throws(() => saveSampleDraft({ ...draft, lines: [{ ...draft.lines[0], qty: -1 }] }, []), /positive quantity/)
})

test('overview chart periods reconcile with posted invoices and receipts while excluding drafts', () => {
  const week = chartRows(7)
  assert.equal(week.length, 7)
  assert.equal(week[0].date, '2026-09-01')
  assert.equal(week[6].date, '2026-09-07')
  assert.equal(week[6].invoiced, 0)
  assert.equal(week.reduce((sum, row) => sum + row.invoiced, 0), 18427.5)
  assert.equal(week.reduce((sum, row) => sum + row.received, 0), 9087.5)
  assert.equal(week.reduce((sum, row) => sum + row.expenses, 0), 2330)
  const all = chartRows(90)
  const totals = invoiceSummary(SAMPLE_INVOICES)
  assert.equal(all.length, 90)
  assert.equal(all.reduce((sum, row) => sum + row.invoiced, 0), totals.billed)
  assert.equal(all.reduce((sum, row) => sum + row.received, 0), totals.paid)
  assert.equal(totals.billed, 42367.5)
  assert.equal(totals.pending, 14265)
  assert.equal(totals.overdue, 3780)
})
