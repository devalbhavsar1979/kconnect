interface Props {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}

export function FormField({ label, required, error, hint, children }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Shared input class helpers
export const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
  'placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500'

export const selectCls = inputCls

export const textareaCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white resize-y ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
  'placeholder:text-slate-400 disabled:bg-slate-50'
