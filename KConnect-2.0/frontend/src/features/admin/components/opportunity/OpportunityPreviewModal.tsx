import { X, Calendar, MapPin, Users, Clock, Briefcase, Tag } from 'lucide-react'
import type { OpportunityFormState } from '@/types/opportunity'
import {
  COMPENSATION_TYPE_LABELS,
  EXPERTISE_LEVEL_LABELS,
  FEE_STRUCTURE_LABELS,
  OPPORTUNITY_TYPE_LABELS,
  SESSION_STRUCTURE_LABELS,
  VENUE_LOCATION_LABELS,
  TARGET_AUDIENCE_OPTIONS,
} from '@/types/opportunity'

interface Props {
  form: OpportunityFormState
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3 border-b border-slate-100 pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-3 py-1.5">
      <span className="text-xs text-slate-500 w-36 shrink-0">{label}</span>
      <span className="text-sm text-slate-700">{value}</span>
    </div>
  )
}

function Pill({ label }: { label: string }) {
  return (
    <span className="inline-flex px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700
                     border border-blue-200 rounded-full">
      {label}
    </span>
  )
}

export function OpportunityPreviewModal({ form, onClose }: Props) {
  const audienceLabels = TARGET_AUDIENCE_OPTIONS
    .filter(o => form.target_audience.includes(o.value))
    .map(o => o.label)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh]
                   overflow-y-auto flex flex-col"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-slate-800">Preview Opportunity</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hero */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2.5 py-0.5 text-xs font-medium bg-white/20 rounded-full">
                {OPPORTUNITY_TYPE_LABELS[form.opportunity_type]}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-white/20 rounded-full">
                {form.category}
              </span>
              {form.sub_category && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-white/20 rounded-full">
                  {form.sub_category}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold mb-1">{form.title || '(Untitled)'}</h1>
            <p className="text-blue-100 text-sm">{form.short_description}</p>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Calendar size={14} />, label: 'Date', value: form.event_date || '—' },
              { icon: <MapPin size={14} />, label: 'Venue', value: form.venue_name || '—' },
              { icon: <Users size={14} />, label: 'Openings', value: form.number_of_openings },
              {
                icon: <Clock size={14} />,
                label: 'Duration',
                value: form.total_duration || '—',
              },
            ].map(item => (
              <div key={item.label}
                className="bg-slate-50 rounded-lg p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1 text-slate-500">
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              {/* Opportunity Details */}
              <Section title="About this Opportunity">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {form.detailed_description || '—'}
                </p>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {form.tags.map(t => <Pill key={t} label={t} />)}
                  </div>
                )}
              </Section>

              {/* Schedule */}
              <Section title="Schedule & Location">
                <div className="space-y-0.5">
                  <Row label="Date" value={form.event_date} />
                  {form.start_time && <Row label="Start Time" value={form.start_time} />}
                  {form.end_time && <Row label="End Time" value={form.end_time} />}
                  {form.venue_location_type && (
                    <Row label="Location Type" value={VENUE_LOCATION_LABELS[form.venue_location_type]} />
                  )}
                  <Row label="Venue" value={form.venue_name} />
                  <Row label="Address" value={form.venue_address} />
                  {audienceLabels.length > 0 && (
                    <Row
                      label="Target Audience"
                      value={
                        <div className="flex flex-wrap gap-1">
                          {audienceLabels.map(l => <Pill key={l} label={l} />)}
                        </div>
                      }
                    />
                  )}
                </div>
              </Section>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Structure */}
              <Section title="Program Structure">
                <div className="space-y-0.5">
                  <Row label="Structure" value={SESSION_STRUCTURE_LABELS[form.session_structure]} />
                  <Row label="Total Duration" value={form.total_duration} />
                  <Row label="Per Session" value={form.duration_per_session} />
                  {form.delivery_modes.length > 0 && (
                    <Row
                      label="Delivery Mode"
                      value={
                        <div className="flex flex-wrap gap-1">
                          {form.delivery_modes.map(m => <Pill key={m} label={m} />)}
                        </div>
                      }
                    />
                  )}
                </div>
              </Section>

              {/* Requirements */}
              <Section title="Requirements">
                <div className="space-y-0.5">
                  {form.skills_required.length > 0 && (
                    <Row
                      label="Skills"
                      value={
                        <div className="flex flex-wrap gap-1">
                          {form.skills_required.map(s => <Pill key={s} label={s} />)}
                        </div>
                      }
                    />
                  )}
                  <Row label="Min Experience" value={form.minimum_experience} />
                  {form.expertise_level && (
                    <Row label="Expertise Level" value={EXPERTISE_LEVEL_LABELS[form.expertise_level]} />
                  )}
                  <Row label="Language" value={form.language_of_delivery} />
                </div>
              </Section>

              {/* Compensation */}
              <Section title="Compensation">
                <div className="space-y-0.5">
                  <Row label="Type" value={COMPENSATION_TYPE_LABELS[form.compensation_type]} />
                  {form.fee_structure && (
                    <Row label="Fee Structure" value={FEE_STRUCTURE_LABELS[form.fee_structure]} />
                  )}
                  {form.fee_amount != null && (
                    <Row label="Amount" value={`₹${form.fee_amount.toLocaleString('en-IN')}`} />
                  )}
                  <Row label="Payment Terms" value={form.payment_terms} />
                  <Row label="Travel Required" value={form.travel_required ? 'Yes' : 'No'} />
                  {form.travel_required && (
                    <Row label="Reimbursement" value={form.travel_reimbursement ? 'Yes' : 'No'} />
                  )}
                  <Row label="Other Benefits" value={form.other_benefits} />
                </div>
              </Section>
            </div>
          </div>

          {/* Notes for applicants */}
          {form.notes_for_applicants && (
            <Section title="Notes for Applicants">
              <p className="text-sm text-slate-700">{form.notes_for_applicants}</p>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium bg-slate-700 text-white
                       rounded-lg hover:bg-slate-600 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}
