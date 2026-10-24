// ── Enum mirrors matching backend Python enums ──────────────────────────────

export type UserType =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SME'
  | 'PROFESSIONAL_SERVICE_PROVIDER'
  // kept for legacy data / future re-activation:
  | 'VENDOR'
  | 'TRAINER'
  | 'FREELANCER'
  | 'CONSULTANT'

export type ProfileStatus = 'INCOMPLETE' | 'COMPLETE'

export type TitleType = 'MR' | 'MRS' | 'MISS' | 'DR' | 'PROF'

export type GenderType = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'

export type DesignationType =
  | 'PROFESSOR'
  | 'ASST_PROFESSOR'
  | 'TRAINER'
  | 'GUEST_FACULTY'

export type OpportunityType =
  | 'TRAINING'
  | 'SME'
  | 'FREELANCE'
  | 'CONSULTING'
  | 'PROJECT'
  | 'WORKSHOP'
  | 'LECTURE'
  | 'OTHER'

export type OpportunityStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED'

export type LocationType = 'REMOTE' | 'ONSITE' | 'HYBRID'

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'SELECTED'
  | 'WITHDRAWN'

// ── Domain models ─────────────────────────────────────────────────────────────

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  mobile_number: string | null
  user_type: UserType
  profile_status: ProfileStatus
  is_active: boolean
  is_verified: boolean

  // migration 002
  date_of_birth: string | null
  cv_file_path: string | null

  // migration 004 — extended profile
  profile_photo_path: string | null
  title: TitleType | null
  gender: GenderType | null
  website: string | null
  linkedin: string | null
  company: string | null
  designation: DesignationType | null
  short_bio: string | null
  address_flat: string | null
  address_area: string | null
  address_city: string | null
  address_state: string | null
  address_country: string | null
  address_pincode: string | null
  consent: boolean

  created_at: string
  updated_at: string
}

export interface ProfileCompletion {
  percentage: number
  missing_fields: string[]
}

export interface ProfileUpdatePayload {
  first_name?: string
  last_name?: string
  title?: TitleType
  gender?: GenderType
  mobile_number?: string
  website?: string
  linkedin?: string
  date_of_birth?: string
  company?: string
  designation?: DesignationType
  short_bio?: string
  address_flat?: string
  address_area?: string
  address_city?: string
  address_state?: string
  address_country?: string
  address_pincode?: string
  user_type?: UserType
  consent?: boolean
}

