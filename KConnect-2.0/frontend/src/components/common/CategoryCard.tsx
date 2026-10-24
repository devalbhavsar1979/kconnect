import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CategoryCardProps {
  label: string
  count: number
  icon: LucideIcon
  color?: 'blue' | 'purple' | 'green' | 'orange'
  onClick?: () => void
}

const colorMap = {
  blue:   'from-blue-500   to-blue-600',
  purple: 'from-violet-500 to-violet-600',
  green:  'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
}

export function CategoryCard({
  label, count, icon: Icon, color = 'blue', onClick,
}: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl p-5 text-left w-full',
        'bg-gradient-to-br text-white transition-transform hover:scale-[1.02] active:scale-100',
        colorMap[color]
      )}
    >
      <div className="absolute -right-4 -bottom-4 opacity-20">
        <Icon size={80} />
      </div>
      <Icon size={24} className="mb-3 opacity-90" />
      <p className="text-sm font-medium opacity-90">{label}</p>
      <p className="text-2xl font-bold mt-1">{count}</p>
      <p className="text-xs opacity-70 mt-0.5">opportunities</p>
    </button>
  )
}
