import { Globe, ChevronDown } from 'lucide-react'

// ── Brand SVG icons ──────────────────────────────────────────────────────────

export function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

export function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

// ── K-CONNECT logo ───────────────────────────────────────────────────────────

export function KConnectLogo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
        <circle cx="40" cy="40" r="30" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
        <text x="40" y="48" textAnchor="middle" fill="white" fontSize="28" fontWeight="800" fontFamily="sans-serif">K</text>
        <rect x="31" y="62" width="18" height="3" rx="1" fill="#3b82f6" opacity="0.8" />
        <rect x="33" y="58" width="14" height="5" rx="1" fill="#3b82f6" opacity="0.5" />
        <circle cx="14" cy="32" r="3" fill="#60a5fa" opacity="0.8" />
        <path d="M9 44c0-3 2.5-5 5-5s5 2 5 5" stroke="#60a5fa" strokeWidth="1.2" fill="none" opacity="0.8" />
        <circle cx="66" cy="32" r="3" fill="#60a5fa" opacity="0.8" />
        <path d="M61 44c0-3 2.5-5 5-5s5 2 5 5" stroke="#60a5fa" strokeWidth="1.2" fill="none" opacity="0.8" />
        <circle cx="40" cy="8"  r="1.5" fill="#60a5fa" opacity="0.9" />
        <circle cx="18" cy="18" r="1.2" fill="#818cf8" opacity="0.7" />
        <circle cx="62" cy="18" r="1.2" fill="#818cf8" opacity="0.7" />
        <circle cx="11" cy="52" r="1"   fill="#60a5fa" opacity="0.6" />
        <circle cx="69" cy="52" r="1"   fill="#60a5fa" opacity="0.6" />
        <line x1="40" y1="10" x2="40" y2="18" stroke="#3b82f6" strokeWidth="0.8" opacity="0.4" />
        <line x1="20" y1="20" x2="26" y2="28" stroke="#3b82f6" strokeWidth="0.8" opacity="0.4" />
        <line x1="60" y1="20" x2="54" y2="28" stroke="#3b82f6" strokeWidth="0.8" opacity="0.4" />
      </svg>
      <div className="text-center">
        <p className="text-white font-extrabold text-2xl tracking-[0.12em]">K-CONNECT</p>
        <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase mt-0.5">
          Connecting <span className="text-blue-400">Knowledge</span> With Opportunity
          <span className="mx-2 inline-block w-6 h-px bg-violet-500 align-middle" />
        </p>
      </div>
    </div>
  )
}

// ── Cityscape illustration ───────────────────────────────────────────────────

export function CityscapeIllustration() {
  return (
    <div className="relative w-full max-w-md h-52">
      <svg viewBox="0 0 420 200" fill="none" className="w-full h-full">
        <defs>
          <radialGradient id="glow" cx="50%" cy="60%" r="40%">
            <stop offset="0%"  stopColor="#7c3aed" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#030c2e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bookGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <ellipse cx="210" cy="130" rx="160" ry="90" fill="url(#glow)" />
        {[30,60,80,50,70,45].map((h, i) => (
          <rect key={i} x={20 + i * 28} y={160 - h} width={20} height={h}
            stroke="#1e3a6e" strokeWidth="1" fill="#0a1845" opacity="0.5" />
        ))}
        {[50,75,55,65,40,55].map((h, i) => (
          <rect key={i} x={220 + i * 28} y={160 - h} width={20} height={h}
            stroke="#1e3a6e" strokeWidth="1" fill="#0a1845" opacity="0.5" />
        ))}
        <ellipse cx="60"  cy="35" rx="25" ry="10" stroke="#1e3a8a" strokeWidth="1" fill="#0d1e5a" opacity="0.5" />
        <ellipse cx="80"  cy="30" rx="20" ry="9"  stroke="#1e3a8a" strokeWidth="1" fill="#0d1e5a" opacity="0.5" />
        <ellipse cx="350" cy="40" rx="25" ry="10" stroke="#1e3a8a" strokeWidth="1" fill="#0d1e5a" opacity="0.5" />
        <ellipse cx="370" cy="35" rx="18" ry="8"  stroke="#1e3a8a" strokeWidth="1" fill="#0d1e5a" opacity="0.5" />
        <polygon points="210,60 240,73 210,86 180,73" fill="#1d4ed8" opacity="0.9" />
        <rect x="235" y="73" width="2" height="14" fill="#3b82f6" />
        <circle cx="236" cy="89" r="3" fill="#3b82f6" />
        <ellipse cx="210" cy="138" rx="55" ry="30" fill="url(#bookGlow)" opacity="0.6" />
        <path d="M210,115 Q185,118 170,128 Q175,148 210,150 Z" fill="#3730a3" stroke="#6d28d9" strokeWidth="1.2" opacity="0.9" />
        <path d="M210,115 Q235,118 250,128 Q245,148 210,150 Z" fill="#4338ca" stroke="#7c3aed" strokeWidth="1.2" opacity="0.9" />
        <line x1="210" y1="115" x2="210" y2="150" stroke="#a78bfa" strokeWidth="1.5" opacity="0.9" />
        <line x1="182" y1="127" x2="205" y2="127" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
        <line x1="179" y1="133" x2="205" y2="133" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
        <line x1="180" y1="139" x2="205" y2="139" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
        <line x1="215" y1="127" x2="238" y2="127" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
        <line x1="215" y1="133" x2="241" y2="133" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
        <line x1="215" y1="139" x2="240" y2="139" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
        <line x1="0" y1="160" x2="420" y2="160" stroke="#1e3a6e" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  )
}

