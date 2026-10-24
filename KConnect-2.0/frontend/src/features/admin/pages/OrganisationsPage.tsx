import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { adminOrgsApi } from '@/api/adminOrgsApi'
import type { AdminOrganisation } from '@/types/admin'
import type { PaginatedAdminOrgs } from '@/types/admin'
import { INDUSTRY_OPTIONS } from '../components/organisation/orgConstants'

export function OrganisationsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<AdminOrganisation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const SIZE = 20

  const load = useCallback(() => {
    setLoading(true)
    adminOrgsApi
      .list({ page, size: SIZE, search: search || undefined, industry: industry || undefined })
      .then((r: PaginatedAdminOrgs) => {
        setItems(r.items)
        setTotal(r.total)
      })
      .finally(() => setLoading(false))
  }, [page, search, industry])

  useEffect(() => { load() }, [load])

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  async function handleDelete(org: AdminOrganisation) {
    if (org.opportunity_count > 0) {
      showToast(
        `Cannot delete — organisation has ${org.opportunity_count} linked opportunit${org.opportunity_count === 1 ? 'y' : 'ies'}`,
        'error',
      )
      return
    }
    if (!window.confirm(`Delete "${org.organization_name}"? This cannot be undone.`)) return
    setDeletingId(org.id)
    try {
      await adminOrgsApi.delete(org.id)
      showToast('Organisation deleted', 'success')
      load()
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Delete failed'
      showToast(typeof detail === 'string' ? detail : 'Delete failed', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const totalPages = Math.ceil(total / SIZE)

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Organisations</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {total} total organisation{total !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/organisations/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                       text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
          >
            <Plus size={16} />
            Add Organisation
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4
                        flex flex-wrap gap-3 items-center">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by name or city…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit"
              className="px-4 py-2 text-sm font-medium bg-slate-700 text-white
                         rounded-lg hover:bg-slate-600 transition-colors">
              Search
            </button>
          </form>

          <select
            value={industry}
            onChange={e => { setPage(1); setIndustry(e.target.value) }}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Industries</option>
            {INDUSTRY_OPTIONS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-slate-50 m-3 rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm mb-4">No organisations found.</p>
              <button
                onClick={() => navigate('/admin/organisations/new')}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium
                           rounded-lg hover:bg-blue-500 transition-colors"
              >
                Add first organisation
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['Organisation', 'Industry', 'Type', 'Location', 'Opps', 'Actions'].map(h => (
                    <th key={h}
                      className={`text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide
                                  ${['Industry', 'Type', 'Location'].includes(h) ? 'hidden md:table-cell' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(org => (
                  <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 line-clamp-1">{org.organization_name}</p>
                      {org.email && (
                        <p className="text-xs text-slate-400 mt-0.5">{org.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600 text-xs">
                      {org.industry ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600 text-xs">
                      {org.organization_type ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600 text-xs">
                      {[org.city, org.state, org.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium
                                       bg-blue-50 text-blue-700 rounded-full">
                        {org.opportunity_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/organisations/${org.id}/edit`)}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-blue-600
                                     rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(org)}
                          title="Delete"
                          disabled={deletingId === org.id}
                          className="p-1.5 text-slate-400 hover:text-red-500
                                     rounded-lg hover:bg-red-50 transition-colors
                                     disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50
                           transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50
                           transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg
                      text-white text-sm font-medium max-w-sm
                      ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
