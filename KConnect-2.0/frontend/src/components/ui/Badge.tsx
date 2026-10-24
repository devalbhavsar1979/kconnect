import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type BadgeColor =
  | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate' | 'orange'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor
}

const colorMap: Record<BadgeColor, string> = {
  blue:   'bg-blue-50   text-blue-700   border-blue-200',
  green:  'bg-green-50  text-green-700  border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  red:    'bg-red-50    text-red-700    border-red-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
  slate:  'bg-slate-100 text-slate-700  border-slate-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
}

export function Badge({ color = 'slate', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        colorMap[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
