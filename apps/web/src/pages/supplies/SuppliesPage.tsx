import { useState } from 'react'
import { apiFetch } from '../../api'
import { useApi } from '../../hooks/useApi'

type Supply = {
  id: number
  name: string
  category: string
  unit: string
  quantity: number
  lowStockThreshold: number
  supplier: string | null
  isLow: boolean
}

const CATEGORY_ICON: Record<string, string> = {
  FOOD: '🍖',
  POTION: '🧪',
  BANDAGE: '🩹',
  BEDDING: '🛏️',
  CLEANING: '🧽',
  OTHER: '📦',
}

function MovementForm({ supply, onDone }: { supply: Supply; onDone: () => void }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('USED')
  const [error, setError] = useState('')

  const save = async () => {
    setError('')
    try {
      await apiFetch(`/supplies/${supply.id}/movements`, { method: 'POST', body: { amount: Number(amount), reason } })
      setAmount('')
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
  }

  return (
    <span className="movement">
      <input className="small" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={supply.unit} />
      <select value={reason} onChange={(e) => setReason(e.target.value)}>
        <option value="USED">used</option>
        <option value="DELIVERY">delivered</option>
        <option value="SPOILED">spoiled</option>
        <option value="ADJUSTMENT">adjust (±)</option>
      </select>
      <button disabled={!amount || isNaN(Number(amount))} onClick={save}>
        OK
      </button>
      {error && <span className="error"> {error}</span>}
    </span>
  )
}

export default function SuppliesPage() {
  const [category, setCategory] = useState('')
  const { data: supplies, error, reload } = useApi<Supply[]>(`/supplies${category ? `?category=${category}` : ''}`)

  if (error) return <p className="page error">{error.message}</p>
  if (!supplies) return <p className="page">Counting bandages... 🩹</p>

  const low = supplies.filter((s) => s.isLow)

  return (
    <div className="page">
      <h2>📦 Supplies</h2>
      {low.length > 0 && (
        <div className="warning">
          ⚠️ Running low on: {low.map((s) => `${s.name} (${s.quantity} ${s.unit})`).join(', ')}
        </div>
      )}
      <div className="toolbar">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {Object.entries(CATEGORY_ICON).map(([c, icon]) => (
            <option key={c} value={c}>
              {icon} {c.toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th />
            <th>Item</th>
            <th>In stock</th>
            <th>Reorder at</th>
            <th>Supplier</th>
            <th>Record</th>
          </tr>
        </thead>
        <tbody>
          {supplies.map((s) => (
            <tr key={s.id} className={s.isLow ? 'low' : ''}>
              <td>{CATEGORY_ICON[s.category]}</td>
              <td>{s.name}</td>
              <td>
                {s.quantity} {s.unit} {s.isLow && <span className="badge badge-danger">low</span>}
              </td>
              <td>
                {s.lowStockThreshold} {s.unit}
              </td>
              <td className="muted">{s.supplier}</td>
              <td>
                <MovementForm supply={s} onDone={reload} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
