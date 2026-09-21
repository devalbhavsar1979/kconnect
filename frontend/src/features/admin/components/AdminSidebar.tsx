import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Briefcase, CalendarDays, FileText,
  MessageSquare, BarChart2, Settings, HelpCircle,
  ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Tag,
  Building2,
} from 'lucide-react'

interface NavChild {
  label: string
  path: string
}

interface NavGroup {
  id: string
  label: string
  icon: React.ElementType
  path?: string
  children?: NavChild[]
}

const NAV: NavGroup[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  {
    id: 'users', label: 'User Management', icon: Users,
    children: [
      { label: 'All Users',              path: '/admin/users' },
      { label: 'Verification Requests',  path: '/admin/users/verification' },
    ],
  },
  {
    id: 'opportunities', label: 'Opportunities', icon: Briefcase,
    children: [
      { label: 'All Opportunities',   path: '/admin/opportunities' },
      { label: 'Applications',        path: '/admin/applications' },
      { label: 'Categories',          path: '/admin/categories' },
      { label: 'Organisations',       path: '/admin/organisations' },
    ],
  },
  {
    id: 'sessions', label: 'Sessions', icon: CalendarDays,
    children: [
      { label: 'All Sessions',     path: '/admin/sessions' },
      { label: 'Session Requests', path: '/admin/sessions/requests' },
    ],
  },
  {
    id: 'content', label: 'Content Management', icon: FileText,
    children: [
      { label: 'Announcements', path: '/admin/content/announcements' },
      { label: 'Banners',       path: '/admin/content/banners' },
    ],
  },
  {
    id: 'communications', label: 'Communications', icon: MessageSquare,
    children: [
      { label: 'Notifications',    path: '/admin/communications/notifications' },
      { label: 'Email Broadcasts', path: '/admin/communications/email' },
    ],
  },
  {
    id: 'analytics', label: 'Reports & Analytics', icon: BarChart2,
    children: [
      { label: 'Overview',             path: '/admin/analytics' },
      { label: 'User Reports',         path: '/admin/analytics/users' },
      { label: 'Opportunity Reports',  path: '/admin/analytics/opportunities' },
    ],
  },
  {
    id: 'settings', label: 'Settings', icon: Settings,
    children: [
      { label: 'Platform Settings', path: '/admin/settings/platform' },
      { label: 'Admin Accounts',    path: '/admin/settings/admins' },
    ],
  },
  {
    id: 'support', label: 'Support & Help', icon: HelpCircle,
    children: [
      { label: 'Support Requests', path: '/admin/support' },
    ],
  },
]

const STORAGE_KEY = 'admin-sidebar-collapsed'
const OPEN_KEY    = 'admin-sidebar-open-groups'

export function AdminSidebar() {
  const location = useLocation()

  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  )
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(OPEN_KEY)
      return new Set(saved ? JSON.parse(saved) : ['opportunities', 'users'])
    } catch {
      return new Set(['opportunities', 'users'])
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    localStorage.setItem(OPEN_KEY, JSON.stringify([...openGroups]))
  }, [openGroups])

  // Auto-open the group that contains the active route
  useEffect(() => {
    for (const group of NAV) {
      if (group.children?.some(c => location.pathname.startsWith(c.path))) {
        setOpenGroups(prev => new Set([...prev, group.id]))
      }
    }
  }, [location.pathname])

  function toggleGroup(id: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const isChildActive = (group: NavGroup) =>
    group.children?.some(c => location.pathname.startsWith(c.path)) ?? false

  return (
    <aside
      className={`flex flex-col bg-slate-900 h-screen sticky top-0 transition-all duration-300 flex-shrink-0
                  ${collapsed ? 'w-16' : 'w-56'}`}
    >
      {/* Brand */}
      <div className={`flex items-center gap-3 px-3 py-4 border-b border-slate-800
                       ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-base leading-none">K</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">K-CONNECT</p>
            <p className="text-slate-400 text-xs leading-tight truncate">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {NAV.map(group => {
          const Icon = group.icon

          if (!group.children) {
            return (
              <NavLink
                key={group.id}
                to={group.path!}
                title={collapsed ? group.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors
                   ${isActive
                     ? 'bg-blue-700 text-white'
                     : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                   } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{group.label}</span>}
              </NavLink>
            )
          }

          const active = isChildActive(group)
          const open   = openGroups.has(group.id) && !collapsed

          return (
            <div key={group.id}>
              <button
                onClick={() => !collapsed && toggleGroup(group.id)}
                title={collapsed ? group.label : undefined}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm
                            transition-colors
                            ${active
                              ? 'text-white bg-slate-800'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{group.label}</span>
                    <ChevronDown
                      size={14}
                      className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </>
                )}
              </button>

              {open && (
                <div className="mt-0.5 ml-4 pl-3 border-l border-slate-700 space-y-0.5">
                  {group.children.map(child => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        `block px-2 py-2 rounded-md text-xs transition-colors
                         ${isActive
                           ? 'bg-blue-700 text-white font-medium'
                           : 'text-slate-400 hover:text-white hover:bg-slate-800'
                         }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-800 p-2">
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`w-full flex items-center gap-2 px-2 py-2.5 rounded-lg text-slate-400
                      hover:bg-slate-800 hover:text-white transition-colors text-sm
                      ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse Menu</span>}
        </button>
      </div>
    </aside>
  )
}
