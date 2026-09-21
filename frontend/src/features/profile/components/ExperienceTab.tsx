import { useCallback, useEffect, useState } from 'react'
import { Briefcase, Plus, Trash2 } from 'lucide-react'
import type { ExperienceEntry } from '@/types'
import { experienceApi } from '@/api/experienceApi'
import { ExperienceCard }         from './ExperienceCard'
import { AddEditExperienceModal } from './AddEditExperienceModal'

export function ExperienceTab() {
  const [entries,       setEntries]       = useState<ExperienceEntry[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [modal,         setModal]         = useState<{ open: boolean; entry: ExperienceEntry | null }>({ open: false, entry: null })
  const [deleteTarget,  setDeleteTarget]  = useState<ExperienceEntry | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchEntries = useCallback(() => {
    setLoading(true)
    setError(null)
    experienceApi
      .list()
      .then(setEntries)
      .catch(() => setError('Failed to load experience.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await experienceApi.remove(deleteTarget.id)
      setEntries(prev => prev.filter(e => e.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // entry stays in list; user can retry
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-800">Experience</h2>
        <button
          onClick={() => setModal({ open: true, entry: null })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                     border border-blue-600 text-blue-600 rounded-lg
                     hover:bg-blue-50 transition-colors"
        >
          <Plus size={15} />
          Add Experience
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-4">
          {[0, 1].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm h-28 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-sm">{error}</p>
          <button
            onClick={fetchEntries}
            className="mt-3 text-blue-600 text-sm underline hover:text-blue-500"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <Briefcase size={40} className="text-slate-300 mx-auto" />
          <p className="text-slate-600 font-medium mt-3">No experience added yet</p>
          <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
            Add your work history to showcase your professional background.
          </p>
          <button
            onClick={() => setModal({ open: true, entry: null })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium
                       rounded-lg hover:bg-blue-500 transition-colors"
          >
            Add Experience
          </button>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="space-y-4">
          {entries.map(entry => (
            <ExperienceCard
              key={entry.id}
              entry={entry}
              onEdit={() => setModal({ open: true, entry })}
              onDelete={() => setDeleteTarget(entry)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <AddEditExperienceModal
        entry={modal.entry}
        open={modal.open}
        onClose={() => setModal({ open: false, entry: null })}
        onSaved={(saved) => {
          setEntries(prev =>
            modal.entry
              ? prev.map(e => e.id === saved.id ? saved : e)
              : [saved, ...prev]
          )
          setModal({ open: false, entry: null })
        }}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => !deleteLoading && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center"
            onClick={e => e.stopPropagation()}
          >
            <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">Delete this entry?</p>
            <p className="text-sm text-slate-500 mt-1">
              "{deleteTarget.job_title} at {deleteTarget.organization}" will be permanently removed from your profile.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 text-sm font-medium border border-slate-300
                           text-slate-600 rounded-lg hover:bg-slate-50 transition-colors
                           disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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
    </>
  )
}
