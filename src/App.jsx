import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import SymptomChecker from './pages/SymptomChecker'
import BookAppointment from './pages/BookAppointment'
import TrackAppointment from './pages/TrackAppointment'
import Login from './pages/Login'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/symptom-checker" element={<SymptomChecker />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/track" element={<TrackAppointment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor" element={<ProtectedRoute roles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
