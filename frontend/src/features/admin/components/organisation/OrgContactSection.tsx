import type { AdminOrgCreatePayload } from '@/types/admin'
import { COUNTRY_OPTIONS, INDIAN_STATES } from './orgConstants'
import { inputCls, selectCls } from './OrgIdentitySection'

type FormState = AdminOrgCreatePayload
type Errors = Partial<Record<keyof FormState, string>>

interface FieldProps {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface Props {
  form: FormState
  errors: Errors
  onChange: (patch: Partial<FormState>) => void
}

export function OrgContactSection({ form, errors, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full
                         bg-blue-600 text-white text-xs font-bold">2</span>
        Contact & Location
      </h2>

      <div className="space-y-4">
        {/* Email + Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contact Email" error={errors.email}>
            <input
              type="email"
              value={form.email ?? ''}
              onChange={e => onChange({ email: e.target.value || null })}
              maxLength={255}
              placeholder="contact@organisation.com"
              className={inputCls}
            />
          </Field>

          <Field label="Mobile / Phone" error={errors.mobile_number}>
            <input
              type="tel"
              value={form.mobile_number ?? ''}
              onChange={e => onChange({ mobile_number: e.target.value || null })}
              maxLength={20}
              placeholder="+91 98765 43210"
              className={inputCls}
            />
          </Field>
        </div>

        {/* City + State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Location / City" error={errors.city}>
            <input
              type="text"
              value={form.city ?? ''}
              onChange={e => onChange({ city: e.target.value || null })}
              maxLength={100}
              placeholder="e.g. Mumbai"
              className={inputCls}
            />
          </Field>

          <Field label="State" error={errors.state}>
            <select
              value={form.state ?? ''}
              onChange={e => onChange({ state: e.target.value || null })}
              className={selectCls}
            >
              <option value="">— Select State —</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Country */}
        <Field label="Country" error={errors.country}>
          <select
            value={form.country ?? ''}
            onChange={e => onChange({ country: e.target.value || null })}
            className={selectCls}
          >
            <option value="">— Select Country —</option>
            {COUNTRY_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        {/* Address */}
        <Field label="Address / Notes" error={errors.address}>
          <textarea
            value={form.address ?? ''}
            onChange={e => onChange({ address: e.target.value || null })}
            maxLength={500}
            rows={3}
            placeholder="Full office address…"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white
                       resize-y focus:outline-none focus:ring-2 focus:ring-blue-500
                       placeholder:text-slate-400"
          />
        </Field>
      </div>
    </div>
  )
}
