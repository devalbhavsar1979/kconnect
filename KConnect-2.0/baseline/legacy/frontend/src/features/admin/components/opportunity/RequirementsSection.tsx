import type { ExpertiseLevelType, OpportunityFormState } from '@/types/opportunity'
import {
  EXPERTISE_LEVEL_LABELS,
  LANGUAGE_OPTIONS,
  MINIMUM_EXPERIENCE_OPTIONS,
} from '@/types/opportunity'
import { FormField, selectCls, textareaCls } from './FormField'
import { SectionCard } from './SectionCard'
import { TagInput } from './TagInput'

interface Props {
  form: OpportunityFormState
  errors: Partial<Record<keyof OpportunityFormState, string>>
  onChange: (patch: Partial<OpportunityFormState>) => void
}

export function RequirementsSection({ form, errors, onChange }: Props) {
  return (
    <SectionCard number={6} title="Requirements">
      <div className="space-y-4">
        {/* Skills Required */}
        <FormField label="Required Skills / Keywords" required error={errors.skills_required}
          hint="Press Enter or comma to add a skill">
          <TagInput
            tags={form.skills_required}
            onChange={tags => onChange({ skills_required: tags })}
            placeholder="e.g. Python, Machine Learning, Statistics"
          />
        </FormField>

        {/* Min Experience + Expertise Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Minimum Experience" required error={errors.minimum_experience}>
            <select
              value={form.minimum_experience ?? ''}
              onChange={e => onChange({ minimum_experience: e.target.value || null })}
              className={selectCls}
            >
              <option value="">— Select —</option>
              {MINIMUM_EXPERIENCE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Expertise Level" required error={errors.expertise_level}>
            <select
              value={form.expertise_level ?? ''}
              onChange={e => onChange({ expertise_level: (e.target.value as ExpertiseLevelType) || null })}
              className={selectCls}
            >
              <option value="">— Select —</option>
              {(Object.keys(EXPERTISE_LEVEL_LABELS) as ExpertiseLevelType[]).map(val => (
                <option key={val} value={val}>{EXPERTISE_LEVEL_LABELS[val]}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Language of Delivery */}
        <FormField label="Language of Delivery" required error={errors.language_of_delivery}>
          <select
            value={form.language_of_delivery}
            onChange={e => onChange({ language_of_delivery: e.target.value })}
            className={selectCls}
          >
            <option value="">— Select —</option>
            {LANGUAGE_OPTIONS.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </FormField>

        {/* Additional Requirements */}
        <FormField label="Additional Requirements" error={errors.additional_requirements}>
          <textarea
            value={form.additional_requirements ?? ''}
            onChange={e => onChange({ additional_requirements: e.target.value || null })}
            maxLength={300}
            rows={3}
            placeholder="Any other specific requirements…"
            className={textareaCls}
          />
        </FormField>
      </div>
    </SectionCard>
  )
}
