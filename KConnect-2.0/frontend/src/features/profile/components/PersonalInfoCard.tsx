import { Edit2 } from 'lucide-react'
import type { DesignationType, GenderType, TitleType, User } from '@/types'

interface Props {
  profile: User
  onEdit: () => void
}

const TITLE_LABELS: Record<TitleType, string> = {
  MR:   'Mr.',
  MRS:  'Mrs.',
  MISS: 'Miss',
  DR:   'Dr.',
  PROF: 'Prof.',
}

const GENDER_LABELS: Partial<Record<GenderType, string>> = {
  MALE:              'Male',
  FEMALE:            'Female',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
}

const DESIGNATION_LABELS: Record<DesignationType, string> = {
  PROFESSOR:      'Professor',
  ASST_PROFESSOR: 'Asst. Professor',
  TRAINER:        'Trainer',
  GUEST_FACULTY:  'Guest Faculty',
}

const ROLE_LABELS: Record<string, string> = {
  SME:                          'SME - Subject Matter Expert',
  PROFESSIONAL_SERVICE_PROVIDER: 'Professional Service Provider',
}

export function PersonalInfoCard({ profile, onEdit }: Props) {
  const rows = [
    { label: 'Role',                value: ROLE_LABELS[profile.user_type] ?? profile.user_type },
    { label: 'Title',               value: profile.title ? TITLE_LABELS[profile.title] : null },
    { label: 'Gender',              value: profile.gender ? GENDER_LABELS[profile.gender] : null },
    { label: 'Current Designation', value: profile.designation ? DESIGNATION_LABELS[profile.designation] : null },
    { label: 'Company / Academy',   value: profile.company },
    {
      label: 'Location',
      value:
        [profile.address_city, profile.address_state, profile.address_country]
          .filter(Boolean)
          .join(', ') || null,
    },
    {
      label: 'Date of Birth',
      value: profile.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
        : null,
    },
    {
      label: 'Mobile',
      value: profile.mobile_number ? `+91 ${profile.mobile_number}` : null,
    },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value))

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {/* Section heading */}
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
        Personal Information
      </h2>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {rows.map(row => (
          <div key={row.label} className="flex gap-3 py-2.5">
            <span className="w-40 shrink-0 text-sm text-slate-500">{row.label}</span>
            <span className="text-sm text-slate-800">{row.value}</span>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="py-4 text-sm text-slate-400 text-center">
            No information added yet.
          </p>
        )}
      </div>

      {/* Edit button */}
      <button
        onClick={onEdit}
        className="mt-5 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium
                   text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50
                   transition-colors"
      >
        <Edit2 size={14} />
        Edit Information
      </button>
    </div>
  )
}
