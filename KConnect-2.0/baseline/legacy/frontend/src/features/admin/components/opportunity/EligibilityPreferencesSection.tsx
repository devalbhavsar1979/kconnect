import type { OpportunityFormState } from '@/types/opportunity'
import { FormField, inputCls, selectCls, textareaCls } from './FormField'
import { SectionCard } from './SectionCard'

const GENDER_OPTIONS = ['No Preference', 'Male', 'Female', 'Any']

interface Props {
  form: OpportunityFormState
  errors: Partial<Record<keyof OpportunityFormState, string>>
  onChange: (patch: Partial<OpportunityFormState>) => void
}

export function EligibilityPreferencesSection({ form, errors, onChange }: Props) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <SectionCard number={7} title="Eligibility & Preferences">
      <div className="space-y-4">
        {/* Preferred Location */}
        <FormField label="Preferred Location / Area" error={errors.preferred_location}
          hint='e.g. "Mumbai", "Pan India"'>
          <input
            type="text"
            value={form.preferred_location ?? ''}
            onChange={e => onChange({ preferred_location: e.target.value || null })}
            maxLength={200}
            placeholder="e.g. Across Maharashtra"
            className={inputCls}
          />
        </FormField>

        {/* Gender + Candidate Preference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Gender Preference" error={errors.gender_preference}>
            <select
              value={form.gender_preference ?? ''}
              onChange={e => onChange({ gender_preference: e.target.value || null })}
              className={selectCls}
            >
              <option value="">— No Preference —</option>
              {GENDER_OPTIONS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Application Deadline" error={errors.application_deadline}>
            <input
              type="date"
              value={form.application_deadline ?? ''}
              max={form.event_date || undefined}
              onChange={e => onChange({ application_deadline: e.target.value || null })}
              className={inputCls}
            />
          </FormField>
        </div>

        {/* Candidate Preference */}
        <FormField label="Candidate Preference" error={errors.candidate_preference}>
          <textarea
            value={form.candidate_preference ?? ''}
            onChange={e => onChange({ candidate_preference: e.target.value || null })}
            maxLength={300}
            rows={2}
            placeholder="e.g. Ph.D. preferred, industry practitioners welcome"
            className={textareaCls}
          />
        </FormField>

        {/* Notes for Applicants */}
        <FormField label="Notes for Applicants" error={errors.notes_for_applicants}
          hint="Shown to experts who view this opportunity">
          <textarea
            value={form.notes_for_applicants ?? ''}
            onChange={e => onChange({ notes_for_applicants: e.target.value || null })}
            maxLength={300}
            rows={2}
            placeholder="Any special instructions for applicants…"
            className={textareaCls}
          />
        </FormField>
      </div>
    </SectionCard>
  )
}
