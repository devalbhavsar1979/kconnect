import apiClient from './client'
import type { AcademicDetail, AcademicDetailPayload } from '@/types'

export const academicApi = {
  list: async (): Promise<AcademicDetail[]> => {
    const { data } = await apiClient.get<AcademicDetail[]>('/users/me/academic')
    return data
  },

  create: async (payload: AcademicDetailPayload): Promise<AcademicDetail> => {
    const { data } = await apiClient.post<AcademicDetail>('/users/me/academic', payload)
    return data
  },

  update: async (id: string, payload: Partial<AcademicDetailPayload>): Promise<AcademicDetail> => {
    const { data } = await apiClient.put<AcademicDetail>(`/users/me/academic/${id}`, payload)
    return data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/me/academic/${id}`)
  },
}
