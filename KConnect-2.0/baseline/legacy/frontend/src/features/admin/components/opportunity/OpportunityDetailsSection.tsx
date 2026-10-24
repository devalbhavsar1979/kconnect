import type { OpportunityFormState } from '@/types/opportunity'
import { FormField, inputCls, textareaCls } from './FormField'
import { SectionCard } from './SectionCard'
import { TagInput } from './TagInput'

const TAG_SUGGESTIONS = [
  'Workshop', 'Training Program', 'Guest Lecture', 'Webinar', 'Bootcamp', 'Seminar',
]

interface Props {
  form: OpportunityFormState
  errors: Partial<Record<keyof OpportunityFormState, string>>
  onChange: (patch: Partial<OpportunityFormState>) => void
}

export function OpportunityDetailsSection({ form, errors, onChange }: Props) {
  const descLen = form.detailed_description.length

  return (
    <SectionCard number={3} title="Opportunity Details">
      <div className="space-y-4">
        {/* Short Description */}
        <FormField label="Short Description" required error={errors.short_description}
          hint={`${form.short_description.length}/200 chars`}>
          <input
            type="text"
            value={form.short_description}
            onChange={e => onChange({ short_description: e.target.value })}
            maxLength={200}
            placeholder="Brief one-liner about this opportunity"
            className={inputCls}
          />
        </FormField>

        {/* Detailed Description */}
        <FormField label="Detailed Description" required error={errors.detailed_description}>
          <div className="relative">
            <textarea
              value={form.detailed_description}
              onChange={e => onChange({ detailed_description: e.target.value })}
              maxLength={4000}
              rows={8}
              placeholder="Describe the opportunity in detail — objectives, responsibilities, expectations…"
              className={`${textareaCls} min-h-[200px] pb-6`}
            />
            <span className={`absolute bottom-2 right-3 text-xs
                              ${descLen > 3800 ? 'text-red-500' : 'text-slate-400'}`}>
              {descLen}/4000
            </span>
          </div>
        </FormField>

        {/* Tags */}
        <FormField label="Tags" required error={errors.tags}
          hint="Press Enter or comma to add a tag">
          <TagInput
            tags={form.tags}
            onChange={tags => onChange({ tags })}
            suggestions={TAG_SUGGESTIONS}
            placeholder="e.g. Workshop, Bootcamp"
          />
        </FormField>
      </div>
    </SectionCard>
  )
}
