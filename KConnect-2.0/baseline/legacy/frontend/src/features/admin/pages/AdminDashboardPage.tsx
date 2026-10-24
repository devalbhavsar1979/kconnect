import { useEffect, useState } from 'react'
import { Users, Briefcase, ClipboardList, ShieldAlert, UserCheck, TrendingUp } from 'lucide-react'
import { adminDashboardApi } from '@/api/adminDashboardApi'
import type { DashboardStats } from '@/types/admin'

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  loading: boolean
}

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-slate-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-800">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    adminDashboardApi.getStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Users',            value: stats?.total_users ?? 0,           icon: Users,       color: 'bg-blue-600' },
    { label: 'Active Users',           value: stats?.active_users ?? 0,          icon: UserCheck,   color: 'bg-emerald-600' },
    { label: 'Total Opportunities',    value: stats?.total_opportunities ?? 0,   icon: Briefcase,   color: 'bg-violet-600' },
    { label: 'Open Opportunities',     value: stats?.open_opportunities ?? 0,    icon: TrendingUp,  color: 'bg-amber-500' },
    { label: 'Total Applications',     value: stats?.total_applications ?? 0,    icon: ClipboardList, color: 'bg-sky-600' },
    { label: 'Pending Verifications',  value: stats?.pending_verifications ?? 0, icon: ShieldAlert, color: 'bg-rose-500' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform overview at a glance</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(card => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>
    </div>
  )
}
