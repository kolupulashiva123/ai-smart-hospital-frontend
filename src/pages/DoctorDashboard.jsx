import { useEffect, useState } from 'react'
import api, { errMsg } from '../api'
import AppointmentTable from '../components/AppointmentTable'
import Modal from '../components/Modal'
import { money, todayISO } from '../utils'
import { useAuth } from '../context/AuthContext'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState('')
  const [completing, setCompleting] = useState(null)
  const [notes, setNotes] = useState('')

  const load = async () => {
    try {
      const [s, a] = await Promise.all([api.get('/dashboard/stats'), api.get('/appointments')])
      setStats(s.data); setRows(a.data)
    } catch (e) { setError(errMsg(e)) }
  }
  useEffect(() => { load() }, [])

  const update = async (a, status, noteText) => {
    try {
      await api.put(`/appointments/${a.id}/status`, { status, notes: noteText })
      await load()
    } catch (e) { setError(errMsg(e)) }
  }

  const onAction = (a, status) => {
    if (status === 'COMPLETED') { setCompleting(a); setNotes(a.doctorNotes || '') }
    else update(a, status)
  }

  const shown = rows.filter((r) =>
    filter === 'ALL' ? true : filter === 'TODAY' ? r.appointmentDate === todayISO() : r.status === filter)

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <div className="grid-4">
          <div className="stat"><span>Total</span><b>{stats.totalAppointments}</b></div>
          <div className="stat warn"><span>Pending</span><b>{stats.pending}</b></div>
          <div className="stat ok"><span>Completed</span><b>{stats.completed}</b></div>
          <div className="stat"><span>Earnings</span><b>{money(stats.revenue)}</b></div>
        </div>
      )}

      <div className="tabs">
        {['ALL', 'TODAY', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <AppointmentTable rows={shown} onAction={onAction} />

      {completing && (
        <Modal title={`Complete appointment #${completing.id}`} onClose={() => setCompleting(null)}>
          <p className="muted">Patient: <b>{completing.patient.name}</b> — {completing.issue}</p>
          <label>Diagnosis / prescription notes</label>
          <textarea rows="5" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write consultation notes…" />
          <button className="btn btn-success" onClick={async () => { await update(completing, 'COMPLETED', notes); setCompleting(null) }}>
            Save &amp; Complete
          </button>
        </Modal>
      )}
    </div>
  )
}
