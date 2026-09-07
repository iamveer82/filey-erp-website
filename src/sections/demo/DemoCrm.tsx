import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Activity, Building2, CheckSquare, Kanban, List, Plus, RotateCcw, Search, StickyNote, Target, Users, X } from 'lucide-react'
import { CRM_SAMPLE_SPEC, DEMO_STAGE_PROBABILITY, SAMPLE_CRM, moveSampleRecord, sampleLabel, sampleMoney, type CrmSection, type SampleCrm, type SampleRecord } from './crmSample'
import './DemoCrm.css'

const sectionIcons = { companies: Building2, contacts: Users, leads: Target, deals: Kanban, tasks: CheckSquare, notes: StickyNote, activities: Activity }
const sectionIds = Object.keys(CRM_SAMPLE_SPEC) as CrmSection[]
type Editor = { section: CrmSection; record?: SampleRecord; stage?: string }

export default function DemoCrm() {
  const [data, setData] = useState<SampleCrm>(SAMPLE_CRM)
  const [section, setSection] = useState<CrmSection>('deals')
  const [mode, setMode] = useState<'board' | 'list'>('board')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [owner, setOwner] = useState('')
  const [editor, setEditor] = useState<Editor | null>(null)
  const [message, setMessage] = useState('')
  const spec = CRM_SAMPLE_SPEC[section]
  const rows = data[section]
  const companyName = (id: string | number) => String(data.companies.find((record) => record.id === Number(id))?.name || '—')
  const groups = spec.fields.find((field) => field.key === spec.group)?.options || [...new Set(rows.map((record) => String(record[spec.group] || '')).filter(Boolean))]
  const owners = [...new Set(rows.map((record) => String(record.owner || '')).filter(Boolean))]
  const visible = rows.filter((record) => {
    const content = [...Object.values(record), companyName(record.company_id)].join(' ').toLowerCase()
    return content.includes(query.trim().toLowerCase()) && (!status || record[spec.group] === status) && (!owner || record.owner === owner)
  })
  const board = (section === 'deals' || section === 'tasks') && mode === 'board'
  const tableFields = spec.fields.filter((field) => field.key !== spec.title && field.key !== 'probability' && field.type !== 'textarea').slice(0, 5)

  function navigate(next: CrmSection) {
    setSection(next)
    setQuery('')
    setStatus('')
    setOwner('')
    setMessage('')
  }
  function move(record: SampleRecord, next: string) {
    setData((previous) => moveSampleRecord(previous, section, record.id, next))
    setMessage(`${record.name} moved to ${sampleLabel(next)}.`)
  }
  function reset() {
    setData(SAMPLE_CRM)
    setQuery('')
    setStatus('')
    setOwner('')
    setMessage('Sample CRM restored.')
  }

  return (
    <div className="fd-crm">
      <div className="fd-crm-breadcrumb"><Building2 size={14} aria-hidden="true" /><span>Filey / <strong>CRM workspace</strong></span><span>Sample workspace</span></div>
      <div className="fd-crm-layout">
        <nav className="fd-crm-nav" aria-label="CRM sections">
          {sectionIds.map((id) => {
            const Icon = sectionIcons[id]
            return <button key={id} type="button" aria-current={section === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={15} aria-hidden="true" />{CRM_SAMPLE_SPEC[id].label}<span>{data[id].length}</span></button>
          })}
        </nav>
        <div className="fd-crm-content">
          <header className="fd-page-heading">
            <div><h3>{spec.label}</h3><p>{spec.description}</p></div>
            <div className="fd-crm-actions">
              <button type="button" className="fd-button" onClick={reset}><RotateCcw size={14} aria-hidden="true" />Reset sample</button>
              <button type="button" className="fd-button fd-button-primary" onClick={() => setEditor({ section })}><Plus size={15} aria-hidden="true" />New {spec.singular}</button>
            </div>
          </header>
          <div className="fd-toolbar fd-crm-toolbar">
            <label className="fd-crm-search"><Search size={15} aria-hidden="true" /><input className="fd-input" aria-label={`Search ${spec.label.toLowerCase()}`} placeholder={`Search ${spec.label.toLowerCase()}…`} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <select className="fd-input" aria-label={`Filter ${spec.group}`} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{sampleLabel(spec.group)}: all</option>{groups.map((value) => <option key={value} value={value}>{sampleLabel(value)}</option>)}</select>
            {owners.length > 0 && <select className="fd-input" aria-label="Filter owner" value={owner} onChange={(event) => setOwner(event.target.value)}><option value="">All owners</option>{owners.map((value) => <option key={value}>{value}</option>)}</select>}
            {(section === 'deals' || section === 'tasks') && <div className="fd-crm-view" role="group" aria-label="Record layout"><button type="button" aria-label="List view" aria-pressed={mode === 'list'} onClick={() => setMode('list')}><List size={16} aria-hidden="true" /></button><button type="button" aria-label="Board view" aria-pressed={mode === 'board'} onClick={() => setMode('board')}><Kanban size={16} aria-hidden="true" /></button></div>}
          </div>
          <div className="fd-crm-count"><span>{visible.length} of {rows.length} records</span>{(query || status || owner) && <button type="button" onClick={() => { setQuery(''); setStatus(''); setOwner('') }}>Clear filters</button>}</div>
          {board ? (
            <div className="fd-crm-board" role="region" aria-label={`${spec.label} board`} tabIndex={0}>
              {groups.map((stage) => {
                const cards = visible.filter((record) => record[spec.group] === stage)
                return (
                  <section className="fd-crm-column" key={stage} aria-label={sampleLabel(stage)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
                    event.preventDefault()
                    const record = visible.find((item) => item.id === Number(event.dataTransfer.getData('application/x-filey-demo-crm')))
                    if (record) move(record, stage)
                  }}>
                    <div className="fd-crm-column-heading"><h4>{sampleLabel(stage)}</h4><span>{cards.length}</span></div>
                    <div className="fd-crm-cards">
                      {cards.map((record) => <article className="fd-crm-record" key={record.id} draggable onDragStart={(event) => event.dataTransfer.setData('application/x-filey-demo-crm', String(record.id))}>
                        <button type="button" className="fd-crm-record-name" onClick={() => setEditor({ section, record })}>{record.name}</button>
                        <p>{section === 'deals' ? companyName(record.company_id) : record.owner || 'Unassigned'}</p>
                        {section === 'deals' && <strong>{sampleMoney(Number(record.value) || 0)}</strong>}
                        <select className="fd-input" aria-label={`Move ${record.name}`} value={String(record[spec.group])} onChange={(event) => move(record, event.target.value)}>{groups.map((value) => <option key={value} value={value}>{sampleLabel(value)}</option>)}</select>
                      </article>)}
                      {!cards.length && <p className="fd-crm-column-empty">No {spec.label.toLowerCase()} here.</p>}
                      <button type="button" className="fd-button fd-crm-add" onClick={() => setEditor({ section, stage })}><Plus size={13} aria-hidden="true" />Add {spec.singular}</button>
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="fd-table-wrap fd-crm-table-wrap" role="region" aria-label={`${spec.label} records`} tabIndex={0}>
              <table className="fd-table fd-crm-table"><thead><tr><th scope="col">Name</th>{tableFields.map((field) => <th scope="col" key={field.key}>{field.label}</th>)}<th scope="col">Created</th></tr></thead><tbody>
                {visible.map((record) => <tr key={record.id}><td><button type="button" className="fd-crm-record-name" onClick={() => setEditor({ section, record })}>{record.name}</button></td>{tableFields.map((field) => {
                  const value = record[field.key]
                  const linkedSection = field.type === 'company' ? 'companies' : field.type === 'contact' ? 'contacts' : null
                  const linked = linkedSection ? data[linkedSection].find((item) => item.id === Number(value)) : null
                  return <td key={field.key}>{linked && linkedSection ? <button type="button" className="fd-crm-link" onClick={() => setEditor({ section: linkedSection, record: linked })}>{linked.name}</button> : field.options && value ? <span className={`fd-chip ${value === 'won' || value === 'done' ? 'fd-crm-success' : ''}`}>{sampleLabel(value)}</span> : field.type === 'number' ? sampleMoney(Number(value) || 0) : value || '—'}</td>
                })}<td>{record.created}</td></tr>)}
                {!visible.length && <tr><td colSpan={tableFields.length + 2} className="fd-empty">No records match these filters.</td></tr>}
              </tbody></table>
            </div>
          )}
          <p className="fd-crm-note">Edit a record or move a card. Changes stay in this preview and reset when you leave it.</p>
          <p className="fd-crm-announcement" role="status">{message}</p>
        </div>
      </div>
      {editor && <RecordDialog key={`${editor.section}:${editor.record?.id || 'new'}`} editor={editor} data={data} onClose={() => setEditor(null)} onSave={(record) => {
        setData((previous) => ({ ...previous, [editor.section]: editor.record ? previous[editor.section].map((item) => item.id === record.id ? record : item) : [record, ...previous[editor.section]] }))
        setMessage(`${record.name} saved in the sample workspace.`)
      }} />}
    </div>
  )
}

function RecordDialog({ editor, data, onClose, onSave }: { editor: Editor; data: SampleCrm; onClose: () => void; onSave: (record: SampleRecord) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const spec = CRM_SAMPLE_SPEC[editor.section]
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(spec.fields.map((field) => [field.key, String(editor.record?.[field.key] ?? (field.key === spec.group && editor.stage ? editor.stage : field.key === 'probability' ? DEMO_STAGE_PROBABILITY[editor.stage || 'qualification'] : field.options?.[0] || ''))])))
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  function close() { dialog.current?.close(); onClose() }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    if (spec.fields.some((field) => field.required && !String(values[field.key] || '').trim())) { setError('Complete the required fields.'); return }
    const record: SampleRecord = { id: editor.record?.id ?? Math.max(0, ...Object.values(data).flat().map((item) => item.id)) + 1, created: editor.record?.created || new Date().toISOString().slice(0, 10) }
    for (const field of spec.fields) {
      const value = String(values[field.key] || '').trim()
      if (field.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) < 0 || (field.max !== undefined && Number(value) > field.max))) { setError(`Enter a valid ${field.label.toLowerCase()}.`); return }
      record[field.key] = field.type === 'number' ? Number(value) : value
    }
    onSave(record)
    close()
  }
  return (
    <dialog ref={dialog} className="fd-crm-dialog" aria-labelledby="fd-crm-editor-title" aria-describedby="fd-crm-editor-description" onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
      <div className="fd-crm-dialog-heading"><h3 id="fd-crm-editor-title">{editor.record ? editor.record.name : `New ${spec.singular}`}</h3><button type="button" className="fd-button" aria-label="Close record" onClick={close}><X size={16} aria-hidden="true" /></button></div>
      <p id="fd-crm-editor-description">Changes apply to this sample workspace only.</p>
      <form onSubmit={save}>
        <div className="fd-crm-form">
          {spec.fields.map((field) => {
            const id = `fd-crm-${field.key}`
            const options = field.type === 'company' ? data.companies.map((item) => ({ value: String(item.id), label: String(item.name) })) : field.type === 'contact' ? data.contacts.filter((item) => !draft.company_id || String(item.company_id) === draft.company_id).map((item) => ({ value: String(item.id), label: String(item.name) })) : field.options?.map((value) => ({ value, label: sampleLabel(value) }))
            function change(value: string) { setDraft((previous) => ({ ...previous, [field.key]: value, ...(field.type === 'company' ? { contact_id: '' } : {}), ...(field.key === 'stage' ? { probability: String(DEMO_STAGE_PROBABILITY[value]) } : {}) })) }
            return <div key={field.key} className={field.type === 'textarea' ? 'fd-crm-field-wide' : ''}><label htmlFor={id}>{field.label}{field.required ? ' *' : ''}</label>{options ? <select className="fd-input" id={id} name={field.key} value={draft[field.key]} required={field.required} onChange={(event) => change(event.target.value)}>{!field.options && <option value="">Select {field.label.toLowerCase()}</option>}{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === 'textarea' ? <textarea className="fd-input" id={id} name={field.key} value={draft[field.key]} onChange={(event) => change(event.target.value)} maxLength={2000} /> : <input className="fd-input" id={id} name={field.key} type={field.type || 'text'} value={draft[field.key]} required={field.required} min={field.type === 'number' ? 0 : undefined} max={field.max} step={field.type === 'number' ? field.key === 'probability' ? 1 : 0.01 : undefined} maxLength={200} onChange={(event) => change(event.target.value)} />}</div>
          })}
        </div>
        {error && <p className="fd-crm-error" role="alert">{error}</p>}
        <div className="fd-crm-dialog-actions"><button type="button" className="fd-button" onClick={close}>Cancel</button><button className="fd-button fd-button-primary" type="submit">Save record</button></div>
      </form>
    </dialog>
  )
}
