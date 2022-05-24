import React from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

type State = { monsters: any[]; loading: boolean; search: string }

export default class MonsterListPage extends React.Component<any, State> {
  state: State = { monsters: [], loading: true, search: '' }

  componentDidMount() {
    this.load()
  }

  load() {
    let url = '/monsters'
    if (this.state.search) url += '?search=' + encodeURIComponent(this.state.search)
    apiFetch(url).then((monsters) => this.setState({ monsters, loading: false }))
  }

  onSubmit = (e: any) => {
    e.preventDefault()
    this.load()
  }

  render() {
    return (
      <div className="page">
        <h2>Monsters</h2>
        <form onSubmit={this.onSubmit}>
          <input placeholder="name or species" value={this.state.search} onChange={(e) => this.setState({ search: e.target.value })} />
          <button type="submit">Search</button>
        </form>
        {this.state.loading ? (
          <p>loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Species</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {this.state.monsters.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link to={'/monsters/' + m.id}>{m.name}</Link>
                  </td>
                  <td>{m.species}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }
}
