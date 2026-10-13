import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const dashPath = user?.role === 'ADMIN' ? '/admin' : '/doctor'

  return (
    <div className="app">
      <header className="navbar">
        <NavLink to="/" className="brand">
          <span className="brand-icon">✚</span> MediCare <b>AI</b>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/symptom-checker">AI Symptom Checker</NavLink>
          <NavLink to="/book">Book Appointment</NavLink>
          <NavLink to="/track">My Appointments</NavLink>
          {user && <NavLink to={dashPath}>Dashboard</NavLink>}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-chip">{user.name} · {user.role}</span>
              <button className="btn btn-outline" onClick={() => { logout(); navigate('/') }}>Logout</button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary">Staff Login</NavLink>
          )}
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} MediCare AI Smart Hospital · Java Full Stack Project (React + Spring Boot + MySQL)
        <div className="muted small">The AI symptom checker is an educational tool and not a medical diagnosis.</div>
      </footer>
    </div>
  )
}
