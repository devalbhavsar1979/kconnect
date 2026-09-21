import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { opportunityListingApi } from '@/api/opportunityListingApi'
import { INDIAN_STATES } from '@/features/admin/components/organisation/orgConstants'
import { OPPORTUNITY_TYPE_LISTING_LABELS } from '@/types/opportunity'
import type { ListingFilters, ListingTab, PaginatedOpportunityListings } from '@/types/opportunity'
import { OpportunityCard } from './components/OpportunityCard'
import { FilterSidebar } from './components/FilterSidebar'
import { ProfileCompletionWidget } from './components/ProfileCompletionWidget'
import { OpportunityDetailModal } from './components/OpportunityDetailModal'

const PAGE_SIZE = 12

const EMPTY_FILTERS: ListingFilters = {
  tab: 'all',
  search: '',
  opportunity_type: '',
  delivery_mode: '',
  expertise_level: '',
  state: '',
  category: '',
  date_filter: '',
  duration_keyword: '',
  sort_by: 'newest',
  page: 1,
}

const TABS: { key: ListingTab; label: string }[] = [
  { key: 'all', label: 'All Opportunities' },
  { key: 'recommended', label: 'Recommended' },
  { key: 'applied', label: 'Applied' },
  { key: 'closing_soon', label: 'Closing Soon' },
]

const DATE_OPTIONS = [
  { value: '', label: 'Any Date' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'next_3_months', label: 'Next 3 Months' },
]

