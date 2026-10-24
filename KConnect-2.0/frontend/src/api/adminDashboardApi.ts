import apiClient from './client'
import type { DashboardStats } from '@/types/admin'

export const adminDashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    apiClient.get('/admin/dashboard').then(r => r.data),
}
