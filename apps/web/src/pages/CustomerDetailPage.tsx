import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../api'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState<any>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    apiFetch('/customers/' + id).then(setCustomer)
  }, [id])

  const save = async () => {
    await apiFetch('/customers/' + id, { method: 'PUT', body: customer })
    setEditing(false)
  }

  if (!customer) return <p>loading...</p>

  return (
    <div className="page">
      <h2>
        {customer.title} {customer.first_name} {customer.last_name}
      </h2>
      {editing ? (
        <div className="form">
          <label>Title</label>
          <input value={customer.title || ''} onChange={(e) => setCustomer({ ...customer, title: e.target.value })} />
          <label>First name</label>
          <input value={customer.first_name || ''} onChange={(e) => setCustomer({ ...customer, first_name: e.target.value })} />
          <label>Last name</label>
          <input value={customer.last_name || ''} onChange={(e) => setCustomer({ ...customer, last_name: e.target.value })} />
          <label>Email</label>
          <input value={customer.email || ''} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
          <label>Contact by</label>
          <select value={customer.contact_pref} onChange={(e) => setCustomer({ ...customer, contact_pref: e.target.value })}>
            <option value="raven">Raven</option>
            <option value="crystal ball">Crystal ball</option>
            <option value="email">Email</option>
          </select>
          <label>Lair address</label>
          <textarea value={customer.lair_address || ''} onChange={(e) => setCustomer({ ...customer, lair_address: e.target.value })} />
          <label>Notes</label>
          <textarea value={customer.notes || ''} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} />
          <button onClick={save}>Save</button>
        </div>
      ) : (
        <div>
          <p>Email: {customer.email}</p>
          <p>Contact by: {customer.contact_pref}</p>
          <p>Lair: {customer.lair_address}</p>
          <p>{customer.notes}</p>
          <button onClick={() => setEditing(true)}>Edit</button>
        </div>
      )}
      <h3>Monsters</h3>
      <ul>
        {customer.monsters.map((m: any) => (
          <li key={m.id}>
            <Link to={'/monsters/' + m.id}>{m.name}</Link> ({m.species}) - {m.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
