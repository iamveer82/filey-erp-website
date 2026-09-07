import { useId, useMemo, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Clock, Download, Plus } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartRows, DEMO_CUSTOMERS, displayDate, invoiceSummary, invoiceTotals, money, SAMPLE_EXPENSES, SAMPLE_INVOICES, shortMoney } from './desktopFinanceData'
import './DesktopFinance.css'

const tooltipStyle = { background: 'var(--fd-card)', color: 'var(--fd-text)', border: '1px solid var(--fd-line)', borderRadius: 10, fontSize: 12 }
const axis = { tick: { fill: 'var(--fd-muted)', fontSize: 10 }, tickLine: false, axisLine: false }
const colors = ['var(--fd-accent)', 'var(--fd-text)', '#b7bac3']

export default function DemoDashboard({ onNewInvoice, onViewInvoices }: { onNewInvoice?: () => void; onViewInvoices?: () => void }) {
  const [range, setRange] = useState(7)
  const gradient = useId().replace(/:/g, '')
  const trend = useMemo(() => chartRows(range), [range])
  const summary = invoiceSummary(SAMPLE_INVOICES)
  const segments = Array.from(new Set(DEMO_CUSTOMERS.map(customer => customer.segment))).map(name => ({ name, value: DEMO_CUSTOMERS.filter(customer => customer.segment === name).length }))
  const metrics = [
    { label: 'Invoiced sales', value: money(summary.billed), hint: summary.postedCount + ' invoices' },
    { label: 'Orders', value: String(summary.postedCount), hint: SAMPLE_INVOICES.filter(invoice => invoice.status === 'sent').length + ' pending' },
    { label: 'Customers', value: String(DEMO_CUSTOMERS.length), hint: 'Directory count' },
    { label: 'Outstanding', value: money(summary.pending), hint: summary.overdueCount + ' overdue' },
  ]
  function exportOverview() {
    const csv = ['Metric,Value,Detail', ...metrics.map(metric => [metric.label, metric.value, metric.hint].map(value => '"' + value.replace(/"/g, '""') + '"').join(','))].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'filey-sample-overview.csv'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <div className="fd-finance fd-overview">
    <header className="fd-page-heading">
      <div><h3>Welcome back, Alex</h3><p>A view of your business, using the sample workspace.</p></div>
      <div className="fd-fin-actions">
        <button className="fd-button" onClick={exportOverview}><Download size={14} /> Export</button>
        {onNewInvoice && <button className="fd-button fd-button-primary" onClick={onNewInvoice}><Plus size={14} /> New invoice</button>}
      </div>
    </header>

    <div className="fd-fin-metrics">
      {metrics.map(metric => <div className="fd-fin-metric" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.hint}</small></div>)}
    </div>

    <div className="fd-overview-heading">
      <div><h4>Business overview</h4><p>Amounts in AED · customer segments show the full directory</p></div>
      <div className="fd-fin-period" role="group" aria-label="Overview chart period">{[7, 30, 90].map(days => <button key={days} aria-pressed={range === days} onClick={() => setRange(days)}>{days}d</button>)}</div>
    </div>

    <div className="fd-overview-joined">
      <section className="fd-chart-panel fd-chart-wide" aria-label="Invoiced versus confirmed receipts">
        <h4>Invoiced vs confirmed receipts</h4>
        <p>Last {range} days · invoices by issue date, receipts by payment date</p>
        <div className="fd-chart">
          <ResponsiveContainer width="100%" height={230} minWidth={0} initialDimension={{ width: 400, height: 230 }}>
            <BarChart data={trend} margin={{ top: 14, right: 8, left: -8, bottom: 0 }} accessibilityLayer>
              <defs><linearGradient id={gradient + '-billed'} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--fd-accent)" stopOpacity={0.9} /><stop offset="100%" stopColor="var(--fd-accent)" stopOpacity={0.35} /></linearGradient></defs>
              <CartesianGrid stroke="var(--fd-line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" {...axis} minTickGap={24} />
              <YAxis {...axis} width={50} tickFormatter={shortMoney} />
              <Tooltip contentStyle={tooltipStyle} formatter={value => money(Number(value))} cursor={{ fill: 'var(--fd-soft)' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="invoiced" name="Invoiced" fill={'url(#' + gradient + '-billed)'} radius={[3, 3, 0, 0]} maxBarSize={24} isAnimationActive={false} />
              <Bar dataKey="received" name="Confirmed receipts" fill="var(--fd-text)" radius={[3, 3, 0, 0]} maxBarSize={24} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="fd-chart-panel fd-segments">
        <h4>Customer segments</h4><p>All customers · from the directory</p>
        <div className="fd-segment-chart">
          <ResponsiveContainer width="100%" height={200} minWidth={0} initialDimension={{ width: 240, height: 200 }}>
            <PieChart><Pie data={segments} dataKey="value" nameKey="name" innerRadius={52} outerRadius={74} paddingAngle={2} stroke="none" isAnimationActive={false}>{segments.map((segment, index) => <Cell key={segment.name} fill={colors[index]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
          </ResponsiveContainer>
          <div className="fd-segment-center"><strong>{DEMO_CUSTOMERS.length}</strong><span>customers</span></div>
        </div>
        <ul className="fd-segment-legend">{segments.map((segment, index) => <li key={segment.name}><span><i style={{ background: colors[index] }} />{segment.name}</span><span>{segment.value}</span></li>)}</ul>
      </section>
    </div>

    <div className="fd-overview-joined fd-overview-recent">
      <section className="fd-chart-wide">
        <div className="fd-recent-heading"><div><h4>Recent invoices</h4><p>Latest activity across your accounts</p></div>{onViewInvoices && <button className="fd-fin-text-button" onClick={onViewInvoices}>View all <ArrowUpRight size={13} /></button>}</div>
        <div className="fd-table-wrap">
          <table className="fd-table fd-recent-table"><thead><tr><th>Invoice</th><th>Customer</th><th className="fd-fin-number">Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{SAMPLE_INVOICES.slice(0, 5).map(invoice => <tr key={invoice.id}><td className="fd-fin-mono">{invoice.number}</td><td>{invoice.customer}</td><td className="fd-fin-number">{money(invoiceTotals(invoice).total)}</td><td><span className="fd-fin-status" data-status={invoice.status}>{invoice.status}</span></td><td>{displayDate(invoice.date)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="fd-chart-panel">
        <h4>Activity</h4><p>From your sample workspace</p>
        <ul className="fd-activity">
          {SAMPLE_INVOICES.slice(0, 4).map(invoice => <li key={invoice.id}><span className="fd-activity-icon"><CheckCircle2 size={15} /></span><div><strong>Invoice {invoice.number}</strong> · {invoice.status}<small>System · {displayDate(invoice.date)}</small></div></li>)}
          <li><span className="fd-activity-icon"><Clock size={15} /></span><div><strong>Expense {SAMPLE_EXPENSES[2].category}</strong><small>{money(SAMPLE_EXPENSES[2].amount)} · {displayDate(SAMPLE_EXPENSES[2].date)}</small></div></li>
        </ul>
      </section>
    </div>

    <section className="fd-chart-panel fd-receipt-panel">
      <h4>Receipts and expenses</h4><p>Last {range} days · confirmed receipts and recorded expenses, by date</p>
      <div className="fd-chart">
        <ResponsiveContainer width="100%" height={230} minWidth={0} initialDimension={{ width: 700, height: 230 }}>
          <AreaChart data={trend} margin={{ top: 14, right: 10, left: -8, bottom: 0 }} accessibilityLayer>
            <defs><linearGradient id={gradient + '-receipts'} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--fd-accent)" stopOpacity={0.3} /><stop offset="100%" stopColor="var(--fd-accent)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="var(--fd-line)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" {...axis} minTickGap={28} /><YAxis {...axis} width={50} tickFormatter={shortMoney} /><Tooltip contentStyle={tooltipStyle} formatter={value => money(Number(value))} /><Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="received" name="Confirmed receipts" stroke="var(--fd-accent)" fill={'url(#' + gradient + '-receipts)'} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="expenses" name="Recorded expenses" stroke="var(--fd-text)" fill="var(--fd-text)" fillOpacity={0.04} strokeWidth={2} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="fd-chart-data"><summary>View chart data</summary><div className="fd-table-wrap"><table className="fd-table"><thead><tr><th>Date</th><th>Invoiced</th><th>Confirmed receipts</th><th>Expenses</th></tr></thead><tbody>{trend.map(row => <tr key={row.date}><td>{row.label}</td><td>{money(row.invoiced)}</td><td>{money(row.received)}</td><td>{money(row.expenses)}</td></tr>)}</tbody></table></div></details>
    </section>
  </div>
}
