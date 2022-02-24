import React from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

type State = { monsters: any[]; loading: boolean }

export default class MonsterListPage extends React.Component<any, State> {
  state: State = { monsters: [], loading: true }

  componentDidMount() {
    apiFetch('/monsters').then((monsters) => this.setState({ monsters, loading: false }))
  }

  render() {
    if (this.state.loading) return <p>loading...</p>
    return (
      <div className="page">
        <h2>Monsters</h2>
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
      </div>
    )
  }
}
