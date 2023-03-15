import { useState, type FormEvent } from 'react'
import { ROLES, type Role } from '@bandage/shared'
import { apiFetch } from '../../api'
import { useApi } from '../../hooks/useApi'

type User = { id: number; email: string; name: string | null; roles: Role[] }

const ASSIGNABLE = ROLES.filter((r) => r !== 'STAFF')

function RoleCheckboxes({ value, onChange }: { value: Role[]; onChange: (roles: Role[]) => void }) {
  return (
    <span className="roles">
      {ASSIGNABLE.map((r) => (
        <label key={r}>
          <input
            type="checkbox"
            checked={value.includes(r)}
            onChange={(e) => onChange(e.target.checked ? [...value, r] : value.filter((x) => x !== r))}
          />
          {r}
        </label>
      ))}
    </span>
  )
}

function UserRow({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [roles, setRoles] = useState<Role[]>(user.roles)
  const [error, setError] = useState('')
  const dirty = roles.slice().sort().join() !== user.roles.slice().sort().join()

  const save = async () => {
    setError('')
    try {
      await apiFetch(`/users/${user.id}`, { method: 'PATCH', body: { roles } })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <RoleCheckboxes value={roles} onChange={setRoles} />
        {user.roles.includes('STAFF') && <span className="badge badge-warn" title="Old catch-all role. Give this account real roles.">STAFF (legacy)</span>}
        {error && <div className="error">{error}</div>}
      </td>
      <td>
        <button disabled={!dirty} onClick={save}>
          Save
        </button>
      </td>
    </tr>
  )
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const { data: users, loading, reload } = useApi<User[]>(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`)
  const [form, setForm] = useState({ email: '', name: '', password: '', roles: [] as Role[] })
  const [formError, setFormError] = useState('')

  const create = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    try {
      await apiFetch('/users', { method: 'POST', body: form })
      setForm({ email: '', name: '', password: '', roles: [] })
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create user')
    }
  }

  return (
    <div className="page">
      <h2>👥 Users</h2>
      <input placeholder="search users" value={search} onChange={(e) => setSearch(e.target.value)} />
      {loading && !users ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <UserRow key={`${u.id}-${u.roles.join()}`} user={u} onSaved={reload} />
            ))}
          </tbody>
        </table>
      )}

      <h3>Add a user</h3>
      <form className="form" onSubmit={create}>
        <label>Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Email</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Temporary password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <label>Roles</label>
        <RoleCheckboxes value={form.roles} onChange={(roles) => setForm({ ...form, roles })} />
        <div>
          <button type="submit">Create user</button>
        </div>
        {formError && <p className="error">{formError}</p>}
      </form>
    </div>
  )
}
