import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AuthLeftPanel, AuthFooter, SocialButtons } from './AuthLayout'

export function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPwd]  = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full py-3 bg-[#0d1d5a]/40 border border-blue-900/50 rounded-lg text-white ' +
    'text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 ' +
    'focus:ring-blue-500 focus:border-transparent transition-all'

  return (
    <div className="min-h-screen bg-[#020c2a] flex flex-col">

      <div className="flex flex-1">
        {/* ── Left hero panel ───────────────────────────────────────────── */}
        <AuthLeftPanel />

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#030e32]">
          <div className="w-full max-w-md">
            <div className="bg-[#0a1645]/70 border border-blue-900/40 rounded-2xl p-8
                            shadow-[0_8px_40px_rgba(37,99,235,0.12)]">

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
                <p className="text-slate-400 text-sm mt-1">Login to your account to continue</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-blue-900/40 mb-6">
                <button className="flex-1 pb-3 text-sm font-semibold text-blue-400
                                   border-b-2 border-blue-400 -mb-px transition-colors">
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 pb-3 text-sm font-semibold text-slate-400
                             hover:text-white transition-colors"
                >
                  Sign Up
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20
                                text-red-400 text-xs leading-relaxed">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email" required autoComplete="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email ID / Mobile Number"
                      className={`${inputCls} pl-10 pr-4`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`${inputCls} pl-10 pr-10`}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                    <span className="text-sm text-slate-400">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot Password?
                  </button>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
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
                      Logging in…
                    </>
                  ) : 'Login'}
                </button>
              </form>

              <SocialButtons />
            </div>

            {/* Mobile sign-up link */}
            <p className="lg:hidden text-center text-slate-500 text-xs mt-4">
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  )
}
