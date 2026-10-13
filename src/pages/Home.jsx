import { Link } from 'react-router-dom'

const features = [
  { icon: '🤖', title: 'AI Symptom Checker', text: 'Describe how you feel and our triage engine suggests the right specialist and urgency level.' },
  { icon: '📅', title: 'Instant Booking', text: 'No sign-up needed. Tell us your issue, pick a doctor and slot, and see your fee upfront.' },
  { icon: '👨‍⚕️', title: 'Doctor Dashboard', text: 'Doctors manage their appointments, confirm visits and write consultation notes.' },
  { icon: '📊', title: 'Admin Control', text: 'Admins manage doctors, patients and monitor hospital statistics and revenue.' },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <span className="pill">AI-Powered Healthcare</span>
          <h1>Smarter care,<br />faster appointments.</h1>
          <p>
            MediCare AI combines intelligent symptom triage with simple online booking so patients reach
            the right doctor at the right time.
          </p>
          <div className="hero-actions">
            <Link to="/book" className="btn btn-primary btn-lg">Book Appointment</Link>
            <Link to="/symptom-checker" className="btn btn-outline btn-lg">Check Symptoms</Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-stat"><b>8+</b><span>Specializations</span></div>
          <div className="hero-stat"><b>24/7</b><span>AI Triage</span></div>
          <div className="hero-stat"><b>0</b><span>Sign-up needed</span></div>
        </div>
      </section>

      <section>
        <h2 className="section-title">What we offer</h2>
        <div className="grid-4">
          {features.map((f) => (
            <div key={f.title} className="card feature">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
