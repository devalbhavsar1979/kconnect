import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Pencil, X, Check } from 'lucide-react'
import { adminUsersApi } from '@/api/adminUsersApi'
import type { AdminUser, AdminUserUpdate } from '@/types/admin'
import type { UserType } from '@/types'

const USER_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '',                          label: 'All Types'  },
  { value: 'SME',                       label: 'SME'        },
  { value: 'PROFESSIONAL_SERVICE_PROVIDER', label: 'Service Provider' },
  { value: 'TRAINER',                   label: 'Trainer'    },
  { value: 'FREELANCER',                label: 'Freelancer' },
  { value: 'CONSULTANT',                label: 'Consultant' },
  { value: 'ADMIN',                     label: 'Admin'      },
]

const EDITABLE_TYPES: { value: UserType; label: string }[] = [
  { value: 'SME',                            label: 'SME'             },
  { value: 'PROFESSIONAL_SERVICE_PROVIDER',  label: 'Service Provider'},
  { value: 'TRAINER',                        label: 'Trainer'         },
  { value: 'FREELANCER',                     label: 'Freelancer'      },
  { value: 'CONSULTANT',                     label: 'Consultant'      },
  { value: 'ADMIN',                          label: 'Admin'           },
]

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full
                      ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full
                      ${verified ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
      {verified ? 'Verified' : 'Unverified'}
    </span>
  )
}

interface EditDrawerProps {
  user: AdminUser
  onClose: () => void
  onSaved: (updated: AdminUser) => void
}

function EditDrawer({ user, onClose, onSaved }: EditDrawerProps) {
  const [form,    setForm]    = useState<AdminUserUpdate>({
    user_type:   user.user_type,
    is_active:   user.is_active,
    is_verified: user.is_verified,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setError(null)
    try {
      const updated = await adminUsersApi.update(user.id, form)
      onSaved(updated)
    } catch {
      setError('Failed to save changes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1" />
      <div
        className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Edit User</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">User Type</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.user_type}
              onChange={e => setForm(f => ({ ...f, user_type: e.target.value as UserType }))}
            >
              {EDITABLE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-slate-700">Active</label>
            <button
              onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
              className={`relative w-10 h-5.5 rounded-full transition-colors
                          ${form.is_active ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
                                transition-transform
                                ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-slate-700">Verified</label>
            <button
              onClick={() => setForm(f => ({ ...f, is_verified: !f.is_verified }))}
              className={`relative w-10 h-5.5 rounded-full transition-colors
                          ${form.is_verified ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
                                transition-transform
                                ${form.is_verified ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium border border-slate-300 text-slate-600
                       rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg
                       hover:bg-blue-500 transition-colors disabled:opacity-70
                       flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function UsersPage() {
  const [users,    setUsers]    = useState<AdminUser[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [typeFilter, setType]   = useState('')
  const [activeFilter, setActive] = useState<string>('')
  const [verifiedFilter, setVerified] = useState<string>('')
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const PAGE_SIZE = 20

  const fetchUsers = useCallback(async (pg: number, s: string, t: string, a: string, v: string) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: pg, size: PAGE_SIZE }
      if (s) params.search = s
      if (t) params.user_type = t
      if (a !== '') params.is_active = a === 'true'
      if (v !== '') params.is_verified = v === 'true'
      const res = await adminUsersApi.list(params as never)
      setUsers(res.items)
      setTotal(res.total)
    } catch {
      // keep stale data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      fetchUsers(1, search, typeFilter, activeFilter, verifiedFilter)
    }, 300)
  }, [search, typeFilter, activeFilter, verifiedFilter])

  useEffect(() => {
    fetchUsers(page, search, typeFilter, activeFilter, verifiedFilter)
  }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const selectCls = 'px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={selectCls} value={typeFilter} onChange={e => setType(e.target.value)}>
          {USER_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className={selectCls} value={activeFilter} onChange={e => setActive(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select className={selectCls} value={verifiedFilter} onChange={e => setVerified(e.target.value)}>
          <option value="">All Verified</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No users found
                  </td>
                </tr>
              )}
              {!loading && users.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-blue-600">
                          {u.first_name[0]}{u.last_name[0]}
                        </span>
                      </div>
                      <span className="font-medium text-slate-800">{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.user_type.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3"><StatusBadge active={u.is_active} /></td>
                  <td className="px-4 py-3"><VerifiedBadge verified={u.is_verified} /></td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditUser(u)}
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages} · {total} users
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {editUser && (
        <EditDrawer
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={updated => {
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
            setEditUser(null)
          }}
        />
      )}
    </div>
  )
}
