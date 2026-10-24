import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { DesignationType, GenderType, TitleType, User } from '@/types'
import { profileApi } from '@/api/profileApi'

function toProperCase(value: string): string {
  return value
    .split(' ')
    .map(word => word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word)
    .join(' ')
}

interface Props {
  profile: User
  open: boolean
  onClose: () => void
  onSaved: (updated: User) => void
}

interface FormState {
  title: TitleType | ''
  first_name: string
  last_name: string
  gender: GenderType | ''
  date_of_birth: string
  user_type: 'SME' | 'PROFESSIONAL_SERVICE_PROVIDER'
  mobile_number: string
  website: string
  linkedin: string
  designation: DesignationType | ''
  company: string
  short_bio: string
  address_flat: string
  address_area: string
  address_city: string
  address_state: string
  address_country: string
  address_pincode: string
}

type Errors = Partial<Record<keyof FormState, string>>

const TITLE_LABELS: Record<TitleType, string> = {
  MR: 'Mr.', MRS: 'Mrs.', MISS: 'Miss', DR: 'Dr.', PROF: 'Prof.',
}

const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: 'MALE',              label: 'Male' },
  { value: 'FEMALE',            label: 'Female' },
  { value: 'OTHER',             label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

const DESIGNATION_OPTIONS: { value: DesignationType; label: string }[] = [
  { value: 'PROFESSOR',      label: 'Professor' },
  { value: 'ASST_PROFESSOR', label: 'Asst. Professor' },
  { value: 'TRAINER',        label: 'Trainer' },
  { value: 'GUEST_FACULTY',  label: 'Guest Faculty' },
]

const ROLE_OPTIONS = [
  { value: 'SME' as const,                          label: 'SME - Subject Matter Expert' },
  { value: 'PROFESSIONAL_SERVICE_PROVIDER' as const, label: 'Professional Service Provider' },
]

function maxDob(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 21)
  return d.toISOString().split('T')[0]
}

// ── Reusable field wrapper ────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────

function Section({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400
                   pb-2 border-b border-slate-100">
      {title}
    </h3>
  )
}

// ── Input / Textarea classes ──────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const disabledCls =
  'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed'

// ── Main component ────────────────────────────────────────────────────────────

