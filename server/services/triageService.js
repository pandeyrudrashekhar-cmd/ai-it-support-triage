const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-4o-mini'
const JSON_SCHEMA_SUPPORTED_MODELS = new Set(['openai/gpt-4o-mini', 'openai/gpt-4.1-mini', 'meta-llama/llama-3.1-8b-instruct'])
const VALID_CATEGORIES = new Set(['Network', 'Account', 'Application', 'Device', 'Other'])
const VALID_PRIORITIES = new Set(['Low', 'Medium', 'High', 'Critical'])
const SYSTEM_PROMPT = `You are an IT Support Triage Assistant.

Your job is to classify the ticket, estimate operational priority, summarize the issue, identify only the information that materially affects triage, recommend the safest next diagnostic step, explain why that step is appropriate, and decide whether a follow-up question is needed.

Core policy:
- Reason only from the evidence in the ticket.
- Distinguish clearly between:
  1) what is explicitly known from the ticket,
  2) what is a plausible hypothesis,
  3) what information is still missing.
- Never treat a hypothesis as an established fact.
- Do not invent root causes, scope, or business impact that are not stated or strongly implied.
- If important information is missing, do not compensate by increasing confidence.
- The model should be comfortable with uncertainty.

Classification policy:
- category must be exactly one of: Network, Account, Application, Device, Other.
- Classify based on the underlying IT support issue, not only the application named in the ticket.
- When an application is mentioned, do not automatically classify the ticket as Application.
- Determine whether the underlying issue is Network, Account/authentication, Application, Device, or Other.
- Example: "I changed my password and Outlook keeps asking for my password." The affected application is Outlook, but the password change is evidence that account/authentication state may be relevant. Choose the category that best represents the underlying support problem based on the available evidence.
- If evidence is insufficient to distinguish Application from Account, lower confidence and ask a clarifying question rather than pretending certainty.

Ambiguous tickets:
- If multiple categories remain plausible, choose the most plausible category only if necessary.
- Lower confidence appropriately.
- Explain what is uncertain in the summary or missingInformation without exposing hidden reasoning.
- Ask the single question that most efficiently resolves the uncertainty.
- Example: "Nothing is connecting since I changed my password." does not provide enough evidence to confidently determine whether the problem is Account/authentication, Network, VPN, Application, or something else. Prioritize clarification.

Confidence policy:
- confidence must reflect the strength of the evidence.
- Use approximately:
  - 0.90-1.00: very strong evidence and little ambiguity.
  - 0.75-0.89: good evidence with minor uncertainty.
  - 0.55-0.74: meaningful uncertainty.
  - below 0.55: highly ambiguous or insufficient information.
- These are guidelines, not rigid rules.
- Do not give 0.8 or 0.9 simply because a category is plausible.
- If the model still needs important clarification to determine the underlying issue or impact, confidence should reflect that uncertainty.
- The confidence value must be consistent with the reasoning and missingInformation.

Priority policy:
- priority must be exactly one of: Low, Medium, High, Critical.
- Priority must be based on both urgency and demonstrated business impact.
- Do not infer scope that the user did not state.
- Example: "I have a client call in 20 minutes." is strong urgency evidence.
- Example: "The internet is down." establishes a connectivity problem, but it does not establish company-wide impact, multiple users affected, or critical business impact.
- Critical requires strong evidence of severe business impact, such as multiple users affected, an organization-wide outage, a critical business service unavailable, or major operational activity blocked.
- High requires meaningful urgency or meaningful demonstrated impact.
- Medium is appropriate when the issue matters but urgency or impact is not clearly severe.
- Low is appropriate for minor or non-urgent issues.
- These are guidelines, not rigid rules.

Missing information policy:
- missingInformation must be an array of strings that materially affect diagnosis, category, priority, or troubleshooting.
- Only include evidence-driven missing details that would materially change the triage decision.
- Do not generate generic questions.
- For ambiguous tickets, missingInformation should directly resolve the ambiguity.
- Keep the list targeted and concise.

Follow-up question policy:
- needsFollowUp must be true only when one concise follow-up question would materially change the triage decision.
- The followUpQuestion must directly address the most important missing information.
- Do not ask a generic troubleshooting question when the real uncertainty is category or impact.
- If needsFollowUp is false, followUpQuestion must be null or an empty string.
- If needsFollowUp is true, followUpQuestion must be a single concise question.

Next step policy:
- nextStep must be one concrete, safe, actionable, first diagnostic step based on the evidence.
- Prefer a diagnostic step that distinguishes between plausible causes.
- Do not claim a root cause has been established unless the ticket provides sufficient evidence.

Reason policy:
- reason must briefly explain the triage decision using concise, evidence-based reasoning.
- Do not expose hidden chain-of-thought or internal reasoning.

Final quality checks:
- Before producing the JSON response, verify:
  - Does category match the underlying issue?
  - Does priority match urgency and demonstrated impact?
  - Does confidence match evidence quality?
  - Does missingInformation contain only useful information?
  - Does followUpQuestion target the most valuable missing information?
  - Does nextStep avoid assuming an unproven root cause?
- Return valid JSON only, with no Markdown fences, no extra commentary, and no additional fields.
- The output must match the required schema exactly.`

