import apiClient from './client'
import type { AuthTokens, AccessToken, User } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  mobile_number?: string
  password: string
  confirm_password: string
  user_type?: string
  date_of_birth?: string   // YYYY-MM-DD
  cv?: File
}

export interface RefreshPayload {
  refresh_token: string
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>('/auth/login', payload)
    return data
  },

  register: async (payload: RegisterPayload): Promise<AuthTokens> => {
    const fd = new FormData()
    fd.append('first_name', payload.first_name)
    fd.append('last_name', payload.last_name)
    fd.append('email', payload.email)
    fd.append('password', payload.password)
    fd.append('confirm_password', payload.confirm_password)
    if (payload.mobile_number) fd.append('mobile_number', payload.mobile_number)
    if (payload.user_type)     fd.append('user_type', payload.user_type)
    if (payload.date_of_birth) fd.append('date_of_birth', payload.date_of_birth)
    if (payload.cv)            fd.append('cv', payload.cv)

    const { data } = await apiClient.post<AuthTokens>('/auth/register', fd)
    return data
  },

  refresh: async (payload: RefreshPayload): Promise<AccessToken> => {
    const { data } = await apiClient.post<AccessToken>('/auth/refresh', payload)
    return data
  },

  logout: async (payload: RefreshPayload): Promise<void> => {
    await apiClient.post('/auth/logout', payload)
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
}
