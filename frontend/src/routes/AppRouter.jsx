import { Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import CandidateDashboard from '../pages/candidate/CandidateDashboard.jsx'
import CompanyDashboard from '../pages/company/CompanyDashboard.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
