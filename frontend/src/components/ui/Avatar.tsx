import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials?: string
  src?: string
  size?: AvatarSize
  gradient?: boolean
}

const sizeMap: Record<AvatarSize, string> = {
  xs: 'w-6  h-6  text-[10px]',
  sm: 'w-8  h-8  text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

export function Avatar({
  initials = '?',
  src,
  size = 'md',
  gradient = true,
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden',
        gradient
          ? 'bg-gradient-to-br from-blue-500 to-violet-600'
          : 'bg-slate-200',
        sizeMap[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={initials} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-semibold leading-none">{initials}</span>
      )}
    </div>
  )
}
