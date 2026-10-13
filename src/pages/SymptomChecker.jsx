import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errMsg } from '../api'
import TriageResultCard from '../components/TriageResultCard'

const EXAMPLES = [
  'I have fever, cough and body ache since 2 days',
  'Itchy red rash on my arm with pimples',
  'Severe headache with dizziness and blurred vision',
  'Knee pain and swelling after a fall',
]

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!symptoms.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.post('/ai/triage', { symptoms })
      setResult(data)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="narrow">
      <h1>🤖 AI Symptom Checker</h1>
      <p className="muted">Describe your symptoms in your own words. Our AI engine will suggest a specialist and how urgent it is.</p>

      <div className="card">
        <textarea
          rows="5"
          placeholder="e.g. I have a high fever and sore throat since yesterday..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <div className="chips">
          {EXAMPLES.map((ex) => (
            <button key={ex} className="chip chip-btn" onClick={() => setSymptoms(ex)}>{ex}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={analyze} disabled={loading || !symptoms.trim()}>
          {loading ? 'Analyzing…' : 'Analyze Symptoms'}
        </button>
        {error && <div className="alert alert-error">{error}</div>}
      </div>

      {result && (
        <>
          <TriageResultCard result={result} />
          <Link to="/book" state={{ issue: symptoms, triage: result }} className="btn btn-success btn-lg">
            Book a {result.specialization} →
          </Link>
        </>
      )}
    </div>
  )
}
