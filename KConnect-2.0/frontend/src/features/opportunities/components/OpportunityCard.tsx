import { BookOpen, CalendarDays, ClipboardCheck, Clock3, Globe, IndianRupee, Mic2, Monitor, Pencil } from 'lucide-react'
import type { OpportunityListingCard, OpportunityType } from '@/types/opportunity'
import {
  OPPORTUNITY_TYPE_BADGE_CLASSES,
  OPPORTUNITY_TYPE_ICON_BG,
  OPPORTUNITY_TYPE_LISTING_LABELS,
  FEE_STRUCTURE_LABELS,
} from '@/types/opportunity'

const TYPE_ICONS: Record<OpportunityType, React.ElementType> = {
  LECTURE: Mic2,
  CONTENT_COURSE_DEVELOPMENT: BookOpen,
  LANGUAGE_MEDIA: Globe,
  LEARNING_SUPPORT_EVALUATION: ClipboardCheck,
  CONTENT_ELEARNING: Monitor,
  EDITING_REVIEW: Pencil,
}

function formatFee(card: OpportunityListingCard): string {
  switch (card.compensation_type) {
    case 'PAID':
      return card.fee_amount != null
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(card.fee_amount))
        : 'Amount to be confirmed'
    case 'NEGOTIABLE': return 'Negotiable'
    case 'VOLUNTARY': return 'Voluntary / Unpaid'
    default: return 'To be confirmed'
  }
}

function formatEventDate(value: string | null): string {
  if (!value) return 'To be confirmed'
  const date = new Date(value.slice(0, 10) + 'T00:00:00')
  return Number.isNaN(date.getTime()) ? 'To be confirmed' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatLocation(card: OpportunityListingCard): string {
  return card.preferred_location || card.venue_city ||
    (card.delivery_modes?.some(mode => mode.toLowerCase() === 'online') ? 'Online / Remote' : 'Location to be confirmed')
}

interface Props {
  card: OpportunityListingCard
  detailsAvailable?: boolean
  children?: React.ReactNode
  onViewDetails: (id: string) => void
}

export function OpportunityCard({ card, onViewDetails, children, detailsAvailable = true }: Props) {
  const type = card.opportunity_type
  const TypeIcon = TYPE_ICONS[type] ?? BookOpen
  const badgeCls = OPPORTUNITY_TYPE_BADGE_CLASSES[type] ?? 'bg-slate-100 text-slate-700'
  const iconBg = OPPORTUNITY_TYPE_ICON_BG[type] ?? 'bg-slate-50 text-slate-400'
  const typeLabel = OPPORTUNITY_TYPE_LISTING_LABELS[type] ?? type
  const tags = card.tags ?? []

  return (
    <article className="grid grid-cols-1 lg:grid-cols-[20%_40%_40%] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200">
      <div className="min-w-0 flex flex-col items-center justify-center gap-3 border-b border-slate-100 p-5 text-center lg:border-b-0 lg:border-r">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
          <TypeIcon size={32} aria-hidden="true" />
        </div>
        {card.organization_name && <p className="text-sm font-semibold text-slate-900 break-words w-full">{card.organization_name}</p>}
      </div>

      <div className="min-w-0 space-y-2 p-5">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>{typeLabel}</span>
        <h3 className="text-base font-semibold leading-snug text-slate-900 break-words">{card.title}</h3>
        <p className="text-xs text-slate-500 break-words">
          {card.organization_name && <>{card.organization_name} &ndash; </>}{formatLocation(card)}
        </p>
        {card.short_description && <p className="text-xs leading-relaxed text-slate-600 line-clamp-3 break-words">{card.short_description}</p>}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Tags">
            {tags.slice(0, 3).map((tag, index) => <span key={`${tag}-${index}`} className="max-w-full break-words rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{tag}</span>)}
            {tags.length > 3 && <span title={tags.slice(3).join(', ')} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">+{tags.length - 3} more</span>}
          </div>
        )}
      </div>

      <div className="min-w-0 flex flex-col border-t border-slate-100 p-5 lg:border-t-0 lg:border-l">
        <dl className="space-y-3 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <CalendarDays size={15} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
            <div><dt className="text-slate-500">Event Date</dt><dd className="mt-0.5 font-medium">{formatEventDate(card.event_date)}</dd></div>
          </div>
          <div className="flex items-start gap-2">
            <Clock3 size={15} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
            <div className="min-w-0 break-words"><dt className="text-slate-500">Session Total Duration</dt><dd className="mt-0.5 font-medium">{card.total_duration || 'To be confirmed'}</dd></div>
          </div>
          <div className="flex items-start gap-2">
            <IndianRupee size={15} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
            <div className="min-w-0 break-words"><dt className="text-slate-500">Fee / Honorarium Amount (INR)</dt><dd className="mt-0.5 font-semibold">{formatFee(card)}</dd></div>
          </div>
          <div className="pl-[23px]"><dt className="text-slate-500">Fee Structure</dt><dd className="mt-0.5 font-medium">{card.fee_structure ? FEE_STRUCTURE_LABELS[card.fee_structure] ?? 'To be confirmed' : card.compensation_type === 'VOLUNTARY' ? 'Not applicable' : 'To be confirmed'}</dd></div>
        </dl>
        <div className="mt-auto pt-4 flex justify-end">
          <button disabled={!detailsAvailable} title={detailsAvailable ? undefined : "This opportunity is no longer publicly available"} onClick={() => onViewDetails(card.id)} className="disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-blue-400 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors">View Details</button>
        </div>
      </div>
      {children && <div className="min-w-0 border-t border-slate-200 lg:col-span-3">{children}</div>}
    </article>
  )
}
