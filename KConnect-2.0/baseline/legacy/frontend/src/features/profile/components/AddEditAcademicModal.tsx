import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { AcademicDetail, AcademicDetailPayload } from '@/types'
import { academicApi } from '@/api/academicApi'

interface Props {
  entry: AcademicDetail | null
  open: boolean
  onClose: () => void
  onSaved: (saved: AcademicDetail) => void
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i)

interface FormState {
  school: string
  degree: string
  field_of_study: string
  end_year: string
  grade: string
  description: string
}

type Errors = Partial<Record<keyof FormState, string>>

const BLANK: FormState = {
  school: '', degree: '', field_of_study: '',
  end_year: '', grade: '', description: '',
}

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

export function AddEditAcademicModal({ entry, open, onClose, onSaved }: Props) {
  const [form, setForm]       = useState<FormState>(BLANK)
  const [errors, setErrors]   = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setForm(entry ? {
        school:         entry.school,
        degree:         entry.degree,
        field_of_study: entry.field_of_study ?? '',
        end_year:       entry.end_year  ? String(entry.end_year)  : '',
        grade:          entry.grade       ?? '',
        description:    entry.description ?? '',
      } : BLANK)
      setErrors({})
      setToast(null)
    }
  }, [open]) // sync once on open; intentionally omit entry

  useEffect(() => {
    if (toast) {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 3500)
    }
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [toast])

  function setField<K extends keyof FormState>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!form.school.trim())  e.school  = 'Institution is required'
    if (!form.degree.trim())  e.degree  = 'Degree is required'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload: AcademicDetailPayload = {
        school:         form.school.trim(),
        degree:         form.degree.trim(),
        field_of_study: form.field_of_study.trim()  || undefined,
        end_year:       form.end_year   ? parseInt(form.end_year)   : undefined,
        grade:          form.grade.trim()        || undefined,
        description:    form.description.trim()  || undefined,
      }
      const result = entry
        ? await academicApi.update(entry.id, payload)
        : await academicApi.create(payload)
      onSaved(result)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? (detail as { msg?: string }[]).map(d => d.msg ?? '').filter(Boolean).join('; ')
          : 'Failed to save. Please try again.'
      setToast({ type: 'error', message: msg })
    } finally {
      setLoading(false)
    }
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
            {entry ? 'Edit Education' : 'Add Education'}
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

          <Field label="Degree *" error={errors.degree}>
            <input
              className={inputCls}
              value={form.degree}
              onChange={e => setField('degree', e.target.value)}
              placeholder="e.g. B.Tech, M.Sc, MBA, Ph.D"
            />
          </Field>

          <Field label="Field of Study">
            <input
              className={inputCls}
              value={form.field_of_study}
              onChange={e => setField('field_of_study', e.target.value)}
              placeholder="e.g. Computer Science, Data Science"
            />
          </Field>

          <Field label="Institution *" error={errors.school}>
            <input
              className={inputCls}
              value={form.school}
              onChange={e => setField('school', e.target.value)}
              placeholder="University, college, or institution name"
            />
          </Field>

          <Field label="Completion Year" error={errors.end_year}>
            <select
              className={inputCls}
              value={form.end_year}
              onChange={e => setField('end_year', e.target.value)}
            >
              <option value="">Select year</option>
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </Field>

          <Field label="Grade" error={errors.grade}>
            <input
              className={inputCls}
              value={form.grade}
              onChange={e => setField('grade', e.target.value)}
              placeholder="e.g. 8.5 CGPA, First Class"
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <div className="relative">
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                maxLength={500}
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Activities, achievements, thesis topic…"
              />
              <span className="absolute bottom-2 right-3 text-xs text-slate-400">
                {form.description.length}/500
              </span>
            </div>
          </Field>

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
