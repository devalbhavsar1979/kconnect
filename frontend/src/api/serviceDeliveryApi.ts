import apiClient from './client'
import type { UserServiceDelivery, UserServiceDeliveryPayload } from '@/types'

export const serviceDeliveryApi = {
  get: async (): Promise<UserServiceDelivery> => {
    const { data } = await apiClient.get<UserServiceDelivery>('/users/me/service-delivery')
    return data
  },

  upsert: async (payload: UserServiceDeliveryPayload): Promise<UserServiceDelivery> => {
    const { data } = await apiClient.put<UserServiceDelivery>('/users/me/service-delivery', payload)
    return data
  },
}
