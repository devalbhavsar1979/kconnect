import type { UserType, ProfileStatus, TitleType, GenderType, DesignationType } from './index'

export interface DashboardStats {
  total_users: number
  active_users: number
  total_opportunities: number
  open_opportunities: number
  total_applications: number
  pending_verifications: number
}

export interface AdminUser {
  id: string
  first_name: string
  last_name: string
  email: string
  mobile_number: string | null
  user_type: UserType
  profile_status: ProfileStatus
  is_active: boolean
  is_verified: boolean
  title: TitleType | null
  gender: GenderType | null
  designation: DesignationType | null
  company: string | null
  address_city: string | null
  address_state: string | null
  address_country: string | null
  date_of_birth: string | null
  created_at: string
  updated_at: string
}

export interface AdminUserUpdate {
  user_type?: UserType
  is_active?: boolean
  is_verified?: boolean
}

export interface AdminOrganisation {
  id: string
  organization_name: string
  industry: string | null
  organization_type: string | null
  website: string | null
  email: string | null
  mobile_number: string | null
  city: string | null
  state: string | null
  country: string | null
  address: string | null
  created_by: string
  created_at: string
  updated_at: string
  opportunity_count: number
}

export interface AdminOrgCreatePayload {
  organization_name: string
  industry: string
  organization_type: string
  website?: string | null
  email?: string | null
  mobile_number?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  address?: string | null
}

export type AdminOrgUpdatePayload = Partial<AdminOrgCreatePayload>

export interface Category {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryPayload {
  name: string
  description?: string
  is_active?: boolean
}

export interface PaginatedAdminUsers {
  items: AdminUser[]
  total: number
  page: number
  size: number
}

export interface PaginatedAdminOrgs {
  items: AdminOrganisation[]
  total: number
  page: number
  size: number
}
