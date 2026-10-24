import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Building2, Download, CheckCircle, Bookmark, Presentation, Shapes, GitBranch, Monitor, CalendarDays, Clock, MapPin, Plane, IndianRupee, Wrench, BriefcaseBusiness, Award, Languages, ClipboardList, Wallet, Receipt, CreditCard, Gift, Layers, Hourglass, Timer, Users, Tags, UserRound, CalendarClock, UserCheck, FileText, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import api from '@/api/client'
import type { Opportunity } from '@/types/opportunity'
import { OPPORTUNITY_TYPE_LABELS, FEE_STRUCTURE_LABELS, COMPENSATION_TYPE_LABELS, EXPERTISE_LEVEL_LABELS, SESSION_STRUCTURE_LABELS } from '@/types/opportunity'

type Details = Opportunity & { response_status: string | null; organization: { organization_name: string; organization_type: string | null; address: string | null; city: string | null; state: string | null; website: string | null } | null }
const tabs = ['Overview', 'Requirement', 'Compensation', 'Other Details']
const date = (s?: string | null) => s ? new Date(s.length === 10 ? s + 'T00:00:00' : s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified'
const fieldIcons: Record<string, LucideIcon> = {
 'Opportunity Type': Presentation,
 Category: Shapes,
 'Sub Category': GitBranch,
 'Delivery Mode': Monitor,
 'Event Date': CalendarDays,
 Time: Clock,
 Venue: MapPin,
 'Travel Required': Plane,
 'Fee / Honorarium Amount (INR)': IndianRupee,
 'Skills Required': Wrench,
 'Minimum Experience': BriefcaseBusiness,
 'Expertise Level': Award,
 'Language of Delivery': Languages,
 'Additional Requirements': ClipboardList,
 'Compensation Type': Wallet,
 'Fee Structure': Receipt,
 'Payment Terms': CreditCard,
 'Travel Reimbursement': Plane,
 'Other Benefits': Gift,
 'Session Structure': Layers,
 'Total Duration': Hourglass,
 'Duration per Session': Timer,
 'Number of Openings': Users,
 'Target Audience': Users,
 Tags: Tags,
 'Preferred Location / Area': MapPin,
 'Gender Preference': UserRound,
 'Application Deadline': CalendarClock,
 'Candidate Preference': UserCheck,
 'Notes for Applicants': FileText,
}
function Fields({ values, singleColumn = false }: { values: [string, React.ReactNode][]; singleColumn?: boolean }) {
 return <dl className={`grid gap-6 ${singleColumn ? 'grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
  {values.map(([label, value]) => {
   const Icon = fieldIcons[label] || Info
   return <div key={label} className="relative min-w-0 pl-10">
    <dt className="text-xs text-slate-500 mb-1">
     <span aria-hidden="true" className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Icon size={18} strokeWidth={1.75} /></span>
     {label}
    </dt>
    <dd className="text-sm text-slate-800 whitespace-pre-wrap break-words">{value || 'Not specified'}</dd>
   </div>
  })}
 </dl>
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"><h2 className="font-semibold text-slate-900">{title}</h2>{children}</section> }
export function OpportunityDetailsPage() {
 const { id } = useParams(); const [data, setData] = useState<Details | null>(null); const [tab, setTab] = useState(0); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('')
 useEffect(() => { let active = true; setData(null); setError(''); api.get(`/opportunities/${id}`).then(r => { if (active) setData(r.data) }).catch(() => { if (active) setError('Unable to load this opportunity. It may no longer be available.') }); return () => { active = false } }, [id])
 async function respond(status: string) { setBusy(true); setMessage(''); try { const r = await api.post(`/opportunities/${id}/response`, { status }); setData(d => d && { ...d, response_status: r.data.status }); setMessage(r.data.status === 'Saved' ? 'Saved for later.' : 'Your application is recorded.') } catch (e: any) { setMessage(e.response?.data?.detail || e.response?.data?.message || 'Unable to save your response. Please try again.') } finally { setBusy(false) } }
 async function download(attachment: Opportunity['attachments'][number]) { try { const r = await api.get(`/opportunities/${id}/attachments/${attachment.id}`, { responseType: 'blob' }); const url = URL.createObjectURL(r.data); const a = document.createElement('a'); a.href = url; a.download = attachment.file_name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) } catch { setMessage('Unable to download attachment. Please try again.') } }
 if (!data) return <div className="p-6"><Link to="/opportunities" className="text-blue-600">Back to Opportunities</Link><p role="status" className="mt-4">{error || 'Loading opportunity…'}</p></div>
 const d = data; const org = d.organization; const applied = !!d.response_status && d.response_status !== 'Saved'; const saved = d.response_status === 'Saved'; const fee = d.fee_amount != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(d.fee_amount) : COMPENSATION_TYPE_LABELS[d.compensation_type]; const share = window.location.href; const website = org?.website && /^https?:\/\//i.test(org.website) ? org.website : null
 return <div className="space-y-5">
 <nav className="text-sm text-slate-500"><Link to="/opportunities" className="text-blue-600">Opportunities</Link> / Opportunity Details</nav>
 <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,4fr)_minmax(0,1fr)] gap-5">
 <main className="min-w-0 space-y-6">
 <header className="space-y-3"><h1 className="text-2xl font-bold text-slate-900 break-words">{d.title}</h1><span className="inline-flex rounded bg-blue-50 text-blue-700 text-xs px-2 py-1">{OPPORTUNITY_TYPE_LABELS[d.opportunity_type]}</span><p className="text-xs text-slate-500 break-all">Posted on: {date(d.created_at)} · Opportunity ID: {d.id}</p></header>
 <div role="tablist" aria-label="Opportunity details" className="flex overflow-x-auto border-b border-slate-200">{tabs.map((name, i) => <button key={name} role="tab" id={`tab-${i}`} aria-controls="detail-panel" aria-selected={tab === i} onClick={() => setTab(i)} className={`px-5 py-3 text-sm whitespace-nowrap border-b-2 ${tab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>{name}</button>)}</div>
 <section id="detail-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
 {tab === 0 && <><h2 className="font-semibold">Opportunity Description</h2><p className="text-sm leading-relaxed whitespace-pre-wrap">{d.short_description}</p><p className="text-sm leading-relaxed whitespace-pre-wrap">{d.detailed_description}</p><hr /><Fields values={[
 ['Opportunity Type', OPPORTUNITY_TYPE_LABELS[d.opportunity_type]], ['Category', d.category], ['Sub Category', d.sub_category], ['Delivery Mode', d.delivery_modes.join(', ')], ['Event Date', date(d.event_date)], ['Time', [d.start_time?.slice(0,5), d.end_time?.slice(0,5)].filter(Boolean).join(' – ')], ['Venue', [d.venue_name, d.venue_address].filter(Boolean).join('\n')], ['Travel Required', d.travel_required ? 'Yes' : 'No'], ['Fee / Honorarium Amount (INR)', fee]
 ]} /></>}
 {tab === 1 && <Fields values={[[ 'Skills Required', d.skills_required.join(', ')], ['Minimum Experience', d.minimum_experience], ['Expertise Level', d.expertise_level && EXPERTISE_LEVEL_LABELS[d.expertise_level]], ['Language of Delivery', d.language_of_delivery], ['Additional Requirements', d.additional_requirements]]} />}
 {tab === 2 && <Fields values={[[ 'Compensation Type', COMPENSATION_TYPE_LABELS[d.compensation_type]], ['Fee / Honorarium Amount (INR)', fee], ['Fee Structure', d.fee_structure && FEE_STRUCTURE_LABELS[d.fee_structure]], ['Payment Terms', d.payment_terms], ['Travel Reimbursement', d.travel_reimbursement ? 'Yes' : 'No'], ['Other Benefits', d.other_benefits]]} />}
 {tab === 3 && <Fields values={[[ 'Session Structure', SESSION_STRUCTURE_LABELS[d.session_structure]], ['Total Duration', d.total_duration], ['Duration per Session', d.duration_per_session], ['Number of Openings', d.number_of_openings === 0 ? 'Unlimited' : d.number_of_openings], ['Target Audience', d.target_audience.join(', ')], ['Tags', d.tags.join(', ')]]} />}
 </section>
 <div className="grid sm:grid-cols-2 gap-4">
 <section className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-3"><CheckCircle className="text-green-600" /><h2 className="font-semibold text-green-800">I am interested</h2><p className="text-sm text-green-800">I am available and interested in this opportunity.</p><button disabled={busy || applied} onClick={() => respond('Applied')} className="rounded-lg bg-green-700 text-white px-5 py-2 disabled:opacity-50">{applied ? 'Applied' : busy ? 'Please wait…' : 'Apply Now'}</button></section>
 <section className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 space-y-3"><Bookmark className="text-yellow-600" /><h2 className="font-semibold text-yellow-800">Sounds interesting</h2><p className="text-sm text-yellow-800">Save this opportunity to revisit later.</p><button disabled={busy || saved || applied} onClick={() => respond('Saved')} className="rounded-lg bg-yellow-400 text-yellow-950 px-5 py-2 disabled:opacity-50">{saved ? 'Saved for Later' : 'Save for Later'}</button></section>
 </div><p role="status" className="text-sm text-slate-700">{message}</p>
 </main>
 <aside className="min-w-0 space-y-4 text-sm break-words">
 <Panel title="About the Organization"><Building2 size={40} className="rounded-lg bg-blue-50 p-2 text-blue-600" aria-label="Organization" /><h3 className="font-semibold">{org?.organization_name || 'Organization not specified'}</h3><p>{org?.organization_type}</p><p>{[org?.address, org?.city, org?.state].filter(Boolean).join(', ') || 'Address not specified'}</p>{website ? <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{website}</a> : <p>Website not specified</p>}</Panel>
 <Panel title="Key Information"><h3 className="font-medium">Eligibility Preferences</h3><Fields singleColumn values={[[ 'Preferred Location / Area', d.preferred_location], ['Gender Preference', d.gender_preference], ['Application Deadline', date(d.application_deadline)], ['Candidate Preference', d.candidate_preference], ['Notes for Applicants', d.notes_for_applicants]]} /></Panel>
 <Panel title="Attachments">{d.attachments.length ? d.attachments.map(a => <button key={a.id} onClick={() => download(a)} className="flex w-full gap-2 items-start text-left text-blue-600"><span className="min-w-0 break-all">{a.file_name}</span><Download size={16} className="shrink-0 mt-1" /></button>) : <p>No attachments.</p>}</Panel>
 <Panel title="Share Opportunity"><div className="flex flex-wrap gap-3 text-blue-600"><a target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(d.title + ' ' + share)}`}>WhatsApp</a><a href={`mailto:?subject=${encodeURIComponent(d.title)}&body=${encodeURIComponent(share)}`}>Email</a><button onClick={async () => { try { await navigator.clipboard.writeText(share); setMessage('Link copied.') } catch { setMessage('Could not copy. Copy the page address from your browser.') } }}>Copy Link</button></div></Panel>
 </aside></div></div>
}
