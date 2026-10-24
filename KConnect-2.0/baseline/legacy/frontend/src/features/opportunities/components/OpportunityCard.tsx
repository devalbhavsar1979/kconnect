import { Bookmark, BookOpen, ClipboardCheck, Globe, MapPin, Mic2, Monitor, Pencil, Users } from 'lucide-react'
import type { OpportunityListingCard, OpportunityType } from '@/types/opportunity'
import {
  OPPORTUNITY_TYPE_BADGE_CLASSES,
  OPPORTUNITY_TYPE_ICON_BG,
  OPPORTUNITY_TYPE_LISTING_LABELS,
  FEE_STRUCTURE_SHORT_LABELS,
} from '@/types/opportunity'

const TYPE_ICONS: Record<OpportunityType, React.ElementType> = {
  LECTURE: Mic2,
  CONTENT_COURSE_DEVELOPMENT: BookOpen,
  LANGUAGE_MEDIA: Globe,
  LEARNING_SUPPORT_EVALUATION: ClipboardCheck,
  CONTENT_ELEARNING: Monitor,
  EDITING_REVIEW: Pencil,
}

function isNew(createdAt: string): boolean {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  return diffMs <= 7 * 24 * 60 * 60 * 1000
}

function isClosingSoon(deadline: string | null): boolean {
  if (!deadline) return false
  const diffMs = new Date(deadline).getTime() - Date.now()
  return diffMs > 0 && diffMs <= 3 * 24 * 60 * 60 * 1000
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Open-ended'
  return `Apply by ${new Date(deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
}

function formatFee(card: OpportunityListingCard): string {
  if (!card.compensation_type) return ''
  switch (card.compensation_type) {
    case 'PAID':
      if (card.fee_amount) {
        const suffix = card.fee_structure ? FEE_STRUCTURE_SHORT_LABELS[card.fee_structure as keyof typeof FEE_STRUCTURE_SHORT_LABELS] ?? '' : ''
        return `₹${Number(card.fee_amount).toLocaleString('en-IN')} ${suffix}`.trim()
      }
      return 'Paid'
    case 'NEGOTIABLE': return 'Negotiable'
    case 'VOLUNTARY': return 'Voluntary'
    case 'TBD': return 'Fee: TBD'
    default: return ''
  }
}

function formatLocation(card: OpportunityListingCard): string {
  const parts = [card.venue_city, card.preferred_location].filter(Boolean)
  if (parts.length === 0) {
    const hasOnline = card.delivery_modes?.includes('Online') || card.delivery_modes?.includes('ONLINE')
    return hasOnline ? 'Online / Remote' : '—'
  }
  return parts[0]!
}

interface Props {
  card: OpportunityListingCard
  onViewDetails: (id: string) => void
}

export function OpportunityCard({ card, onViewDetails }: Props) {
  const type = card.opportunity_type as OpportunityType
  const TypeIcon = TYPE_ICONS[type] ?? BookOpen
  const badgeCls = OPPORTUNITY_TYPE_BADGE_CLASSES[type] ?? 'bg-slate-100 text-slate-700'
  const iconBg = OPPORTUNITY_TYPE_ICON_BG[type] ?? 'bg-slate-50 text-slate-400'
  const typeLabel = OPPORTUNITY_TYPE_LISTING_LABELS[type] ?? card.opportunity_type
  const feeDisplay = formatFee(card)
  const openings = card.number_of_openings === 0 ? 'Unlimited openings' : `${card.number_of_openings ?? '—'} opening${card.number_of_openings !== 1 ? 's' : ''}`

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3
                    hover:shadow-md hover:border-blue-100 transition-all duration-200">
      {/* Top row: badges + bookmark */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>
            {typeLabel}
          </span>
          {isNew(card.created_at) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              New
            </span>
          )}
          {isClosingSoon(card.application_deadline) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              Closing Soon
            </span>
          )}
        </div>
        {/* Bookmark placeholder — Phase 2 */}
        <button
          disabled
          title="Save (coming soon)"
          className="p-1 text-slate-300 cursor-not-allowed shrink-0"
          aria-label="Save opportunity"
        >
          <Bookmark size={16} />
        </button>
      </div>

      {/* Icon + title + org */}
      <div className="flex gap-3 items-start">
        <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${iconBg}`}>
          <TypeIcon size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
            {card.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {card.organization_name && (
              <span className="text-xs text-slate-500">{card.organization_name}</span>
            )}
            {card.organization_name && (
              <span className="text-slate-300 text-xs">·</span>
            )}
            <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
              <MapPin size={11} />
              {formatLocation(card)}
            </span>
          </div>
        </div>
      </div>

      {/* Short description */}
      {card.short_description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
          {card.short_description}
        </p>
      )}

      {/* Delivery modes + openings */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {(card.delivery_modes ?? []).map(mode => (
            <span key={mode} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">
              {mode}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 shrink-0">
          <Users size={11} />
          {openings}
        </span>
      </div>

      {/* Skills */}
      {(card.skills_required ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.skills_required.slice(0, 3).map(skill => (
            <span key={skill} className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md text-xs">
              {skill}
            </span>
          ))}
          {card.skills_required.length > 3 && (
            <span className="text-xs text-slate-400 px-1 self-center">
              +{card.skills_required.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Divider + fee + deadline + actions */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-col gap-0.5">
          {feeDisplay && (
            <span className="text-xs font-semibold text-slate-700">💰 {feeDisplay}</span>
          )}
          <span className="text-xs text-slate-400">📅 {formatDeadline(card.application_deadline)}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onViewDetails(card.id)}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200
                       rounded-lg hover:bg-blue-50 transition-colors"
          >
            View Details
          </button>
          <button
            disabled
            title="Apply — coming soon"
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg
                       opacity-40 cursor-not-allowed"
          >
            Apply →
          </button>
        </div>
      </div>
    </div>
  )
}
