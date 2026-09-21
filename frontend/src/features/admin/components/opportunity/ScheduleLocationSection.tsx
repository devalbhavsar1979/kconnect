import type { OpportunityFormState, VenueLocationType } from '@/types/opportunity'
import { TARGET_AUDIENCE_OPTIONS, VENUE_LOCATION_LABELS } from '@/types/opportunity'
import { FormField, inputCls, selectCls, textareaCls } from './FormField'
import { MultiSelect } from './MultiSelect'
import { SectionCard } from './SectionCard'

interface Props {
  form: OpportunityFormState
  errors: Partial<Record<keyof OpportunityFormState, string>>
  onChange: (patch: Partial<OpportunityFormState>) => void
}

export function ScheduleLocationSection({ form, errors, onChange }: Props) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <SectionCard number={4} title="Schedule & Location">
      <div className="space-y-4">
        {/* Date + Start Time + End Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Event Date" required error={errors.event_date}>
            <input
              type="date"
              value={form.event_date}
              min={today}
              onChange={e => onChange({ event_date: e.target.value })}
              className={inputCls}
            />
          </FormField>

          <FormField label="Start Time" error={errors.start_time}>
            <input
              type="time"
              value={form.start_time ?? ''}
              onChange={e => onChange({ start_time: e.target.value || null })}
              className={inputCls}
            />
          </FormField>

          <FormField label="End Time" error={errors.end_time}>
            <input
              type="time"
              value={form.end_time ?? ''}
              onChange={e => onChange({ end_time: e.target.value || null })}
              className={inputCls}
            />
          </FormField>
        </div>

        {/* Venue Name + Location Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Venue / Location Name" required error={errors.venue_name}>
            <input
              type="text"
              value={form.venue_name ?? ''}
              onChange={e => onChange({ venue_name: e.target.value || null })}
              maxLength={500}
              placeholder="e.g. IIT Bombay Main Auditorium, Online (Zoom)"
              className={inputCls}
            />
          </FormField>

          <FormField label="Location Type" required error={errors.venue_location_type}>
            <select
              value={form.venue_location_type ?? ''}
              onChange={e => onChange({ venue_location_type: (e.target.value as VenueLocationType) || null })}
              className={selectCls}
            >
              <option value="">— Select —</option>
              {(Object.keys(VENUE_LOCATION_LABELS) as VenueLocationType[]).map(val => (
                <option key={val} value={val}>{VENUE_LOCATION_LABELS[val]}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Address */}
        <FormField label="Address / Venue Details" required error={errors.venue_address}>
          <textarea
            value={form.venue_address ?? ''}
            onChange={e => onChange({ venue_address: e.target.value || null })}
            maxLength={1000}
            rows={3}
            placeholder="Full address or meeting link"
            className={textareaCls}
          />
        </FormField>

        {/* Target Audience */}
        <FormField label="Target Audience" required error={errors.target_audience}>
          <MultiSelect
            options={TARGET_AUDIENCE_OPTIONS}
            value={form.target_audience}
            onChange={v => onChange({ target_audience: v })}
            placeholder="Select audience types…"
          />
        </FormField>
      </div>
    </SectionCard>
  )
}
