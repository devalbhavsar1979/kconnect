// ── Enums ─────────────────────────────────────────────────────────────────────

export type OpportunityType =
  | 'LECTURE'
  | 'CONTENT_COURSE_DEVELOPMENT'
  | 'LANGUAGE_MEDIA'
  | 'LEARNING_SUPPORT_EVALUATION'
  | 'CONTENT_ELEARNING'
  | 'EDITING_REVIEW'

export type SessionStructureType =
  | 'SINGLE_SESSION'
  | 'MULTIPLE_SESSIONS'
  | 'ONGOING_PROGRAM'

export type VenueLocationType =
  | 'CORPORATE'
  | 'INSTITUTE'
  | 'UNIVERSITY'
  | 'ONLINE'
  | 'OTHERS'

export type ExpertiseLevelType =
  | 'FRESHER'
  | 'EXPERIENCED'
  | 'EXPERT'

export type CompensationType =
  | 'PAID'
  | 'VOLUNTARY'
  | 'NEGOTIABLE'
  | 'TBD'

export type FeeStructureType =
  | 'PER_SESSION'
  | 'PER_PROGRAM'
  | 'PER_TASK'

export type OpportunityVisibility =
  | 'VISIBLE_TO_ALL'
  | 'SHORTLISTED_ONLY'

export type OpportunityStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'CLOSED'
  | 'CANCELLED'
  | 'ARCHIVED'

// ── Sub-objects ───────────────────────────────────────────────────────────────

export interface OpportunityAttachment {
  id: string
  opportunity_id: string
  file_name: string
  file_path: string
  file_size_bytes: number
  uploaded_at: string
}

// ── Main interfaces ───────────────────────────────────────────────────────────

export interface OpportunityListItem {
  id: string
  title: string
  opportunity_type: OpportunityType
  category: string
  status: OpportunityStatus
  visibility: OpportunityVisibility
  organization_id: string | null
  organization_name: string | null
  short_description: string | null
  delivery_modes: string[]
  skills_required: string[]
  compensation_type: CompensationType | null
  fee_amount: number | null
  fee_structure: FeeStructureType | null
  number_of_openings: number
  event_date: string
  application_deadline: string | null
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  // §1 Basics
  title: string
  opportunity_type: OpportunityType
  category: string
  sub_category: string | null
  delivery_modes: string[]
  number_of_openings: number
  session_structure: SessionStructureType
  total_duration: string
  duration_per_session: string
  // §2 Organization
  organization_id: string | null
  // §3 Details
  short_description: string
  detailed_description: string
  tags: string[]
  // §4 Schedule & Location
  event_date: string
  start_time: string | null
  end_time: string | null
  venue_name: string | null
  venue_location_type: VenueLocationType | null
  venue_address: string | null
  target_audience: string[]
  // §5 Requirements
  skills_required: string[]
  minimum_experience: string | null
  expertise_level: ExpertiseLevelType | null
  additional_requirements: string | null
  language_of_delivery: string
  // §6 Eligibility & Preferences
  preferred_location: string | null
  gender_preference: string | null
  candidate_preference: string | null
  notes_for_applicants: string | null
  application_deadline: string | null
  // §7 Compensation & Benefits
  compensation_type: CompensationType
  fee_structure: FeeStructureType | null
  fee_amount: number | null
  payment_terms: string | null
  travel_required: boolean
  travel_reimbursement: boolean
  other_benefits: string | null
  // §8 Visibility & Status
  visibility: OpportunityVisibility
  status: OpportunityStatus
  // Metadata
  created_by: string
  created_at: string
  updated_at: string
  attachments: OpportunityAttachment[]
}

// Form state — same as Opportunity without server-only fields
export type OpportunityFormState = Omit<
  Opportunity,
  'id' | 'created_by' | 'created_at' | 'updated_at' | 'attachments'
>

