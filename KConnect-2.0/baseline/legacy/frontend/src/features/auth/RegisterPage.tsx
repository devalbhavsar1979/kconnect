import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, ChevronDown, Calendar, Upload, X, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import type { UserType } from '@/types'
import { AuthLeftPanel, AuthFooter, SocialButtons } from './AuthLayout'

const USER_TYPES: { value: UserType; label: string }[] = [
  { value: 'SME',                        label: 'SME - Subject Matter Expert' },
  { value: 'PROFESSIONAL_SERVICE_PROVIDER', label: 'Professional Service Provider' },
  // future options — uncomment to re-enable:
  // { value: 'TRAINER',    label: 'Trainer' },
  // { value: 'FREELANCER', label: 'Freelancer' },
  // { value: 'CONSULTANT', label: 'Consultant' },
  // { value: 'VENDOR',     label: 'Vendor / Organisation' },
]

const MAX_CV_MB = 5
const ALLOWED_CV_EXTS = ['.pdf', '.doc', '.docx']
const ALLOWED_CV_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function RegisterPage() {
  const navigate               = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const cvInputRef             = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    first_name:       '',
    last_name:        '',
    email:            '',
    mobile_number:    '',
    password:         '',
    confirm_password: '',
    user_type:        'SME' as UserType,
    date_of_birth:    '',
  })
  const [showPassword, setShowPwd]     = useState(false)
  const [showConfirm,  setShowConfirm] = useState(false)
  const [cvFile,  setCvFile]           = useState<File | null>(null)
  const [cvError, setCvError]          = useState('')
  const [loading, setLoading]          = useState(false)
  const [error,   setError]            = useState('')

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleCvFile = (file: File | undefined) => {
    if (!file) return
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
    if (!ALLOWED_CV_EXTS.includes(ext) && !ALLOWED_CV_MIME.includes(file.type)) {
      setCvError('Only PDF, DOC, or DOCX files are allowed')
      return
    }
    if (file.size > MAX_CV_MB * 1024 * 1024) {
      setCvError(`File must be smaller than ${MAX_CV_MB} MB`)
      return
    }
    setCvError('')
    setCvFile(file)
  }

  const removeCv = () => {
    setCvFile(null)
    setCvError('')
    if (cvInputRef.current) cvInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const tokens = await authApi.register({
        first_name:       form.first_name,
        last_name:        form.last_name,
        email:            form.email,
        mobile_number:    form.mobile_number || undefined,
        password:         form.password,
        confirm_password: form.confirm_password,
        user_type:        form.user_type,
        date_of_birth:    form.date_of_birth || undefined,
        cv:               cvFile ?? undefined,
      })
      setTokens(tokens.access_token, tokens.refresh_token)
      const profile = await authApi.me()
      setUser(profile)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full py-2.5 bg-[#0d1d5a]/40 border border-blue-900/50 rounded-lg text-white ' +
    'text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 ' +
    'focus:ring-blue-500 focus:border-transparent transition-all'

  const today  = new Date().toISOString().split('T')[0]
  const minDob = `${new Date().getFullYear() - 100}-01-01`
  const pwdMismatch = form.confirm_password.length > 0 && form.password !== form.confirm_password

  return (
    <div className="min-h-screen bg-[#020c2a] flex flex-col">

      <div className="flex flex-1">
        {/* ── Left hero panel ───────────────────────────────────────────── */}
        <AuthLeftPanel />

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 bg-[#030e32] overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="bg-[#0a1645]/70 border border-blue-900/40 rounded-2xl p-7
                            shadow-[0_8px_40px_rgba(37,99,235,0.12)]">

              {/* Header */}
              <div className="text-center mb-5">
                <h2 className="text-2xl font-bold text-white">Join K-Connect!</h2>
                <p className="text-slate-400 text-sm mt-1">Start your journey to better opportunities</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-blue-900/40 mb-5">
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 pb-3 text-sm font-semibold text-slate-400
                             hover:text-white transition-colors"
                >
                  Login
                </button>
                <button className="flex-1 pb-3 text-sm font-semibold text-blue-400
                                   border-b-2 border-blue-400 -mb-px transition-colors">
                  Sign Up
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20
                                text-red-400 text-xs leading-relaxed">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* First + Last name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input required value={form.first_name} onChange={set('first_name')}
                        placeholder="John" className={`${inputCls} pl-9 pr-3`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input required value={form.last_name} onChange={set('last_name')}
                        placeholder="Doe" className={`${inputCls} pl-9 pr-3`} />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="email" required autoComplete="email"
                      value={form.email} onChange={set('email')}
                      placeholder="you@example.com" className={`${inputCls} pl-9 pr-3`} />
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Mobile Number{' '}
                    <span className="text-slate-500 text-xs font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="tel" value={form.mobile_number} onChange={set('mobile_number')}
                      placeholder="+91 99999 99999" className={`${inputCls} pl-9 pr-3`} />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">I am a</label>
                  <div className="relative">
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <select value={form.user_type} onChange={set('user_type')}
                      className={`${inputCls} px-3 pr-8 appearance-none cursor-pointer`}
                      style={{ background: 'rgba(13,29,90,0.4)' }}>
                      {USER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}
                          style={{ background: '#0a1645', color: 'white' }}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Date of Birth{' '}
                    <span className="text-slate-500 text-xs font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type="date" value={form.date_of_birth} onChange={set('date_of_birth')}
                      min={minDob} max={today}
                      className={`${inputCls} pl-9 pr-3`}
                      style={{ colorScheme: 'dark' }} />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type={showPassword ? 'text' : 'password'} required
                      autoComplete="new-password" minLength={8}
                      value={form.password} onChange={set('password')}
                      placeholder="Minimum 8 characters"
                      className={`${inputCls} pl-9 pr-10`} />
                    <button type="button" onClick={() => setShowPwd(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type={showConfirm ? 'text' : 'password'} required
                      autoComplete="new-password"
                      value={form.confirm_password} onChange={set('confirm_password')}
                      placeholder="Re-enter your password"
                      className={`${inputCls} pl-9 pr-10 ${pwdMismatch ? 'border-red-500/70 focus:ring-red-500' : ''}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {pwdMismatch && (
                    <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                {/* Upload CV */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Upload CV{' '}
                    <span className="text-slate-500 text-xs font-normal">
                      (optional — PDF, DOC, DOCX · max {MAX_CV_MB} MB)
                    </span>
                  </label>

                  {cvFile ? (
                    <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-700/40
                                    rounded-lg text-sm">
                      <FileText size={18} className="text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate text-xs">{cvFile.name}</p>
                        <p className="text-slate-500 text-xs">{formatBytes(cvFile.size)}</p>
                      </div>
                      <button type="button" onClick={removeCv}
                        className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-blue-900/50 rounded-lg p-5
                                  flex flex-col items-center gap-1.5 cursor-pointer
                                  hover:border-blue-600/60 hover:bg-blue-900/10 transition-all"
                      onClick={() => cvInputRef.current?.click()}
                      onDrop={(e) => { e.preventDefault(); handleCvFile(e.dataTransfer.files[0]) }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <Upload size={20} className="text-slate-500" />
                      <p className="text-slate-400 text-xs text-center">
                        <span className="text-blue-400 font-medium">Click to upload</span>{' '}
                        or drag and drop
                      </p>
                    </div>
                  )}

                  {cvError && <p className="mt-1 text-xs text-red-400">{cvError}</p>}

                  <input ref={cvInputRef} type="file" className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => handleCvFile(e.target.files?.[0])} />
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading || pwdMismatch}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                             disabled:opacity-60 disabled:cursor-not-allowed text-white
                             font-semibold rounded-lg transition-colors flex items-center
                             justify-center gap-2 text-sm mt-1">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account…
                    </>
                  ) : 'Sign Up'}
                </button>
              </form>

              <SocialButtons />
            </div>

            {/* Mobile login link */}
            <p className="lg:hidden text-center text-slate-500 text-xs mt-4">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Login
              </button>
            </p>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  )
}
