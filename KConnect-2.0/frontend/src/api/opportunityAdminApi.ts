import apiClient from './client'
import type {
  Opportunity,
  OpportunityFormState,
  OpportunityListItem,
  OpportunityAttachment,
  PaginatedOpportunities,
} from '@/types/opportunity'

interface ListParams {
  page?: number
  size?: number
  status?: string
  opportunity_type?: string
  search?: string
}

export const opportunityAdminApi = {
  list: (params: ListParams = {}): Promise<PaginatedOpportunities> =>
    apiClient.get('/admin/opportunities', { params }).then(r => r.data),

  get: (id: string): Promise<Opportunity> =>
    apiClient.get(`/admin/opportunities/${id}`).then(r => r.data),

  create: (data: OpportunityFormState): Promise<Opportunity> =>
    apiClient.post('/admin/opportunities', data).then(r => r.data),

  update: (id: string, data: Partial<OpportunityFormState>): Promise<Opportunity> =>
    apiClient.put(`/admin/opportunities/${id}`, data).then(r => r.data),

  publish: (id: string): Promise<Opportunity> =>
    apiClient.post(`/admin/opportunities/${id}/publish`).then(r => r.data),

  archive: (id: string): Promise<Opportunity> =>
    apiClient.post(`/admin/opportunities/${id}/archive`).then(r => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/admin/opportunities/${id}`).then(() => undefined),

  uploadAttachment: (id: string, file: File): Promise<OpportunityAttachment> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient
      .post(`/admin/opportunities/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data)
  },

  deleteAttachment: (id: string, attachmentId: string): Promise<void> =>
    apiClient
      .delete(`/admin/opportunities/${id}/attachments/${attachmentId}`)
      .then(() => undefined),
}
