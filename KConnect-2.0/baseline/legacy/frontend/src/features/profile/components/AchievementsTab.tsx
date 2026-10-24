import { useCallback, useEffect, useState } from 'react'
import { Plus, Trophy } from 'lucide-react'
import type { Achievement } from '@/types'
import { achievementsApi } from '@/api/achievementsApi'
import { AchievementCard } from './AchievementCard'
import { AddEditAchievementModal } from './AddEditAchievementModal'

const INFO_CATEGORIES = [
  'Awards', 'Highlights', 'Publications', 'Professional Certification',
  'Research Areas', 'Conferences', 'CV / Resume', 'Profile / Bio',
  'Certifications', 'Academic Certificates', 'Training Credentials', 'Portfolio',
]

export function AchievementsTab() {
  const [entries,       setEntries]       = useState<Achievement[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editTarget,    setEditTarget]    = useState<Achievement | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<Achievement | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchEntries = useCallback(() => {
    setLoading(true)
    setError(null)
    achievementsApi.list()
      .then(data => setEntries(data))
      .catch(() => setError('Failed to load achievements.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  function openAdd() {
    setEditTarget(null)
    setModalOpen(true)
  }

  function openEdit(entry: Achievement) {
    setEditTarget(entry)
    setModalOpen(true)
  }

  function onSaved(saved: Achievement) {
    setEntries(prev =>
      editTarget
        ? prev.map(e => e.id === saved.id ? saved : e)
        : [saved, ...prev],
    )
    setModalOpen(false)
    setEditTarget(null)
  }

  async function onDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await achievementsApi.remove(deleteTarget.id)
      setEntries(prev => prev.filter(e => e.id !== deleteTarget.id))
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Achievements</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                     bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Plus size={15} />
          Add Achievement
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-2">
          What can you add here?
        </p>
        <div className="flex flex-wrap gap-1.5">
          {INFO_CATEGORIES.map(cat => (
            <span
              key={cat}
              className="px-2.5 py-1 text-xs bg-white border border-blue-200 text-blue-600 rounded-full"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm h-32" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <p className="text-slate-500 text-sm">{error}</p>
          <button
            onClick={fetchEntries}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                       hover:bg-blue-500 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <Trophy size={40} className="text-slate-300 mx-auto" />
          <p className="text-slate-600 font-medium mt-3">No achievements added yet</p>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Upload your awards, certifications, publications, CV, and more.
          </p>
          <button
            onClick={openAdd}
            className="mt-5 px-5 py-2 bg-blue-600 text-white text-sm font-medium
                       rounded-lg hover:bg-blue-500 transition-colors"
          >
            Add Achievement
          </button>
        </div>
      )}

      {/* List */}
      {!loading && !error && entries.length > 0 && (
        <div className="space-y-4">
          {entries.map(entry => (
            <AchievementCard
              key={entry.id}
              entry={entry}
              onEdit={() => openEdit(entry)}
              onDelete={() => setDeleteTarget(entry)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <AddEditAchievementModal
        entry={editTarget}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        onSaved={onSaved}
      />

      {/* Delete confirm */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => !deleteLoading && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-800 mb-2">Delete Achievement</h3>
            <p className="text-sm text-slate-600">
              Delete{' '}
              <span className="font-medium">"{deleteTarget.title}"</span>?
              {' '}This cannot be undone.
            </p>
            {deleteTarget.file_path && (
              <p className="text-xs text-slate-400 mt-1">
                The attached file will also be deleted.
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 text-sm font-medium border border-slate-300 text-slate-600
                           rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 py-2.5 text-sm font-medium bg-red-600 text-white
                           rounded-lg hover:bg-red-500 transition-colors disabled:opacity-70
                           flex items-center justify-center gap-2"
              >
                {deleteLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
