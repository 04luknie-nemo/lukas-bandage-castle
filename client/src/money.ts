export function formatGold(n: any) {
  return Number(n || 0).toFixed(2) + ' gp'
}

// for lists: never show more gold than they actually owe (toFixed rounds up!)
export function formatGP(n: any) {
  const v = Math.floor(Number(n || 0) * 100) / 100
  return v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' gp'
}
