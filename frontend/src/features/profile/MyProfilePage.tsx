import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProfileCompletion, User } from '@/types'
import { profileApi } from '@/api/profileApi'

import { AcademicDetailsTab }        from './components/AcademicDetailsTab'
import { AchievementsTab }           from './components/AchievementsTab'
import { ExperienceTab }             from './components/ExperienceTab'
import { ExpertiseTab }              from './components/ExpertiseTab'
import { PreferencesTab }            from './components/PreferencesTab'
import { ServiceDeliveryTab }        from './components/ServiceDeliveryTab'
import { BioCard }                  from './components/BioCard'
import { EditPersonalInfoDrawer }    from './components/EditPersonalInfoDrawer'
import { PersonalInfoCard }          from './components/PersonalInfoCard'
import { ProfileCompletionCard }     from './components/ProfileCompletionCard'
import { ProfileHeader }             from './components/ProfileHeader'
import { ProfileTabBar }             from './components/ProfileTabBar'

// ── Placeholder card for overview grid cells ──────────────────────────────────

function PlaceholderCard({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col justify-between">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <p className="text-sm text-slate-400 italic mt-3">Coming soon…</p>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 h-44" />
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm h-12" />
      {/* Content */}
      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-10 lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm h-64" />
          <div className="bg-white rounded-xl shadow-sm h-32" />
        </div>
        <div className="col-span-10 lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm h-40" />
          <div className="bg-white rounded-xl shadow-sm h-40" />
        </div>
        <div className="col-span-10 lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm h-40" />
          <div className="bg-white rounded-xl shadow-sm h-40" />
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function MyProfilePage() {
  const [profile, setProfile]                         = useState<User | null>(null)
  const [completion, setCompletion]                   = useState<ProfileCompletion | null>(null)
  const [activeTab, setActiveTab]                     = useState('overview')
  const [editPersonalInfoOpen, setEditPersonalInfoOpen] = useState(false)
  const [loading, setLoading]                         = useState(true)
  const [error, setError]                             = useState<string | null>(null)
  const [toast, setToast]                             = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [prof, comp] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getCompletion(),
      ])
      setProfile(prof)
      setCompletion(comp)
    } catch {
      setError('Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [fetchData])

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) return <Skeleton />

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <p className="text-slate-500 text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                     hover:bg-blue-500 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!profile) return null

  const safeCompletion: ProfileCompletion = completion ?? { percentage: 0, missing_fields: [] }

  // ── Tab content ────────────────────────────────────────────────────────────

  const tabContent: Record<string, React.ReactNode> = {
    overview: (
      <div className="grid grid-cols-10 gap-4">
        {/* Left column */}
        <div className="col-span-10 lg:col-span-3 space-y-4">
          <PersonalInfoCard
            profile={profile}
            onEdit={() => setEditPersonalInfoOpen(true)}
          />
          <BioCard
            bio={profile.short_bio}
            onEdit={() => setEditPersonalInfoOpen(true)}
          />
        </div>

        {/* Middle column */}
        <div className="col-span-10 lg:col-span-4 space-y-4">
          <PlaceholderCard title="Expertise & Skills" />
          <PlaceholderCard title="Experience Summary" />
          <PlaceholderCard title="Training Topics" />
        </div>

        {/* Right column */}
        <div className="col-span-10 lg:col-span-3 space-y-4">
          <PlaceholderCard title="Documents" />
          <PlaceholderCard title="Availability & Preferences" />
        </div>
      </div>
    ),

    academic: <AcademicDetailsTab />,

    experience: <ExperienceTab />,

    expertise: <ExpertiseTab />,

    documents: <PreferencesTab />,

    availability: <ServiceDeliveryTab />,

    reviews: <AchievementsTab />,
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        <ProfileHeader
          profile={profile}
          completion={safeCompletion}
          onEditProfile={() => setEditPersonalInfoOpen(true)}
          onCompleteProfile={() => setActiveTab('overview')}
          onPhotoSaved={setProfile}
        />

        <ProfileTabBar activeTab={activeTab} onChange={setActiveTab} />

        {tabContent[activeTab] ?? tabContent.overview}
      </div>

      <EditPersonalInfoDrawer
        profile={profile}
        open={editPersonalInfoOpen}
        onClose={() => setEditPersonalInfoOpen(false)}
        onSaved={(updated) => {
          setProfile(updated)
          setEditPersonalInfoOpen(false)
          showToast('Profile updated successfully', 'success')
          profileApi.getCompletion().then(setCompletion).catch(() => null)
        }}
      />

      {/* Page-level toast — bottom-right */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg
                      text-white text-sm font-medium transition-all
                      ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.message}
        </div>
      )}
    </>
  )
}
