import { cn } from '@/utils/cn'

type ActivityType = 'applied' | 'shortlisted' | 'rejected' | 'selected' | 'new_opportunity'

interface ActivityItemProps {
  type: ActivityType
  title: string
  description: string
  time: string
  isLast?: boolean
}

const dot: Record<ActivityType, string> = {
  applied:         'bg-blue-500',
  shortlisted:     'bg-yellow-500',
  rejected:        'bg-red-400',
  selected:        'bg-green-500',
  new_opportunity: 'bg-violet-500',
}

export function ActivityItem({ type, title, description, time, isLast }: ActivityItemProps) {
  return (
    <div className="flex gap-3">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', dot[type])} />
        {!isLast && <div className="w-px flex-1 mt-1.5 bg-slate-100 min-h-[1.5rem]" />}
      </div>

      {/* Content */}
      <div className="pb-4 min-w-0">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  )
}
