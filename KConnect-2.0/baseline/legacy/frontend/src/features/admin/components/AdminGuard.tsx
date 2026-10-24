import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function AdminGuard() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (user.user_type !== 'SUPER_ADMIN') return <Navigate to="/" replace />
  return <Outlet />
}
