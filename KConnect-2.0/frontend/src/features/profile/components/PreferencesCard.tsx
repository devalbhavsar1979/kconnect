import { Pencil } from 'lucide-react'
import type { UserPreferences } from '@/types'

interface Props {
  preferences: UserPreferences
  onEdit: () => void
}

const DELIVERY_LABELS: Record<string, string> = {
  CLASSROOM:          'Classroom',
  ONLINE:             'Online',
  HYBRID:             'Hybrid',
  OFFLINE_RECORDING:  'Offline Session Recording',
}

const GEO_LABELS: Record<string, string> = {
  MY_CITY:              'My City',
  NEARBY_CITIES:        'Nearby Cities',
  ENTIRE_STATE:         'Entire State',
  NEIGHBOURING_STATES:  'Neighbouring States',
  PAN_INDIA:            'Pan India',
  REMOTE_ONLINE:        'Remote / Online',
}

const AUDIENCE_LABELS: Record<string, string> = {
  WORKING_PROFESSIONALS:          'Working Professionals',
  COLLEGE_UNIVERSITY_INSTITUTES:  'College / University / Institutes',
  MANAGEMENT:                     'Management',
  SENIOR_MANAGEMENT:              'Sr. Management',
}

const SERVICE_LABELS: Record<string, string> = {
  LECTURE_TRAINING:  'Lecture / Training Session',
  WORKSHOP:          'Workshop',
  TRANSLATION:       'Translation',
  PROOFREADING:      'Proofreading',
  CONTENT_REVIEW:    'Content Review',
}

function Pills({ values, labelMap }: { values: string[]; labelMap: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map(v => (
        <span
          key={v}
          className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200"
        >
          {labelMap[v] ?? v}
        </span>
      ))}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex py-2.5 gap-3">
      <span className="w-52 text-sm text-slate-500 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function PreferencesCard({ preferences, onEdit }: Props) {
  return (
    <div className="space-y-4">

      {/* Section 1 — Delivery */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Delivery</h3>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                       text-slate-600 border border-slate-300 rounded-lg
                       hover:bg-slate-50 transition-colors"
          >
            <Pencil size={13} />
            Edit
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          <Row label="Delivery Mode">
            <Pills values={preferences.delivery_modes} labelMap={DELIVERY_LABELS} />
          </Row>
          <Row label="Geographic Preference">
            <Pills values={preferences.geographic_preference} labelMap={GEO_LABELS} />
          </Row>
        </div>
      </div>

      {/* Section 2 — Travel */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Travel</h3>
        <div className="divide-y divide-slate-100">
          <Row label="Willing to Travel">
            <span className="text-sm font-medium text-slate-800">
              {preferences.willing_to_travel ? 'Yes' : 'No'}
            </span>
          </Row>
          <Row label="Max. Travel Distance">
            {preferences.willing_to_travel ? (
              <span className="text-sm font-medium text-slate-800">
                {preferences.max_travel_distance ?? '—'}
              </span>
            ) : (
              <span className="text-sm italic text-slate-400">N/A</span>
            )}
          </Row>
          <Row label="Travel Reimbursement">
            <span className="text-sm font-medium text-slate-800">
              {preferences.travel_reimbursement ? 'Yes' : 'No'}
            </span>
          </Row>
        </div>
      </div>

      {/* Section 3 — Audience & Services */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
          Audience &amp; Services
        </h3>
        <div className="divide-y divide-slate-100">
          <Row label="Preferred Audience">
            <Pills values={preferences.preferred_audience} labelMap={AUDIENCE_LABELS} />
          </Row>
          <Row label="Services I Can Deliver">
            <Pills values={preferences.services} labelMap={SERVICE_LABELS} />
          </Row>
        </div>
      </div>

      {/* Section 4 — Training Topics */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
          Training Topics I Can Deliver
        </h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {preferences.training_topics.map(topic => (
            <span
              key={topic}
              className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