export function EditPersonalInfoDrawer({ profile, open, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(blankForm(profile))
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Re-sync form whenever drawer opens
  useEffect(() => {
    if (open) {
      setForm(blankForm(profile))
      setErrors({})
      setToast(null)
    }
  }, [open]) // intentionally omit profile — sync once on open

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 3500)
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [toast])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!form.first_name.trim())               e.first_name = 'First name is required'
    if (!form.last_name.trim())                e.last_name  = 'Last name is required'
    if (!/^\d{10}$/.test(form.mobile_number))  e.mobile_number = 'Enter a valid 10-digit mobile number'
    if (!form.date_of_birth)                   e.date_of_birth = 'Date of birth is required'
    else {
      const dob = new Date(form.date_of_birth)
      const cutoff = new Date()
      cutoff.setFullYear(cutoff.getFullYear() - 21)
      if (dob > cutoff) e.date_of_birth = 'You must be at least 21 years old'
    }
    if (form.website && !/^https?:\/\//i.test(form.website))
      e.website = 'Must start with http:// or https://'
    if (form.linkedin && !/^https?:\/\//i.test(form.linkedin))
      e.linkedin = 'Must start with http:// or https://'
    if (form.address_pincode && !/^\d{1,6}$/.test(form.address_pincode))
      e.address_pincode = 'Pincode must be up to 6 digits'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const payload = {
        title:            form.title           || undefined,
        first_name:       toProperCase(form.first_name.trim()),
        last_name:        toProperCase(form.last_name.trim()),
        gender:           form.gender          || undefined,
        date_of_birth:    form.date_of_birth   || undefined,
        user_type:        form.user_type,
        mobile_number:    form.mobile_number,
        website:          form.website         || undefined,
        linkedin:         form.linkedin        || undefined,
        designation:      form.designation     || undefined,
        company:          form.company.trim()  || undefined,
        short_bio:        form.short_bio.trim() || undefined,
        address_flat:     form.address_flat    || undefined,
        address_area:     form.address_area    || undefined,
        address_city:     form.address_city    || undefined,
        address_state:    form.address_state   || undefined,
        address_country:  form.address_country || undefined,
        address_pincode:  form.address_pincode || undefined,
      }
      const updated = await profileApi.updateProfile(payload)
      onSaved(updated)
      setToast({ type: 'success', message: 'Profile updated successfully.' })
      setTimeout(onClose, 1200)
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
    <>
      {/* Overlay + centering wrapper */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4
                    bg-black/40 transition-opacity duration-200
                    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      >
      {/* Modal box */}
      <div
        className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl
                    flex flex-col max-h-[90vh]
                    transition-all duration-200
                    ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Toast */}
        {toast && (
          <div
            className={`absolute top-4 left-4 right-4 z-10 px-4 py-3 rounded-lg text-sm font-medium
                        shadow-md transition-all
                        ${toast.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border border-red-200 text-red-700'}`}
          >
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between
                        px-5 py-4 border-b border-slate-100 bg-white">
          <h2 className="text-base font-semibold text-slate-800">
            Edit Personal Information
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600
                       hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <Section title="Basic Info" />

          {/* Title pills */}
          <Field label="Title" error={errors.title}>
            <div className="flex flex-wrap gap-2 mt-1">
              {(Object.keys(TITLE_LABELS) as TitleType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setField('title', t)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors
                    ${form.title === t
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 text-slate-600 hover:border-blue-400'}`}
                >
                  {TITLE_LABELS[t]}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name *" error={errors.first_name}>
              <input
                className={inputCls}
                value={form.first_name}
                onChange={e => setField('first_name', toProperCase(e.target.value))}
                placeholder="First name"
              />
            </Field>
            <Field label="Last Name *" error={errors.last_name}>
              <input
                className={inputCls}
                value={form.last_name}
                onChange={e => setField('last_name', toProperCase(e.target.value))}
                placeholder="Last name"
              />
            </Field>
          </div>

          {/* Gender radio */}
          <Field label="Gender" error={errors.gender}>
            <div className="flex flex-wrap gap-3 mt-1">
              {GENDER_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="gender"
                    value={opt.value}
                    checked={form.gender === opt.value}
                    onChange={() => setField('gender', opt.value)}
                    className="accent-blue-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Date of Birth *" error={errors.date_of_birth}>
            <input
              type="date"
              className={inputCls}
              value={form.date_of_birth}
              max={maxDob()}
              onChange={e => setField('date_of_birth', e.target.value)}
            />
          </Field>

          {/* Role radio */}
          <Field label="Role" error={errors.user_type}>
            <div className="flex flex-col gap-2 mt-1">
              {ROLE_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="user_type"
                    value={opt.value}
                    checked={form.user_type === opt.value}
                    onChange={() => setField('user_type', opt.value)}
                    className="accent-blue-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Field>

          {/* ── Contact ─────────────────────────────────────────────────── */}
          <Section title="Contact" />

          <Field label="Email">
            <input className={disabledCls} value={profile.email} disabled />
            <p className="mt-1 text-xs text-slate-400">Change email via Account Settings</p>
          </Field>

          <Field label="Mobile *" error={errors.mobile_number}>
            <div className="flex">
              <span className="flex items-center px-3 text-sm text-slate-500
                               border border-r-0 border-slate-300 rounded-l-lg bg-slate-50">
                +91
              </span>
              <input
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-r-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.mobile_number}
                maxLength={10}
                onChange={e => setField('mobile_number', e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit number"
              />
            </div>
          </Field>

          <Field label="Website" error={errors.website}>
            <input
              className={inputCls}
              value={form.website}
              onChange={e => setField('website', e.target.value)}
              placeholder="https://yoursite.com"
            />
          </Field>

          <Field label="LinkedIn" error={errors.linkedin}>
            <input
              className={inputCls}
              value={form.linkedin}
              onChange={e => setField('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </Field>

          {/* ── Professional ────────────────────────────────────────────── */}
          <Section title="Professional" />

          <Field label="Current Designation" error={errors.designation}>
            <select
              className={inputCls}
              value={form.designation}
              onChange={e => setField('designation', e.target.value as DesignationType | '')}
            >
              <option value="">Select designation</option>
              {DESIGNATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Company / Academy" error={errors.company}>
            <input
              className={inputCls}
              value={form.company}
              onChange={e => setField('company', e.target.value)}
              placeholder="Organisation name"
            />
          </Field>

          <Field label="Short Bio" error={errors.short_bio}>
            <div className="relative">
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                maxLength={500}
                value={form.short_bio}
                onChange={e => setField('short_bio', e.target.value)}
                placeholder="Tell organisations about yourself…"
              />
              <span className="absolute bottom-2 right-3 text-xs text-slate-400">
                {form.short_bio.length}/500
              </span>
            </div>
          </Field>

          {/* ── Address ─────────────────────────────────────────────────── */}
          <Section title="Address" />

          <Field label="Flat / House / Building" error={errors.address_flat}>
            <input
              className={inputCls}
              value={form.address_flat}
              onChange={e => setField('address_flat', e.target.value)}
            />
          </Field>

          <Field label="Area" error={errors.address_area}>
            <input
              className={inputCls}
              value={form.address_area}
              onChange={e => setField('address_area', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City" error={errors.address_city}>
              <input
                className={inputCls}
                value={form.address_city}
                onChange={e => setField('address_city', e.target.value)}
              />
            </Field>
            <Field label="State" error={errors.address_state}>
              <input
                className={inputCls}
                value={form.address_state}
                onChange={e => setField('address_state', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Country" error={errors.address_country}>
              <input
                className={inputCls}
                value={form.address_country}
                onChange={e => setField('address_country', e.target.value)}
              />
            </Field>
            <Field label="Pincode" error={errors.address_pincode}>
              <input
                className={inputCls}
                value={form.address_pincode}
                maxLength={6}
                onChange={e => setField('address_pincode', e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code"
              />
            </Field>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 px-5 py-4 border-t border-slate-100 bg-white">
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
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
      </div>
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function blankForm(profile: User): FormState {
  const safeRole =
    profile.user_type === 'SME' || profile.user_type === 'PROFESSIONAL_SERVICE_PROVIDER'
      ? profile.user_type
      : 'SME'
  return {
    title:            profile.title           ?? '',
    first_name:       profile.first_name      ?? '',
    last_name:        profile.last_name       ?? '',
    gender:           profile.gender          ?? '',
    date_of_birth:    profile.date_of_birth   ?? '',
    user_type:        safeRole,
    mobile_number:    profile.mobile_number   ?? '',
    website:          profile.website         ?? '',
    linkedin:         profile.linkedin        ?? '',
    designation:      profile.designation     ?? '',
    company:          profile.company         ?? '',
    short_bio:        profile.short_bio       ?? '',
    address_flat:     profile.address_flat    ?? '',
    address_area:     profile.address_area    ?? '',
    address_city:     profile.address_city    ?? '',
    address_state:    profile.address_state   ?? '',
    address_country:  profile.address_country ?? '',
    address_pincode:  profile.address_pincode ?? '',
  }
}
