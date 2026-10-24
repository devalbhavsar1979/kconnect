export interface Applicant {
 id: string; name: string; role: string; latest_degree: string | null; completion_year: number | null; experience_months: number | null; skills: string[]
}
export const roleLabel = (role: string) => role === 'SME' ? 'SME' : role.toLowerCase().split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
export function ApplicantSummary({ applicant: a }: { applicant: Applicant }) {
 const months = a.experience_months
 return <dl className="grid gap-3 text-sm sm:grid-cols-3">
  <div><dt className="text-xs text-slate-500">Role</dt><dd>{roleLabel(a.role)}</dd></div>
  <div><dt className="text-xs text-slate-500">Latest Degree</dt><dd>{a.latest_degree ? `${a.latest_degree} (${a.completion_year})` : 'Not specified'}</dd></div>
  <div><dt className="text-xs text-slate-500">Total Experience</dt><dd>{months === null ? 'Not specified' : `${Math.floor(months / 12)} years ${months % 12} months`}</dd><p className="text-xs text-slate-500">From earliest start date to today</p></div>
  <div className="sm:col-span-3"><dt className="text-xs text-slate-500 mb-1">Skills</dt><dd className="flex flex-wrap gap-1.5">{a.skills.length ? a.skills.map(skill => <span key={skill} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 break-words max-w-full">{skill}</span>) : 'Not specified'}</dd></div>
 </dl>
}
