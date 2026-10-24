import apiClient from './client'
import type { UserPreferences, UserPreferencesPayload } from '@/types'

export const preferencesApi = {
  get: async (): Promise<UserPreferences | null> => {
    try {
      const { data } = await apiClient.get<UserPreferences>('/users/me/preferences')
      return data
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return null
      throw err
    }
  },

  upsert: async (payload: UserPreferencesPayload): Promise<UserPreferences> => {
    const { data } = await apiClient.put<UserPreferences>('/users/me/preferences', payload)
    return data
  },
}
