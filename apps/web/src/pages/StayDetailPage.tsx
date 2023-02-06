import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../api'

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
    </div>
  )
}
