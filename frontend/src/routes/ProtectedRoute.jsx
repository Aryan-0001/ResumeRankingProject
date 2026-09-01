import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { token, user } = useAuth()

  console.log('ProtectedRoute - Token:', token)
  console.log('ProtectedRoute - User:', user)
  console.log('ProtectedRoute - Allowed Roles:', allowedRoles)

  if (!token) {
    console.log('ProtectedRoute - No token, redirecting to login')
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    console.log('ProtectedRoute - Role check failed, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute - Access granted, rendering children')
  return children
}
