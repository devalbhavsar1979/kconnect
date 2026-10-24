import { useRef, useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
  maxTags?: number
  disabled?: boolean
}

export function TagInput({
  tags,
  onChange,
  placeholder = 'Type and press Enter to add',
  suggestions = [],
  maxTags = 20,
  disabled = false,
}: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function commit() {
    const value = input.trim()
    if (!value || tags.includes(value) || tags.length >= maxTags) return
    onChange([...tags, value])
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function remove(tag: string) {
    onChange(tags.filter(t => t !== tag))
  }

  return (
    <div>
      <div
        className="min-h-[42px] w-full px-2 py-1.5 flex flex-wrap gap-1.5
                   border border-slate-300 rounded-lg bg-white
                   focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent
                   cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium
                       bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); remove(tag) }}
                className="hover:text-blue-900 transition-colors"
              >
                <X size={10} />
              </button>
            )}
          </span>
        ))}
        {!disabled && tags.length < maxTags && (
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onBlur={commit}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] text-sm outline-none bg-transparent
                       placeholder:text-slate-400 py-0.5"
          />
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {suggestions
            .filter(s => !tags.includes(s))
            .map(s => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (tags.length < maxTags) onChange([...tags, s])
                }}
                disabled={disabled}
                className="px-2 py-0.5 text-xs border border-slate-200 text-slate-500
                           rounded-full hover:bg-slate-50 hover:border-slate-300
                           transition-colors disabled:opacity-50"
              >
                + {s}
              </button>
            ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-1">
        {tags.length}/{maxTags} tags
      </p>
    </div>
  )
}
