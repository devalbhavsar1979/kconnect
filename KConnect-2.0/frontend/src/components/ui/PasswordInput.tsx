import { forwardRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from './Input'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  hint?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = 'Password', ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        label={label}
        leftIcon={<Lock size={15} />}
        rightElement={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-slate-400 hover:text-slate-700 transition-colors"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
