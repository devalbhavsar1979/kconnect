import type { OpportunityFormState, SessionStructureType } from '@/types/opportunity'
import {
  DELIVERY_MODE_OPTIONS,
  OPPORTUNITY_TYPE_LABELS,
  SESSION_STRUCTURE_LABELS,
} from '@/types/opportunity'
import { FormField, inputCls, selectCls } from './FormField'
import { MultiSelect } from './MultiSelect'
import { SectionCard } from './SectionCard'

interface Props {
  form: OpportunityFormState
  errors: Partial<Record<keyof OpportunityFormState, string>>
  onChange: (patch: Partial<OpportunityFormState>) => void
}

export function OpportunityBasicsSection({ form, errors, onChange }: Props) {
  return (
    <SectionCard number={1} title="Opportunity Basics">
      <div className="space-y-4">
        {/* Title — full width */}
        <FormField label="Opportunity Title" required error={errors.title}>
          <input
            type="text"
            value={form.title}
            onChange={e => onChange({ title: e.target.value })}
            maxLength={512}
            placeholder="e.g. Guest Lecture on Machine Learning"
            className={inputCls}
          />
        </FormField>

        {/* Type + Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Opportunity Type" required error={errors.opportunity_type}>
            <select
              value={form.opportunity_type}
              onChange={e => onChange({ opportunity_type: e.target.value as OpportunityFormState['opportunity_type'] })}
              className={selectCls}
            >
              {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Category" required error={errors.category}>
            <input
              type="text"
              value={form.category}
              onChange={e => onChange({ category: e.target.value })}
              maxLength={200}
              placeholder="e.g. Data Science & AI"
              className={inputCls}
            />
          </FormField>
        </div>

        {/* Sub Category + Delivery Mode + Number of Openings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Sub Category" error={errors.sub_category}>
            <input
              type="text"
              value={form.sub_category ?? ''}
              onChange={e => onChange({ sub_category: e.target.value || null })}
              maxLength={200}
              placeholder="e.g. Deep Learning"
              className={inputCls}
            />
          </FormField>

          <FormField label="Delivery Mode" required error={errors.delivery_modes}>
            <MultiSelect
              options={DELIVERY_MODE_OPTIONS}
              value={form.delivery_modes}
              onChange={v => onChange({ delivery_modes: v })}
              placeholder="Select modes…"
            />
          </FormField>

          <FormField label="Number of Openings" required error={errors.number_of_openings}>
            <input
              type="number"
              value={form.number_of_openings}
              onChange={e => onChange({ number_of_openings: Math.max(1, parseInt(e.target.value) || 1) })}
              min={1}
              className={inputCls}
            />
          </FormField>
        </div>

        {/* Session / Program Structure — radio row */}
        <FormField label="Session / Program Structure" required error={errors.session_structure}>
          <div className="flex flex-wrap gap-4 pt-1">
            {(Object.keys(SESSION_STRUCTURE_LABELS) as SessionStructureType[]).map(val => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="session_structure"
                  value={val}
                  checked={form.session_structure === val}
                  onChange={() => onChange({ session_structure: val })}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{SESSION_STRUCTURE_LABELS[val]}</span>
              </label>
            ))}
          </div>
        </FormField>

        {/* Total Duration + Duration Per Session */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Total Duration" required error={errors.total_duration}
            hint='e.g. "3 hours", "2 days", "6 weeks"'>
            <input
              type="text"
              value={form.total_duration}
              onChange={e => onChange({ total_duration: e.target.value })}
              maxLength={100}
              placeholder='e.g. "6 weeks"'
              className={inputCls}
            />
          </FormField>

          <FormField label="Duration Per Session" required error={errors.duration_per_session}
            hint='e.g. "1 hour", "90 minutes"'>
            <input
              type="text"
              value={form.duration_per_session}
              onChange={e => onChange({ duration_per_session: e.target.value })}
              maxLength={100}
              placeholder='e.g. "90 minutes"'
              className={inputCls}
            />
          </FormField>
        </div>
      </div>
    </SectionCard>
  )
}
