// tiny fetch wrapper. adds the token.

export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(t: string | null) {
  if (t) localStorage.setItem('token', t)
  else localStorage.removeItem('token')
}

export async function apiFetch(url: string, opts: any = {}) {
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token
  const res = await fetch('/api' + url, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined })
  if (res.status === 401) {
    setToken(null)
    window.location.href = '/login'
    return
  }
  const text = await res.text()
  let data: any = text
  try {
    data = JSON.parse(text)
  } catch (e) {}
  if (!res.ok) throw new Error((data && data.error) || 'request failed')
  return data
}
