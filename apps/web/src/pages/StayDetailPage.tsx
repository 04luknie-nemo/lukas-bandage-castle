import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../api'

// #35 - extend a stay (new endpoint, uses prisma)
function ExtendStay({ stayId, onDone }: { stayId: number; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [newPickup, setNewPickup] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  if (!open) return <button onClick={() => setOpen(true)}>Extend stay</button>

  const save = async () => {
    try {
      await apiFetch('/stays/' + stayId + '/extend', { method: 'POST', body: { newPickup, reason } })
      setOpen(false)
      onDone()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="form">
      <h4>Extend stay</h4>
      <label>New pickup date</label>
      <input type="date" value={newPickup} onChange={(e) => setNewPickup(e.target.value)} />
      <label>Reason</label>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="owner delayed by a siege" />
      <div>
        <button onClick={save}>Save</button> <button onClick={() => setOpen(false)}>Cancel</button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default function StayDetailPage() {
  const { id } = useParams()
  const [stay, setStay] = useState<any>(null)
  const [msg, setMsg] = useState('')

  const load = () => apiFetch('/stays/' + id).then(setStay)

  useEffect(() => {
    load()
  }, [id])

  const act = async (action: string) => {
    try {
      await apiFetch('/stays/' + id + '/' + action, { method: 'POST' })
      const r = await apiFetch('/stays/' + id, {})
      setMsg(action == 'checkout' ? 'checked out, invoice created' : 'done')
      load()
    } catch (e: any) {
      setMsg(e.message)
    }
  }

  if (!stay) return <p>loading...</p>

  return (
    <div className="page">
      <h2>
        Stay #{stay.id} - {stay.monster_name}
      </h2>
      <p>
        Owner: {stay.title} {stay.first_name} {stay.last_name}
      </p>
      <p>Reason: {stay.reason}</p>
      <p>Status: {stay.status}</p>
      <p>Start: {stay.start_date && stay.start_date.slice(0, 10)}</p>
      <p>Pickup: {stay.expected_pickup && stay.expected_pickup.slice(0, 10)}</p>
      <p>Rate: {stay.daily_rate} gp/day</p>
      <p>{stay.notes}</p>
      {stay.status === 'BOOKED' && <button onClick={() => act('checkin')}>Check in</button>}
      {stay.status === 'BOOKED' && <button onClick={() => act('cancel')}>Cancel</button>}
      {stay.status === 'CHECKED_IN' && <button onClick={() => act('checkout')}>Check out</button>}
      {msg && <p>{msg}</p>}
      {(stay.status === 'BOOKED' || stay.status === 'CHECKED_IN') && <ExtendStay stayId={stay.id} onDone={load} />}
    </div>
  )
}
