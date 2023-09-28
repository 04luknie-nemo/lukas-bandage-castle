import { useState, type FormEvent } from 'react'
import { apiFetch } from '../../api'

type Ref = { refereeName: string; relationship: string; text: string }

export default function ApplyForm({ listingId, monsterName }: { listingId: number; monsterName: string }) {
  const [message, setMessage] = useState('')
  const [lairDescription, setLairDescription] = useState('')
  const [refs, setRefs] = useState<Ref[]>([])
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch(`/hiring/listings/${listingId}/applications`, {
        method: 'POST',
        body: { message, lairDescription: lairDescription || undefined, references: refs },
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed')
    }
  }

  if (sent) return <p className="success">📜 Application sent! We'll let you know by your preferred method of contact.</p>

  const setRef = (i: number, field: keyof Ref, value: string) => setRefs(refs.map((r, j) => (j === i ? { ...r, [field]: value } : r)))

  return (
    <form className="form" onSubmit={submit}>
      <h3>Apply to hire {monsterName}</h3>
      <label>Why should {monsterName} come to you?</label>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
      <label>Describe your lair</label>
      <textarea value={lairDescription} onChange={(e) => setLairDescription(e.target.value)} placeholder="Size, temperature, damp level, number of adventurers per week..." />
      <h4>References ({refs.length}/3)</h4>
      {refs.map((r, i) => (
        <div className="reference" key={i}>
          <input placeholder="Name" value={r.refereeName} onChange={(e) => setRef(i, 'refereeName', e.target.value)} />
          <input placeholder="Relationship (e.g. former minion)" value={r.relationship} onChange={(e) => setRef(i, 'relationship', e.target.value)} />
          <textarea placeholder="What do they say about you?" value={r.text} onChange={(e) => setRef(i, 'text', e.target.value)} />
        </div>
      ))}
      {refs.length < 3 && (
        <button type="button" className="link" onClick={() => setRefs([...refs, { refereeName: '', relationship: '', text: '' }])}>
          + add a reference
        </button>
      )}
      <div>
        <button type="submit">Send application</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
