import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/utils/cn'

type StatColor = 'blue' | 'purple' | 'green' | 'orange' | 'red'

interface StatCardProps {
  title: string
  value: string | number
  trend?: string
  trendUp?: boolean
  icon: LucideIcon
  color?: StatColor
}

const colorMap: Record<StatColor, { icon: string; bg: string; ring: string }> = {
  blue:   { icon: 'text-blue-600',   bg: 'bg-blue-50',   ring: 'ring-blue-100' },
  purple: { icon: 'text-violet-600', bg: 'bg-violet-50', ring: 'ring-violet-100' },
  green:  { icon: 'text-green-600',  bg: 'bg-green-50',  ring: 'ring-green-100' },
  orange: { icon: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100' },
  red:    { icon: 'text-red-600',    bg: 'bg-red-50',    ring: 'ring-red-100' },
}

export function StatCard({ title, value, trend, trendUp, icon: Icon, color = 'blue' }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && (
            <div className={cn('flex items-center gap-1 mt-1.5 text-xs font-medium',
              trendUp !== false ? 'text-green-600' : 'text-red-500'
            )}>
              {trendUp !== false
                ? <TrendingUp size={12} />
                : <TrendingDown size={12} />}
              {trend}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl ring-1', c.bg, c.ring)}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </div>
  )
}
