import React from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

type State = { monsters: any[]; loading: boolean }

export default class MyMonstersPage extends React.Component<any, State> {
  state: State = { monsters: [], loading: true }

  componentDidMount() {
    apiFetch('/monsters?mine=1').then((monsters) => this.setState({ monsters, loading: false }))
  }

  render() {
    if (this.state.loading) return <p>loading...</p>
    return (
      <div className="page">
        <h2>My monsters</h2>
        {this.state.monsters.length === 0 && <p>You have no monsters with us. Yet.</p>}
        <div className="cards">
          {this.state.monsters.map((m) => (
            <div className="card" key={m.id}>
              <img src={m.photo_url || '/placeholder-monster.png'} alt={m.name} width={120} />
              <h3>
                <Link to={'/monsters/' + m.id}>{m.name}</Link>
              </h3>
              <p>{m.species}</p>
              <p>{m.status === 'IN_RESIDENCE' ? 'Staying with us' : m.status}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