export const EMPTY_OPPORTUNITY_FORM: OpportunityFormState = {
  title: '',
  opportunity_type: 'LECTURE',
  category: '',
  sub_category: null,
  delivery_modes: [],
  number_of_openings: 1,
  session_structure: 'SINGLE_SESSION',
  total_duration: '',
  duration_per_session: '',
  organization_id: null,
  short_description: '',
  detailed_description: '',
  tags: [],
  event_date: '',
  start_time: null,
  end_time: null,
  venue_name: null,
  venue_location_type: null,
  venue_address: null,
  target_audience: [],
  skills_required: [],
  minimum_experience: null,
  expertise_level: null,
  additional_requirements: null,
  language_of_delivery: '',
  preferred_location: null,
  gender_preference: null,
  candidate_preference: null,
  notes_for_applicants: null,
  application_deadline: null,
  compensation_type: 'TBD',
  fee_structure: null,
  fee_amount: null,
  payment_terms: null,
  travel_required: false,
  travel_reimbursement: false,
  other_benefits: null,
  visibility: 'VISIBLE_TO_ALL',
  status: 'DRAFT',
}

// ── Paginated list response ───────────────────────────────────────────────────

export interface PaginatedOpportunities {
  items: OpportunityListItem[]
  total: number
  page: number
  size: number
}

// ── Display label maps ────────────────────────────────────────────────────────

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  LECTURE: 'Lecture',
  CONTENT_COURSE_DEVELOPMENT: 'Content & Course Development',
  LANGUAGE_MEDIA: 'Language & Media',
  LEARNING_SUPPORT_EVALUATION: 'Learning Support & Evaluation',
  CONTENT_ELEARNING: 'Content & E-Learning',
  EDITING_REVIEW: 'Editing & Review',
}

export const SESSION_STRUCTURE_LABELS: Record<SessionStructureType, string> = {
  SINGLE_SESSION: 'Single Session',
  MULTIPLE_SESSIONS: 'Multiple Sessions',
  ONGOING_PROGRAM: 'Ongoing Program',
}

export const VENUE_LOCATION_LABELS: Record<VenueLocationType, string> = {
  CORPORATE: 'Corporate',
  INSTITUTE: 'Institute',
  UNIVERSITY: 'University',
  ONLINE: 'Online',
  OTHERS: 'Others',
}

export const EXPERTISE_LEVEL_LABELS: Record<ExpertiseLevelType, string> = {
  FRESHER: 'Fresher',
  EXPERIENCED: 'Experienced',
  EXPERT: 'Expert',
}

export const COMPENSATION_TYPE_LABELS: Record<CompensationType, string> = {
  PAID: 'Paid',
  VOLUNTARY: 'Voluntary / Unpaid',
  NEGOTIABLE: 'Negotiable',
  TBD: 'TBD',
}

export const FEE_STRUCTURE_LABELS: Record<FeeStructureType, string> = {
  PER_SESSION: 'Per Session',
  PER_PROGRAM: 'Per Program',
  PER_TASK: 'Per Task',
}

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  ARCHIVED: 'Archived',
}

export const DELIVERY_MODE_OPTIONS = [
  { value: 'Classroom', label: 'Classroom' },
  { value: 'Online', label: 'Online' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Offline Recording', label: 'Offline Recording' },
  { value: 'Chat Support / Q&A', label: 'Chat Support / Q&A' },
]

export const TARGET_AUDIENCE_OPTIONS = [
  { value: 'SCHOOL', label: 'School' },
  { value: 'COLLEGE_UNIVERSITY', label: 'College / University' },
  { value: 'FRESHERS', label: 'Freshers' },
  { value: 'WORKING_PROFESSIONALS', label: 'Working Professionals' },
  { value: 'MANAGERS', label: 'Managers' },
  { value: 'SENIOR_MANAGEMENT', label: 'Senior Management' },
  { value: 'TECHNICAL_TEAMS', label: 'Technical Teams' },
  { value: 'NON_TECHNICAL_TEAMS', label: 'Non-Technical Teams' },
]

export const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu',
  'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi', 'Other',
]

