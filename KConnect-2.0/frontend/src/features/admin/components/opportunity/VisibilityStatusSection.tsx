import type { OpportunityFormState, OpportunityVisibility } from '@/types/opportunity'
import { SectionCard } from './SectionCard'

interface Props {
  form: OpportunityFormState
  errors: Partial<Record<keyof OpportunityFormState, string>>
  onChange: (patch: Partial<OpportunityFormState>) => void
}

export function VisibilityStatusSection({ form, errors, onChange }: Props) {
  return (
    <SectionCard number={9} title="Visibility & Status">
      <div className="space-y-5">
        {/* Visibility */}
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">
            Visibility <span className="text-red-500">*</span>
          </p>
          <div className="space-y-2">
            {([
              {
                value: 'VISIBLE_TO_ALL' as OpportunityVisibility,
                label: 'Visible to All',
                desc: 'All matching experts can discover this opportunity',
              },
              {
                value: 'SHORTLISTED_ONLY' as OpportunityVisibility,
                label: 'Shortlisted Only',
                desc: 'Only shortlisted experts can view this opportunity',
              },
            ] as const).map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                            ${form.visibility === opt.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:bg-slate-50'}`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={opt.value}
                  checked={form.visibility === opt.value}
                  onChange={() => onChange({ visibility: opt.value })}
                  className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.visibility && (
            <p className="text-xs text-red-500 mt-1">{errors.visibility}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">
            Status <span className="text-red-500">*</span>
          </p>
          <div className="space-y-2">
            {([
              {
                value: 'OPEN' as const,
                label: 'Active (Publish Now)',
                desc: 'Immediately visible to eligible experts',
              },
              {
                value: 'DRAFT' as const,
                label: 'Draft (Save for Later)',
                desc: 'Not visible to experts — finish editing first',
              },
            ] as const).map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                            ${form.status === opt.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:bg-slate-50'}`}
              >
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={form.status === opt.value}
                  onChange={() => onChange({ status: opt.value })}
                  className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.status && (
            <p className="text-xs text-red-500 mt-1">{errors.status}</p>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
