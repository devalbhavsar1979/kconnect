import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { UserExpertise, UserExpertisePayload } from '@/types'
import { expertiseApi } from '@/api/expertiseApi'

interface Props {
  expertise: UserExpertise | null
  open: boolean
  onClose: () => void
  onSaved: (saved: UserExpertise) => void
}

const AUDIENCE_OPTIONS = [
  { value: 'SCHOOL',                label: 'School' },
  { value: 'COLLEGE_UNIVERSITY',    label: 'College / University' },
  { value: 'FRESHERS',              label: 'Freshers' },
  { value: 'WORKING_PROFESSIONALS', label: 'Working Professionals' },
  { value: 'MANAGERS',              label: 'Managers' },
  { value: 'SENIOR_MANAGEMENT',     label: 'Senior Management' },
  { value: 'TECHNICAL_TEAMS',       label: 'Technical Teams' },
  { value: 'NON_TECHNICAL_TEAMS',   label: 'Non-Technical Teams' },
]

interface FormState {
  total_experience    : string
  teaching_experience : string
  corporate_training  : string
  online_training     : string
  classroom_training  : string
  primary_expertise   : string
  secondary_expertise : string
  audience_levels     : string[]
}

type Errors = Partial<Record<keyof FormState, string>>

const BLANK: FormState = {
  total_experience: '', teaching_experience: '', corporate_training: '',
  online_training: '', classroom_training: '', primary_expertise: '',
  secondary_expertise: '', audience_levels: [],
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 pt-1">
      {children}
    </p>
  )
}

export function AddEditExpertiseModal({ expertise, open, onClose, onSaved }: Props) {
  const [form,    setFormState] = useState<FormState>(BLANK)
  const [errors,  setErrors]    = useState<Errors>({})
  const [loading, setLoading]   = useState(false)
  const [toast,   setToast]     = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setFormState(expertise ? {
        total_experience:    expertise.total_experience,
        teaching_experience: expertise.teaching_experience,
        corporate_training:  expertise.corporate_training,
        online_training:     expertise.online_training,
        classroom_training:  expertise.classroom_training,
        primary_expertise:   expertise.primary_expertise,
        secondary_expertise: expertise.secondary_expertise ?? '',
        audience_levels:     expertise.audience_levels,
      } : BLANK)
      setErrors({})
      setToast(null)
    }
  }, [open]) // intentionally omit expertise — sync on open only

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

  function toggleAudience(value: string) {
    setField(
      'audience_levels',
      form.audience_levels.includes(value)
        ? form.audience_levels.filter(v => v !== value)
        : [...form.audience_levels, value],
    )
  }

  function validate(): Errors {
    const e: Errors = {}
    const required: (keyof FormState)[] = [
      'total_experience', 'teaching_experience', 'corporate_training',
      'online_training', 'classroom_training', 'primary_expertise',
    ]
    for (const key of required) {
      if (!(form[key] as string).trim()) e[key] = 'This field is required'
    }
    if (form.audience_levels.length === 0)
      e.audience_levels = 'Select at least one audience level'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload: UserExpertisePayload = {
        total_experience:    form.total_experience.trim(),
        teaching_experience: form.teaching_experience.trim(),
        corporate_training:  form.corporate_training.trim(),
        online_training:     form.online_training.trim(),
        classroom_training:  form.classroom_training.trim(),
        primary_expertise:   form.primary_expertise.trim(),
        secondary_expertise: form.secondary_expertise.trim() || undefined,
        audience_levels:     form.audience_levels,
      }
      const result = await expertiseApi.upsert(payload)
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
            {expertise ? 'Edit Expertise' : 'Add Expertise'}
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

          <SectionHeading>Experience</SectionHeading>

          <Field label="Total Academic / Professional Experience *" error={errors.total_experience}>
            <input
              className={inputCls}
              value={form.total_experience}
              onChange={e => setField('total_experience', e.target.value)}
              placeholder='e.g. "10 years", "5+ years"'
            />
          </Field>

          <Field label="Total Teaching Experience *" error={errors.teaching_experience}>
            <input
              className={inputCls}
              value={form.teaching_experience}
              onChange={e => setField('teaching_experience', e.target.value)}
              placeholder='e.g. "3 years"'
            />
          </Field>

          <Field label="Corporate Training Experience *" error={errors.corporate_training}>
            <input
              className={inputCls}
              value={form.corporate_training}
              onChange={e => setField('corporate_training', e.target.value)}
              placeholder='e.g. "2 years"'
            />
          </Field>

          <Field label="Online Training Experience *" error={errors.online_training}>
            <input
              className={inputCls}
              value={form.online_training}
              onChange={e => setField('online_training', e.target.value)}
              placeholder='e.g. "1 year"'
            />
          </Field>

          <Field label="Classroom Training Experience *" error={errors.classroom_training}>
            <input
              className={inputCls}
              value={form.classroom_training}
              onChange={e => setField('classroom_training', e.target.value)}
              placeholder='e.g. "4 years"'
            />
          </Field>

          <SectionHeading>Expertise</SectionHeading>

          <Field label="Primary Expertise *" error={errors.primary_expertise}>
            <input
              className={inputCls}
              value={form.primary_expertise}
              onChange={e => setField('primary_expertise', e.target.value)}
              placeholder='e.g. "Machine Learning, Data Science"'
            />
          </Field>

          <Field label="Secondary Expertise" error={errors.secondary_expertise}>
            <input
              className={inputCls}
              value={form.secondary_expertise}
              onChange={e => setField('secondary_expertise', e.target.value)}
              placeholder='e.g. "Python, Statistics"'
            />
          </Field>

          {/* Audience section */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 pt-1 mb-2">
              Audience / Training Level Delivered *
            </p>
            {errors.audience_levels && (
              <p className="mb-2 text-xs text-red-500">{errors.audience_levels}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCE_OPTIONS.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.audience_levels.includes(option.value)}
                    onChange={() => toggleAudience(option.value)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
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
