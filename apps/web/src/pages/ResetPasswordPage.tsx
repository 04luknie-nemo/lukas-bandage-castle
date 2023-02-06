import React, { useState } from 'react'
import { apiFetch } from '../api'

export default function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get('token')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: any) => {
    e.preventDefault()
    try {
      await apiFetch('/auth/reset', { method: 'POST', body: { token, password } })
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (done)
    return (
      <div className="login">
        Password changed. <a href="/login">Log in</a>
      </div>
    )

  return (
    <div className="login">
      <h2>New password</h2>
      <form onSubmit={submit}>
        <input type="password" placeholder="new password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Save</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