function sanitizeJsonString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function logOpenRouterStage(stage, details) {
  const safeDetails = { ...details }

  if (typeof safeDetails.content === 'string') {
    safeDetails.content = safeDetails.content.slice(0, 500)
  }

  if (safeDetails.errorBody && typeof safeDetails.errorBody === 'string') {
    safeDetails.errorBody = safeDetails.errorBody.slice(0, 500)
  }

  console.log(`[OPENROUTER] ${stage}`, JSON.stringify(safeDetails))
}

function extractMessageContent(payload) {
  const message = payload?.choices?.[0]?.message

  if (typeof message?.content === 'string') {
    return message.content
  }

  if (Array.isArray(message?.content)) {
    const parts = []

    const flatten = (value) => {
      if (typeof value === 'string') {
        parts.push(value)
        return
      }

      if (Array.isArray(value)) {
        value.forEach(flatten)
        return
      }

      if (value && typeof value === 'object') {
        if (typeof value.text === 'string') {
          parts.push(value.text)
        }

        if (Array.isArray(value.content)) {
          value.content.forEach(flatten)
        }
      }
    }

    message.content.forEach(flatten)
    if (parts.length > 0) {
      return parts.join('')
    }
  }

  if (typeof payload?.choices?.[0]?.text === 'string') {
    return payload.choices[0].text
  }

  if (typeof message?.refusal === 'string') {
    return message.refusal
  }

  return null
}

function resolveOpenRouterModel(requestedModel) {
  const value = typeof requestedModel === 'string' ? requestedModel.trim() : ''

  if (!value) {
    return DEFAULT_OPENROUTER_MODEL
  }

  if (JSON_SCHEMA_SUPPORTED_MODELS.has(value)) {
    return value
  }

  if (value.toLowerCase().includes('openrouter/free')) {
    console.warn('[OPENROUTER] Unsupported strict-JSON model detected. Falling back to openai/gpt-4o-mini.')
    return DEFAULT_OPENROUTER_MODEL
  }

  return value
}

function createFallbackTriageResult(ticket) {
  const text = typeof ticket === 'string' ? ticket.toLowerCase() : ''

  let category = 'Other'
  if (text.includes('wifi') || text.includes('network') || text.includes('internet') || text.includes('connect')) {
    category = 'Network'
  } else if (text.includes('password') || text.includes('login') || text.includes('account') || text.includes('email') || text.includes('outlook')) {
    category = 'Account'
  } else if (text.includes('team') || text.includes('outlook') || text.includes('app') || text.includes('software') || text.includes('application')) {
    category = 'Application'
  } else if (text.includes('laptop') || text.includes('desktop') || text.includes('computer') || text.includes('device') || text.includes('printer')) {
    category = 'Device'
  }

  let priority = 'Medium'
  if (text.includes('call in 20 minutes') || text.includes('urgent') || text.includes('down') || text.includes('not working') || text.includes('can\'t access')) {
    priority = 'High'
  } else if (text.includes('slow')) {
    priority = 'Medium'
  }

  const missingInformation = []
  if (!text.includes('vpn') && !text.includes('proxy')) {
    missingInformation.push('Whether a VPN or proxy is required.')
  }
  if (!text.includes('other devices')) {
    missingInformation.push('Whether the issue affects other devices on the same network.')
  }
  if (!text.includes('windows') && !text.includes('mac') && !text.includes('linux')) {
    missingInformation.push('The device operating system.')
  }

  return {
    category,
    priority,
    confidence: 0.7,
    summary: 'The ticket indicates an issue affecting connectivity or access to a core service, and the impact is time-sensitive.',
    missingInformation,
    nextStep: 'Verify whether the problem affects other devices on the same network and, if it is isolated to this device, disconnect and reconnect to Wi‑Fi or restart the device before re-testing access.',
    reason: 'The ticket describes a likely connectivity issue with immediate business impact and limited supporting context.',
    needsFollowUp: true,
    followUpQuestion: 'Can you confirm whether the issue affects only this device or other devices on the same network?',
  }
}

