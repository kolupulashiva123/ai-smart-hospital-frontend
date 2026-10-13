export const money = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

export const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export const todayISO = () => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export const statusClass = (s) => `badge badge-${(s || '').toLowerCase()}`
export const urgencyClass = (u) => `badge urgency-${(u || 'low').toLowerCase()}`

export const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Dermatologist',
  'Orthopedic', 'Pediatrician', 'ENT', 'Gynecologist',
]
