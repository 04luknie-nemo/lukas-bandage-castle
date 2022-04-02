import moment from 'moment'
import { q } from '../db'

export function nights(start: any, end: any) {
  const n = moment(end).startOf('day').diff(moment(start).startOf('day'), 'days')
  return n < 1 ? 1 : n
}

export async function createInvoiceForStay(stayId: any) {
  const stays = await q('SELECT * FROM tbl_stay WHERE id = ?', [stayId])
  const stay = stays[0]
  if (!stay) throw new Error('no stay')

  const end = stay.checked_out_at || new Date()
  const n = nights(stay.checked_in_at || stay.start_date, end)
  const lines: any[] = []
  lines.push({ description: n + ' nights (' + stay.reason.toLowerCase() + ')', qty: n, unit_price: stay.daily_rate, amount: n * stay.daily_rate, kind: 'STAY' })

  let total = 0
  for (const l of lines) total += l.amount

  const due = moment().add(30, 'days').format('YYYY-MM-DD')
  const result = await q('INSERT INTO tbl_invoice (stay_id, customer_id, due_date, total) VALUES (?,?,?,?)', [stay.id, stay.customer_id, due, total])
  const invoiceId = result.insertId
  for (const l of lines) {
    await q('INSERT INTO tbl_invoice_line (invoice_id, description, qty, unit_price, amount, kind) VALUES (?,?,?,?,?,?)', [
      invoiceId,
      l.description,
      l.qty,
      l.unit_price,
      l.amount,
      l.kind,
    ])
  }
  return invoiceId
}
