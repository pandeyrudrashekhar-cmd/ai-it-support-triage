const { triageTicket } = require('../services/triageService')

function validateTicket(ticket) {
  if (ticket === undefined) {
    return { valid: false, error: 'Ticket is required.' }
  }

  if (typeof ticket !== 'string') {
    return { valid: false, error: 'Ticket must be a string.' }
  }

  const trimmedTicket = ticket.trim()

  if (!trimmedTicket) {
    return { valid: false, error: 'Ticket cannot be empty.' }
  }

  if (trimmedTicket.length > 2000) {
    return { valid: false, error: 'Ticket cannot exceed 2000 characters.' }
  }

  return { valid: true, ticket: trimmedTicket }
}

async function createTriage(req, res) {
  try {
    const { ticket } = req.body || {}
    const validation = validateTicket(ticket)

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      })
    }

    const triageResponse = await triageTicket(validation.ticket)

    return res.status(200).json(triageResponse)
  } catch (error) {
    const message = error && error.message ? error.message : 'Unable to process the triage request right now.'

    if (message.startsWith('OPENROUTER_')) {
      console.error('[API] OpenRouter stage failure:', message)
      return res.status(502).json({
        success: false,
        error: message,
      })
    }

    console.error('[API] Unexpected error:', message)
    return res.status(500).json({
      success: false,
      error: 'Unable to process the triage request right now.',
    })
  }
}

module.exports = {
  createTriage,
}
