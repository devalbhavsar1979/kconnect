import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '@/api/client'
import { OpportunityCard } from '@/features/opportunities/components/OpportunityCard'
import { OPPORTUNITY_TYPE_LISTING_LABELS } from '@/types/opportunity'
import type { OpportunityListingCard } from '@/types/opportunity'
import { ApplicantSummary } from '../components/ApplicantSummary'
import type { Applicant } from '../components/ApplicantSummary'

type Results = { items: (OpportunityListingCard & { applicants: Applicant[] })[]; total: number }
export function ApplicationsPage() {
 const [params, setParams] = useSearchParams()
 const page = Math.max(1, Number(params.get('page')) || 1)
 const search = params.get('search') || ''; const type = params.get('opportunity_type') || ''
 const [data, setData] = useState<Results | null>(null)
 const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [retry, setRetry] = useState(0)
 const navigate = useNavigate()
 useEffect(() => {
  const controller = new AbortController(); setLoading(true); setError('')
  const timer = setTimeout(() => {
   api.get('/admin/applications', { params: { page, size: 12, search, opportunity_type: type }, signal: controller.signal })
    .then(r => { if (!controller.signal.aborted) setData(r.data) })
    .catch(() => { if (!controller.signal.aborted) setError('Unable to load applications. Please try again.') })
    .finally(() => { if (!controller.signal.aborted) setLoading(false) })
  }, 250)
  return () => { clearTimeout(timer); controller.abort() }
 }, [page, search, type, retry])
 function filter(key: string, value: string) { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); next.delete('page'); setParams(next, { replace: true }) }
 function go(nextPage: number) { const next = new URLSearchParams(params); next.set('page', String(nextPage)); setParams(next) }
 return <div className="space-y-5">
  <header><h1 className="text-xl font-bold text-slate-900">Applications</h1><p className="text-sm text-slate-500">Opportunities with applied applicants.</p></header>
  <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4">
   <input aria-label="Search opportunities" type="search" value={search} onChange={e => filter('search', e.target.value)} placeholder="Search opportunity or organization" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" />
   <select aria-label="Opportunity type" value={type} onChange={e => filter('opportunity_type', e.target.value)} className="rounded-lg border px-3 py-2 text-sm"><option value="">All Types</option>{Object.entries(OPPORTUNITY_TYPE_LISTING_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
  </div>
  {loading ? <p role="status">Loading applications?</p> : error ? <div role="alert"><p>{error}</p><button onClick={() => setRetry(n => n + 1)} className="text-blue-600">Retry</button></div> : <>
   <p className="text-sm text-slate-500">{data?.total || 0} opportunities with applications</p>
   {!data?.items.length ? <p className="rounded-xl border bg-white p-8 text-center text-slate-500">No applied opportunities match your filters.</p> : data.items.map(card => <OpportunityCard key={card.id} card={card} onViewDetails={id => navigate(`/admin/opportunities/${id}/edit`)}>
    <div className="p-5 space-y-4"><h2 className="font-semibold text-slate-900">Applicants ({card.applicants.length}) <span className="ml-2 text-xs font-medium text-green-700 bg-green-50 rounded-full px-2 py-1">Applied</span></h2>
     {card.applicants.map(a => <section key={a.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold break-words">{a.name}</h3><Link to={`/admin/applicants/${a.id}`} className="rounded-lg border border-blue-400 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50" aria-label={`View Profile of ${a.name}`}>View Profile</Link></div>
      <ApplicantSummary applicant={a} />
     </section>)}
    </div>
   </OpportunityCard>)}
   {data && data.total > 12 && <div className="flex items-center justify-between text-sm"><button disabled={page <= 1} onClick={() => go(page - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {Math.ceil(data.total / 12)}</span><button disabled={page * 12 >= data.total} onClick={() => go(page + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Next</button></div>}
  </>}
 </div>
}
