import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuthenticated, setTokens, setUser, logout: storeLogout } = useAuthStore()

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authApi.login({ email, password })
      setTokens(tokens.access_token, tokens.refresh_token)
      const profile = await authApi.me()
      setUser(profile)
      const dest = profile.user_type === 'SUPER_ADMIN' ? '/admin/dashboard' : '/dashboard'
      navigate(dest, { replace: true })
    },
    [navigate, setTokens, setUser]
  )

  const logout = useCallback(async () => {
    const { refreshToken } = useAuthStore.getState()
    try {
      if (refreshToken) {
        await authApi.logout({ refresh_token: refreshToken })
      }
    } catch {
      // Silently ignore logout errors — clear local state regardless
    } finally {
      storeLogout()
      navigate('/login', { replace: true })
    }
  }, [navigate, storeLogout])

  return { user, isAuthenticated, login, logout }
}
