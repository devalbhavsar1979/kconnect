import { Clock, Video } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ScheduleItem {
  id: string
  title: string
  time: string
  duration: string
  type: 'interview' | 'session' | 'meeting' | 'deadline'
  virtual?: boolean
}

interface ScheduleCardProps {
  items: ScheduleItem[]
}

const typeColors: Record<ScheduleItem['type'], string> = {
  interview: 'border-l-blue-500   bg-blue-50',
  session:   'border-l-violet-500  bg-violet-50',
  meeting:   'border-l-green-500   bg-green-50',
  deadline:  'border-l-orange-500  bg-orange-50',
}

export function ScheduleCard({ items }: ScheduleCardProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        No upcoming events
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'border-l-4 rounded-lg p-3 flex items-start justify-between gap-3',
            typeColors[item.type]
          )}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={11} />
                {item.time}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{item.duration}</span>
            </div>
          </div>
          {item.virtual && (
            <Video size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
          )}
        </div>
      ))}
    </div>
  )
}
