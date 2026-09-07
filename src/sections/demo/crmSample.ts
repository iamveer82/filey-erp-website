export const DEMO_STAGES = ['qualification', 'proposal', 'negotiation', 'won', 'lost'] as const
export const DEMO_STAGE_PROBABILITY: Record<string, number> = { qualification: 20, proposal: 45, negotiation: 70, won: 100, lost: 0 }
export type CrmSection = 'companies' | 'contacts' | 'leads' | 'deals' | 'tasks' | 'notes' | 'activities'
export type SampleRecord = { id: number; created: string; [key: string]: string | number }
export type SampleCrm = Record<CrmSection, SampleRecord[]>
type Field = { key: string; label: string; type?: 'email' | 'number' | 'date' | 'textarea' | 'company' | 'contact'; options?: readonly string[]; required?: boolean; max?: number }
type Spec = { label: string; singular: string; title: string; group: string; description: string; fields: Field[] }
const company: Field = { key: 'company_id', label: 'Company', type: 'company' }
const email: Field = { key: 'email', label: 'Email', type: 'email' }
const owner: Field = { key: 'owner', label: 'Owner' }
export const CRM_SAMPLE_SPEC: Record<CrmSection, Spec> = {
  companies: { label: 'Companies', singular: 'company', title: 'name', group: 'segment', description: 'Accounts connected to their people, deals, and history.', fields: [
    { key: 'name', label: 'Company name', required: true }, email, { key: 'phone', label: 'Phone' }, { key: 'segment', label: 'Segment' }, { key: 'city', label: 'City' },
  ] },
  contacts: { label: 'Contacts', singular: 'contact', title: 'name', group: 'owner', description: 'The people behind every business relationship.', fields: [
    { key: 'name', label: 'Full name', required: true }, company, { key: 'job_title', label: 'Job title' }, email, { key: 'phone', label: 'Phone' }, owner,
  ] },
  leads: { label: 'Leads', singular: 'lead', title: 'name', group: 'status', description: 'Capture interest, qualify it, and turn it into an opportunity.', fields: [
    { key: 'name', label: 'Full name', required: true }, { key: 'company', label: 'Company' }, email, { key: 'phone', label: 'Phone' }, { key: 'status', label: 'Status', options: ['new', 'contacted', 'qualified', 'lost'] }, { key: 'source', label: 'Source' }, { key: 'value', label: 'Estimated value (AED)', type: 'number' }, owner,
  ] },
  deals: { label: 'Deals', singular: 'deal', title: 'name', group: 'stage', description: 'Track opportunities from qualification to won or lost.', fields: [
    { key: 'name', label: 'Deal name', required: true }, { ...company, required: true }, { key: 'contact_id', label: 'Contact', type: 'contact' }, { key: 'stage', label: 'Stage', options: DEMO_STAGES }, { key: 'value', label: 'Value (AED)', type: 'number' }, { key: 'probability', label: 'Probability (%)', type: 'number', max: 100 }, { key: 'expected_close', label: 'Expected close', type: 'date' }, owner,
  ] },
  tasks: { label: 'Tasks', singular: 'task', title: 'name', group: 'status', description: 'Assign the next step and keep commitments on schedule.', fields: [
    { key: 'name', label: 'Task title', required: true }, { key: 'body', label: 'Description', type: 'textarea' }, { key: 'status', label: 'Status', options: ['open', 'in_progress', 'done', 'cancelled'] }, { key: 'priority', label: 'Priority', options: ['normal', 'low', 'high', 'urgent'] }, { key: 'due_date', label: 'Due date', type: 'date' }, { key: 'owner', label: 'Assignee' },
  ] },
  notes: { label: 'Notes', singular: 'note', title: 'name', group: 'owner', description: 'Keep context attached to the record it belongs to.', fields: [
    { key: 'name', label: 'Title', required: true }, { key: 'body', label: 'Note', type: 'textarea' }, company, { key: 'owner', label: 'Author' },
  ] },
  activities: { label: 'Activities', singular: 'activity', title: 'name', group: 'type', description: 'Calls, meetings, messages, and follow-ups in one timeline.', fields: [
    { key: 'name', label: 'Subject', required: true }, { key: 'type', label: 'Type', options: ['call', 'meeting', 'email', 'follow_up'] }, company, { key: 'date', label: 'Date', type: 'date' }, owner, { key: 'body', label: 'Notes', type: 'textarea' },
  ] },
}

