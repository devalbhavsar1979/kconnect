import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description?: string
  icon?: LucideIcon
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon = Construction,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100
                      flex items-center justify-center mb-5">
        <Icon size={28} className="text-blue-400" />
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">{title}</h1>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        {description ??
          `The ${title} module is currently in development and will be available in a future release.`}
      </p>
      <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50
                      border border-blue-100 rounded-full text-blue-600 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        Coming Soon
      </div>
    </div>
  )
}
