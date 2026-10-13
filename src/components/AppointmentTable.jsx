import { fmtDate, money, statusClass, urgencyClass } from '../utils'

/**
 * Shared table for doctor + admin dashboards.
 * onAction(appointment, newStatus) is called for the action buttons.
 */
export default function AppointmentTable({ rows, onAction, showDoctor = false }) {
  if (!rows.length) return <div className="empty">No appointments found.</div>

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Patient</th>{showDoctor && <th>Doctor</th>}
            <th>Date &amp; Time</th><th>Issue</th><th>Urgency</th><th>Fee</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>
                <b>{a.patient?.name}</b>
                <div className="muted small">{a.patient?.age} yrs · {a.patient?.gender} · {a.patient?.phone}</div>
              </td>
              {showDoctor && (
                <td>{a.doctor?.name}<div className="muted small">{a.doctor?.specialization}</div></td>
              )}
              <td>{fmtDate(a.appointmentDate)}<div className="muted small">{a.timeSlot}</div></td>
              <td className="issue-cell">
                {a.issue}
                {a.doctorNotes && <div className="note">📝 {a.doctorNotes}</div>}
              </td>
              <td><span className={urgencyClass(a.urgency)}>{a.urgency}</span></td>
              <td>{money(a.fee)}</td>
              <td><span className={statusClass(a.status)}>{a.status}</span></td>
              <td className="actions">
                {a.status === 'PENDING' && (
                  <button className="btn btn-sm btn-primary" onClick={() => onAction(a, 'CONFIRMED')}>Confirm</button>
                )}
                {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                  <>
                    <button className="btn btn-sm btn-success" onClick={() => onAction(a, 'COMPLETED')}>Complete</button>
                    <button className="btn btn-sm btn-danger" onClick={() => onAction(a, 'CANCELLED')}>Cancel</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
