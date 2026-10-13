import { useState } from 'react'
import api, { errMsg } from '../api'
import { fmtDate, money, statusClass } from '../utils'

export default function TrackAppointment() {
  const [phone, setPhone] = useState('')
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  const search = async (e) => {
    e.preventDefault()
    setError(''); setRows(null)
    try {
      const { data } = await api.get('/appointments/track', { params: { phone } })
      setRows(data)
    } catch (err) { setError(errMsg(err)) }
  }

  return (
    <div className="narrow">
      <h1>🔎 My Appointments</h1>
      <p className="muted">Enter the phone number you used while booking.</p>
      <form className="card inline-form" onSubmit={search}>
        <input required pattern="\d{10}" maxLength="10" placeholder="10-digit phone number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
        <button className="btn btn-primary">Search</button>
      </form>
      {error && <div className="alert alert-error">{error}</div>}
      {rows && !rows.length && <div className="empty">No appointments found for this number.</div>}
      {rows?.map((a) => (
        <div key={a.id} className="card appt">
          <div className="appt-top">
            <b>#{a.id} · {a.doctor.name}</b>
            <span className={statusClass(a.status)}>{a.status}</span>
          </div>
          <div className="muted">{a.doctor.specialization}</div>
          <div>{fmtDate(a.appointmentDate)} at {a.timeSlot}</div>
          <div className="muted small">Issue: {a.issue}</div>
          <div>Fee: <b>{money(a.fee)}</b></div>
          {a.doctorNotes && <div className="note">📝 Doctor's notes: {a.doctorNotes}</div>}
        </div>
      ))}
    </div>
  )
}
