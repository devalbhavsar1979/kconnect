import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '@/api/client'
import { ApplicantSummary } from '../components/ApplicantSummary'
import type { Applicant } from '../components/ApplicantSummary'

type Profile = Applicant & {
 profile: Record<string, string | null>
 education: { id: string; school: string; degree: string; field_of_study: string | null; end_year: number | null; description: string | null }[]
 experience: { id: string; job_title: string; organization: string; start_month: number; start_year: number; end_month: number | null; end_year: number | null; is_current: boolean; highlights: string | null; skills: string[] }[]
}
export function ApplicantProfilePage() {
 const { id } = useParams(); const [data, setData] = useState<Profile | null>(null); const [error, setError] = useState(''); const [retry, setRetry] = useState(0)
 useEffect(() => {
  const controller = new AbortController(); setData(null); setError('')
  api.get(`/admin/applicants/${id}`, { signal: controller.signal }).then(r => { if (!controller.signal.aborted) setData(r.data) }).catch(() => { if (!controller.signal.aborted) setError('Unable to load this applicant profile.') })
  return () => controller.abort()
 }, [id, retry])
 return <div className="space-y-5">
  <Link to="/admin/applications" className="text-sm text-blue-600">Back to Applications</Link>
  {error ? <div role="alert">{error} <button onClick={() => setRetry(n => n + 1)} className="text-blue-600">Retry</button></div> : !data ? <p role="status">Loading profile?</p> : <>
   <section className="rounded-xl border bg-white p-5 space-y-4"><h1 className="text-xl font-bold">{data.name}</h1><ApplicantSummary applicant={data} /><dl className="grid sm:grid-cols-2 gap-4 text-sm">{Object.entries(data.profile).map(([key, value]) => <div key={key} className="min-w-0"><dt className="text-xs capitalize text-slate-500">{key.replace(/_/g, ' ')}</dt><dd className="break-words whitespace-pre-wrap">{value || 'Not specified'}</dd></div>)}</dl></section>
   <section className="rounded-xl border bg-white p-5 space-y-4"><h2 className="font-semibold">Education</h2>{!data.education.length && <p>No education details provided.</p>}{data.education.map(e => <div key={e.id} className="border-t pt-3 text-sm space-y-1"><h3 className="font-medium">{e.degree} ? {e.school}</h3><p>{e.field_of_study}</p><p className="text-slate-500">Completion year: {e.end_year || 'Not specified'}</p><p className="whitespace-pre-wrap">{e.description}</p></div>)}</section>
   <section className="rounded-xl border bg-white p-5 space-y-4"><h2 className="font-semibold">Experience</h2>{!data.experience.length && <p>No experience details provided.</p>}{data.experience.map(e => <div key={e.id} className="border-t pt-3 text-sm space-y-1"><h3 className="font-medium">{e.job_title} ? {e.organization}</h3><p className="text-slate-500">{e.start_month}/{e.start_year} ? {e.is_current ? 'Present' : e.end_year ? `${e.end_month || '?'}/${e.end_year}` : 'End date not specified'}</p><p className="whitespace-pre-wrap">{e.highlights}</p><p className="break-words">{e.skills.join(', ')}</p></div>)}</section>
  </>}
 </div>
}