const DURATION_OPTIONS = [
  { value: '', label: 'All Durations' },
  { value: 'hour', label: 'Half Day' },
  { value: '1 day', label: '1 Day' },
  { value: '2', label: '2–3 Days' },
  { value: 'week', label: '1 Week' },
  { value: 'ongoing', label: 'Ongoing' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Most Relevant' },
  { value: 'closing_soon', label: 'Closing Soon First' },
  { value: 'fee_desc', label: 'Fee: High to Low' },
]

function filtersFromParams(params: URLSearchParams): ListingFilters {
  return {
    tab: (params.get('tab') as ListingTab) || 'all',
    search: params.get('search') || '',
    opportunity_type: params.get('opportunity_type') || '',
    delivery_mode: params.get('delivery_mode') || '',
    expertise_level: params.get('expertise_level') || '',
    state: params.get('state') || '',
    category: params.get('category') || '',
    date_filter: params.get('date_filter') || '',
    duration_keyword: params.get('duration_keyword') || '',
    sort_by: (params.get('sort_by') as ListingFilters['sort_by']) || 'newest',
    page: parseInt(params.get('page') || '1', 10),
  }
}

function filtersToParams(f: ListingFilters): Record<string, string> {
  const out: Record<string, string> = {}
  if (f.tab !== 'all') out.tab = f.tab
  if (f.search) out.search = f.search
  if (f.opportunity_type) out.opportunity_type = f.opportunity_type
  if (f.delivery_mode) out.delivery_mode = f.delivery_mode
  if (f.expertise_level) out.expertise_level = f.expertise_level
  if (f.state) out.state = f.state
  if (f.category) out.category = f.category
  if (f.date_filter) out.date_filter = f.date_filter
  if (f.duration_keyword) out.duration_keyword = f.duration_keyword
  if (f.sort_by !== 'newest') out.sort_by = f.sort_by
  if (f.page > 1) out.page = String(f.page)
  return out
}

function hasActiveFilters(f: ListingFilters): boolean {
  return !!(f.search || f.opportunity_type || f.delivery_mode || f.expertise_level ||
    f.state || f.category || f.date_filter || f.duration_keyword || f.sort_by !== 'newest')
}

const selectCls = 'text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer'

export function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<ListingFilters>(() => filtersFromParams(searchParams))
  const [data, setData] = useState<PaginatedOpportunityListings | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync filter state → URL params
  useEffect(() => {
    setSearchParams(filtersToParams(filters), { replace: true })
  }, [filters, setSearchParams])

  // Fetch opportunities when filters change (skip for recommended tab)
  useEffect(() => {
    if (filters.tab === 'recommended') { setData(null); setLoading(false); return }
    setLoading(true)
    opportunityListingApi
      .list({ ...filters, size: PAGE_SIZE })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [filters])

  function patch(update: Partial<ListingFilters>) {
    setFilters(f => ({ ...f, ...update, page: 1 }))
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => patch({ search: value }), 300)
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Browse Opportunities</h2>
            {data && !loading && (
              <p className="text-sm text-slate-500 mt-0.5">
                Showing <span className="font-semibold text-slate-700">{data.total}</span> opportunit{data.total !== 1 ? 'ies' : 'y'}
              </p>
            )}
          </div>
          {/* Mobile Filters button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200
                       text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilters(filters) && (
              <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-xs rounded-full">
                !
              </span>
            )}
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setFilters(f => ({ ...f, tab: t.key, page: 1 }))}
              className={`px-5 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                filters.tab === t.key
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
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search title, skill, keyword…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400"
              />
            </div>

            {/* Location */}
            <select value={filters.state} onChange={e => patch({ state: e.target.value })} className={selectCls}>
              <option value="">All Locations</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Type */}
            <select value={filters.opportunity_type} onChange={e => patch({ opportunity_type: e.target.value })} className={selectCls}>
              <option value="">All Types</option>
              {Object.entries(OPPORTUNITY_TYPE_LISTING_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>

            {/* Duration */}
            <select value={filters.duration_keyword} onChange={e => patch({ duration_keyword: e.target.value })} className={selectCls}>
              {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Date */}
            <select value={filters.date_filter} onChange={e => patch({ date_filter: e.target.value })} className={selectCls}>
              {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Sort */}
            <select value={filters.sort_by} onChange={e => patch({ sort_by: e.target.value as ListingFilters['sort_by'] })} className={selectCls}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Save Search — Phase 2 */}
            <button
              disabled
              title="Coming soon"
              className="text-sm text-slate-400 px-3 py-2 border border-slate-200 rounded-lg cursor-not-allowed"
            >
              Save Search
            </button>

            {/* Clear all */}
            {hasActiveFilters(filters) && (
              <button
                onClick={() => { setSearchInput(''); setFilters(EMPTY_FILTERS) }}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <X size={13} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* 3-column layout */}
        <div className="flex gap-4 items-start">
          {/* Left sidebar — profile widget */}
          <div className="hidden xl:block w-56 shrink-0">
            <ProfileCompletionWidget />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {filters.tab === 'recommended' ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
                <p className="text-slate-500 text-sm font-medium mb-1">Personalised recommendations coming soon.</p>
                <p className="text-slate-400 text-xs">Complete your profile to be matched with the best opportunities.</p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 h-60 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
                    <div className="h-5 bg-slate-100 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                    <div className="h-16 bg-slate-100 rounded mb-3" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-slate-100 rounded-full" />
                      <div className="h-5 w-20 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
                <p className="text-slate-500 text-sm mb-3">No opportunities match your filters.</p>
                <button
                  onClick={() => { setSearchInput(''); setFilters(EMPTY_FILTERS) }}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.items.map(card => (
                    <OpportunityCard
                      key={card.id}
                      card={card}
                      onViewDetails={setDetailId}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
                    <span>Page {filters.page} of {totalPages}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={filters.page <= 1}
                        onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                        className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50
                                   transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <button
                        disabled={filters.page >= totalPages}
                        onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                        className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50
                                   transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right sidebar — filter panel (desktop) */}
          <div className="hidden md:block w-64 shrink-0">
            <FilterSidebar filters={filters} onChange={patch} />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="w-72 bg-white h-full overflow-y-auto p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-slate-800">Filters</span>
              <button onClick={() => setDrawerOpen(false)}>
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={p => { patch(p); setDrawerOpen(false) }}
            />
          </div>
        </div>
      )}

      {/* Detail modal */}
      <OpportunityDetailModal opportunityId={detailId} onClose={() => setDetailId(null)} />
    </>
  )
}
