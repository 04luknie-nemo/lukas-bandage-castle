import moment from 'moment'
import { q } from '../db'
import { sendRaven } from '../ravenPost/ravenPost'
import { formatGold } from './money'

export function nights(start: any, end: any) {
  const n = moment(end).startOf('day').diff(moment(start).startOf('day'), 'days')
  return n < 1 ? 1 : n
}

export const LATE_FEE_PER_DAY = 25

// days the owner was late picking up. pickup day counts.
export function lateDays(expectedPickup: any, checkedOut: any) {
  if (!expectedPickup) return 0
  const pickup = moment(expectedPickup).startOf('day')
  const out = moment(checkedOut).startOf('day')
  if (out.isBefore(pickup)) return 0
  return out.diff(pickup, 'days') + 1
}

export async function createInvoiceForStay(stayId: any) {
  const stays = await q('SELECT * FROM tbl_stay WHERE id = ?', [stayId])
  const stay = stays[0]
  if (!stay) throw new Error('no stay')

  const end = stay.checked_out_at || new Date()
  const n = nights(stay.checked_in_at || stay.start_date, end)
  const lines: any[] = []
  lines.push({ description: n + ' nights (' + stay.reason.toLowerCase() + ')', qty: n, unit_price: stay.daily_rate, amount: n * stay.daily_rate, kind: 'STAY' })

  const late = lateDays(stay.expected_pickup, end)
  if (late > 0 && stay.reason != 'SURRENDER') {
    lines.push({ description: 'Late pickup (' + late + ' days)', qty: late, unit_price: LATE_FEE_PER_DAY, amount: late * LATE_FEE_PER_DAY, kind: 'LATE_FEE' })
  }

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
  sendRaven(stay.customer_id, 'Your invoice #' + invoiceId, 'Total due: ' + formatGold(total) + ' by ' + due + '. Pay in gold, gems or (reluctantly) IOU.')
  return invoiceId
}
