import React from 'react'
import { apiFetch, setToken } from '../api'

type State = { email: string; password: string; error: string | null }

export default class LoginPage extends React.Component<any, State> {
  state: State = { email: '', password: '', error: null }

  submit = async (e: any) => {
    e.preventDefault()
    try {
      const data = await apiFetch('/auth/login', { method: 'POST', body: { email: this.state.email, password: this.state.password } })
      setToken(data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = data.user.role === 'OWNER' ? '/my/monsters' : '/'
    } catch (err: any) {
      this.setState({ error: err.message })
    }
  }

  render() {
    return (
      <div className="login">
        <h1>Bandage Castle</h1>
        <form onSubmit={this.submit}>
          <input placeholder="email" value={this.state.email} onChange={(e) => this.setState({ email: e.target.value })} />
          <input placeholder="password" type="password" value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} />
          <button type="submit">Log in</button>
          {this.state.error && <p className="error">{this.state.error}</p>}
        </form>
        <a href="/forgot-password">forgot password?</a>
      </div>
    )
  }
}
