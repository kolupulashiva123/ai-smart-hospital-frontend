import { useEffect, useState } from 'react'
import api, { errMsg } from '../api'
import AppointmentTable from '../components/AppointmentTable'
import Modal from '../components/Modal'
import { fmtDate, money, SPECIALIZATIONS } from '../utils'

const emptyDoctor = { name: '', specialization: SPECIALIZATIONS[0], fee: '', experienceYears: '', username: '', password: '' }

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [doc, setDoc] = useState(emptyDoctor)

  const load = async () => {
    try {
      const [s, a, d, p] = await Promise.all([
        api.get('/dashboard/stats'), api.get('/appointments'), api.get('/doctors'), api.get('/patients'),
      ])
      setStats(s.data); setAppointments(a.data); setDoctors(d.data); setPatients(p.data)
    } catch (e) { setError(errMsg(e)) }
  }
  useEffect(() => { load() }, [])

  const flash = (m) => { setInfo(m); setTimeout(() => setInfo(''), 3000) }

  const onAction = async (a, status) => {
    try { await api.put(`/appointments/${a.id}/status`, { status }); await load() }
    catch (e) { setError(errMsg(e)) }
  }

  const addDoctor = async (e) => {
    e.preventDefault(); setError('')
    try {
      await api.post('/doctors', { ...doc, fee: Number(doc.fee), experienceYears: Number(doc.experienceYears) })
      setShowAdd(false); setDoc(emptyDoctor); flash('Doctor added'); load()
    } catch (err) { setError(errMsg(err)) }
  }

  const toggle = async (d) => {
    try { await api.put(`/doctors/${d.id}/availability`); load() } catch (e) { setError(errMsg(e)) }
  }
  const remove = async (d) => {
    if (!confirm(`Delete ${d.name}?`)) return
    try { await api.delete(`/doctors/${d.id}`); flash('Doctor deleted'); load() } catch (e) { setError(errMsg(e)) }
  }

  const bar = (label, value, total, cls) => (
    <div className="bar-row" key={label}>
      <span>{label}</span>
      <div className="bar"><div className={`bar-fill ${cls}`} style={{ width: total ? `${(value / total) * 100}%` : '0%' }} /></div>
      <b>{value}</b>
    </div>
  )

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <div className="alert alert-error" onClick={() => setError('')}>{error} (click to dismiss)</div>}
      {info && <div className="alert alert-success">{info}</div>}

      <div className="tabs">
        {[['overview', 'Overview'], ['appointments', 'Appointments'], ['doctors', 'Doctors'], ['patients', 'Patients']].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <>
          <div className="grid-4">
            <div className="stat"><span>Patients</span><b>{stats.totalPatients}</b></div>
            <div className="stat"><span>Doctors</span><b>{stats.totalDoctors}</b></div>
            <div className="stat"><span>Appointments</span><b>{stats.totalAppointments}</b></div>
            <div className="stat ok"><span>Revenue (completed)</span><b>{money(stats.revenue)}</b></div>
          </div>
          <div className="card">
            <h3>Appointments by status</h3>
            {bar('Pending', stats.pending, stats.totalAppointments, 'warn')}
            {bar('Confirmed', stats.confirmed, stats.totalAppointments, 'info')}
            {bar('Completed', stats.completed, stats.totalAppointments, 'ok')}
            {bar('Cancelled', stats.cancelled, stats.totalAppointments, 'bad')}
            <p className="muted small">Appointments scheduled today: <b>{stats.todayAppointments}</b></p>
          </div>
        </>
      )}

      {tab === 'appointments' && <AppointmentTable rows={appointments} onAction={onAction} showDoctor />}

      {tab === 'doctors' && (
        <>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Doctor</button>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td><b>{d.name}</b></td>
                    <td>{d.specialization}</td>
                    <td>{d.experienceYears} yrs</td>
                    <td>{money(d.fee)}</td>
                    <td><span className={`badge ${d.available ? 'badge-completed' : 'badge-cancelled'}`}>{d.available ? 'Available' : 'Unavailable'}</span></td>
                    <td className="actions">
                      <button className="btn btn-sm btn-outline" onClick={() => toggle(d)}>{d.available ? 'Set unavailable' : 'Set available'}</button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(d)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'patients' && (
        patients.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Registered</th></tr></thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td><td><b>{p.name}</b></td><td>{p.age}</td><td>{p.gender}</td><td>{p.phone}</td>
                    <td>{fmtDate((p.registeredAt || '').slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty">No patients have booked yet.</div>
      )}

      {showAdd && (
        <Modal title="Add a new doctor" onClose={() => setShowAdd(false)}>
          <form onSubmit={addDoctor}>
            <label>Name</label><input required value={doc.name} onChange={(e) => setDoc({ ...doc, name: e.target.value })} />
            <label>Specialization</label>
            <select value={doc.specialization} onChange={(e) => setDoc({ ...doc, specialization: e.target.value })}>
              {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="form-grid">
              <div><label>Fee (₹)</label><input required type="number" min="1" value={doc.fee} onChange={(e) => setDoc({ ...doc, fee: e.target.value })} /></div>
              <div><label>Experience (yrs)</label><input required type="number" min="0" value={doc.experienceYears} onChange={(e) => setDoc({ ...doc, experienceYears: e.target.value })} /></div>
              <div><label>Login username</label><input required value={doc.username} onChange={(e) => setDoc({ ...doc, username: e.target.value })} /></div>
              <div><label>Login password</label><input required minLength="6" type="password" value={doc.password} onChange={(e) => setDoc({ ...doc, password: e.target.value })} /></div>
            </div>
            <button className="btn btn-primary">Save Doctor</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
