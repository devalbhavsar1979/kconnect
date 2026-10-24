import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileApi } from '@/api/profileApi'

export function ProfileCompletionWidget() {
  const navigate = useNavigate()
  const [pct, setPct] = useState<number | null>(null)

  useEffect(() => {
    profileApi.getCompletion()
      .then(c => setPct(c.percentage))
      .catch(() => null)
  }, [])

  if (pct === null || pct >= 100) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-700">Your Profile</p>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">
            {pct >= 75 ? 'Almost there!' : pct >= 50 ? 'Keep going!' : 'Just getting started!'}
          </span>
          <span className="text-xs font-bold text-blue-600">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Complete your profile to receive personalised recommendations.
      </p>

      <button
        onClick={() => navigate('/profile')}
        className="w-full text-sm font-medium text-blue-600 hover:text-blue-700
                   py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
      >
        Complete Profile →
      </button>
    </div>
  )
}