function normalizeCategory(value) {
  const text = typeof value === 'string' ? value.trim().toLowerCase() : ''

  if (VALID_CATEGORIES.has(value)) {
    return value
  }

  if (!text) {
    return 'Other'
  }

  if (text.includes('network') || text.includes('internet') || text.includes('wifi') || text.includes('connectivity')) {
    return 'Network'
  }

  if (text.includes('account') || text.includes('password') || text.includes('login') || text.includes('email') || text.includes('outlook')) {
    return 'Account'
  }

  if (text.includes('app') || text.includes('application') || text.includes('teams') || text.includes('outlook') || text.includes('software') || text.includes('office')) {
    return 'Application'
  }

  if (text.includes('device') || text.includes('laptop') || text.includes('computer') || text.includes('printer') || text.includes('mouse') || text.includes('phone') || text.includes('hardware')) {
    return 'Device'
  }

  return 'Other'
}

function normalizePriority(value) {
  const text = typeof value === 'string' ? value.trim().toLowerCase() : ''

  if (VALID_PRIORITIES.has(value)) {
    return value
  }

  if (!text) {
    return 'Medium'
  }

  if (text.includes('critical') || text.includes('urgent')) {
    return 'Critical'
  }

  if (text.includes('high') || text.includes('severe')) {
    return 'High'
  }

  if (text.includes('low')) {
    return 'Low'
  }

  return 'Medium'
}

function parseJsonContent(content) {
  if (typeof content !== 'string') {
    throw new Error('OpenRouter returned an invalid response.')
  }

  const trimmed = content.trim()
  const withoutCodeFence = trimmed.replace(/^```json\s*/i, '').replace(/```\s*$/, '')

  try {
    return JSON.parse(withoutCodeFence)
  } catch (error) {
    const firstBrace = withoutCodeFence.indexOf('{')
    const lastBrace = withoutCodeFence.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('Unable to parse the AI response as JSON.')
    }

    try {
      return JSON.parse(withoutCodeFence.slice(firstBrace, lastBrace + 1))
    } catch (innerError) {
      throw new Error('Unable to parse the AI response as JSON.')
    }
  }
}

function validateTriageResult(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('The AI response was malformed.')
  }

  payload.category = normalizeCategory(payload.category)
  payload.priority = normalizePriority(payload.priority)

  if (!VALID_CATEGORIES.has(payload.category)) {
    throw new Error('The AI returned an invalid category.')
  }

  if (!VALID_PRIORITIES.has(payload.priority)) {
    throw new Error('The AI returned an invalid priority.')
  }

  if (typeof payload.confidence !== 'number' || Number.isNaN(payload.confidence) || payload.confidence < 0 || payload.confidence > 1) {
    throw new Error('The AI returned an invalid confidence score.')
  }

  if (typeof payload.summary !== 'string' || !payload.summary.trim()) {
    throw new Error('The AI returned an invalid summary.')
  }

  if (!Array.isArray(payload.missingInformation)) {
    throw new Error('The AI returned an invalid missingInformation array.')
  }

  if (typeof payload.nextStep !== 'string' || !payload.nextStep.trim()) {
    throw new Error('The AI returned an invalid nextStep.')
  }

  if (typeof payload.reason !== 'string' || !payload.reason.trim()) {
    throw new Error('The AI returned an invalid reason.')
  }

  if (typeof payload.needsFollowUp !== 'boolean') {
    throw new Error('The AI returned an invalid follow-up flag.')
  }

  if (payload.needsFollowUp) {
    if (typeof payload.followUpQuestion !== 'string' || !payload.followUpQuestion.trim()) {
      throw new Error('The AI returned an invalid follow-up question.')
    }
  } else if (payload.followUpQuestion !== null && payload.followUpQuestion !== undefined && payload.followUpQuestion !== '') {
    payload.followUpQuestion = null
  }

  return {
    category: payload.category,
    priority: payload.priority,
    confidence: Number(payload.confidence),
    summary: payload.summary.trim(),
    missingInformation: payload.missingInformation.map((item) => sanitizeJsonString(item)).filter(Boolean),
    nextStep: payload.nextStep.trim(),
    reason: payload.reason.trim(),
    needsFollowUp: payload.needsFollowUp,
    followUpQuestion: payload.needsFollowUp ? payload.followUpQuestion.trim() : null,
  }
}

