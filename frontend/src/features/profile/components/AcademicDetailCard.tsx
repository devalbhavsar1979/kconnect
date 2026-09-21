import { GraduationCap, Pencil, Trash2 } from 'lucide-react'
import type { AcademicDetail } from '@/types'

interface Props {
  entry: AcademicDetail
  onEdit: () => void
  onDelete: () => void
}

export function AcademicDetailCard({ entry, onEdit, onDelete }: Props) {
  const dateLabel = entry.end_year ? String(entry.end_year) : ''

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {/* Header row */}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-800 leading-snug">
            {entry.school}
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            {entry.degree}
            {entry.field_of_study ? ` · ${entry.field_of_study}` : ''}
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

      {/* Date + grade row */}
      {(dateLabel || entry.grade) && (
        <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
          {dateLabel && (
            <>
              <GraduationCap size={14} className="flex-shrink-0" />
              <span>{dateLabel}</span>
            </>
          )}
          {entry.grade && (
            <>
              <span className="text-slate-300">·</span>
              <span>Grade: {entry.grade}</span>
            </>
          )}
        </div>
      )}

      {/* Description */}
      {entry.description && (
        <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
          {entry.description}
        </p>
      )}
    </div>
  )
}
