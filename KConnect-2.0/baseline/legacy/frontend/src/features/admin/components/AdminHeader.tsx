import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, KeyRound, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  onMenuToggle?: () => void
}

function breadcrumbs(pathname: string): { label: string; path: string }[] {
  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean)
  const crumbs: { label: string; path: string }[] = [
    { label: 'Dashboard', path: '/admin/dashboard' },
  ]
  let current = '/admin'
  for (const seg of segments) {
    if (seg === 'dashboard') break
    current += `/${seg}`
    crumbs.push({
      label: seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      path: current,
    })
  }
  return crumbs
}

export function AdminHeader({ onMenuToggle }: Props) {
  const location = useLocation()
  const { logout } = useAuth()
  const user = useAuthStore(s => s.user)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const crumbs = breadcrumbs(location.pathname)
  const pageTitle = crumbs[crumbs.length - 1]?.label ?? 'Dashboard'

  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || 'SA'

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="h-15 flex items-center justify-between px-5 py-3.5 bg-white
                       border-b border-slate-200 shadow-sm sticky top-0 z-30">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          onClick={onMenuToggle}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-1.5 text-sm min-w-0">
          {crumbs.map((crumb, i) => (
            <span key={crumb.path} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <span className="text-slate-300 flex-shrink-0">›</span>}
              {i === crumbs.length - 1 ? (
                <span className="font-semibold text-slate-800 truncate">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-slate-500 hover:text-blue-600 transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Right: bell + user chip */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                       hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-800 leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-400 leading-tight">Super Admin</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl
                            shadow-lg border border-slate-100 py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
              <button
                onClick={() => { setDropdownOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600
                           hover:bg-slate-50 transition-colors"
              >
                <KeyRound size={14} className="text-slate-400" />
                Change Password
              </button>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => { setDropdownOpen(false); logout() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600
                             hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
