import React, { useState } from 'react'
import { apiFetch } from '../api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async (e: any) => {
    e.preventDefault()
    await apiFetch('/auth/forgot', { method: 'POST', body: { email } })
    setSent(true)
  }

  return (
    <div className="login">
      <h2>Forgot password</h2>
      {sent ? (
        <p>If that email exists, a raven is on its way.</p>
      ) : (
        <form onSubmit={submit}>
          <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit">Send reset link</button>
        </form>
      )}
    </div>
  )
}
