import apiClient from './client'
import type { ProfileCompletion, ProfileUpdatePayload, User } from '@/types'

export const profileApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me/profile')
    return data
  },

  updateProfile: async (payload: ProfileUpdatePayload): Promise<User> => {
    const { data } = await apiClient.put<User>('/users/me/profile', payload)
    return data
  },

  uploadPhoto: async (file: File): Promise<User> => {
    const fd = new FormData()
    fd.append('photo', file)
    const { data } = await apiClient.post<User>('/users/me/profile/photo', fd)
    return data
  },

  getCompletion: async (): Promise<ProfileCompletion> => {
    const { data } = await apiClient.get<ProfileCompletion>('/users/me/completion')
    return data
  },
}
