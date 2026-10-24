import type { AdminOrgCreatePayload } from '@/types/admin'
import { INDUSTRY_OPTIONS, ORG_TYPE_OPTIONS } from './orgConstants'

type FormState = AdminOrgCreatePayload
type Errors = Partial<Record<keyof FormState, string>>

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
  'placeholder:text-slate-400'

const selectCls = inputCls

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface Props {
  form: FormState
  errors: Errors
  onChange: (patch: Partial<FormState>) => void
}

export function OrgIdentitySection({ form, errors, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full
                         bg-blue-600 text-white text-xs font-bold">1</span>
        Identity
      </h2>

      <div className="space-y-4">
        <Field label="Organisation / Institute Name" required error={errors.organization_name}>
          <input
            type="text"
            value={form.organization_name}
            onChange={e => onChange({ organization_name: e.target.value })}
            maxLength={255}
            placeholder="e.g. Tata Consultancy Services"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Industry / Domain" required error={errors.industry}>
            <select
              value={form.industry}
              onChange={e => onChange({ industry: e.target.value })}
              className={selectCls}
            >
              <option value="">— Select Industry —</option>
              {INDUSTRY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>

          <Field label="Organization Type" required error={errors.organization_type}>
            <select
              value={form.organization_type}
              onChange={e => onChange({ organization_type: e.target.value })}
              className={selectCls}
            >
              <option value="">— Select Type —</option>
              {ORG_TYPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Website" error={errors.website}
          hint="Include https://…">
          <input
            type="url"
            value={form.website ?? ''}
            onChange={e => onChange({ website: e.target.value || null })}
            maxLength={512}
            placeholder="https://www.example.com"
            className={inputCls}
          />
        </Field>
      </div>
    </div>
  )
}

// Also export input/select classes for sibling components
export { inputCls, selectCls }
