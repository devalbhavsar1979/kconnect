import apiClient from './client'
import type { Achievement, AchievementPayload } from '@/types'

function buildForm(payload: AchievementPayload, forUpdate = false): FormData {
  const fd = new FormData()
  fd.append('title', payload.title)
  fd.append('description', payload.description)
  if (payload.file instanceof File) {
    fd.append('file', payload.file)
  } else if (forUpdate && payload.file === null) {
    fd.append('clear_file', 'true')
  }
  return fd
}

export const achievementsApi = {
  list: async (): Promise<Achievement[]> => {
    const { data } = await apiClient.get<Achievement[]>('/users/me/achievements')
    return data
  },

  create: async (payload: AchievementPayload): Promise<Achievement> => {
    const { data } = await apiClient.post<Achievement>(
      '/users/me/achievements',
      buildForm(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  update: async (id: string, payload: AchievementPayload): Promise<Achievement> => {
    const { data } = await apiClient.put<Achievement>(
      `/users/me/achievements/${id}`,
      buildForm(payload, true),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/me/achievements/${id}`)
  },
}
