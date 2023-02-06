import React from 'react'
import { apiFetch, getToken } from '../api'
import { formatGold } from '../money'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type State = { occupancy: any; revenue: any[]; available: any[]; year: number }

export default class ReportsPage extends React.Component<any, State> {
  state: State = { occupancy: null, revenue: [], available: [], year: new Date().getFullYear() }

  componentDidMount() {
    apiFetch('/reports/occupancy').then((occupancy) => this.setState({ occupancy }))
    apiFetch('/reports/available').then((available) => this.setState({ available }))
    this.loadRevenue()
  }

  loadRevenue() {
    apiFetch('/reports/revenue?year=' + this.state.year).then((revenue) => this.setState({ revenue }))
  }

  downloadCsv = async () => {
    const res = await fetch('/api/reports/revenue.csv', { headers: { Authorization: 'Bearer ' + getToken() } })
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'revenue.csv'
    a.click()
  }

  render() {
    const o = this.state.occupancy
    return (
      <div className="page">
        <h2>Reports</h2>
        <h3>Occupancy</h3>
        {o ? (
          <div>
            <p>
              <b>{o.total}</b> monsters in residence. {o.arrivingThisWeek} arriving and {o.leavingThisWeek} leaving within a week.
            </p>
            <ul>
              {o.byReason.map((r: any) => (
                <li key={r.reason}>
                  {r.reason}: {r.n}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>loading...</p>
        )}

        <h3>
          Revenue{' '}
          <select value={this.state.year} onChange={(e) => this.setState({ year: Number(e.target.value) }, () => this.loadRevenue())}>
            {[2022, 2023, 2024, 2025, 2026].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </h3>
        <table className="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Invoices</th>
              <th>Invoiced</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {this.state.revenue.map((r) => (
              <tr key={r.month}>
                <td>{MONTHS[r.month - 1]}</td>
                <td>{r.invoices}</td>
                <td>{formatGold(r.invoiced)}</td>
                <td>{formatGold(r.paid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={this.downloadCsv}>Download CSV</button>

        <h3>Available for hire</h3>
        <ul>
          {this.state.available.map((m) => (
            <li key={m.id}>
              {m.name} ({m.species})
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
