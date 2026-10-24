import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive, BookOpen, ClipboardCheck, Globe, MapPin,
  Mic2, Monitor, Pencil, Plus, Search, Sparkles, Users, X,
} from 'lucide-react'
import { opportunityAdminApi } from '@/api/opportunityAdminApi'
import type { OpportunityListItem, OpportunityStatus, OpportunityType } from '@/types/opportunity'
import {
  OPPORTUNITY_TYPE_LISTING_LABELS,
  OPPORTUNITY_TYPE_BADGE_CLASSES,
  OPPORTUNITY_TYPE_ICON_BG,
  FEE_STRUCTURE_SHORT_LABELS,
  OPPORTUNITY_STATUS_LABELS,
} from '@/types/opportunity'

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<OpportunityType, React.ElementType> = {
  LECTURE: Mic2,
  CONTENT_COURSE_DEVELOPMENT: BookOpen,
  LANGUAGE_MEDIA: Globe,
  LEARNING_SUPPORT_EVALUATION: ClipboardCheck,
  CONTENT_ELEARNING: Monitor,
  EDITING_REVIEW: Pencil,
}

const STATUS_BADGE: Record<OpportunityStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-orange-100 text-orange-600',
  ARCHIVED: 'bg-amber-100 text-amber-700',
}

const TABS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ARCHIVED', label: 'Archived' },
]

const TYPE_OPTIONS = Object.entries(OPPORTUNITY_TYPE_LISTING_LABELS) as [OpportunityType, string][]

const PAGE_SIZE = 12

const selectCls =
  'text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatFee(item: OpportunityListItem): string {
  if (!item.compensation_type) return ''
  switch (item.compensation_type) {
    case 'PAID':
      if (item.fee_amount) {
        const suffix = item.fee_structure
          ? (FEE_STRUCTURE_SHORT_LABELS[item.fee_structure] ?? '')
          : ''
        return `₹${Number(item.fee_amount).toLocaleString('en-IN')} ${suffix}`.trim()
      }
      return 'Paid'
    case 'NEGOTIABLE': return 'Negotiable'
    case 'VOLUNTARY': return 'Voluntary'
    case 'TBD': return 'TBD'
    default: return ''
  }
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000
}

// ── Admin Opportunity Card ─────────────────────────────────────────────────────

interface CardProps {
  item: OpportunityListItem
  onEdit: (id: string) => void
  onPublish: (id: string) => void
  onArchive: (id: string) => void
  actionLoading: string | null
}