export const MINIMUM_EXPERIENCE_OPTIONS = [
  { value: 'Fresher (0 yrs)', label: 'Fresher (0 yrs)' },
  { value: '1-2 years', label: '1–2 years' },
  { value: '3-5 years', label: '3–5 years' },
  { value: '5-8 years', label: '5–8 years' },
  { value: '8-10 years', label: '8–10 years' },
  { value: '10+ years', label: '10+ years' },
]

export const PAYMENT_TERMS_OPTIONS = [
  'Advance', 'On Completion', '50-50', 'Monthly', 'As Agreed',
]

// ── Expert listing card ───────────────────────────────────────────────────────

export interface OpportunityListingCard {
  id: string
  title: string
  opportunity_type: OpportunityType
  organization_name: string | null
  short_description: string | null
  delivery_modes: string[]
  skills_required: string[]
  tags: string[]
  venue_city: string | null
  preferred_location: string | null
  expertise_level: ExpertiseLevelType | null
  compensation_type: CompensationType | null
  fee_amount: number | null
  fee_structure: FeeStructureType | null
  number_of_openings: number | null
  application_deadline: string | null
  event_date: string | null
  total_duration: string | null
  created_at: string
  status: OpportunityStatus
}

export interface PaginatedOpportunityListings {
  items: OpportunityListingCard[]
  total: number
  page: number
  size: number
}

// ── Listing display maps ──────────────────────────────────────────────────────

export const OPPORTUNITY_TYPE_LISTING_LABELS: Record<OpportunityType, string> = {
  LECTURE: 'Lecture / Guest Faculty',
  CONTENT_COURSE_DEVELOPMENT: 'Course Development',
  LANGUAGE_MEDIA: 'Language & Media',
  LEARNING_SUPPORT_EVALUATION: 'Learning Support',
  CONTENT_ELEARNING: 'E-Learning Content',
  EDITING_REVIEW: 'Editing & Review',
}

export const OPPORTUNITY_TYPE_BADGE_CLASSES: Record<OpportunityType, string> = {
  LECTURE: 'bg-blue-100 text-blue-700',
  CONTENT_COURSE_DEVELOPMENT: 'bg-purple-100 text-purple-700',
  LANGUAGE_MEDIA: 'bg-teal-100 text-teal-700',
  LEARNING_SUPPORT_EVALUATION: 'bg-orange-100 text-orange-700',
  CONTENT_ELEARNING: 'bg-green-100 text-green-700',
  EDITING_REVIEW: 'bg-rose-100 text-rose-700',
}

export const OPPORTUNITY_TYPE_ICON_BG: Record<OpportunityType, string> = {
  LECTURE: 'bg-blue-50 text-blue-500',
  CONTENT_COURSE_DEVELOPMENT: 'bg-purple-50 text-purple-500',
  LANGUAGE_MEDIA: 'bg-teal-50 text-teal-500',
  LEARNING_SUPPORT_EVALUATION: 'bg-orange-50 text-orange-500',
  CONTENT_ELEARNING: 'bg-green-50 text-green-500',
  EDITING_REVIEW: 'bg-rose-50 text-rose-500',
}

export const FEE_STRUCTURE_SHORT_LABELS: Record<FeeStructureType, string> = {
  PER_SESSION: '/ session',
  PER_PROGRAM: '/ program',
  PER_TASK: '/ task',
}

export type ListingTab = 'all' | 'recommended' | 'applied' | 'saved' | 'closing_soon'

export type ListingSortBy = 'newest' | 'closing_soon' | 'fee_desc' | 'relevant'

export interface ListingFilters {
  tab: ListingTab
  search: string
  opportunity_type: string
  delivery_mode: string
  expertise_level: string
  state: string
  category: string
  date_filter: string
  duration_keyword: string
  sort_by: ListingSortBy
  page: number
}
