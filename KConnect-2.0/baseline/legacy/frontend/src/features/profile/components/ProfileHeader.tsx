import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  CheckCircle2,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import type { ProfileCompletion, User } from '@/types'
import { experienceApi } from '@/api/experienceApi'
import { profileApi } from '@/api/profileApi'
import { ProfileCompletionCard } from './ProfileCompletionCard'

interface Props {
  profile: User
  completion: ProfileCompletion
  onEditProfile: () => void
  onCompleteProfile: () => void
  onPhotoSaved: (updated: User) => void
}

const USER_TYPE_LABELS: Record<string, string> = {
  SME: 'SME - Subject Matter Expert',
  PROFESSIONAL_SERVICE_PROVIDER: 'Professional Service Provider',
  ADMIN: 'Administrator',
  VENDOR: 'Vendor',
  TRAINER: 'Trainer',
  FREELANCER: 'Freelancer',
  CONSULTANT: 'Consultant',
}

const TITLE_LABELS: Record<string, string> = {
  MR: 'Mr.', MRS: 'Mrs.', MISS: 'Miss', DR: 'Dr.', PROF: 'Prof.',
}

const DESIGNATION_LABELS: Record<string, string> = {
  PROFESSOR:      'Professor',
  ASST_PROFESSOR: 'Asst. Professor',
  TRAINER:        'Trainer',
  GUEST_FACULTY:  'Guest Faculty',
}

export function ProfileHeader({
  profile,
  completion,
  onEditProfile,
  onCompleteProfile,
  onPhotoSaved,
}: Props) {
  const [uploading, setUploading]           = useState(false)
  const [photoError, setPhotoError]         = useState<string | null>(null)
  const [experienceSkills, setExpSkills]    = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    experienceApi.list()
      .then(entries => {
        const unique = [...new Set(entries.flatMap(e => e.skills ?? []))]
        setExpSkills(unique)
      })
      .catch(() => {})
  }, [])

  const initials = [profile.first_name?.[0], profile.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase()

  const taglineParts = [
    profile.designation ? DESIGNATION_LABELS[profile.designation] : null,
    profile.company     ?? null,
  ].filter((p): p is string => Boolean(p))

  const locationParts = [
    profile.address_city,
    profile.address_state,
    profile.address_country,
  ].filter((p): p is string => Boolean(p))

  const visibleSkills = experienceSkills.slice(0, 4)
  const extraSkills   = experienceSkills.length > 4 ? experienceSkills.length - 4 : 0

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setPhotoError(null)
    try {
      const updated = await profileApi.uploadPhoto(file)
      onPhotoSaved(updated)
    } catch {
      setPhotoError('Photo upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const photoUrl = profile.profile_photo_path
    ? `/${profile.profile_photo_path}`
    : null

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/*
        Three-column layout on desktop:
          [1] Avatar + name + role + tagline + location + skills  (flex-1)
          [2] Contact links                                        (w-52)
          [3] Completion card                                      (w-56)
        On mobile: stack vertically.
      */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── SECTION 1 — Avatar + identity ───────────────────────────── */}
        <div className="flex gap-5 lg:flex-1 min-w-0">

          {/* Avatar */}
          <div className="relative flex-shrink-0 self-start">
            <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-slate-100">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-500
                                flex items-center justify-center">
                  <span className="text-4xl font-bold text-white select-none">{initials}</span>
                </div>
              )}

              {/* Spinner overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Change profile photo"
              className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 hover:bg-blue-500
                         rounded-full flex items-center justify-center shadow-md
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={14} className="text-white" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Identity details */}
          <div className="flex-1 min-w-0 pt-1">
            {/* Name + verified */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-800 leading-tight">
                {profile.title ? `${TITLE_LABELS[profile.title]} ` : ''}{profile.first_name} {profile.last_name}
              </h1>
              {profile.is_verified && (
                <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0" fill="#2563eb" />
              )}
            </div>

            {/* Role pill */}
            <div className="mt-2">
              <span className="inline-block px-3 py-0.5 text-xs font-medium
                               border border-blue-600 text-blue-600 rounded-full">
                {USER_TYPE_LABELS[profile.user_type] ?? profile.user_type}
              </span>
            </div>

            {/* Tagline */}
            {taglineParts.length > 0 && (
              <p className="mt-2 text-sm text-slate-500 leading-snug">
                {taglineParts.join(' | ')}
              </p>
            )}

            {/* Location */}
            {locationParts.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
                <MapPin size={13} className="flex-shrink-0" />
                <span>{locationParts.join(', ')}</span>
              </div>
            )}

            {/* Skills */}
            {visibleSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {visibleSkills.map(skill => (
                  <span key={skill}
                        className="px-2.5 py-0.5 text-xs font-medium
                                   border border-blue-300 text-blue-600 rounded-full">
                    {skill}
                  </span>
                ))}
                {extraSkills > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-medium
                                   bg-slate-100 text-slate-500 rounded-full">
                    +{extraSkills} more
                  </span>
                )}
              </div>
            )}

            {photoError && (
              <p className="mt-2 text-xs text-red-500">{photoError}</p>
            )}
          </div>
        </div>

        {/* ── SECTION 2 — Contact ─────────────────────────────────────── */}
        <div className="flex flex-col justify-start gap-2.5 lg:flex-1 min-w-0 lg:pt-1">
          <a href={`mailto:${profile.email}`}
             className="flex items-center gap-2.5 text-sm text-slate-600
                        hover:text-blue-600 transition-colors min-w-0">
            <Mail size={15} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{profile.email}</span>
          </a>

          {profile.mobile_number && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Phone size={15} className="text-slate-400 flex-shrink-0" />
              <span>+91 {profile.mobile_number}</span>
            </div>
          )}

          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2.5 text-sm text-slate-600
                          hover:text-blue-600 transition-colors min-w-0">
              <Globe size={15} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{profile.website}</span>
            </a>
          )}

          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2.5 text-sm text-slate-600
                          hover:text-blue-600 transition-colors min-w-0">
              <Linkedin size={15} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{profile.linkedin}</span>
            </a>
          )}
        </div>

        {/* ── SECTION 3 — Completion card ─────────────────────────────── */}
        <div className="lg:flex-1 min-w-0">
          <ProfileCompletionCard
            percentage={completion.percentage}
            onEditProfile={onEditProfile}
            onCompleteProfile={onCompleteProfile}
          />
        </div>

      </div>
    </div>
  )
}
