import { Briefcase, MapPin, Pencil, Trash2 } from 'lucide-react'
import type { ExperienceEntry } from '@/types'

interface Props {
  entry: ExperienceEntry
  onEdit: () => void
  onDelete: () => void
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME:      'Full-time',
  PART_TIME:      'Part-time',
  FREELANCE:      'Freelance',
  SELF_EMPLOYED:  'Self-employed',
  INTERNSHIP:     'Internship',
  APPRENTICESHIP: 'Apprenticeship',
}

const LOCATION_TYPE_LABELS: Record<string, string> = {
  ONSITE: 'On-Site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
}

function formatDateRange(
  startMonth: number,
  startYear: number,
  endMonth: number | null,
  endYear: number | null,
  isCurrent: boolean,
): { range: string; duration: string } {
  const start    = `${MONTH_SHORT[startMonth - 1]} ${startYear}`
  const endLabel = isCurrent
    ? 'Present'
    : endYear
      ? `${MONTH_SHORT[(endMonth ?? 1) - 1]} ${endYear}`
      : ''

  const range = endLabel ? `${start} – ${endLabel}` : start

  const endDate = isCurrent
    ? new Date()
    : endYear ? new Date(endYear, (endMonth ?? 1) - 1) : null
  const startDate = new Date(startYear, startMonth - 1)

  if (!endDate) return { range, duration: '' }

  const totalMonths = Math.max(
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth()),
    0,
  )
  const yrs = Math.floor(totalMonths / 12)
  const mos = totalMonths % 12
  const parts = [
    yrs > 0 ? `${yrs} yr${yrs > 1 ? 's' : ''}` : '',
    mos > 0 ? `${mos} mo${mos > 1 ? 's' : ''}` : '',
  ].filter(Boolean)

  return { range, duration: parts.join(' ') }
}

export function ExperienceCard({ entry, onEdit, onDelete }: Props) {
  const { range, duration } = formatDateRange(
    entry.start_month, entry.start_year,
    entry.end_month, entry.end_year,
    entry.is_current,
  )

  const locationMeta = [
    entry.location,
    entry.location_type ? LOCATION_TYPE_LABELS[entry.location_type] : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">

      {/* Header row */}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-800 leading-snug">
            {entry.job_title}
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            {entry.organization}
            {entry.employment_type
              ? ` · ${EMPLOYMENT_LABELS[entry.employment_type]}`
              : ''}
          </p>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            aria-label="Edit"
            className="p-1.5 rounded text-slate-400 hover:text-blue-600
                       hover:bg-blue-50 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete"
            className="p-1.5 rounded text-slate-400 hover:text-red-500
                       hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Meta row — location + date */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
        {locationMeta && (
          <>
            <MapPin size={13} className="flex-shrink-0" />
            <span>{locationMeta}</span>
          </>
        )}
        <Briefcase size={13} className="flex-shrink-0" />
        <span>
          {range}
          {duration && (
            <span className="text-slate-400"> · {duration}</span>
          )}
        </span>
      </div>

      {/* Highlights */}
      {entry.highlights && (
        <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-4">
          {entry.highlights}
        </p>
      )}

      {/* Skills */}
      {entry.skills && entry.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.skills.map(skill => (
            <span
              key={skill}
              className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
