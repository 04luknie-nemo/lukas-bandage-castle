import React from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

type State = { customers: any[]; q: string; loading: boolean }

export default class CustomerListPage extends React.Component<any, State> {
  state: State = { customers: [], q: '', loading: true }
  timer: any = null

  componentDidMount() {
    this.load()
  }

  load() {
    apiFetch('/customers' + (this.state.q ? '?q=' + encodeURIComponent(this.state.q) : '')).then((customers) =>
      this.setState({ customers, loading: false })
    )
  }

  onSearch = (e: any) => {
    this.setState({ q: e.target.value })
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.load(), 300)
  }

  render() {
    return (
      <div className="page">
        <h2>Customers</h2>
        <Link to="/customers/new">+ New customer</Link>
        <input placeholder="search..." value={this.state.q} onChange={this.onSearch} />
        {this.state.loading ? (
          <p>loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact by</th>
              </tr>
            </thead>
            <tbody>
              {this.state.customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={'/customers/' + c.id}>
                      {c.title} {c.first_name} {c.last_name}
                    </Link>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.contact_pref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }
}
