import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { ExperienceEntry, ExperienceEntryPayload } from '@/types'
import { experienceApi } from '@/api/experienceApi'

interface Props {
  entry: ExperienceEntry | null
  open: boolean
  onClose: () => void
  onSaved: (saved: ExperienceEntry) => void
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => CURRENT_YEAR - i)

const LOCATION_TYPE_OPTIONS = [
  { value: 'ONSITE', label: 'On-Site' },
  { value: 'HYBRID', label: 'Hybrid'  },
  { value: 'REMOTE', label: 'Remote'  },
]

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME',      label: 'Full-time'      },
  { value: 'PART_TIME',      label: 'Part-time'      },
  { value: 'FREELANCE',      label: 'Freelance'      },
  { value: 'SELF_EMPLOYED',  label: 'Self-employed'  },
  { value: 'INTERNSHIP',     label: 'Internship'     },
  { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
]

interface FormState {
  job_title       : string
  organization    : string
  location        : string
  location_type   : string
  employment_type : string
  is_current      : boolean
  start_month     : string
  start_year      : string
  end_month       : string
  end_year        : string
  highlights      : string
  skills          : string[]
}

type Errors = Partial<Record<keyof FormState, string>>

const BLANK: FormState = {
  job_title: '', organization: '', location: '', location_type: '',
  employment_type: '', is_current: false,
  start_month: '', start_year: '', end_month: '', end_year: '',
  highlights: '', skills: [],
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function toProperCase(value: string): string {
  return value
    .split(' ')
    .map(word => word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word)
    .join(' ')
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function AddEditExperienceModal({ entry, open, onClose, onSaved }: Props) {
  const [form,        setFormState] = useState<FormState>(BLANK)
  const [errors,      setErrors]    = useState<Errors>({})
  const [loading,     setLoading]   = useState(false)
  const [toast,       setToast]     = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [skillInput,  setSkillInput] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setFormState(entry ? {
        job_title:       entry.job_title,
        organization:    entry.organization,
        location:        entry.location        ?? '',
        location_type:   entry.location_type   ?? '',
        employment_type: entry.employment_type ?? '',
        is_current:      entry.is_current,
        start_month:     String(entry.start_month),
        start_year:      String(entry.start_year),
        end_month:       entry.end_month ? String(entry.end_month) : '',
        end_year:        entry.end_year  ? String(entry.end_year)  : '',
        highlights:      entry.highlights ?? '',
        skills:          entry.skills    ?? [],
      } : BLANK)
      setErrors({})
      setToast(null)
      setSkillInput('')
    }
  }, [open]) // intentionally omit entry — sync on open only

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

  function addSkill() {
    const t = skillInput.trim()
    if (!t || form.skills.includes(t) || form.skills.length >= 20) return
    setField('skills', [...form.skills, t])
    setSkillInput('')
  }

  function removeSkill(s: string) {
    setField('skills', form.skills.filter(x => x !== s))
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!form.job_title.trim())    e.job_title    = 'Job title is required'
    if (!form.organization.trim()) e.organization = 'Organization / Institute is required'
    if (!form.start_month)         e.start_month  = 'Start month is required'
    if (!form.start_year)          e.start_year   = 'Start year is required'
    if (!form.is_current && Boolean(form.end_month) !== Boolean(form.end_year))
      e.end_month = 'Select both month and year'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload: ExperienceEntryPayload = {
        job_title:       toProperCase(form.job_title.trim()),
        organization:    toProperCase(form.organization.trim()),
        location:        form.location.trim()        || undefined,
        location_type:   (form.location_type   as ExperienceEntryPayload['location_type'])   || undefined,
        employment_type: (form.employment_type as ExperienceEntryPayload['employment_type']) || undefined,
        is_current:      form.is_current,
        start_month:     parseInt(form.start_month),
        start_year:      parseInt(form.start_year),
        end_month:  (!form.is_current && form.end_month) ? parseInt(form.end_month) : undefined,
        end_year:   (!form.is_current && form.end_year)  ? parseInt(form.end_year)  : undefined,
        highlights:  form.highlights.trim()  || undefined,
        skills:      form.skills.length > 0  ? form.skills : undefined,
      }
      const result = entry
        ? await experienceApi.update(entry.id, payload)
        : await experienceApi.create(payload)
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
            {entry ? 'Edit Experience' : 'Add Experience'}
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

          <Field label="Job Title *" error={errors.job_title}>
            <input
              className={inputCls}
              value={form.job_title}
              onChange={e => setField('job_title', toProperCase(e.target.value))}
              placeholder="e.g. Senior Data Scientist"
            />
          </Field>

          <Field label="Organization / Institute *" error={errors.organization}>
            <input
              className={inputCls}
              value={form.organization}
              onChange={e => setField('organization', toProperCase(e.target.value))}
              placeholder="Company or institution name"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Employment Type">
              <select
                className={inputCls}
                value={form.employment_type}
                onChange={e => setField('employment_type', e.target.value)}
              >
                <option value="">Select type</option>
                {EMPLOYMENT_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Location Type">
              <select
                className={inputCls}
                value={form.location_type}
                onChange={e => setField('location_type', e.target.value)}
              >
                <option value="">Select type</option>
                {LOCATION_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Location">
            <input
              className={inputCls}
              value={form.location}
              onChange={e => setField('location', e.target.value)}
              placeholder="e.g. Mumbai, India"
            />
          </Field>

          <Field label="Start Date *" error={errors.start_month ?? errors.start_year}>
            <div className="grid grid-cols-2 gap-3">
              <select
                className={inputCls}
                value={form.start_month}
                onChange={e => setField('start_month', e.target.value)}
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                className={inputCls}
                value={form.start_year}
                onChange={e => setField('start_year', e.target.value)}
              >
                <option value="">Year</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </Field>

          {/* Currently working checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_current}
              onChange={e => {
                setField('is_current', e.target.checked)
                if (e.target.checked) {
                  setField('end_month', '')
                  setField('end_year', '')
                }
              }}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">I currently work here</span>
          </label>

          {/* End Date — only shown when not current */}
          {!form.is_current && (
            <Field label="End Date" error={errors.end_month}>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={inputCls}
                  value={form.end_month}
                  onChange={e => setField('end_month', e.target.value)}
                >
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  className={inputCls}
                  value={form.end_year}
                  onChange={e => setField('end_year', e.target.value)}
                >
                  <option value="">Year</option>
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </Field>
          )}

          <Field label="Highlights">
            <div className="relative">
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                maxLength={1000}
                value={form.highlights}
                onChange={e => setField('highlights', e.target.value)}
                placeholder="Key responsibilities and achievements…"
              />
              <span className="absolute bottom-2 right-3 text-xs text-slate-400">
                {form.highlights.length}/1000
              </span>
            </div>
          </Field>

          <Field label="Skills">
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.skills.map(skill => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-400 hover:text-blue-600 leading-none"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              className={inputCls}
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addSkill()
                }
              }}
              onBlur={addSkill}
              placeholder="Type a skill and press Enter"
              disabled={form.skills.length >= 20}
            />
            <p className="mt-1 text-xs text-slate-400">{form.skills.length}/20 skills added</p>
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
