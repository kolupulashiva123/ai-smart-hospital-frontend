import { urgencyClass } from '../utils'

export default function TriageResultCard({ result }) {
  if (!result) return null
  const emergency = result.urgency === 'EMERGENCY'
  return (
    <div className={`triage-card ${emergency ? 'emergency' : ''}`}>
      <div className="triage-top">
        <span className={urgencyClass(result.urgency)}>{result.urgency} urgency</span>
        <span className="muted small">AI confidence: {result.confidence}%</span>
      </div>
      <h3>{result.possibleCondition}</h3>
      <p><b>Recommended specialist:</b> {result.specialization}</p>
      <p>{result.advice}</p>
      {result.matchedSymptoms?.length > 0 && (
        <div className="chips">
          {result.matchedSymptoms.map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
      )}
    </div>
  )
}
