const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function analyzeTicket(ticket) {
  if (typeof ticket !== 'string' || !ticket.trim()) {
    throw new Error('Please enter a support request before analyzing.')
  }

  const response = await fetch(`${API_URL}/triage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticket: ticket.trim() }),
  })

  let payload = null

  try {
    payload = await response.json()
  } catch (error) {
    payload = null
  }

  if (!response.ok) {
    const errorMessage =
      payload && typeof payload.error === 'string'
        ? payload.error
        : 'Unable to analyze the support request right now. Please try again.'

    throw new Error(errorMessage)
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('The server returned an invalid triage response.')
  }

  return payload
}