function AdminOpportunityCard({ item, onEdit, onPublish, onArchive, actionLoading }: CardProps) {
  const type = item.opportunity_type
  const TypeIcon = TYPE_ICONS[type] ?? BookOpen
  const badgeCls = OPPORTUNITY_TYPE_BADGE_CLASSES[type] ?? 'bg-slate-100 text-slate-700'
  const iconBg = OPPORTUNITY_TYPE_ICON_BG[type] ?? 'bg-slate-50 text-slate-400'
  const typeLabel = OPPORTUNITY_TYPE_LISTING_LABELS[type] ?? type
  const statusCls = STATUS_BADGE[item.status] ?? 'bg-slate-100 text-slate-600'
  const feeDisplay = formatFee(item)
  const openings =
    item.number_of_openings === 0
      ? 'Unlimited'
      : `${item.number_of_openings} opening${item.number_of_openings !== 1 ? 's' : ''}`
  const busy = actionLoading === item.id

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3
                    hover:shadow-md hover:border-blue-100 transition-all duration-200">
      {/* Top row: type badge + status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>
            {typeLabel}
          </span>
          {isNew(item.created_at) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
              New
            </span>
          )}
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls}`}>
          {OPPORTUNITY_STATUS_LABELS[item.status]}
        </span>
      </div>

      {/* Icon + title + org */}
      <div className="flex gap-3 items-start">
        <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${iconBg}`}>
          <TypeIcon size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{item.title}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {item.organization_name && (
              <span className="text-xs text-slate-500">{item.organization_name}</span>
            )}
            {item.organization_name && <span className="text-slate-300 text-xs">·</span>}
            <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
              <MapPin size={11} />
              {item.event_date ? formatDate(item.event_date) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Short description */}
      {item.short_description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.short_description}</p>
      )}

      {/* Delivery + openings */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {(item.delivery_modes ?? []).map(mode => (
            <span key={mode} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">{mode}</span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 shrink-0">
          <Users size={11} />
          {openings}
        </span>
      </div>

      {/* Skills */}
      {(item.skills_required ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.skills_required.slice(0, 3).map(skill => (
            <span key={skill} className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md text-xs">
              {skill}
            </span>
          ))}
          {item.skills_required.length > 3 && (
            <span className="text-xs text-slate-400 px-1 self-center">
              +{item.skills_required.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Fee + deadline */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-col gap-0.5">
          {feeDisplay && (
            <span className="text-xs font-semibold text-slate-700">💰 {feeDisplay}</span>
          )}
          {item.application_deadline && (
            <span className="text-xs text-slate-400">
              📅 Deadline: {formatDate(item.application_deadline)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(item.id)}
            title="Edit"
            className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Pencil size={14} />
          </button>

          {item.status === 'DRAFT' && (
            <button
              onClick={() => onPublish(item.id)}
              disabled={busy}
              title="Publish"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium
                         bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={12} />
              {busy ? '…' : 'Publish'}
            </button>
          )}

          {item.status === 'OPEN' && (
            <button
              onClick={() => onArchive(item.id)}
              disabled={busy}
              title="Archive"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium
                         border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Archive size={12} />
              {busy ? '…' : 'Archive'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function OpportunitiesPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<OpportunityListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    opportunityAdminApi
      .list({
        page,
        size: PAGE_SIZE,
        status: activeTab || undefined,
        opportunity_type: typeFilter || undefined,
        search: search || undefined,
      })
      .then(r => { setItems(r.items); setTotal(r.total) })
      .finally(() => setLoading(false))
  }, [page, activeTab, typeFilter, search])

  useEffect(() => { load() }, [load])

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(1); setSearch(value) }, 300)
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab)
    setPage(1)
  }

  function handleTypeChange(t: string) {
    setTypeFilter(t)
    setPage(1)
  }

  async function handlePublish(id: string) {
    setActionLoading(id)
    try {
      await opportunityAdminApi.publish(id)
      showToast('Opportunity published', 'success')
      load()
    } catch {
      showToast('Publish failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleArchive(id: string) {
    if (!window.confirm('Archive this opportunity? It will no longer be visible to experts.')) return
    setActionLoading(id)
    try {
      await opportunityAdminApi.archive(id)
      showToast('Opportunity archived', 'success')
      load()
    } catch {
      showToast('Archive failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const hasFilters = !!(search || typeFilter)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Opportunities</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {total} total opportunit{total !== 1 ? 'ies' : 'y'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/opportunities/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                       text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
          >
            <Plus size={16} />
            Post Opportunity
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => handleTabChange(t.value)}
              className={`px-5 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.value
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search title, description, category…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400"
              />
            </div>

            {/* Type */}
            <select value={typeFilter} onChange={e => handleTypeChange(e.target.value)} className={selectCls}>
              <option value="">All Types</option>
              {TYPE_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); setTypeFilter(''); setPage(1) }}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Card grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 h-64 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
                <div className="h-5 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                <div className="h-14 bg-slate-100 rounded mb-3" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-16 text-center">
            <p className="text-slate-500 text-sm mb-4">
              {hasFilters ? 'No opportunities match your filters.' : 'No opportunities yet.'}
            </p>
            {hasFilters ? (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); setTypeFilter(''); setPage(1) }}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin/opportunities/new')}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
              >
                Post your first opportunity
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map(item => (
              <AdminOpportunityCard
                key={item.id}
                item={item}
                onEdit={id => navigate(`/admin/opportunities/${id}/edit`)}
                onPublish={handlePublish}
                onArchive={handleArchive}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50
                           transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50
                           transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg
                         text-white text-sm font-medium max-w-sm
                         ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}
    </>
  )
}
