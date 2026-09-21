import { useLocation } from 'react-router-dom'
import { Menu, Bell, Search } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/opportunities': 'Opportunities',
  '/applications':  'Applications',
  '/assignments':   'Assignments',
  '/calendar':      'Calendar',
  '/messages':      'Messages',
  '/notifications': 'Notifications',
  '/profile':       'Profile',
  '/documents':     'Documents',
  '/settings':      'Settings',
  '/help':          'Help & Support',
}

export function Header() {
  const { toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const { pathname } = useLocation()

  const title = PAGE_TITLES[pathname] ?? 'K-CONNECT'
  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : 'KK'

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 px-4 md:px-6
                        bg-white border-b border-slate-200 gap-4">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900
                   hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold text-slate-900 flex-1 truncate">
        {title}
      </h1>

      {/* Search — hidden on small mobile */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100
                      rounded-lg text-slate-500 text-sm w-48 md:w-64 cursor-text">
        <Search size={15} className="flex-shrink-0" />
        <span className="text-slate-400">Search…</span>
      </div>

      {/* Notifications */}
      <button className="relative p-2 text-slate-500 hover:text-slate-900
                         hover:bg-slate-100 rounded-lg transition-colors">
        <Bell size={19} />
        {/* Notification dot */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500
                          rounded-full border-2 border-white" />
      </button>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600
                      flex items-center justify-center cursor-pointer flex-shrink-0">
        <span className="text-white text-xs font-semibold">{initials}</span>
      </div>
    </header>
  )
}
