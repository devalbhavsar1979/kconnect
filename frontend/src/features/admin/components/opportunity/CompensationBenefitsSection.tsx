import type {
  CompensationType,
  FeeStructureType,
  OpportunityFormState,
} from '@/types/opportunity'
import {
  COMPENSATION_TYPE_LABELS,
  FEE_STRUCTURE_LABELS,
  PAYMENT_TERMS_OPTIONS,
} from '@/types/opportunity'
import { FormField, inputCls, selectCls, textareaCls } from './FormField'
import { SectionCard } from './SectionCard'

interface Props {
  form: OpportunityFormState
  errors: Partial<Record<keyof OpportunityFormState, string>>
  onChange: (patch: Partial<OpportunityFormState>) => void
}

const HIDE_FEE_TYPES: CompensationType[] = ['VOLUNTARY', 'TBD']

export function CompensationBenefitsSection({ form, errors, onChange }: Props) {
  const hideFee = HIDE_FEE_TYPES.includes(form.compensation_type)

  return (
    <SectionCard number={5} title="Compensation & Benefits">
      <div className="space-y-4">
        {/* Compensation Type */}
        <FormField label="Compensation Type" required error={errors.compensation_type}>
          <select
            value={form.compensation_type}
            onChange={e => {
              const ct = e.target.value as CompensationType
              onChange({
                compensation_type: ct,
                fee_structure: HIDE_FEE_TYPES.includes(ct) ? null : form.fee_structure,
                fee_amount: HIDE_FEE_TYPES.includes(ct) ? null : form.fee_amount,
                payment_terms: HIDE_FEE_TYPES.includes(ct) ? null : form.payment_terms,
              })
            }}
            className={selectCls}
          >
            {(Object.keys(COMPENSATION_TYPE_LABELS) as CompensationType[]).map(val => (
              <option key={val} value={val}>{COMPENSATION_TYPE_LABELS[val]}</option>
            ))}
          </select>
        </FormField>

        {/* Fee Structure + Amount (shown only when PAID or NEGOTIABLE) */}
        {!hideFee && (
          <>
            <FormField label="Fee Structure" error={errors.fee_structure}>
              <div className="flex flex-wrap gap-4 pt-1">
                {(Object.keys(FEE_STRUCTURE_LABELS) as FeeStructureType[]).map(val => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="fee_structure"
                      value={val}
                      checked={form.fee_structure === val}
                      onChange={() => onChange({ fee_structure: val })}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{FEE_STRUCTURE_LABELS[val]}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="fee_structure"
                    value=""
                    checked={form.fee_structure === null}
                    onChange={() => onChange({ fee_structure: null })}
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Not specified</span>
                </label>
              </div>
            </FormField>

            {form.compensation_type === 'PAID' && (
              <FormField label="Fee / Honorarium Amount (INR)" error={errors.fee_amount}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
                  <input
                    type="number"
                    value={form.fee_amount ?? ''}
                    onChange={e => onChange({ fee_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </FormField>
            )}

            <FormField label="Payment Terms" error={errors.payment_terms}>
              <select
                value={form.payment_terms ?? ''}
                onChange={e => onChange({ payment_terms: e.target.value || null })}
                className={selectCls}
              >
                <option value="">— Select —</option>
                {PAYMENT_TERMS_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FormField>
          </>
        )}

        {/* Travel Required */}
        <FormField label="Travel Required" required error={errors.travel_required}>
          <div className="flex gap-6 pt-1">
            {(['Yes', 'No'] as const).map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="travel_required"
                  checked={form.travel_required === (opt === 'Yes')}
                  onChange={() => onChange({
                    travel_required: opt === 'Yes',
                    travel_reimbursement: opt === 'No' ? false : form.travel_reimbursement,
                  })}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        </FormField>

        {/* Travel Reimbursement (shown only when travel_required = Yes) */}
        {form.travel_required && (
          <FormField label="Travel Reimbursement" required error={errors.travel_reimbursement}>
            <div className="flex gap-6 pt-1">
              {(['Yes', 'No'] as const).map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="travel_reimbursement"
                    checked={form.travel_reimbursement === (opt === 'Yes')}
                    onChange={() => onChange({ travel_reimbursement: opt === 'Yes' })}
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </FormField>
        )}

        {/* Other Benefits */}
        <FormField label="Other Benefits" error={errors.other_benefits}>
          <textarea
            value={form.other_benefits ?? ''}
            onChange={e => onChange({ other_benefits: e.target.value || null })}
            maxLength={300}
            rows={2}
            placeholder='e.g. "Certificate, Meals, Accommodation"'
            className={textareaCls}
          />
        </FormField>
      </div>
    </SectionCard>
  )
}
