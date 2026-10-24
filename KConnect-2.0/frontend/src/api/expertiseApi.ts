import apiClient from './client'
import type { UserExpertise, UserExpertisePayload } from '@/types'

export const expertiseApi = {
  get: async (): Promise<UserExpertise | null> => {
    try {
      const { data } = await apiClient.get<UserExpertise>('/users/me/expertise')
      return data
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return null
      throw err
    }
  },

  upsert: async (payload: UserExpertisePayload): Promise<UserExpertise> => {
    const { data } = await apiClient.put<UserExpertise>('/users/me/expertise', payload)
    return data
  },
}
