// tiny fetch wrapper. The session lives in an httpOnly cookie now (ADR-005),
// so there is no token to attach any more.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
}

export async function apiFetch(url: string, opts: any = {}) {
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const res = await fetch('/api' + url, {
    ...opts,
    headers,
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (res.status === 401 && !url.startsWith('/auth/')) {
    window.location.href = '/login'
    return
  }
  if (res.status === 204) return null
  const text = await res.text()
  let data: any = text
  try {
    data = JSON.parse(text)
  } catch (e) {}
  if (!res.ok) throw new ApiError(res.status, (data && data.error) || 'request failed', data && data.details)
  return data
}
