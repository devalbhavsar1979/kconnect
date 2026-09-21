import { useCallback, useEffect, useState } from 'react'
import { Settings, X } from 'lucide-react'
import type { UserPreferences, UserPreferencesPayload } from '@/types'
import { preferencesApi } from '@/api/preferencesApi'
import { PreferencesCard } from './PreferencesCard'

// ── Constants ─────────────────────────────────────────────────────────────────

const DELIVERY_OPTIONS  = [
  { value: 'CLASSROOM',         label: 'Classroom' },
  { value: 'ONLINE',            label: 'Online' },
  { value: 'HYBRID',            label: 'Hybrid' },
  { value: 'OFFLINE_RECORDING', label: 'Offline Session Recording' },
]

const GEO_OPTIONS = [
  { value: 'MY_CITY',             label: 'My City' },
  { value: 'NEARBY_CITIES',       label: 'Nearby Cities' },
  { value: 'ENTIRE_STATE',        label: 'Entire State' },
  { value: 'NEIGHBOURING_STATES', label: 'Neighbouring States' },
  { value: 'PAN_INDIA',           label: 'Pan India' },
  { value: 'REMOTE_ONLINE',       label: 'Remote / Online' },
]

const AUDIENCE_OPTIONS = [
  { value: 'WORKING_PROFESSIONALS',         label: 'Working Professionals' },
  { value: 'COLLEGE_UNIVERSITY_INSTITUTES', label: 'College / University / Institutes' },
  { value: 'MANAGEMENT',                    label: 'Management' },
  { value: 'SENIOR_MANAGEMENT',             label: 'Sr. Management' },
]

const SERVICE_OPTIONS = [
  { value: 'LECTURE_TRAINING', label: 'Lecture / Training Session' },
  { value: 'WORKSHOP',         label: 'Workshop' },
  { value: 'TRANSLATION',      label: 'Translation' },
  { value: 'PROOFREADING',     label: 'Proofreading' },
  { value: 'CONTENT_REVIEW',   label: 'Content Review' },
]

const DISTANCE_OPTIONS = ['25 km', '50 km', '100 km', '200 km', '500 km', 'Any distance']

// ── Form types ────────────────────────────────────────────────────────────────

interface FormState {
  delivery_modes        : string[]
  geographic_preference : string[]
  willing_to_travel     : boolean | null
  max_travel_distance   : string
  travel_reimbursement  : boolean | null
  preferred_audience    : string[]
  services              : string[]
  training_topics       : string[]
}

type FormErrors = Partial<Record<keyof FormState, string>>

const BLANK: FormState = {
  delivery_modes: [], geographic_preference: [], willing_to_travel: null,
  max_travel_distance: '', travel_reimbursement: null, preferred_audience: [],
  services: [], training_topics: [],
}

function fromPreferences(p: UserPreferences): FormState {
  return {
    delivery_modes:        p.delivery_modes,
    geographic_preference: p.geographic_preference,
    willing_to_travel:     p.willing_to_travel,
    max_travel_distance:   p.max_travel_distance ?? '',
    travel_reimbursement:  p.travel_reimbursement,
    preferred_audience:    p.preferred_audience,
    services:              p.services,
    training_topics:       p.training_topics,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2 pb-1">
      {children}
    </p>
  )
}

