import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '@/api/client'
import { OpportunityCard } from '@/features/opportunities/components/OpportunityCard'
import { OPPORTUNITY_TYPE_LISTING_LABELS } from '@/types/opportunity'
import type { OpportunityListingCard } from '@/types/opportunity'


const statusLabel = (status: string) => status.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

type Results = { items: (OpportunityListingCard & { application: { id: string; status: string; cover_note: string | null; applied_at: string }; can_view_details: boolean })[]; total: number }
export function MyApplicationsPage() {
 const [params, setParams] = useSearchParams()
 const page = Math.max(1, Number(params.get('page')) || 1)
 const search = params.get('search') || ''; const type = params.get('opportunity_type') || ''
 const [data, setData] = useState<Results | null>(null)
 const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [retry, setRetry] = useState(0)
 const navigate = useNavigate()
 useEffect(() => {
  const controller = new AbortController(); setLoading(true); setError('')
  const timer = setTimeout(() => {
   api.get('/applications', { params: { page, size: 12, search, opportunity_type: type }, signal: controller.signal })
    .then(r => { if (!controller.signal.aborted) setData(r.data) })
    .catch(() => { if (!controller.signal.aborted) setError('Unable to load applications. Please try again.') })
    .finally(() => { if (!controller.signal.aborted) setLoading(false) })
  }, 250)
  return () => { clearTimeout(timer); controller.abort() }
 }, [page, search, type, retry])
 function filter(key: string, value: string) { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); next.delete('page'); setParams(next, { replace: true }) }
 function go(nextPage: number) { const next = new URLSearchParams(params); next.set('page', String(nextPage)); setParams(next) }
 return <div className="space-y-5">
  <header><h1 className="text-xl font-bold text-slate-900">My Applications</h1><p className="text-sm text-slate-500">Track your submitted applications and their current status.</p></header>
  <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4">
   <input aria-label="Search opportunities" type="search" value={search} onChange={e => filter('search', e.target.value)} placeholder="Search opportunity or organization" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" />
   <select aria-label="Opportunity type" value={type} onChange={e => filter('opportunity_type', e.target.value)} className="rounded-lg border px-3 py-2 text-sm"><option value="">All Types</option>{Object.entries(OPPORTUNITY_TYPE_LISTING_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
  </div>
  {loading ? <p role="status">Loading applications?</p> : error ? <div role="alert"><p>{error}</p><button onClick={() => setRetry(n => n + 1)} className="text-blue-600">Retry</button></div> : <>
   <p className="text-sm text-slate-500">{data?.total || 0} submitted applications</p>
   {!data?.items.length ? <p className="rounded-xl border bg-white p-8 text-center text-slate-500">No submitted applications match your filters.</p> : data.items.map(card => <OpportunityCard key={card.application.id} card={card} detailsAvailable={card.can_view_details} onViewDetails={id => navigate(`/opportunities/${id}`)}>
    <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
     <div><dt className="text-xs text-slate-500 mb-1">Status</dt><dd><span className="inline-flex rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{statusLabel(card.application.status)}</span></dd></div>
     <div><dt className="text-xs text-slate-500 mb-1">Applied on</dt><dd><time dateTime={card.application.applied_at}>{new Date(card.application.applied_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</time></dd></div>
     <div className="sm:col-span-2 min-w-0"><dt className="text-xs text-slate-500 mb-1">Cover Note</dt><dd className="whitespace-pre-wrap break-words">{card.application.cover_note?.trim() || 'No cover note provided.'}</dd></div>
    </dl>
   </OpportunityCard>)}
   {data && data.total > 12 && <div className="flex items-center justify-between text-sm"><button disabled={page <= 1} onClick={() => go(page - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {Math.ceil(data.total / 12)}</span><button disabled={page * 12 >= data.total} onClick={() => go(page + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Next</button></div>}
  </>}
 </div>
}
