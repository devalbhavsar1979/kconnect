import { useEffect, useState } from 'react'
import { X, MapPin, Users, Calendar, Bookmark } from 'lucide-react'
import { opportunityListingApi } from '@/api/opportunityListingApi'
import type { OpportunityListingCard, OpportunityType } from '@/types/opportunity'
import {
  OPPORTUNITY_TYPE_LISTING_LABELS,
  OPPORTUNITY_TYPE_BADGE_CLASSES,
  FEE_STRUCTURE_SHORT_LABELS,
} from '@/types/opportunity'

interface Props {
  opportunityId: string | null
  onClose: () => void
}

function formatFee(card: OpportunityListingCard): string {
  if (!card.compensation_type) return ''
  switch (card.compensation_type) {
    case 'PAID':
      if (card.fee_amount) {
        const suffix = card.fee_structure
          ? FEE_STRUCTURE_SHORT_LABELS[card.fee_structure as keyof typeof FEE_STRUCTURE_SHORT_LABELS] ?? ''
          : ''
        return `₹${Number(card.fee_amount).toLocaleString('en-IN')} ${suffix}`.trim()
      }
      return 'Paid'
    case 'NEGOTIABLE': return 'Negotiable'
    case 'VOLUNTARY': return 'Voluntary'
    case 'TBD': return 'TBD'
    default: return ''
  }
}

export function OpportunityDetailModal({ opportunityId, onClose }: Props) {
  const [card, setCard] = useState<OpportunityListingCard | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!opportunityId) { setCard(null); return }
    setLoading(true)
    opportunityListingApi.get(opportunityId)
      .then(setCard)
      .catch(() => setCard(null))
      .finally(() => setLoading(false))
  }, [opportunityId])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!opportunityId) return null

  const type = card?.opportunity_type as OpportunityType | undefined
  const badgeCls = type ? (OPPORTUNITY_TYPE_BADGE_CLASSES[type] ?? 'bg-slate-100 text-slate-600') : ''
  const typeLabel = type ? (OPPORTUNITY_TYPE_LISTING_LABELS[type] ?? type) : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">Opportunity Details</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-20 bg-slate-100 rounded" />
            </div>
          ) : card ? (
            <>
              {/* Badge + title */}
              <div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls} mb-2`}>
                  {typeLabel}
                </span>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{card.title}</h2>
                <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-slate-500">
                  {card.organization_name && <span>{card.organization_name}</span>}
                  {(card.venue_city || card.preferred_location) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} />
                      {card.venue_city ?? card.preferred_location}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {card.short_description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">About</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{card.short_description}</p>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Delivery" value={(card.delivery_modes ?? []).join(', ') || '—'} />
                <Detail
                  label="Openings"
                  value={card.number_of_openings === 0 ? 'Unlimited' : String(card.number_of_openings ?? '—')}
                />
                <Detail label="Fee" value={formatFee(card) || '—'} />
                <Detail
                  label="Apply By"
                  value={card.application_deadline
                    ? new Date(card.application_deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Open-ended'}
                />
                {card.expertise_level && (
                  <Detail label="Experience" value={card.expertise_level} />
                )}
                {card.event_date && (
                  <Detail
                    label="Event Date"
                    value={new Date(card.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  />
                )}
              </div>

              {/* Skills */}
              {(card.skills_required ?? []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Skills Required</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.skills_required.map(s => (
                      <span key={s} className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {(card.tags ?? []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.tags.map(t => (
                      <span key={t} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">Could not load opportunity details.</p>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            disabled
            title="Save — coming soon"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 cursor-not-allowed"
          >
            <Bookmark size={15} />
            Save
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              disabled
              title="Apply — coming soon"
              className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg opacity-40 cursor-not-allowed"
            >
              Apply →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value}</p>
    </div>
  )
}