// ── Feature item ─────────────────────────────────────────────────────────────

export function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const icons: Record<string, React.ReactNode> = {
    book: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    network: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
        <line x1="12" y1="7" x2="5" y2="17" /><line x1="12" y1="7" x2="19" y2="17" />
      </svg>
    ),
    star: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  }
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="w-11 h-11 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center">
        {icons[icon]}
      </div>
      <p className="text-white text-xs font-semibold leading-tight">{title}</p>
      <p className="text-slate-400 text-[11px] leading-relaxed">{desc}</p>
    </div>
  )
}

// ── Left panel (shared between Login and Register) ───────────────────────────

export function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-between w-1/2 px-14 py-10
                    bg-gradient-to-b from-[#020c2a] to-[#040f35]">
      <KConnectLogo />

      <div className="text-center -mt-4">
        <h1 className="text-4xl font-extrabold text-white leading-tight">
          Learn. <span className="text-blue-400">Connect.</span> Grow.
        </h1>
        <p className="text-slate-400 text-sm mt-3 max-w-xs leading-relaxed mx-auto">
          K-Connect is your gateway to knowledge, skills,
          and endless opportunities.
        </p>
      </div>

      <CityscapeIllustration />

      <div className="grid grid-cols-3 gap-6 w-full max-w-sm -mt-2">
        <FeatureItem icon="book"    title="Quality Learning"      desc="Access quality content from experts." />
        <FeatureItem icon="network" title="Career Opportunities"  desc="Connect with opportunities that matter." />
        <FeatureItem icon="star"    title="Build Your Future"     desc="Upgrade your skills and achieve your goals." />
      </div>
    </div>
  )
}

// ── Footer (shared) ──────────────────────────────────────────────────────────

export function AuthFooter() {
  return (
    <footer className="bg-[#020b28] border-t border-blue-900/30 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3
                      text-xs text-slate-500">
        <span>© 2024 K-Connect. All rights reserved.</span>
        <nav className="hidden sm:flex items-center gap-6">
          {['About Us', 'How It Works', 'Courses', 'Contact Us'].map((link) => (
            <a key={link} href="#" className="hover:text-slate-300 transition-colors">{link}</a>
          ))}
        </nav>
        <button className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
          <Globe size={13} />
          <span>English</span>
          <ChevronDown size={12} />
        </button>
      </div>
    </footer>
  )
}

// ── Social buttons row (shared) ──────────────────────────────────────────────

export function SocialButtons() {
  return (
    <>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-blue-900/50" />
        <span className="text-xs text-slate-500">or continue with</span>
        <div className="flex-1 h-px bg-blue-900/50" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Google',   Icon: GoogleIcon },
          { label: 'Facebook', Icon: FacebookIcon },
          { label: 'Apple',    Icon: AppleIcon },
        ].map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            disabled
            title={`${label} — coming soon`}
            className="flex items-center justify-center gap-1.5 py-2.5
                       bg-[#0d1d5a]/30 border border-blue-900/40 rounded-lg
                       text-white text-xs font-medium opacity-75 cursor-not-allowed"
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500 mt-5 leading-relaxed">
        By continuing, you agree to our{' '}
        <span className="text-blue-400 cursor-pointer hover:underline">Terms of Service</span>
        {' '}and{' '}
        <span className="text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>
      </p>
    </>
  )
}
