export async function apiRequest(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.detail || 'The server could not complete this request.')
  return body
}
