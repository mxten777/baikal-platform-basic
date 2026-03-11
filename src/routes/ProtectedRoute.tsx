import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { user, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
