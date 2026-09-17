require('dotenv').config()

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const apiKey = process.env.OPENROUTER_API_KEY
const model = process.env.OPENROUTER_MODEL

console.log('OPENROUTER_API_KEY loaded:', Boolean(apiKey))
console.log('OPENROUTER_MODEL:', model)

async function requestOpenRouter(label, payload) {
  console.log(`\n=== ${label} ===`)

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'ai-it-support-triage',
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    console.log('HTTP status:', response.status)
    console.log('content-type:', response.headers.get('content-type'))

    let parsed = null
    try {
      parsed = JSON.parse(text)
    } catch (error) {
      parsed = null
    }

    if (parsed && parsed.error) {
      console.log('error body:', JSON.stringify(parsed.error).slice(0, 1000))
    }

    console.log('response preview:', text.slice(0, 1200))

    if (parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
      const message = parsed.choices[0].message
      console.log('assistant content type:', typeof message.content)
      console.log('assistant content:', message.content ? String(message.content).slice(0, 1000) : null)
    }
  } catch (error) {
    console.log('REQUEST_ERROR:', error && error.message ? error.message : String(error))
  }
}

;(async () => {
  await requestOpenRouter('SIMPLE_REQUEST', {
    model,
    temperature: 0.1,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'The internet is down.' },
    ],
  })

  await requestOpenRouter('STRUCTURED_OUTPUT_REQUEST', {
    model,
    temperature: 0.2,
    max_tokens: 400,
    messages: [
      { role: 'system', content: 'Return valid JSON only.' },
      {
        role: 'user',
        content: 'Ticket: The internet is down.',
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'triage_debug',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            category: { type: 'string', enum: ['Network', 'Account', 'Application', 'Device', 'Other'] },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
            summary: { type: 'string' },
            missingInformation: { type: 'array', items: { type: 'string' } },
            nextStep: { type: 'string' },
            reason: { type: 'string' },
            needsFollowUp: { type: 'boolean' },
            followUpQuestion: { type: ['string', 'null'] },
          },
          required: ['category', 'priority', 'confidence', 'summary', 'missingInformation', 'nextStep', 'reason', 'needsFollowUp', 'followUpQuestion'],
        },
      },
    },
  })
})()
