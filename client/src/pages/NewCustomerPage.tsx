import React, { useState } from 'react'
import { apiFetch } from '../api'

export default function NewCustomerPage() {
  const [c, setC] = useState<any>({ title: '', first_name: '', last_name: '', email: '', contact_pref: 'raven', lair_address: '', notes: '' })
  const [error, setError] = useState('')

  const submit = async (e: any) => {
    e.preventDefault()
    if (!c.last_name) return setError('last name pls')
    try {
      const r = await apiFetch('/customers', { method: 'POST', body: c })
      window.location.href = '/customers/' + r.id
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h2>New customer</h2>
      <form className="form" onSubmit={submit}>
        <label>Title (Lord, Lady, Dread Sorcerer...)</label>
        <input value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} />
        <label>First name</label>
        <input value={c.first_name} onChange={(e) => setC({ ...c, first_name: e.target.value })} />
        <label>Last name</label>
        <input value={c.last_name} onChange={(e) => setC({ ...c, last_name: e.target.value })} />
        <label>Email</label>
        <input value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
        <label>Contact by</label>
        <select value={c.contact_pref} onChange={(e) => setC({ ...c, contact_pref: e.target.value })}>
          <option value="raven">Raven</option>
          <option value="crystal ball">Crystal ball</option>
          <option value="email">Email</option>
        </select>
        <label>Lair address</label>
        <textarea value={c.lair_address} onChange={(e) => setC({ ...c, lair_address: e.target.value })} />
        <label>Notes</label>
        <textarea value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} />
        <div>
          <button type="submit">Create</button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