function CheckboxGrid({
  options,
  selected,
  onToggle,
  cols = 2,
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
  cols?: number
}) {
  return (
    <div className={`grid grid-cols-${cols} gap-2.5`}>
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => onToggle(opt.value)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-500">{message}</p>
}

// ── Main component ────────────────────────────────────────────────────────────

export function PreferencesTab() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  const [isEditing,   setIsEditing]   = useState(false)
  const [form,        setFormState]   = useState<FormState>(BLANK)
  const [formErrors,  setFormErrors]  = useState<FormErrors>({})
  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState<string | null>(null)
  const [topicInput,  setTopicInput]  = useState('')

  const fetchPreferences = useCallback(() => {
    setLoading(true)
    setError(null)
    preferencesApi.get()
      .then(data => setPreferences(data))
      .catch(() => setError('Failed to load preferences.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchPreferences() }, [fetchPreferences])

  function startEdit() {
    setFormState(preferences ? fromPreferences(preferences) : BLANK)
    setFormErrors({})
    setSaveError(null)
    setTopicInput('')
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState(f => ({ ...f, [key]: value }))
    setFormErrors(e => ({ ...e, [key]: undefined }))
  }

  function toggleArray(field: keyof FormState, value: string) {
    const current = form[field] as string[]
    setField(
      field,
      current.includes(value) ? current.filter(v => v !== value) : [...current, value],
    )
  }

  function addTopic() {
    const t = topicInput.trim()
    if (!t || form.training_topics.includes(t) || form.training_topics.length >= 50) return
    setField('training_topics', [...form.training_topics, t])
    setTopicInput('')
    setFormErrors(e => ({ ...e, training_topics: undefined }))
  }

  function removeTopic(t: string) {
    setField('training_topics', form.training_topics.filter(x => x !== t))
  }

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (form.delivery_modes.length === 0)        e.delivery_modes        = 'Select at least one delivery mode'
    if (form.geographic_preference.length === 0) e.geographic_preference = 'Select at least one geographic preference'
    if (form.willing_to_travel === null)          e.willing_to_travel     = 'Please select Yes or No'
    if (form.willing_to_travel === true && !form.max_travel_distance)
                                                  e.max_travel_distance   = 'Select maximum travel distance'
    if (form.travel_reimbursement === null)       e.travel_reimbursement  = 'Please select Yes or No'
    if (form.preferred_audience.length === 0)    e.preferred_audience    = 'Select at least one audience'
    if (form.services.length === 0)              e.services              = 'Select at least one service'
    if (form.training_topics.length === 0)       e.training_topics       = 'Add at least one training topic'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setSaving(true)
    setSaveError(null)
    try {
      const payload: UserPreferencesPayload = {
        delivery_modes:        form.delivery_modes,
        geographic_preference: form.geographic_preference,
        willing_to_travel:     form.willing_to_travel as boolean,
        max_travel_distance:   (form.willing_to_travel && form.max_travel_distance)
                                 ? form.max_travel_distance : undefined,
        travel_reimbursement:  form.travel_reimbursement as boolean,
        preferred_audience:    form.preferred_audience,
        services:              form.services,
        training_topics:       form.training_topics,
      }
      const saved = await preferencesApi.upsert(payload)
      setPreferences(saved)
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

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm h-40" />
        ))}
      </div>
    )
  }

  // ── Fetch error ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <p className="text-slate-500 text-sm">{error}</p>
        <button
          onClick={fetchPreferences}
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
            {preferences ? 'Edit Preferences' : 'Set Preferences'}
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

        {/* Delivery Mode */}
        <div>
          <SectionHeading>Delivery Mode *</SectionHeading>
          <FieldError message={formErrors.delivery_modes} />
          <div className="mt-2">
            <CheckboxGrid
              options={DELIVERY_OPTIONS}
              selected={form.delivery_modes}
              onToggle={v => toggleArray('delivery_modes', v)}
            />
          </div>
        </div>

        {/* Geographic Preference */}
        <div>
          <SectionHeading>Geographic Preference *</SectionHeading>
          <FieldError message={formErrors.geographic_preference} />
          <div className="mt-2">
            <CheckboxGrid
              options={GEO_OPTIONS}
              selected={form.geographic_preference}
              onToggle={v => toggleArray('geographic_preference', v)}
            />
          </div>
        </div>

        {/* Travel */}
        <div className="space-y-4">
          <SectionHeading>Travel</SectionHeading>

          {/* Willing to Travel */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Willing to Travel *</p>
            <div className="flex gap-6">
              {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
                <label key={String(opt.val)} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="willing_to_travel"
                    checked={form.willing_to_travel === opt.val}
                    onChange={() => {
                      setField('willing_to_travel', opt.val)
                      if (!opt.val) setField('max_travel_distance', '')
                    }}
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            <FieldError message={formErrors.willing_to_travel} />
          </div>

          {/* Max Travel Distance — conditional */}
          {form.willing_to_travel === true && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Maximum Travel Distance *
              </label>
              <select
                value={form.max_travel_distance}
                onChange={e => setField('max_travel_distance', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select distance</option>
                {DISTANCE_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <FieldError message={formErrors.max_travel_distance} />
            </div>
          )}

          {/* Travel Reimbursement */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Travel Reimbursement Required *</p>
            <div className="flex gap-6">
              {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
                <label key={String(opt.val)} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="travel_reimbursement"
                    checked={form.travel_reimbursement === opt.val}
                    onChange={() => setField('travel_reimbursement', opt.val)}
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            <FieldError message={formErrors.travel_reimbursement} />
          </div>
        </div>

        {/* Preferred Audience */}
        <div>
          <SectionHeading>Preferred Audience *</SectionHeading>
          <FieldError message={formErrors.preferred_audience} />
          <div className="mt-2">
            <CheckboxGrid
              options={AUDIENCE_OPTIONS}
              selected={form.preferred_audience}
              onToggle={v => toggleArray('preferred_audience', v)}
            />
          </div>
        </div>

        {/* Services */}
        <div>
          <SectionHeading>Services I Can Deliver *</SectionHeading>
          <FieldError message={formErrors.services} />
          <div className="mt-2">
            <CheckboxGrid
              options={SERVICE_OPTIONS}
              selected={form.services}
              onToggle={v => toggleArray('services', v)}
            />
          </div>
        </div>

        {/* Training Topics */}
        <div>
          <SectionHeading>Training Topics I Can Deliver *</SectionHeading>
          <FieldError message={formErrors.training_topics} />
          {form.training_topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
              {form.training_topics.map(topic => (
                <span
                  key={topic}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => removeTopic(topic)}
                    className="text-slate-400 hover:text-slate-600 leading-none"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={topicInput}
            onChange={e => setTopicInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTopic() }
            }}
            onBlur={addTopic}
            placeholder="Type a topic and press Enter"
            disabled={form.training_topics.length >= 50}
          />
          <p className="mt-1 text-xs text-slate-400">{form.training_topics.length}/50 topics added</p>
        </div>

        {/* Footer */}
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
  if (preferences === null) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-10 text-center">
        <Settings size={40} className="text-slate-300 mx-auto" />
        <p className="text-slate-600 font-medium mt-3">No preferences set yet</p>
        <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
          Set your delivery preferences so organisations know how and where you can deliver training.
        </p>
        <button
          onClick={startEdit}
          className="mt-5 px-5 py-2 bg-blue-600 text-white text-sm font-medium
                     rounded-lg hover:bg-blue-500 transition-colors"
        >
          Set Preferences
        </button>
      </div>
    )
  }

  // ── Card view ───────────────────────────────────────────────────────────────
  return <PreferencesCard preferences={preferences} onEdit={startEdit} />
}