async function analyzeTicket(ticket) {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = resolveOpenRouterModel(process.env.OPENROUTER_MODEL)

  console.log('[OPENROUTER] OPENROUTER_API_KEY loaded:', Boolean(apiKey))
  console.log('[OPENROUTER] OPENROUTER_MODEL:', model)

  if (!apiKey) {
    throw new Error('OPENROUTER_REQUEST_FAILED: OpenRouter API key is not configured.')
  }

  if (!model) {
    throw new Error('OPENROUTER_REQUEST_FAILED: OpenRouter model is not configured.')
  }

  const trimmedTicket = typeof ticket === 'string' ? ticket.trim() : ''

  if (!trimmedTicket) {
    throw new Error('Ticket cannot be empty.')
  }

  const requestBody = {
    model,
    temperature: 0.2,
    max_tokens: 400,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyze this IT support ticket and return only a valid JSON object in the required schema.\n\nTicket:\n${trimmedTicket}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'it_triage_result',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            category: {
              type: 'string',
              enum: ['Network', 'Account', 'Application', 'Device', 'Other'],
            },
            priority: {
              type: 'string',
              enum: ['Low', 'Medium', 'High', 'Critical'],
            },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
            summary: { type: 'string' },
            missingInformation: { type: 'array', items: { type: 'string' } },
            nextStep: { type: 'string' },
            reason: { type: 'string' },
            needsFollowUp: { type: 'boolean' },
            followUpQuestion: { type: ['string', 'null'] },
          },
          required: [
            'category',
            'priority',
            'confidence',
            'summary',
            'missingInformation',
            'nextStep',
            'reason',
            'needsFollowUp',
            'followUpQuestion',
          ],
        },
      },
    },
  }

  let response
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'ai-it-support-triage',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    logOpenRouterStage('REQUEST_SENT', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      model,
    })

    if (!response.ok) {
      let errorText = 'OPENROUTER_REQUEST_FAILED'

      try {
        const errorPayload = await response.json()
        if (errorPayload && typeof errorPayload.error === 'string') {
          errorText = errorPayload.error
        } else if (errorPayload && typeof errorPayload === 'object') {
          errorText = JSON.stringify(errorPayload).slice(0, 500)
        }
      } catch (parseError) {
        // Ignore parse errors and keep the generic message.
      }

      throw new Error(`OPENROUTER_REQUEST_FAILED: ${errorText}`)
    }

    const payload = await response.json()
    const message = payload?.choices?.[0]?.message
    const content = extractMessageContent(payload)

    logOpenRouterStage('RESPONSE_RECEIVED', {
      topLevelKeys: Object.keys(payload || {}),
      choicesLength: Array.isArray(payload?.choices) ? payload.choices.length : 0,
      messageExists: Boolean(message),
      contentType: typeof content,
      contentEmpty: typeof content !== 'string' || !content.trim(),
      rawContentPreview: typeof content === 'string' ? content.slice(0, 400) : null,
    })

    if (!content) {
      throw new Error('OPENROUTER_RESPONSE_EMPTY: model returned no assistant content')
    }

    try {
      const parsed = parseJsonContent(content)
      logOpenRouterStage('PARSED_SUCCESS', { parsedKeys: Object.keys(parsed || {}) })
      return validateTriageResult(parsed)
    } catch (parseError) {
      logOpenRouterStage('OPENROUTER_RESPONSE_PARSE_FAILED', {
        message: parseError && parseError.message ? parseError.message : 'Unknown parse error',
        contentPreview: content.slice(0, 500),
      })
      throw new Error(`OPENROUTER_RESPONSE_PARSE_FAILED: ${parseError && parseError.message ? parseError.message : 'Unknown parse error'}`)
    }
  } catch (error) {
    if (error && error.name === 'AbortError') {
      const timeoutError = new Error('OPENROUTER_REQUEST_FAILED: The triage request timed out.')
      console.log('[OPENROUTER] OPENROUTER_REQUEST_FAILED', timeoutError.message)
      throw timeoutError
    }

    if (error instanceof Error && error.message && error.message.startsWith('OPENROUTER_')) {
      console.log('[OPENROUTER] DIAGNOSTIC_STAGE_FAILED', error.message)
      throw error
    }

    if (error instanceof Error && error.message) {
      const message = error.message
      console.log('[OPENROUTER] GENERIC_FAILURE', message)
      throw new Error(`OPENROUTER_REQUEST_FAILED: ${message}`)
    }

    console.log('[OPENROUTER] GENERIC_FAILURE', 'Unknown error')
    throw new Error('OPENROUTER_REQUEST_FAILED: Unknown error')
  } finally {
    clearTimeout(timeout)
  }
}

async function triageTicket(ticket) {
  return analyzeTicket(ticket)
}

module.exports = {
  triageTicket,
  analyzeTicket,
}
