import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react'
import { adminCategoriesApi } from '@/api/adminCategoriesApi'
import type { Category, CategoryPayload } from '@/types/admin'

interface ModalProps {
  category: Category | null
  onClose: () => void
  onSaved: (cat: Category) => void
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function CategoryModal({ category, onClose, onSaved }: ModalProps) {
  const [name,    setName]    = useState(category?.name        ?? '')
  const [desc,    setDesc]    = useState(category?.description ?? '')
  const [active,  setActive]  = useState(category?.is_active   ?? true)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError(null)
    try {
      const payload: CategoryPayload = {
        name: name.trim(),
        description: desc.trim() || undefined,
        is_active: active,
      }
      const result = category
        ? await adminCategoriesApi.update(category.id, payload)
        : await adminCategoriesApi.create(payload)
      onSaved(result)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to save category.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              className={inputCls}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Data Science, Leadership"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Brief description of this category"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Active</span>
          </label>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium border border-slate-300 text-slate-600
                       rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg
                       hover:bg-blue-500 transition-colors disabled:opacity-70
                       flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function CategoriesPage() {
  const [categories,   setCategories]   = useState<Category[]>([])
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState<{ open: boolean; cat: Category | null }>({ open: false, cat: null })
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleteLoading, setDelLoading]  = useState(false)

  useEffect(() => {
    adminCategoriesApi.list()
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    setDelLoading(true)
    try {
      await adminCategoriesApi.remove(deleteTarget.id)
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } finally {
      setDelLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage opportunity categories</p>
        </div>
        <button
          onClick={() => setModal({ open: true, cat: null })}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white
                     rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Plus size={15} />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-slate-50 flex items-center gap-4">
                <div className="h-4 bg-slate-100 rounded animate-pulse flex-1" />
                <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No categories yet</p>
            <button
              onClick={() => setModal({ open: true, cat: null })}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Add the first one
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Description</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{cat.name}</td>
                  <td className="px-5 py-3 text-slate-500 hidden sm:table-cell max-w-xs truncate">
                    {cat.description ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full
                                      ${cat.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setModal({ open: true, cat })}
                        className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal.open && (
        <CategoryModal
          category={modal.cat}
          onClose={() => setModal({ open: false, cat: null })}
          onSaved={saved => {
            setCategories(prev =>
              modal.cat
                ? prev.map(c => c.id === saved.id ? saved : c)
                : [saved, ...prev]
            )
            setModal({ open: false, cat: null })
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
             onClick={() => !deleteLoading && setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center"
               onClick={e => e.stopPropagation()}>
            <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">Deactivate this category?</p>
            <p className="text-sm text-slate-500 mt-1">"{deleteTarget.name}" will be marked inactive.</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 text-sm font-medium border border-slate-300 text-slate-600
                           rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg
                           hover:bg-red-500 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {deleteLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                )}
                {deleteLoading ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
