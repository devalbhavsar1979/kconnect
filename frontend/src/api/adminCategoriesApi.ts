import apiClient from './client'
import type { Category, CategoryPayload } from '@/types/admin'

export const adminCategoriesApi = {
  list: (): Promise<Category[]> =>
    apiClient.get('/admin/categories').then(r => r.data),

  create: (data: CategoryPayload): Promise<Category> =>
    apiClient.post('/admin/categories', data).then(r => r.data),

  update: (id: string, data: Partial<CategoryPayload>): Promise<Category> =>
    apiClient.put(`/admin/categories/${id}`, data).then(r => r.data),

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/admin/categories/${id}`).then(() => undefined),
}
