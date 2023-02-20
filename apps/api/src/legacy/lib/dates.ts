import moment from 'moment'

// ageInYears moved to @bandage/shared
export { ageInYears } from '@bandage/shared'

export function fmtDate(d: any) {
  if (!d) return ''
  return moment(d).format('YYYY-MM-DD')
}
