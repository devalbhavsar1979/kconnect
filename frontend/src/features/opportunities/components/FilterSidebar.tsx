import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { OPPORTUNITY_TYPE_LISTING_LABELS } from '@/types/opportunity'
import type { ListingFilters, OpportunityType } from '@/types/opportunity'

interface Props {
  filters: ListingFilters
  onChange: (patch: Partial<ListingFilters>) => void
}

const OPP_TYPES = Object.entries(OPPORTUNITY_TYPE_LISTING_LABELS) as [OpportunityType, string][]

const DELIVERY_MODES = [
  { value: 'Online', label: 'Online / Remote' },
  { value: 'Classroom', label: 'In-Person / Onsite' },
  { value: 'Hybrid', label: 'Hybrid' },
]

const EXPERTISE_LEVELS = [
  { value: 'FRESHER', label: 'Fresher' },
  { value: 'EXPERIENCED', label: 'Intermediate' },
  { value: 'EXPERT', label: 'Expert' },
]

function Group({
  title,
  active,
  onClear,
  children,
}: {
  title: string
  active: boolean
  onClear: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {title}
        </button>
        {active && (
          <button onClick={onClear} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
            Clear
          </button>
        )}
      </div>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  )
}

export function FilterSidebar({ filters, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filters</p>

      {/* Opportunity Type */}
      <Group
        title="Opportunity Type"
        active={!!filters.opportunity_type}
        onClear={() => onChange({ opportunity_type: '' })}
      >
        {OPP_TYPES.map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="opportunity_type"
              value={value}
              checked={filters.opportunity_type === value}
              onChange={() => onChange({ opportunity_type: value === filters.opportunity_type ? '' : value })}
              className="accent-blue-600"
            />
            <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
              {label}
            </span>
          </label>
        ))}
      </Group>

      {/* Location Type */}
      <Group
        title="Location Type"
        active={!!filters.delivery_mode}
        onClear={() => onChange({ delivery_mode: '' })}
      >
        {DELIVERY_MODES.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="delivery_mode"
              value={value}
              checked={filters.delivery_mode === value}
              onChange={() => onChange({ delivery_mode: value === filters.delivery_mode ? '' : value })}
              className="accent-blue-600"
            />
            <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
              {label}
            </span>
          </label>
        ))}
      </Group>

      {/* Experience Level */}
      <Group
        title="Experience Level"
        active={!!filters.expertise_level}
        onClear={() => onChange({ expertise_level: '' })}
      >
        {EXPERTISE_LEVELS.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="expertise_level"
              value={value}
              checked={filters.expertise_level === value}
              onChange={() => onChange({ expertise_level: value === filters.expertise_level ? '' : value })}
              className="accent-blue-600"
            />
            <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
              {label}
            </span>
          </label>
        ))}
      </Group>
    </div>
  )
}
