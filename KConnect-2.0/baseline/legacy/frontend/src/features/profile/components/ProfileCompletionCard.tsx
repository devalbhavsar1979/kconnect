import { ChevronDown } from 'lucide-react'

interface Props {
  percentage: number
  onEditProfile: () => void
  onCompleteProfile: () => void
}

const RADIUS = 32
const STROKE = 6
const SIZE   = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function statusText(pct: number): string {
  if (pct >= 100) return 'Profile complete!'
  if (pct >= 75)  return 'Almost there!'
  if (pct >= 50)  return 'Keep going!'
  return 'Just getting started!'
}

export function ProfileCompletionCard({ percentage, onEditProfile, onCompleteProfile }: Props) {
  const clamped = Math.min(100, Math.max(0, percentage))
  const offset  = CIRCUMFERENCE * (1 - clamped / 100)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-700">Profile Completion</span>
        <button
          onClick={onEditProfile}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600
                     border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Edit Profile
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Body */}
      <div className="flex items-center gap-4">
        {/* Circular progress ring */}
        <div className="flex-shrink-0">
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="-rotate-90"
          >
            {/* Background track */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#2563eb"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.7s ease-in-out' }}
            />
          </svg>
          {/* Percentage label — centred over the SVG */}
          <div
            className="flex items-center justify-center text-lg font-bold text-slate-800"
            style={{ marginTop: -(SIZE) }}
            aria-label={`${clamped}% complete`}
          >
            <span style={{ lineHeight: `${SIZE}px` }}>{clamped}%</span>
          </div>
        </div>

        {/* Right side text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-snug">
            {statusText(clamped)}
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-snug">
            Complete your profile to increase your visibility.
          </p>

          {clamped < 100 && (
            <button
              onClick={onCompleteProfile}
              className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                         text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Complete Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