export interface Organization {
  id: string
  organization_name: string
  organization_type: string | null
  website: string | null
  email: string | null
  mobile_number: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  title: string
  description: string
  opportunity_type: OpportunityType
  organization_id: string
  location_type: LocationType | null
  location: string | null
  skills_required: string[] | null
  experience_required: string | null
  budget_min: number | null
  budget_max: number | null
  currency: string | null
  start_date: string | null
  end_date: string | null
  status: OpportunityStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  opportunity_id: string
  applicant_id: string
  status: ApplicationStatus
  cover_note: string | null
  applied_at: string
  updated_at: string
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AcademicDetail {
  id: string
  user_id: string
  school: string
  degree: string
  field_of_study: string | null
  end_month: number | null   // 1–12
  end_year: number | null
  grade: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface AcademicDetailPayload {
  school: string
  degree: string
  field_of_study?: string
  end_month?: number
  end_year?: number
  grade?: string
  description?: string
}

export type ExperienceLocationType = 'ONSITE' | 'HYBRID' | 'REMOTE'

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'FREELANCE'
  | 'SELF_EMPLOYED'
  | 'INTERNSHIP'
  | 'APPRENTICESHIP'

export interface ExperienceEntry {
  id              : string
  user_id         : string
  job_title       : string
  organization    : string
  location        : string | null
  location_type   : ExperienceLocationType | null
  employment_type : EmploymentType | null
  is_current      : boolean
  start_month     : number
  start_year      : number
  end_month       : number | null
  end_year        : number | null
  highlights      : string | null
  skills          : string[] | null
  created_at      : string
  updated_at      : string
}

export interface ExperienceEntryPayload {
  job_title        : string
  organization     : string
  location?        : string
  location_type?   : ExperienceLocationType
  employment_type? : EmploymentType
  is_current?      : boolean
  start_month      : number
  start_year       : number
  end_month?       : number
  end_year?        : number
  highlights?      : string
  skills?          : string[]
}

export interface UserExpertise {
  id                  : string
  user_id             : string
  total_experience    : string
  teaching_experience : string
  corporate_training  : string
  online_training     : string
  classroom_training  : string
  primary_expertise   : string
  secondary_expertise : string | null
  audience_levels     : string[]
  created_at          : string
  updated_at          : string
}

export interface UserExpertisePayload {
  total_experience    : string
  teaching_experience : string
  corporate_training  : string
  online_training     : string
  classroom_training  : string
  primary_expertise   : string
  secondary_expertise?: string
  audience_levels     : string[]
}

export interface UserPreferences {
  id                    : string
  user_id               : string
  delivery_modes        : string[]
  geographic_preference : string[]
  willing_to_travel     : boolean
  max_travel_distance   : string | null
  travel_reimbursement  : boolean
  preferred_audience    : string[]
  services              : string[]
  training_topics       : string[]
  created_at            : string
  updated_at            : string
}

export interface UserPreferencesPayload {
  delivery_modes        : string[]
  geographic_preference : string[]
  willing_to_travel     : boolean
  max_travel_distance?  : string
  travel_reimbursement  : boolean
  preferred_audience    : string[]
  services              : string[]
  training_topics       : string[]
}

export interface UserServiceDelivery {
  id      : string
  user_id : string
  // Section 1 — Lecture Delivery
  can_take_lecture          : boolean
  lecture_classroom         : boolean
  lecture_online            : boolean
  lecture_offline_recording : boolean
  lecture_blended_flipped   : boolean
  lecture_hybrid_hyflex     : boolean
  lecture_hands_on_workshop : boolean
  lecture_mentoring         : boolean
  // Section 2 — Content & Course Development
  can_create_content         : boolean
  content_creation           : boolean
  content_explainer          : boolean
  content_presentation       : boolean
  content_course_design      : boolean
  content_syllabus_design    : boolean
  content_reference_material : boolean
  // Section 3 — Language & Media
  lang_translation       : boolean
  lang_transcription     : boolean
  lang_transcript_review : boolean
  lang_proofreading      : boolean
  lang_voiceover         : boolean
  lang_localization      : boolean
  lang_subtitling        : boolean
  // Section 4 — Learning Support & Evaluation
  eval_case_study_creation  : boolean
  eval_case_study_review    : boolean
  eval_case_study_mentoring : boolean
  eval_assignment_creation  : boolean
  eval_assignment_review    : boolean
  eval_assignment_mentoring : boolean
  eval_qbank_creation       : boolean
  eval_qbank_review         : boolean
  eval_qpaper_creation      : boolean
  eval_qpaper_review        : boolean
  eval_qpaper_grading       : boolean
  created_at : string
  updated_at : string
}

export type UserServiceDeliveryPayload = Omit<
  UserServiceDelivery,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>

export const EMPTY_SERVICE_DELIVERY: UserServiceDelivery = {
  id: '', user_id: '',
  can_take_lecture: false,
  lecture_classroom: false,
  lecture_online: false,
  lecture_offline_recording: false,
  lecture_blended_flipped: false,
  lecture_hybrid_hyflex: false,
  lecture_hands_on_workshop: false,
  lecture_mentoring: false,
  can_create_content: false,
  content_creation: false,
  content_explainer: false,
  content_presentation: false,
  content_course_design: false,
  content_syllabus_design: false,
  content_reference_material: false,
  lang_translation: false,
  lang_transcription: false,
  lang_transcript_review: false,
  lang_proofreading: false,
  lang_voiceover: false,
  lang_localization: false,
  lang_subtitling: false,
  eval_case_study_creation: false,
  eval_case_study_review: false,
  eval_case_study_mentoring: false,
  eval_assignment_creation: false,
  eval_assignment_review: false,
  eval_assignment_mentoring: false,
  eval_qbank_creation: false,
  eval_qbank_review: false,
  eval_qpaper_creation: false,
  eval_qpaper_review: false,
  eval_qpaper_grading: false,
  created_at: '',
  updated_at: '',
}

export interface Achievement {
  id          : string
  user_id     : string
  title       : string
  description : string
  file_path   : string | null
  file_name   : string | null
  created_at  : string
  updated_at  : string
}

export interface AchievementPayload {
  title       : string
  description : string
  file?       : File | null
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AccessToken {
  access_token: string
  token_type: string
}

// ── API helpers ───────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}
