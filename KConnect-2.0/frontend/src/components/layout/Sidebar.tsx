import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, User, Briefcase, ClipboardList, CalendarDays,
  CalendarCheck, Mail, BookOpen, Wallet, Star,
  Bell, Settings, HelpCircle, LogOut, X, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'

interface NavItemDef {
  path: string
  label: string
  icon: LucideIcon
  badge?: number
}

const navItems: NavItemDef[] = [
  { path: '/dashboard',     label: 'Dashboard',        icon: Home },
  { path: '/profile',       label: 'My Profile',       icon: User },
  { path: '/opportunities', label: 'Opportunities',    icon: Briefcase },
  { path: '/applications',  label: 'My Applications',  icon: ClipboardList },
  { path: '/sessions',      label: 'My Sessions',      icon: CalendarDays },
  { path: '/availability',  label: 'Availability',     icon: CalendarCheck },
  { path: '/messages',      label: 'Messages',         icon: Mail,     badge: 3 },
  { path: '/resources',     label: 'Resources',        icon: BookOpen },
  { path: '/earnings',      label: 'Earnings',         icon: Wallet },
  { path: '/reviews',       label: 'Reviews',          icon: Star },
  { path: '/notifications', label: 'Notifications',    icon: Bell,     badge: 5 },
  { path: '/settings',      label: 'Settings',         icon: Settings },
  { path: '/help',          label: 'Help & Support',   icon: HelpCircle },
]

// Items shown in the mobile bottom toolbar
const mobileBottomItems: NavItemDef[] = [
  { path: '/dashboard',     label: 'Dashboard',     icon: Home },
  { path: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { path: '/sessions',      label: 'My Sessions',   icon: CalendarDays },
  { path: '/messages',      label: 'Messages',      icon: Mail, badge: 3 },
  { path: '/profile',       label: 'My Profile',    icon: User },
]

function NavItem({
  path, label, icon: Icon, badge, onClick,
}: NavItemDef & { onClick?: () => void }) {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'sidebar-nav-item',
          isActive ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
        )
      }
    >
      <Icon size={17} className="flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto h-5 min-w-[20px] px-1 flex items-center justify-center
                         rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrator',
  SME: 'Subject Matter Expert',
  PROFESSIONAL_SERVICE_PROVIDER: 'Professional Service Provider',
  VENDOR: 'Vendor',
  TRAINER: 'Trainer',
  FREELANCER: 'Freelancer',
  CONSULTANT: 'Consultant',
}

export function Sidebar() {
  const { sidebarOpen, closeSidebar } = useUIStore()
  const { user, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { refreshToken } = useAuthStore.getState()
    try {
      if (refreshToken) await authApi.logout({ refresh_token: refreshToken })
    } catch { /* ignore */ }
    storeLogout()
    navigate('/login', { replace: true })
  }

  const userInitials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : 'KK'

  return (
    <>
      {/* ── Desktop / slide-in sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-navy-900',
          'transition-transform duration-250 ease-out',
          'md:relative md:translate-x-0 md:flex',
          sidebarOpen ? 'translate-x-0 animate-slide-in' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-none tracking-wide">K-CONNECT</p>
              <p className="text-slate-500 text-[10px] mt-0.5 truncate">Connect. Grow. Succeed.</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden text-slate-500 hover:text-slate-300 p-1"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.path} {...item} onClick={closeSidebar} />
          ))}
        </nav>

        {/* User strip + logout */}
        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600
                            flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">{userInitials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-200 text-xs font-medium truncate">
                {user ? `${user.first_name} ${user.last_name}` : 'User'}
              </p>
              <p className="text-slate-500 text-[10px] truncate">
                {user ? (roleLabel[user.user_type] ?? user.user_type) : ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom toolbar ──────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-navy-900 border-t border-white/5
                      flex items-stretch h-16">
        {mobileBottomItems.map(({ path, label, icon: Icon, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 relative',
                'text-[10px] font-medium transition-colors',
                isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              )
            }
          >
            <span className="relative">
              <Icon size={20} />
              {badge != null && badge > 0 && (
                <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-0.5 flex items-center
                                 justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {badge}
                </span>
              )}
            </span>
            <span className="leading-none">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
