import moment from 'moment'

export function ageInYears(birthDate: any) {
  if (!birthDate) return null
  return new Date().getFullYear() - new Date(birthDate).getFullYear()
}

export function fmtDate(d: any) {
  if (!d) return ''
  return moment(d).format('YYYY-MM-DD')
}
