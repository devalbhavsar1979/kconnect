import apiClient from './client'
import type { AdminUser, AdminUserUpdate, PaginatedAdminUsers } from '@/types/admin'

interface ListParams {
  page?: number
  size?: number
  search?: string
  user_type?: string
  is_active?: boolean
  is_verified?: boolean
}

export const adminUsersApi = {
  list: (params: ListParams = {}): Promise<PaginatedAdminUsers> =>
    apiClient.get('/admin/users', { params }).then(r => r.data),

  get: (id: string): Promise<AdminUser> =>
    apiClient.get(`/admin/users/${id}`).then(r => r.data),

  update: (id: string, data: AdminUserUpdate): Promise<AdminUser> =>
    apiClient.patch(`/admin/users/${id}`, data).then(r => r.data),
}
