import { Pencil } from 'lucide-react'
import type { UserExpertise } from '@/types'

interface Props {
  expertise: UserExpertise
  onEdit: () => void
}

const AUDIENCE_LABELS: Record<string, string> = {
  SCHOOL:                'School',
  COLLEGE_UNIVERSITY:    'College / University',
  FRESHERS:              'Freshers',
  WORKING_PROFESSIONALS: 'Working Professionals',
  MANAGERS:              'Managers',
  SENIOR_MANAGEMENT:     'Senior Management',
  TECHNICAL_TEAMS:       'Technical Teams',
  NON_TECHNICAL_TEAMS:   'Non-Technical Teams',
}

const EXPERIENCE_ROWS = [
  { key: 'total_experience',    label: 'Total Academic / Professional Experience' },
  { key: 'teaching_experience', label: 'Total Teaching Experience' },
  { key: 'corporate_training',  label: 'Corporate Training Experience' },
  { key: 'online_training',     label: 'Online Training Experience' },
  { key: 'classroom_training',  label: 'Classroom Training Experience' },
] as const

export function ExpertiseCard({ expertise, onEdit }: Props) {
  return (
    <div className="space-y-4">

      {/* Section 1 — Experience Stats */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Experience
          </h3>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                       text-slate-600 border border-slate-300 rounded-lg
                       hover:bg-slate-50 transition-colors"
          >
            <Pencil size={13} />
            Edit
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {EXPERIENCE_ROWS.map(row => (
            <div key={row.key} className="flex py-2.5 gap-3">
              <span className="w-64 text-sm text-slate-500 shrink-0">{row.label}</span>
              <span className="text-sm font-medium text-slate-800">{expertise[row.key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 — Expertise Focus */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
          Expertise
        </h3>
        <div className="divide-y divide-slate-100">
          <div className="flex py-2.5 gap-3">
            <span className="w-64 text-sm text-slate-500 shrink-0">Primary Expertise</span>
            <span className="text-sm font-medium text-slate-800">{expertise.primary_expertise}</span>
          </div>
          {expertise.secondary_expertise && (
            <div className="flex py-2.5 gap-3">
              <span className="w-64 text-sm text-slate-500 shrink-0">Secondary Expertise</span>
              <span className="text-sm font-medium text-slate-800">{expertise.secondary_expertise}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 3 — Audience */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
          Audience / Training Level Delivered
        </h3>
        <div className="flex flex-wrap gap-2">
          {expertise.audience_levels.map(level => (
            <span
              key={level}
              className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700
                         rounded-full border border-blue-200"
            >
              {AUDIENCE_LABELS[level] ?? level}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
