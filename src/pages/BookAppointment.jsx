import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api, { errMsg } from '../api'
import Modal from '../components/Modal'
import TriageResultCard from '../components/TriageResultCard'
import { fmtDate, money, todayISO } from '../utils'

export default function BookAppointment() {
  const location = useLocation()
  const incoming = location.state || {}

  const [form, setForm] = useState({
    patientName: '', age: '', gender: 'Male', phone: '',
    issue: incoming.issue || '', doctorId: '', date: todayISO(), timeSlot: '',
  })
  const [doctors, setDoctors] = useState([])
  const [triage, setTriage] = useState(incoming.triage || null)
  const [slots, setSlots] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [booked, setBooked] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    api.get('/doctors').then((r) => setDoctors(r.data.filter((d) => d.available))).catch((e) => setError(errMsg(e)))
  }, [])

  // reload free slots when doctor/date changes
  useEffect(() => {
    if (!form.doctorId || !form.date) { setSlots([]); return }
    api.get('/appointments/slots', { params: { doctorId: form.doctorId, date: form.date } })
      .then((r) => { setSlots(r.data); set('timeSlot', '') })
      .catch((e) => setError(errMsg(e)))
  }, [form.doctorId, form.date])

  const analyze = async () => {
    if (!form.issue.trim()) return
    try {
      const { data } = await api.post('/ai/triage', { symptoms: form.issue })
      setTriage(data)
    } catch (e) { setError(errMsg(e)) }
  }

  const recommended = triage ? doctors.filter((d) => d.specialization === triage.specialization) : []
  const others = doctors.filter((d) => !recommended.includes(d))
  const selectedDoctor = doctors.find((d) => String(d.id) === String(form.doctorId))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/appointments/book', { ...form, age: Number(form.age), doctorId: Number(form.doctorId) })
      setBooked(data)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  const DoctorCard = ({ d, star }) => (
    <label className={`doctor-card ${String(form.doctorId) === String(d.id) ? 'selected' : ''}`}>
      <input type="radio" name="doctor" checked={String(form.doctorId) === String(d.id)} onChange={() => set('doctorId', d.id)} />
      <div>
        <b>{d.name}</b> {star && <span className="badge badge-confirmed">AI pick</span>}
        <div className="muted small">{d.specialization} · {d.experienceYears} yrs exp</div>
      </div>
      <div className="fee">{money(d.fee)}</div>
    </label>
  )

  return (
    <div className="narrow">
      <h1>📅 Book an Appointment</h1>
      <p className="muted">No account needed. Your phone number is used to track your appointments.</p>

      <form onSubmit={submit}>
        <div className="card">
          <h3>1. Patient details</h3>
          <div className="form-grid">
            <div><label>Full name</label><input required value={form.patientName} onChange={(e) => set('patientName', e.target.value)} /></div>
            <div><label>Age</label><input required type="number" min="0" max="120" value={form.age} onChange={(e) => set('age', e.target.value)} /></div>
            <div>
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div><label>Phone (10 digits)</label><input required pattern="\d{10}" maxLength="10" value={form.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))} /></div>
          </div>
        </div>

        <div className="card">
          <h3>2. Your health issue</h3>
          <textarea required rows="4" placeholder="Describe your problem…" value={form.issue} onChange={(e) => { set('issue', e.target.value); setTriage(null) }} />
          <button type="button" className="btn btn-outline" onClick={analyze} disabled={!form.issue.trim()}>🤖 Suggest the right doctor</button>
          <TriageResultCard result={triage} />
        </div>

        <div className="card">
          <h3>3. Choose a doctor</h3>
          {recommended.map((d) => <DoctorCard key={d.id} d={d} star />)}
          {others.map((d) => <DoctorCard key={d.id} d={d} />)}
          {!doctors.length && <div className="empty">No doctors available right now.</div>}
        </div>

        <div className="card">
          <h3>4. Date &amp; time</h3>
          <input type="date" min={todayISO()} value={form.date} onChange={(e) => set('date', e.target.value)} />
          {!form.doctorId && <p className="muted small">Select a doctor to see free slots.</p>}
          {form.doctorId && !slots.length && <p className="muted">No free slots on this date.</p>}
          <div className="slots">
            {slots.map((s) => (
              <button type="button" key={s} className={`slot ${form.timeSlot === s ? 'active' : ''}`} onClick={() => set('timeSlot', s)}>{s}</button>
            ))}
          </div>
        </div>

        {selectedDoctor && (
          <div className="card fee-card">
            <span>Consultation fee with {selectedDoctor.name}</span>
            <b>{money(selectedDoctor.fee)}</b>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary btn-lg" disabled={loading || !form.doctorId || !form.timeSlot}>
          {loading ? 'Booking…' : 'Confirm Appointment'}
        </button>
      </form>

      {booked && (
        <Modal title="✅ Appointment requested" onClose={() => setBooked(null)}>
          <div className="receipt">
            <div><span>Booking ID</span><b>#{booked.id}</b></div>
            <div><span>Patient</span><b>{booked.patient.name}</b></div>
            <div><span>Doctor</span><b>{booked.doctor.name} ({booked.doctor.specialization})</b></div>
            <div><span>Date</span><b>{fmtDate(booked.appointmentDate)}</b></div>
            <div><span>Time</span><b>{booked.timeSlot}</b></div>
            <div><span>Urgency</span><b>{booked.urgency}</b></div>
            <div><span>Fee to pay at hospital</span><b>{money(booked.fee)}</b></div>
          </div>
          <p className="muted small">Track your appointment status anytime in “My Appointments” using your phone number.</p>
          <button className="btn btn-primary" onClick={() => setBooked(null)}>Done</button>
        </Modal>
      )}
    </div>
  )
}
