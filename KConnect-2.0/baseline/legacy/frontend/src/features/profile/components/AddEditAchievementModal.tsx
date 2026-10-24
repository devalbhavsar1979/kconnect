import { useEffect, useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'
import type { Achievement } from '@/types'
import { achievementsApi } from '@/api/achievementsApi'

interface Props {
  entry: Achievement | null
  open: boolean
  onClose: () => void
  onSaved: (saved: Achievement) => void
}

type FileAction = 'keep' | 'new' | 'clear'

interface FormState {
  title       : string
  description : string
}

type Errors = Partial<Record<keyof FormState, string>>

const BLANK: FormState = { title: '', description: '' }

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function AddEditAchievementModal({ entry, open, onClose, onSaved }: Props) {
  const [form,        setFormState] = useState<FormState>(BLANK)
  const [errors,      setErrors]    = useState<Errors>({})
  const [loading,     setLoading]   = useState(false)
  const [toast,       setToast]     = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [fileAction,  setFileAction] = useState<FileAction>('keep')
  const [newFile,     setNewFile]   = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setFormState(entry ? { title: entry.title, description: entry.description } : BLANK)
      setErrors({})
      setToast(null)
      setFileAction('keep')
      setNewFile(null)
    }
  }, [open]) // sync on open only

  useEffect(() => {
    if (toast) {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 3500)
    }
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [toast])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setNewFile(f)
    if (f) setFileAction('new')
  }

  function computedFile(): File | null | undefined {
    if (fileAction === 'new')   return newFile
    if (fileAction === 'clear') return null
    return undefined
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        file:        computedFile(),
      }
      const result = entry
        ? await achievementsApi.update(entry.id, payload)
        : await achievementsApi.create(payload)
      onSaved(result)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Failed to save. Please try again.'
      setToast({ type: 'error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  // ── File UI helpers ───────────────────────────────────────────────────────

  function FileSection() {
    // Edit mode — entry has existing file
    if (entry && entry.file_path) {
      if (fileAction === 'keep') {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
              <Paperclip size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 truncate flex-1">
                {entry.file_name ?? 'Attachment'}
              </span>
              <button
                type="button"
                onClick={() => { setFileAction('new'); fileInputRef.current?.click() }}
                className="text-xs text-blue-600 hover:underline flex-shrink-0"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => setFileAction('clear')}
                className="text-xs text-red-500 hover:underline flex-shrink-0"
              >
                Remove
              </button>
            </div>
          </div>
        )
      }

      if (fileAction === 'clear') {
        return (
          <div className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
            <span className="text-sm text-slate-500 italic flex-1">File will be removed on save</span>
            <button
              type="button"
              onClick={() => setFileAction('keep')}
              className="text-xs text-blue-600 hover:underline flex-shrink-0"
            >
              Undo
            </button>
          </div>
        )
      }

      // fileAction === 'new'
      return <FileBrowse />
    }

    // Create mode or edit mode with no existing file
    return <FileBrowse />
  }

  function FileBrowse() {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 rounded-lg
                       text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <Paperclip size={14} />
            Browse file
          </button>
          {entry && entry.file_path && fileAction === 'new' && (
            <button
              type="button"
              onClick={() => { setFileAction('keep'); setNewFile(null) }}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
        {newFile && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-md w-fit">
            <span className="text-xs text-blue-700 truncate max-w-xs">{newFile.name}</span>
            <button
              type="button"
              onClick={() => { setNewFile(null); if (entry?.file_path) setFileAction('keep') }}
              className="text-blue-400 hover:text-blue-600"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <p className="text-xs text-slate-400">PDF, JPG, PNG or DOCX · Max 10 MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4
                  bg-black/40 transition-opacity duration-200
                  ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg bg-white rounded-2xl shadow-2xl
                    flex flex-col max-h-[90vh]
                    transition-all duration-200
                    ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Toast */}
        {toast && (
          <div className={`absolute top-4 left-4 right-4 z-10 px-4 py-3 rounded-lg text-sm font-medium shadow-md
                           ${toast.type === 'success'
                             ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                             : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {entry ? 'Edit Achievement' : 'Add Achievement'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          <Field label="Title *" error={errors.title}>
            <input
              className={inputCls}
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="e.g. Best Trainer Award 2023"
            />
          </Field>

          <Field label="Description *" error={errors.description}>
            <div className="relative">
              <textarea
                className={`${inputCls} resize-none`}
                rows={5}
                maxLength={2000}
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Describe the achievement, publication, certification, or document…"
              />
              <span className="absolute bottom-2 right-3 text-xs text-slate-400">
                {form.description.length}/2000
              </span>
            </div>
          </Field>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attachment <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <FileSection />
          </div>

        </div>

        {/* Footer */}
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
            className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white
                       rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-70
                       flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
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
