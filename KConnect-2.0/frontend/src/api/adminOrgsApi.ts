import apiClient from './client'
import type {
  AdminOrganisation,
  AdminOrgCreatePayload,
  AdminOrgUpdatePayload,
  PaginatedAdminOrgs,
} from '@/types/admin'

interface ListParams {
  page?: number
  size?: number
  search?: string
  industry?: string
}

export const adminOrgsApi = {
  list: (params: ListParams = {}): Promise<PaginatedAdminOrgs> =>
    apiClient.get('/admin/organisations', { params }).then(r => r.data),

  get: (id: string): Promise<AdminOrganisation> =>
    apiClient.get(`/admin/organisations/${id}`).then(r => r.data),

  create: (data: AdminOrgCreatePayload): Promise<AdminOrganisation> =>
    apiClient.post('/admin/organisations', data).then(r => r.data),

  update: (id: string, data: AdminOrgUpdatePayload): Promise<AdminOrganisation> =>
    apiClient.put(`/admin/organisations/${id}`, data).then(r => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/admin/organisations/${id}`).then(() => undefined),
}
