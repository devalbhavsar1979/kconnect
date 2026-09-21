import { ChevronDown, X } from 'lucide-react'
import { useRef, useState } from 'react'

interface Option {
  value: string
  label: string
}

interface Props {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function MultiSelect({ options, value, onChange, placeholder = 'Select…', disabled = false }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  function toggle(val: string) {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  function remove(val: string, e: React.MouseEvent) {
    e.stopPropagation()
    onChange(value.filter(v => v !== val))
  }

  const selectedLabels = options.filter(o => value.includes(o.value))

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => !disabled && setOpen(o => !o)}
        className={`min-h-[42px] w-full px-3 py-1.5 flex flex-wrap gap-1.5 items-center
                    border border-slate-300 rounded-lg bg-white cursor-pointer
                    ${open ? 'ring-2 ring-blue-500 border-transparent' : ''}
                    ${disabled ? 'bg-slate-50 cursor-not-allowed' : ''}`}
      >
        {selectedLabels.length === 0 && (
          <span className="text-sm text-slate-400">{placeholder}</span>
        )}
        {selectedLabels.map(o => (
          <span
            key={o.value}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium
                       bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
          >
            {o.label}
            {!disabled && (
              <button type="button" onClick={e => remove(o.value, e)} className="hover:text-blue-900">
                <X size={10} />
              </button>
            )}
          </span>
        ))}
        <ChevronDown size={14} className="ml-auto text-slate-400 shrink-0" />
      </div>

      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200
                        rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {options.map(o => (
            <label
              key={o.value}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                         hover:bg-slate-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={value.includes(o.value)}
                onChange={() => toggle(o.value)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}
