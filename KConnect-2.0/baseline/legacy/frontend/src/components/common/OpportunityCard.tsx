import { MapPin, Clock, DollarSign, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Opportunity } from '@/types'

const typeColors: Record<string, 'blue' | 'purple' | 'green' | 'orange' | 'yellow'> = {
  TRAINING:   'blue',
  SME:        'purple',
  FREELANCE:  'green',
  CONSULTING: 'orange',
  PROJECT:    'blue',
  WORKSHOP:   'yellow',
  LECTURE:    'purple',
  OTHER:      'yellow',
}

interface OpportunityCardProps {
  opportunity: Opportunity
  onApply?: (id: string) => void
}

export function OpportunityCard({ opportunity, onApply }: OpportunityCardProps) {
  const color = typeColors[opportunity.opportunity_type] ?? 'slate'

  const budget =
    opportunity.budget_min && opportunity.budget_max
      ? `${opportunity.currency ?? ''}${opportunity.budget_min.toLocaleString()} – ${opportunity.budget_max.toLocaleString()}`
      : null

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5
                    hover:shadow-card-hover hover:border-blue-100 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge color={color as any}>
              {opportunity.opportunity_type.replace('_', ' ')}
            </Badge>
            {opportunity.location_type && (
              <Badge color="slate">{opportunity.location_type}</Badge>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
            {opportunity.title}
          </h3>
        </div>
        <ExternalLink
          size={15}
          className="text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5"
        />
      </div>

      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
        {opportunity.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
        {opportunity.location && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} />
            {opportunity.location}
          </span>
        )}
        {opportunity.experience_required && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={12} />
            {opportunity.experience_required}
          </span>
        )}
        {budget && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <DollarSign size={12} />
            {budget}
          </span>
        )}
      </div>

      {opportunity.skills_required && opportunity.skills_required.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {opportunity.skills_required.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-slate-50 border border-slate-200
                         text-xs text-slate-600 rounded-md font-medium"
            >
              {skill}
            </span>
          ))}
          {opportunity.skills_required.length > 4 && (
            <span className="px-2 py-0.5 text-xs text-slate-400">
              +{opportunity.skills_required.length - 4} more
            </span>
          )}
        </div>
      )}

      {onApply && (
        <button
          onClick={() => onApply(opportunity.id)}
          className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white
                     text-xs font-medium rounded-lg transition-colors"
        >
          Apply Now
        </button>
      )}
    </div>
  )
}
