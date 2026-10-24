import apiClient from './client'
import type { ExperienceEntry, ExperienceEntryPayload } from '@/types'

export const experienceApi = {
  list: async (): Promise<ExperienceEntry[]> => {
    const { data } = await apiClient.get<ExperienceEntry[]>('/users/me/experience')
    return data
  },

  create: async (payload: ExperienceEntryPayload): Promise<ExperienceEntry> => {
    const { data } = await apiClient.post<ExperienceEntry>('/users/me/experience', payload)
    return data
  },

  update: async (id: string, payload: Partial<ExperienceEntryPayload>): Promise<ExperienceEntry> => {
    const { data } = await apiClient.put<ExperienceEntry>(`/users/me/experience/${id}`, payload)
    return data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/me/experience/${id}`)
  },
}
