import { Paperclip, Pencil, Trash2 } from 'lucide-react'
import type { Achievement } from '@/types'

interface Props {
  entry: Achievement
  onEdit: () => void
  onDelete: () => void
}

export function AchievementCard({ entry, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-800 leading-snug">{entry.title}</h3>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            aria-label="Edit achievement"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete achievement"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap line-clamp-4">
        {entry.description}
      </p>

      {/* File attachment */}
      {entry.file_path && (
        <div className="mt-3">
          <a
            href={`/${entry.file_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
          >
            <Paperclip size={13} />
            {entry.file_name ?? 'Attachment'}
          </a>
        </div>
      )}
    </div>
  )
}
