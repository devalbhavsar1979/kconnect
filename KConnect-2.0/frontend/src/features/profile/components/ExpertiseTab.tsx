import { useCallback, useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import type { UserExpertise, UserExpertisePayload } from '@/types'
import { expertiseApi } from '@/api/expertiseApi'
import { ExpertiseCard } from './ExpertiseCard'

// ── Form constants ────────────────────────────────────────────────────────────

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

type FormErrors = Partial<Record<keyof FormState, string>>

const BLANK: FormState = {
  total_experience: '', teaching_experience: '', corporate_training: '',
  online_training: '', classroom_training: '', primary_expertise: '',
  secondary_expertise: '', audience_levels: [],
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function fromExpertise(e: UserExpertise): FormState {
  return {
    total_experience:    e.total_experience,
    teaching_experience: e.teaching_experience,
    corporate_training:  e.corporate_training,
    online_training:     e.online_training,
    classroom_training:  e.classroom_training,
    primary_expertise:   e.primary_expertise,
    secondary_expertise: e.secondary_expertise ?? '',
    audience_levels:     e.audience_levels,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2 pb-1">
      {children}
    </p>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ExpertiseTab() {
  const [expertise,  setExpertise] = useState<UserExpertise | null>(null)
  const [loading,    setLoading]   = useState(true)
  const [error,      setError]     = useState<string | null>(null)

  // Form state
  const [isEditing,  setIsEditing] = useState(false)
  const [form,       setFormState] = useState<FormState>(BLANK)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [saving,     setSaving]    = useState(false)
  const [saveError,  setSaveError] = useState<string | null>(null)

  const fetchExpertise = useCallback(() => {
    setLoading(true)
    setError(null)
    expertiseApi.get()
      .then(data => setExpertise(data))
      .catch(() => setError('Failed to load expertise.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchExpertise() }, [fetchExpertise])

  function startEdit() {
    setFormState(expertise ? fromExpertise(expertise) : BLANK)
    setFormErrors({})
    setSaveError(null)
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState(f => ({ ...f, [key]: value }))
    setFormErrors(e => ({ ...e, [key]: undefined }))
  }

  function toggleAudience(value: string) {
    setField(
      'audience_levels',
      form.audience_levels.includes(value)
        ? form.audience_levels.filter(v => v !== value)
        : [...form.audience_levels, value],
    )
  }

  function validate(): FormErrors {
    const e: FormErrors = {}
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
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setSaving(true)
    setSaveError(null)
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
      const saved = await expertiseApi.upsert(payload)
      setExpertise(saved)
      setIsEditing(false)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Failed to save. Please try again.'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-xl shadow-sm h-40" />
        <div className="bg-white rounded-xl shadow-sm h-40" />
        <div className="bg-white rounded-xl shadow-sm h-40" />
      </div>
    )
  }

  // ── Fetch error ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <p className="text-slate-500 text-sm">{error}</p>
        <button
          onClick={fetchExpertise}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                     hover:bg-blue-500 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // ── Inline form ─────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* Form header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-semibold text-slate-800">
            {expertise ? 'Edit Expertise' : 'Add Expertise'}
          </h2>
          <button
            onClick={cancelEdit}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>

        {saveError && (
          <div className="px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
            {saveError}
          </div>
        )}

        <SectionHeading>Experience</SectionHeading>

        <Field label="Total Academic / Professional Experience *" error={formErrors.total_experience}>
          <input
            className={inputCls}
            value={form.total_experience}
            onChange={e => setField('total_experience', e.target.value)}
            placeholder='e.g. "10 years", "5+ years"'
          />
        </Field>

        <Field label="Total Teaching Experience *" error={formErrors.teaching_experience}>
          <input
            className={inputCls}
            value={form.teaching_experience}
            onChange={e => setField('teaching_experience', e.target.value)}
            placeholder='e.g. "3 years"'
          />
        </Field>

        <Field label="Corporate Training Experience *" error={formErrors.corporate_training}>
          <input
            className={inputCls}
            value={form.corporate_training}
            onChange={e => setField('corporate_training', e.target.value)}
            placeholder='e.g. "2 years"'
          />
        </Field>

        <Field label="Online Training Experience *" error={formErrors.online_training}>
          <input
            className={inputCls}
            value={form.online_training}
            onChange={e => setField('online_training', e.target.value)}
            placeholder='e.g. "1 year"'
          />
        </Field>

        <Field label="Classroom Training Experience *" error={formErrors.classroom_training}>
          <input
            className={inputCls}
            value={form.classroom_training}
            onChange={e => setField('classroom_training', e.target.value)}
            placeholder='e.g. "4 years"'
          />
        </Field>

        <SectionHeading>Expertise</SectionHeading>

        <Field label="Primary Expertise *" error={formErrors.primary_expertise}>
          <input
            className={inputCls}
            value={form.primary_expertise}
            onChange={e => setField('primary_expertise', e.target.value)}
            placeholder='e.g. "Machine Learning, Data Science"'
          />
        </Field>

        <Field label="Secondary Expertise">
          <input
            className={inputCls}
            value={form.secondary_expertise}
            onChange={e => setField('secondary_expertise', e.target.value)}
            placeholder='e.g. "Python, Statistics"'
          />
        </Field>

        {/* Audience */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2 pb-2">
            Audience / Training Level Delivered *
          </p>
          {formErrors.audience_levels && (
            <p className="mb-2 text-xs text-red-500">{formErrors.audience_levels}</p>
          )}
          <div className="grid grid-cols-2 gap-2.5">
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

        {/* Form footer */}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={cancelEdit}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-medium border border-slate-300 text-slate-600
                       rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white
                       rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-70
                       flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (expertise === null) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-10 text-center">
        <Zap size={40} className="text-slate-300 mx-auto" />
        <p className="text-slate-600 font-medium mt-3">No expertise added yet</p>
        <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
          Add your expertise profile to let organisations know your training background and delivery experience.
        </p>
        <button
          onClick={startEdit}
          className="mt-5 px-5 py-2 bg-blue-600 text-white text-sm font-medium
                     rounded-lg hover:bg-blue-500 transition-colors"
        >
          Add Expertise
        </button>
      </div>
    )
  }

  // ── Card view ───────────────────────────────────────────────────────────────
  return <ExpertiseCard expertise={expertise} onEdit={startEdit} />
}
