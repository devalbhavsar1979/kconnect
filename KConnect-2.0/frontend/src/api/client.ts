import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

// ── Request interceptor — attach access token ─────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — handle 401 with silent token refresh ───────────────
let isRefreshing = false
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` }
        return apiClient(original)
      })
    }

    original._retry = true
    isRefreshing = true

    const { refreshToken, setTokens, logout } = useAuthStore.getState()

    if (!refreshToken) {
      isRefreshing = false
      logout()
      return Promise.reject(error)
    }

    try {
      // Use a plain axios call to avoid infinite interceptor loop
      const res = await axios.post(`${BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      })
      const newAccessToken: string = res.data.access_token
      setTokens(newAccessToken, refreshToken)
      processQueue(null, newAccessToken)
      original.headers = { ...original.headers, Authorization: `Bearer ${newAccessToken}` }
      return apiClient(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      logout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