const created = '2026-09-01'
export const SAMPLE_CRM: SampleCrm = {
  companies: [
    { id: 1, created, name: 'Al Noor Trading', email: 'hello@alnoor.example', phone: '', segment: 'Retail', city: 'Dubai' },
    { id: 2, created, name: 'Palm Studio', email: 'team@palm.example', phone: '', segment: 'Design', city: 'Abu Dhabi' },
    { id: 3, created, name: 'Gulf Office Supply', email: 'hello@gulfoffice.example', phone: '', segment: 'Wholesale', city: 'Sharjah' },
  ],
  contacts: [
    { id: 4, created, name: 'Sara Ahmed', company_id: 1, job_title: 'Purchasing manager', email: 'sara@alnoor.example', owner: 'Alex Morgan' },
    { id: 5, created, name: 'Omar Hassan', company_id: 2, job_title: 'Studio director', email: 'omar@palm.example', owner: 'Alex Morgan' },
    { id: 6, created, name: 'Maya Patel', company_id: 3, job_title: 'Operations manager', email: 'maya@gulfoffice.example', owner: 'Jamie Lee' },
  ],
  leads: [
    { id: 7, created, name: 'Nadia Salem', company: 'Dune Interiors', email: 'nadia@dune.example', status: 'qualified', source: 'Referral', value: 18500, owner: 'Alex Morgan' },
    { id: 8, created, name: 'Daniel Chen', company: 'Cedar Workspace', email: 'daniel@cedar.example', status: 'new', source: 'Website', value: 9200, owner: 'Jamie Lee' },
  ],
  deals: [
    { id: 9, created, name: 'Annual office supplies', company_id: 1, contact_id: 4, stage: 'qualification', value: 24000, probability: 20, expected_close: '2026-10-15', owner: 'Alex Morgan' },
    { id: 10, created, name: 'Studio fit-out', company_id: 2, contact_id: 5, stage: 'proposal', value: 18500, probability: 45, expected_close: '2026-10-08', owner: 'Alex Morgan' },
    { id: 11, created, name: 'Quarterly restock', company_id: 3, contact_id: 6, stage: 'negotiation', value: 12600, probability: 70, expected_close: '2026-09-28', owner: 'Jamie Lee' },
    { id: 12, created, name: 'Desk accessories', company_id: 1, contact_id: 4, stage: 'won', value: 4800, probability: 100, expected_close: '2026-09-04', owner: 'Jamie Lee' },
    { id: 13, created, name: 'Reception furniture', company_id: 2, contact_id: 5, stage: 'qualification', value: 8700, probability: 20, expected_close: '2026-10-22', owner: 'Alex Morgan' },
  ],
  tasks: [
    { id: 14, created, name: 'Send revised studio proposal', status: 'in_progress', priority: 'high', due_date: '2026-09-10', owner: 'Alex Morgan', body: 'Include the updated delivery schedule.' },
    { id: 15, created, name: 'Confirm quarterly quantities', status: 'open', priority: 'normal', due_date: '2026-09-12', owner: 'Jamie Lee' },
    { id: 16, created, name: 'Share accessories catalogue', status: 'done', priority: 'normal', due_date: '2026-09-05', owner: 'Jamie Lee' },
  ],
  notes: [{ id: 17, created, name: 'Delivery preferences', company_id: 1, owner: 'Alex Morgan', body: 'Deliver to the receiving desk before 11 am. Confirm the slot with Sara.' }],
  activities: [{ id: 18, created, name: 'Studio planning call', company_id: 2, type: 'call', date: '2026-09-06', owner: 'Alex Morgan', body: 'Reviewed quantities and agreed to send a revised proposal.' }],
}

export function moveSampleRecord(data: SampleCrm, section: CrmSection, id: number, stage: string): SampleCrm {
  const group = CRM_SAMPLE_SPEC[section].group
  const choices = CRM_SAMPLE_SPEC[section].fields.find((field) => field.key === group)?.options
  if (!choices?.includes(stage)) return data
  return { ...data, [section]: data[section].map((record) => record.id === id ? { ...record, [group]: stage, ...(section === 'deals' ? { probability: DEMO_STAGE_PROBABILITY[stage] } : {}) } : record) }
}

export const sampleLabel = (value: string | number) => String(value).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
export const sampleMoney = (value: number) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
